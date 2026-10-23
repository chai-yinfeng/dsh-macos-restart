# macOS Desktop Restart (`dsh-macos-restart`)

English | [中文](https://github.com/chai-yinfeng/dsh-macos-restart/blob/main/README.zh.md)

macOS 桌面版一键重启 / One-click restart for the DeepSeek Harness desktop app.

A macOS-only one-click restart for the **DeepSeek Harness desktop app**. It
handles the Electron app itself, not a `dsh web` host: the restart is for making
plugins that cannot hot-reload load on the next launch.

## Scope

**This plugin is for the macOS Desktop app.** It is not a generic header control
and not a `dsh web` restart button:

- It stops the Electron **main** process, lets the desktop host exit through its
  own IPC-disconnect path, waits for the old web port to be released, and runs
  `open -a` on the `.app`.
- It does **not** support Windows, Linux, `dsh web`, or a standalone `dsh` CLI.
- It deliberately does not add a quit/exit action; macOS already has Cmd+Q. The
  value here is the automatic relaunch, the running-turn check, and the
  plugin-install gate.

The community plugin `dsh-header-controls` also puts restart/exit buttons in the
conversation header, but its documented mechanism is a `dsh web` launcher +
Windows `taskkill`/`netstat` flow. It does not restart the macOS Electron app.
The two plugins overlap only at the header-seat level.

## Entry points

- **Title-bar icon** in the top-right Session header. On by default.
- **Sidebar-foot icon** beside Settings. Off by default; enable it in Settings.
- **Settings → Desktop Restart**: status, last restart, logs, entry-point
  switches, and the restart button.
- **`/restart-desktop`** command. Add `--force` to restart while a turn runs.
- **Optional draggable floating button**, off by default, position remembered.

The header, sidebar, floating button, Settings page, and command all call the
same Host operation.

## How it restarts

1. The Client sends `POST /plugins/dsh-restart/restart` with
   `{ "confirm": true }`.
2. The Host checks loopback/same-origin, that this is the macOS desktop host,
   that no plugin install/update is running, and whether a turn is running.
3. The Host writes a handoff record and an initial `state.json`, then starts an
   **independent one-shot opener** as a detached `/bin/sh`. The opener only
   waits and opens; it never kills. Do not use `launchctl submit` for this: in
   a real 0.1.4 test the submitted job restarted the opener every ~10s after
   the app was back.
4. The Host starts the killer helper. It ends the **Electron main process** with
   SIGKILL instead of an ordinary quit. SIGTERM makes the app show its own
   "quit with scheduled tasks?" confirmation, and there is no plugin-facing
   graceful restart channel. The host is a separate child: it sees the IPC
   channel close and runs its own graceful shutdown, so session logs still land.
   The trade-off is that the main process's window/tray cleanup is skipped; the
   plugin's own dialog shows the scheduled-task warning instead.
5. The opener/killer wait for the old main process to disappear and for the web
   port to be released, then run `open -a "/Applications/DeepSeek Harness.app"`.
   `open -a` on an already-running app activates it, so the two helpers cannot
   start two instances.
6. If the host refuses to exit it is escalated. Failure is reported with a
   dialog and a log under `~/.dsh/dsh-restart/`.

## Diagnostics

- `~/.dsh/dsh-restart/state.json` records the last restart's phase:
  `queued → opener-started/killing → waiting-host → host-exited →
  waiting-port → port-free → opening → opened` (or `failed`).
- Settings shows the last phase/time and one **Reveal latest log** button.
  `POST /plugins/dsh-restart/open-logs` does the same from the Host, so it works
  even when the page has lost its connection. It uses `open -R` (Finder reveal)
  because plain `open <file>.log` depends on a default application and can look
  like a no-op.
- The helper log contains the process-level account; the state file is the
  short version that survives a torn-down process tree.

## Stuck install recovery

If the plugin manager holds its install lock with no pnpm/install progress for
five minutes, `pluginOperation.stale` becomes true and the dialog offers
**Force restart (advanced)**. It is only available while the lock belongs to
the current host, or when no manager lock exists at all; a live pnpm process is
never bypassed. A force restart kills the host, releases the lock, and reopens
the app — an unfinished install is interrupted.

## Safety

- Only loopback requests are accepted. The desktop document proxy may strip both
  `Host`/`Origin`, or only `Origin`; a loopback `Host` with no `Origin` is
  accepted, and a present `Origin` must match `Host`. `sec-fetch-site:
  cross-site` is rejected.
- A running turn returns `409 busy`; the Client lists the affected session ids
  and asks for a second confirmation before sending `force: true`.
- A plugin install/update returns `423`. The only exception is the explicit
  advanced force path for a stale manager lock described above.
- `allowRestart: false` in `cordis.patch.yml` disables the operation.
- The plugin never modifies `app.asar` and never starts a second server.

## Configuration

```yaml
- id: dsh-restart
  name: 'dsh-macos-restart'
  config:
    allowRestart: true
```

## Files

- `lib/index.js` — Host routes (`/status`, `/restart`, `/open-logs`), gates,
  command, state, helper/opener scheduling.
- `lib/helper.sh` — detached killer/opener helper (`--dry-run` supported).
- `lib/client.js` — title-bar icon, sidebar action, Settings page, modal,
  floating button, log actions.
- `locale/{en,zh}.json` — Plugin Manager display metadata.
- `README.zh.md` — Chinese README.
- `PUBLISHING.md` — npm + curated-catalog release checklist.

## Publishing

See [PUBLISHING.md](https://github.com/chai-yinfeng/dsh-macos-restart/blob/main/PUBLISHING.md).
The current package name `dsh-macos-restart` is a local development name; the
publishable artifact is `dsh-macos-restart` on npm.
