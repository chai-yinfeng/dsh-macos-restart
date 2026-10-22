import { execFileSync, spawn } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_ID = 'dsh-restart';
const ROUTE_PREFIX = '/plugins/dsh-restart';
const PACKAGE_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const HELPER_PATH = join(PACKAGE_DIR, 'lib', 'helper.sh');
const LOG_DIR = join(homedir(), '.dsh', 'dsh-restart');
const STATE_PATH = join(LOG_DIR, 'state.json');
const MAX_LOG_FILES = 20;
const INSTALL_BUSY_TTL_MS = 15 * 60 * 1000;

export const name = PLUGIN_ID;
export const inject = ['webServer'];

/**
 * Host half of the desktop restart bundle.
 *
 * The operation is deliberately small and audited: a same-origin loopback
 * request asks for one restart, the host writes a handoff record, and a
 * detached `/bin/sh` helper stops the Electron main process, waits for this
 * host to exit and for the web port to be released, then reopens the exact
 * `.app`. Nothing here touches app.asar or starts a second server.
 */
export function apply(ctx, rawConfig) {
  const config = readConfig(rawConfig);
  const managerState = { installBusyUntil: 0, requestId: null };

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: (request, response) =>
          handleRequest(ctx, config, managerState, request, response),
      }),
    'dsh-restart: HTTP route',
  );

  // A plugin install/update must never be interrupted by a restart. The
  // manager has no public "am I busy" method in this version, so observe its
  // lifecycle events; `plugin-manager/changed` settles the operation.
  ctx.on('plugin-manager/install-state', (progress) => {
    if (progress === null || typeof progress !== 'object') return;
    managerState.requestId =
      typeof progress.requestId === 'string' ? progress.requestId : 'install';
    managerState.installBusyUntil = Date.now() + INSTALL_BUSY_TTL_MS;
  });
  ctx.on('plugin-manager/changed', () => {
    managerState.requestId = null;
    managerState.installBusyUntil = 0;
  });

  const commands = ctx.get?.('commands');
  if (commands !== undefined) {
    ctx.effect(
      () =>
        commands.register({
          name: 'restart-desktop',
          description:
            'Restart the DeepSeek Harness desktop app on macOS so newly installed plugins load. Use --force while a turn is running. / 在 macOS 上重启 DeepSeek Harness 桌面版；有任务运行时用 --force。',
          input: { hint: '[--force]' },
          handler: async (invocation) => {
            const force = /(?:^|\s)--force(?:\s|$)/.test(
              String(invocation?.rawInput ?? ''),
            );
            const result = await performRestart(ctx, config, managerState, {
              force,
              source: 'command',
            });
            if (result.status === 202) {
              return { kind: 'success', text: result.message };
            }
            return { kind: 'error', text: result.message };
          },
        }),
      'dsh-restart: /restart-desktop command',
    );
  }
}

function readConfig(rawConfig) {
  const value =
    rawConfig !== null && typeof rawConfig === 'object' ? rawConfig : {};
  return { allowRestart: value.allowRestart !== false };
}

async function handleRequest(ctx, config, managerState, request, response) {
  let pathname;
  try {
    pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  } catch {
    return sendJson(response, 400, {
      ok: false,
      code: 'bad-url',
      message: 'The request URL could not be parsed.',
    });
  }

  if (
    pathname !== ROUTE_PREFIX &&
    !pathname.startsWith(`${ROUTE_PREFIX}/`)
  ) {
    return sendJson(response, 404, {
      ok: false,
      code: 'not-found',
      message: 'Unknown dsh-restart route.',
    });
  }

  const route = pathname.slice(ROUTE_PREFIX.length) || '/';

  // The desktop document proxy strips Host/Origin before forwarding to the
  // in-process host, so a headerless loopback request is the trusted desktop
  // shape. Some proxy versions leave Host but strip only Origin; a missing
  // Origin is therefore accepted for both reads and mutations, as long as the
  // Host names a loopback authority. A present Origin must still match Host.
  if (!trustedRequest(request)) {
    return sendJson(response, 403, {
      ok: false,
      code: 'untrusted',
      message:
        'This restart endpoint only accepts loopback same-origin requests.',
    });
  }

  if (route === '/status' && request.method === 'GET') {
    return sendJson(response, 200, buildStatus(ctx, config, managerState));
  }

  if (route === '/open-logs') {
    if (request.method !== 'POST') {
      return sendJson(response, 405, {
        ok: false,
        code: 'method-not-allowed',
        message: 'Use POST for /open-logs.',
      });
    }
    const contentType = String(request.headers['content-type'] ?? '');
    if (!contentType.toLowerCase().includes('application/json')) {
      return sendJson(response, 415, {
        ok: false,
        code: 'unsupported-media-type',
        message: 'Use application/json for /open-logs.',
      });
    }
    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      return sendJson(response, 400, {
        ok: false,
        code: 'bad-body',
        message: `The open-log request body is invalid: ${messageOf(error)}`,
      });
    }
    if (body === null || typeof body !== 'object' || body.confirm !== true) {
      return sendJson(response, 400, {
        ok: false,
        code: 'confirmation-required',
        message: 'Send { "confirm": true, "target": "folder" } to open the log folder.',
      });
    }
    const result = openLogs(ctx, body);
    return sendJson(response, result.status, result.payload);
  }

  if (route === '/restart') {
    if (request.method !== 'POST') {
      return sendJson(response, 405, {
        ok: false,
        code: 'method-not-allowed',
        message: 'Use POST for /restart.',
      });
    }
    const contentType = String(request.headers['content-type'] ?? '');
    if (!contentType.toLowerCase().includes('application/json')) {
      return sendJson(response, 415, {
        ok: false,
        code: 'unsupported-media-type',
        message: 'Use application/json for /restart.',
      });
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      return sendJson(response, 400, {
        ok: false,
        code: 'bad-body',
        message: `The restart request body is invalid: ${messageOf(error)}`,
      });
    }
    if (body === null || typeof body !== 'object' || body.confirm !== true) {
      return sendJson(response, 400, {
        ok: false,
        code: 'confirmation-required',
        message: 'Send { "confirm": true } to restart DeepSeek Harness.',
      });
    }

    const result = await performRestart(ctx, config, managerState, {
      force: body.force === true,
      dryRun: body.dryRun === true,
      source: 'ui',
    });
    return sendJson(response, result.status, result.payload);
  }

  return sendJson(response, 404, {
    ok: false,
    code: 'not-found',
    message: 'Unknown dsh-restart route.',
  });
}

function buildStatus(ctx, config, managerState) {
  const desktop = detectDesktop(ctx);
  const operation = pluginOperationState(managerState);
  const runningAgents = runningAgentIds(ctx);
  const latestLog = latestLogInfo();
  const status = {
    ok: true,
    plugin: PLUGIN_ID,
    platform: process.platform,
    desktop: desktop.supported,
    desktopSignals: {
      appBundle: desktop.appBundle,
      electron: desktop.electron,
      desktopProfiles: desktop.desktopProfiles,
      desktopHostArg: desktop.desktopHostArg,
    },
    allowRestart: config.allowRestart,
    canRestart: config.allowRestart && desktop.supported && !operation.active,
    pluginOperation: operation,
    runningAgents,
    busy: operation.active || runningAgents.length > 0,
    hostPid: process.pid,
    mainPid: process.ppid,
    port: portOf(ctx),
    logs: {
      dir: LOG_DIR,
      latest: latestLog?.path ?? null,
    },
    lastRestart: readLastRestart(),
  };
  status.message = statusMessage(status);
  return status;
}

function statusMessage(status) {
  if (status.platform !== 'darwin') {
    return 'This plugin restarts the macOS desktop app only.';
  }
  if (!status.desktop) {
    return 'This host is not the DeepSeek Harness desktop host.';
  }
  if (!status.allowRestart) {
    return 'Restart is disabled by the plugin config (allowRestart: false).';
  }
  if (status.pluginOperation.active) {
    return 'A plugin install or update is running; restart is blocked until it finishes.';
  }
  if (status.runningAgents.length > 0) {
    return 'A turn is running; restarting will interrupt it.';
  }
  return 'Ready to restart DeepSeek Harness.';
}

async function performRestart(ctx, config, managerState, options) {
  const status = buildStatus(ctx, config, managerState);

  if (!config.allowRestart) {
    return refusal(
      403,
      'restart-disabled',
      'Restart is disabled by the plugin config (allowRestart: false).',
      status,
    );
  }
  if (process.platform !== 'darwin') {
    return refusal(
      403,
      'unsupported-platform',
      'This plugin restarts the macOS desktop app only.',
      status,
    );
  }
  if (!status.desktop) {
    return refusal(
      403,
      'not-desktop',
      'This host is not the DeepSeek Harness desktop host, so there is no Electron app to restart.',
      status,
    );
  }

  if (options.dryRun) {
    return dryRun(ctx, status);
  }

  if (status.pluginOperation.active) {
    return refusal(
      423,
      'plugin-operation',
      'A plugin install or update is running. Finish or cancel it before restarting.',
      status,
    );
  }
  if (status.runningAgents.length > 0 && !options.force) {
    return {
      status: 409,
      message:
        'A turn is still running. Confirm again to restart and interrupt it.',
      payload: {
        ok: false,
        code: 'busy',
        message:
          'A turn is still running. Confirm again to restart and interrupt it.',
        runningAgents: status.runningAgents,
        busy: true,
        risk:
          'Running turns, live tool output, and streaming replies will be interrupted. Session logs are checkpointed when the host exits gracefully.',
        canForce: true,
      },
    };
  }

  const desktop = detectDesktop(ctx);
  if (
    desktop.execPath === null ||
    desktop.appBundle === null ||
    !existsSync(HELPER_PATH)
  ) {
    return refusal(
      500,
      'helper-missing',
      'The restart helper is missing from the installed package, or the app executable could not be identified.',
      status,
    );
  }

  const logPath = createLogPath();
  const restartId = `${stamp()}-${String(process.pid)}`;
  const handoffPath = join(LOG_DIR, `handoff-${restartId}.json`);
  const requestedAt = new Date().toISOString();
  const handoff = {
    restartId,
    requestedAt,
    source: options.source ?? 'unknown',
    force: options.force === true,
    hostPid: process.pid,
    mainPidHint: process.ppid,
    helper: HELPER_PATH,
    bin: desktop.execPath,
    appBundle: desktop.appBundle,
    port: status.port,
    log: logPath,
    state: STATE_PATH,
  };
  try {
    writeFileSync(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`, {
      mode: 0o600,
    });
    writeState({
      restartId,
      phase: 'queued',
      note: '',
      requestedAt,
      updatedAt: requestedAt,
      hostPid: process.pid,
      mainPid: process.ppid,
      port: status.port,
      log: logPath,
      app: desktop.appBundle,
    });
    appendFileSync(
      logPath,
      `[${requestedAt}] restart requested (id=${restartId}, source=${handoff.source}, force=${String(handoff.force)}, host=${String(process.pid)}, main hint=${String(process.ppid)}, port=${String(status.port)})\n`,
      { mode: 0o600 },
    );
  } catch (error) {
    return {
      status: 500,
      message: `Could not write the restart handoff: ${messageOf(error)}`,
      payload: {
        ok: false,
        code: 'handoff-failed',
        message: `Could not write the restart handoff: ${messageOf(error)}`,
      },
    };
  }

  // The opener is started BEFORE the killer on purpose: if the old process
  // tree takes it down, the opener is still alive to bring the app back. The
  // killer remains the primary path and also opens as a fallback, so a failed
  // opener cannot make the restart worse than it was before.
  const opener = spawnOpener(desktop, logPath, status.port, restartId);
  handoff.opener = opener;
  try {
    writeFileSync(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`, {
      mode: 0o600,
    });
  } catch {
    // The log already has the opener line; the handoff is diagnostic.
  }

  let helperPid = null;
  try {
    const helper = spawn(
      '/bin/sh',
      [
        HELPER_PATH,
        String(process.ppid || 0),
        desktop.execPath,
        desktop.appBundle ?? '',
        String(status.port),
        logPath,
        String(process.pid),
        STATE_PATH,
        restartId,
      ],
      {
        detached: true,
        stdio: 'ignore',
        env: cleanEnv(),
        cwd: '/',
        windowsHide: true,
      },
    );
    helper.on('error', (error) => {
      appendLog(logPath, `helper spawn error: ${messageOf(error)}`);
    });
    helper.unref();
    helperPid = helper.pid ?? null;
  } catch (error) {
    return {
      status: 500,
      message: `Could not start the restart helper: ${messageOf(error)}`,
      payload: {
        ok: false,
        code: 'helper-failed',
        message: `Could not start the restart helper: ${messageOf(error)}`,
      },
    };
  }

  if (helperPid === null) {
    return {
      status: 500,
      message: 'The restart helper did not start.',
      payload: {
        ok: false,
        code: 'helper-failed',
        message: 'The restart helper did not start.',
      },
    };
  }

  const message =
    'Restart scheduled. DeepSeek Harness will close and reopen in a moment.';
  return {
    status: 202,
    message,
    payload: {
      ok: true,
      code: 'restart-scheduled',
      message,
      restartId,
      hostPid: process.pid,
      helperPid,
      opener,
      log: logPath,
      handoff: handoffPath,
      state: STATE_PATH,
    },
  };
}

function writeState(state) {
  const tmp = `${STATE_PATH}.tmp.${String(process.pid)}`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  renameSync(tmp, STATE_PATH);
}

function readLastRestart() {
  try {
    if (!existsSync(STATE_PATH)) return null;
    const value = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
    return value !== null && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function openLogs(ctx, body) {
  if (process.platform !== 'darwin') {
    return {
      status: 403,
      payload: {
        ok: false,
        code: 'unsupported-platform',
        message: 'This action is available on macOS only.',
      },
    };
  }
  const desktop = detectDesktop(ctx);
  if (!desktop.supported) {
    return {
      status: 403,
      payload: {
        ok: false,
        code: 'not-desktop',
        message: 'This host is not the DeepSeek Harness desktop host.',
      },
    };
  }
  const target = body.target === 'latest' ? 'latest' : 'folder';
  let path = LOG_DIR;
  try {
    mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
  } catch (error) {
    return {
      status: 500,
      payload: {
        ok: false,
        code: 'log-dir-failed',
        message: `Could not create the log directory: ${messageOf(error)}`,
      },
    };
  }
  if (target === 'latest') {
    const latest = latestLogInfo();
    if (latest === null) {
      return {
        status: 409,
        payload: {
          ok: false,
          code: 'no-log',
          message: 'No restart log has been written yet.',
        },
      };
    }
    path = latest.path;
  }
  try {
    // Reveal a file in Finder; plain `open <file>.log` depends on a default
    // application and can look like a no-op.
    const command = target === 'latest' ? ['-R', path] : [path];
    const child = spawn('/usr/bin/open', command, {
      detached: true,
      stdio: 'ignore',
    });
    child.on('error', (error) =>
      appendLog(join(LOG_DIR, 'state.log'), `open log failed: ${messageOf(error)}`),
    );
    child.unref();
    return { status: 200, payload: { ok: true, target, path } };
  } catch (error) {
    return {
      status: 500,
      payload: {
        ok: false,
        code: 'open-failed',
        message: `Could not open ${path}: ${messageOf(error)}`,
      },
    };
  }
}

function spawnOpener(desktop, logPath, port, restartId) {
  const args = [
    '--opener',
    String(process.ppid || 0),
    desktop.execPath,
    desktop.appBundle ?? '',
    String(port),
    logPath,
    String(process.pid),
    STATE_PATH,
    restartId,
  ];
  // Do NOT use `launchctl submit` here. In a real 0.1.4 run its job kept
  // restarting the opener every ~10s after the app was back, writing the log
  // and `state.json` forever. A plain detached `/bin/sh` is one-shot; the
  // killer helper also opens as a fallback.
  try {
    const child = spawn('/bin/sh', [HELPER_PATH, ...args], {
      detached: true,
      stdio: 'ignore',
      env: cleanEnv(),
      cwd: '/',
      windowsHide: true,
    });
    child.on('error', (error) =>
      appendLog(logPath, `opener spawn error: ${messageOf(error)}`),
    );
    child.unref();
    appendLog(
      logPath,
      `opener spawned detached (pid ${String(child.pid ?? 'unknown')})`,
    );
    return { mode: 'detached', pid: child.pid ?? null };
  } catch (error) {
    appendLog(logPath, `opener failed: ${messageOf(error)}`);
    return { mode: 'none', error: messageOf(error) };
  }
}

function cleanEnv() {
  const env = { ...process.env };
  // The helper must not look like a Node runtime for the relaunch, and no
  // Electron-as-Node marker should survive into `open`.
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.ELECTRON_NO_ATTACH_CONSOLE;
  env.PATH = env.PATH || '/usr/bin:/bin:/usr/sbin:/sbin';
  return env;
}

function appendLog(path, line) {
  try {
    appendFileSync(path, `[${new Date().toISOString()}] ${line}\n`);
  } catch {
    // Diagnostic only; the HTTP response has already happened.
  }
}

function dryRun(ctx, status) {
  const desktop = detectDesktop(ctx);
  if (desktop.execPath === null || !existsSync(HELPER_PATH)) {
    return refusal(
      500,
      'helper-missing',
      'The restart helper is missing from the installed package, or the app executable could not be identified.',
      status,
    );
  }
  try {
    const output = execFileSync(
      '/bin/sh',
      [
        HELPER_PATH,
        '--dry-run',
        String(process.ppid || 0),
        desktop.execPath,
        desktop.appBundle ?? '',
        String(status.port),
        '',
        String(process.pid),
      ],
      { encoding: 'utf8', timeout: 10_000 },
    );
    const detection = Object.fromEntries(
      output
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
    return {
      status: 200,
      message: 'Dry run only: no process was stopped.',
      payload: {
        ok: true,
        code: 'dry-run',
        message: 'Dry run only: no process was stopped.',
        dryRun: true,
        detection,
        hostPid: process.pid,
        mainPidHint: process.ppid,
        port: status.port,
        appBundle: desktop.appBundle,
        helper: HELPER_PATH,
      },
    };
  } catch (error) {
    return {
      status: 500,
      message: `The restart dry run failed: ${messageOf(error)}`,
      payload: {
        ok: false,
        code: 'dry-run-failed',
        message: `The restart dry run failed: ${messageOf(error)}`,
        stdout: String(error?.stdout ?? ''),
        stderr: String(error?.stderr ?? ''),
      },
    };
  }
}

function refusal(status, code, message, statusBody) {
  return {
    status,
    message,
    payload: {
      ok: false,
      code,
      message,
      status: statusBody,
    },
  };
}

function detectDesktop(ctx) {
  let desktopProfiles = false;
  try {
    desktopProfiles = ctx.get?.('desktopProfiles') !== undefined;
  } catch {
    desktopProfiles = false;
  }
  const execPath = process.execPath;
  const appIndex = execPath.indexOf('.app/Contents/MacOS/');
  const appBundle = appIndex === -1 ? null : execPath.slice(0, appIndex + 4);
  const electron =
    Boolean(process.versions.electron) ||
    process.env.ELECTRON_RUN_AS_NODE === '1';
  const desktopHostArg = process.argv.some(
    (arg) =>
      typeof arg === 'string' && arg.toLowerCase().includes('dsh-desktop-host'),
  );
  const supported =
    process.platform === 'darwin' &&
    appBundle !== null &&
    (desktopProfiles || (electron && desktopHostArg));
  return {
    supported,
    appBundle,
    execPath,
    electron,
    desktopProfiles,
    desktopHostArg,
  };
}

function pluginOperationState(managerState) {
  const lock = pluginManagerLock();
  const installBusy = managerState.installBusyUntil > Date.now();
  return {
    active: lock.active || installBusy,
    reason: lock.active
      ? 'plugin-manager-lock'
      : installBusy
        ? 'plugin-manager-install'
        : null,
    lockPid: lock.pid,
    lockFile: lock.file,
    installRequestId: installBusy ? managerState.requestId : null,
  };
}

function pluginManagerLock() {
  const file = join(profileDir(), '.plugin-manager', 'run.json');
  if (!existsSync(file)) return { active: false, pid: null, file };
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const pid = Number(data?.pid);
    if (!Number.isInteger(pid) || pid <= 0) {
      return { active: false, pid: null, file };
    }
    process.kill(pid, 0);
    return { active: true, pid, file };
  } catch (error) {
    if (error?.code === 'EPERM') return { active: true, pid: null, file };
    return { active: false, pid: null, file };
  }
}

function runningAgentIds(ctx) {
  let agents;
  try {
    agents = ctx.get?.('agents');
  } catch {
    return [];
  }
  if (agents === undefined || typeof agents.list !== 'function') return [];
  try {
    const listed = agents.list();
    if (!Array.isArray(listed)) return [];
    return listed
      .filter((agent) => agent !== null && agent?.status === 'running')
      .map((agent) => String(agent.id))
      .slice(0, 20);
  } catch {
    return [];
  }
}

function portOf(ctx) {
  try {
    const origin = ctx.webServer.getOrigin();
    const url = new URL(origin);
    if (url.port !== '') return Number(url.port);
    return url.protocol === 'https:' ? 443 : 80;
  } catch {
    return 0;
  }
}

function profileDir() {
  if (process.env.DSH_PROFILE_DIR) return process.env.DSH_PROFILE_DIR;
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const profile = process.env.DSH_PROFILE || 'desktop';
  return join(home, 'profiles', profile);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function createLogPath() {
  try {
    mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
  } catch {
    // The helper will fail loudly; the route still returns its own error if
    // the handoff cannot be written.
  }
  pruneOld(LOG_DIR, 'restart-', '.log', MAX_LOG_FILES);
  pruneOld(LOG_DIR, 'handoff-', '.json', MAX_LOG_FILES);
  return join(LOG_DIR, `restart-${stamp()}-${String(process.pid)}.log`);
}

function pruneOld(dir, prefix, suffix, keep) {
  try {
    const names = readdirSync(dir)
      .filter((name) => name.startsWith(prefix) && name.endsWith(suffix))
      .sort()
      .reverse();
    for (const name of names.slice(keep)) {
      rmSync(join(dir, name), { force: true });
    }
  } catch {
    // Housekeeping must never break a restart request.
  }
}

function latestLogInfo() {
  try {
    const names = readdirSync(LOG_DIR)
      .filter((name) => name.startsWith('restart-') && name.endsWith('.log'))
      .sort();
    if (names.length === 0) return null;
    return { path: join(LOG_DIR, names[names.length - 1]), name: names.at(-1) };
  } catch {
    return null;
  }
}

function trustedRequest(request) {
  const address = request.socket?.remoteAddress;
  if (
    address !== '127.0.0.1' &&
    address !== '::1' &&
    address !== '::ffff:127.0.0.1'
  ) {
    return false;
  }
  if (
    request.headers.forwarded !== undefined ||
    request.headers['x-forwarded-for'] !== undefined ||
    request.headers['x-real-ip'] !== undefined
  ) {
    return false;
  }
  if (request.headers['sec-fetch-site'] === 'cross-site') return false;

  const host = request.headers.host;
  const origin = request.headers.origin;

  // The desktop document proxy strips both headers; nothing else a browser
  // can produce omits Host, so this is the trusted desktop shape.
  if (host === undefined && origin === undefined) return true;
  if (host === undefined) return false;
  if (!loopbackAuthority(host)) return false;
  // A missing Origin is the desktop proxy's shape, not a cross-site browser
  // request: browsers send Origin on every POST, and a rebinding page cannot
  // forge a loopback Host. The `sec-fetch-site: cross-site` check above still
  // covers the browser-side signal.
  if (origin === undefined) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function loopbackAuthority(host) {
  if (typeof host !== 'string' || host === '') return false;
  const lower = host.toLowerCase();
  const name = lower.startsWith('[')
    ? lower.slice(0, lower.indexOf(']') + 1)
    : lower.split(':')[0];
  return name === '127.0.0.1' || name === 'localhost' || name === '[::1]';
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    let timer;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      callback(value);
    };
    timer = setTimeout(
      () => finish(reject, new Error('the request body timed out')),
      5_000,
    );
    if (typeof timer.unref === 'function') timer.unref();

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > 16 * 1024) {
        finish(reject, new Error('the request body is too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8').trim();
        finish(resolve, text === '' ? {} : JSON.parse(text));
      } catch (error) {
        finish(reject, error);
      }
    });
    request.on('error', (error) => finish(reject, error));
  });
}

function sendJson(response, status, payload) {
  if (response.writableEnded) return;
  try {
    response.writeHead(status, {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
    });
    response.end(JSON.stringify(payload));
  } catch {
    // The client may already have gone away during a restart.
  }
}

function messageOf(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
