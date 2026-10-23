window.__ModuleLoader__.load({
  id: 'dsh-macos-restart',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'dsh-restart';
    const API = '/plugins/dsh-restart';
    const PREFS_KEY = 'dsh-restart.prefs.v1';
    const FLOAT_SIZE = 38;

    const DICT = {
      en: {
        settingsNav: 'Desktop Restart',
        restart: 'Restart DeepSeek Harness',
        restartShort: 'Restart',
        dialogTitle: 'Restart DeepSeek Harness?',
        dialogSubtitle:
          'The window closes and reopens so newly installed plugins load. Open sessions resume from their logs.',
        checking: 'Checking the desktop host…',
        submitting: 'Asking the host to restart…',
        ready: 'Ready to restart.',
        notDesktop:
          'This host is not the desktop app, so there is nothing to restart.',
        unsupported: 'This plugin only restarts the macOS desktop app.',
        disabled: 'Restart is disabled in the plugin config.',
        pluginBusy:
          'A plugin install or update is running. Restart is blocked until it finishes.',
        runningCount:
          '{count} running session(s) will be interrupted by a restart.',
        idle: 'No turn is running.',
        riskTitle: 'A turn is still running',
        riskBody:
          'Restarting now interrupts the running turn, live tool output, and streaming replies. Session logs are checkpointed when the host exits gracefully.',
        errorTitle: 'Restart failed',
        blockedTitle: 'Restart is blocked',
        restarting: 'Restarting…',
        restartingHint:
          'The window should disappear and reopen in a few seconds. If it does not, open the app manually and check the log.',
        stalledTitle: 'Still waiting for the app',
        stalledHint:
          'The restart was requested 20 seconds ago. If this window is still here, the helper may have failed. Check {log}.',
        cancel: 'Cancel',
        restartNow: 'Restart now',
        restartAnyway: 'Restart anyway',
        retry: 'Check again',
        close: 'Close',
        statusLabel: 'Status',
        appLabel: 'App',
        portLabel: 'Host port',
        logLabel: 'Logs',
        loadingStatus: 'Checking…',
        lastRestartTitle: 'Last restart',
        lastRestartNone: 'No restart has been recorded yet.',
        lastRestartNote:
          'A restart is usually about loading plugins that cannot hot-reload. If one still fails, open the log below.',
        openLatestLog: 'Reveal latest log',
        noLatestLog: 'No log yet',
        logActionFailed: 'Could not open the log: {message}',
        managerStuck: 'Plugin manager appears stuck',
        managerStuckHint:
          'The install lock is held by this host and no progress has been seen for several minutes. Force restart will stop the stuck manager and reopen the app.',
        forceStale: 'Force restart (advanced)',
        forceStaleHint:
          'Use only when the plugin manager is stuck; an unfinished install will be interrupted.',
        phaseQueued: 'Queued',
        phaseStarting: 'Starting helper',
        phaseKilling: 'Stopping the app',
        phaseWaitingHost: 'Waiting for the host to exit',
        phaseHostExited: 'Host exited',
        phaseWaitingPort: 'Waiting for the port',
        phasePortFree: 'Port released',
        phaseOpening: 'Reopening the app',
        phaseOpened: 'Reopened',
        phaseFailed: 'Failed',
        phaseNoMain: 'No main process; relaunch only',
        phaseEscalated: 'Escalated shutdown',
        phaseOpenerStarted: 'Opener started',
        phaseWaitingOldMain: 'Waiting for the old main process',
        settingsIntro:
          'Restart the macOS desktop app to load plugins that cannot hot-reload. Running turns are listed before the restart.',
        appearanceTitle: 'Entry points',
        showHeader: 'Show the title-bar restart icon',
        showHeaderDesc:
          'A one-click restart icon in the top-right Session header.',
        showSidebar: 'Show the sidebar restart icon',
        showSidebarDesc:
          'A small icon beside Settings at the sidebar foot. Off by default to keep the foot clean.',
        showFloating: 'Show a draggable floating restart button',
        showFloatingDesc: 'Drag it anywhere; its position is remembered.',
        resetFloat: 'Reset floating button position',
        howTitle: 'Other ways to restart',
        howBody:
          'The title-bar icon, the sidebar icon (when enabled), this page, and the /restart-desktop command all run the same restart operation.',
        commandHint:
          '/restart-desktop — add --force to restart while a turn is running.',
        canRestart: 'Desktop app detected.',
        cannotRestart: 'Restart is currently unavailable.',
        checkFailed: 'Could not read restart status: {message}',
        httpError: 'The restart request failed (HTTP {status}).',
        forceHint:
          'The server asks for confirmation again before interrupting a running turn.',
        sessionsResume: 'Sessions resume from their logs after the app reopens.',
      },
      zh: {
        settingsNav: '桌面版重启',
        restart: '重启 DeepSeek Harness',
        restartShort: '重启',
        dialogTitle: '重启 DeepSeek Harness？',
        dialogSubtitle:
          '窗口会关闭并重新打开，让新安装的插件生效；已打开的会话会从日志继续。',
        checking: '正在检查桌面宿主…',
        submitting: '正在请求宿主重启…',
        ready: '可以重启。',
        notDesktop: '当前宿主不是桌面版，没有可重启的应用。',
        unsupported: '此插件只支持重启 macOS 桌面版。',
        disabled: '插件配置已禁用重启。',
        pluginBusy: '插件安装或更新正在进行，完成前不能重启。',
        runningCount: '有 {count} 个会话正在运行，重启会中断它们。',
        idle: '当前没有运行中的任务。',
        riskTitle: '仍有任务在运行',
        riskBody:
          '现在重启会中断运行中的回合、实时工具输出和流式回复；宿主正常退出时会保存会话日志。',
        errorTitle: '重启失败',
        blockedTitle: '重启被阻止',
        restarting: '正在重启…',
        restartingHint:
          '窗口应在几秒内关闭并重新打开；如果没有，请手动打开应用并查看日志。',
        stalledTitle: '仍在等待应用',
        stalledHint:
          '重启请求已发出 20 秒；如果窗口还在，可能是助手失败，请查看 {log}。',
        cancel: '取消',
        restartNow: '立即重启',
        restartAnyway: '仍然重启',
        retry: '重新检查',
        close: '关闭',
        statusLabel: '状态',
        appLabel: '应用',
        portLabel: '宿主端口',
        logLabel: '日志',
        loadingStatus: '正在检查…',
        lastRestartTitle: '上次重启',
        lastRestartNone: '还没有重启记录。',
        lastRestartNote:
          '重启通常是为了让无法热加载的插件生效；如果插件仍加载失败，打开下面的日志查看。',
        openLatestLog: '在 Finder 中显示最近日志',
        noLatestLog: '暂无日志',
        logActionFailed: '无法打开日志：{message}',
        managerStuck: '插件管理器似乎卡住了',
        managerStuckHint:
          '安装锁由当前宿主持有，且几分钟没有进展。强制重启会结束卡住的 manager 并重新打开应用。',
        forceStale: '强制重启（高级）',
        forceStaleHint: '仅在插件管理器卡住时使用；未完成的安装会被中断。',
        phaseQueued: '已排队',
        phaseStarting: '启动助手',
        phaseKilling: '正在结束应用',
        phaseWaitingHost: '等待宿主退出',
        phaseHostExited: '宿主已退出',
        phaseWaitingPort: '等待端口释放',
        phasePortFree: '端口已释放',
        phaseOpening: '正在重新打开应用',
        phaseOpened: '已重新打开',
        phaseFailed: '失败',
        phaseNoMain: '没有主进程，仅重开',
        phaseEscalated: '升级关闭',
        phaseOpenerStarted: '独立重开器已启动',
        phaseWaitingOldMain: '等待旧主进程退出',
        settingsIntro:
          '重启 macOS 桌面版，让无法热加载的插件生效；重启前会列出运行中的会话。',
        appearanceTitle: '入口',
        showHeader: '显示标题栏重启图标',
        showHeaderDesc: '在会话标题栏右上角显示一键重启图标。',
        showSidebar: '显示侧栏重启图标',
        showSidebarDesc:
          '设置按钮旁的小图标；默认关闭，保持侧栏底部简洁。',
        showFloating: '显示可拖动的浮动重启按钮',
        showFloatingDesc: '可拖到任意位置，位置会被记住。',
        resetFloat: '重置浮动按钮位置',
        howTitle: '其他重启方式',
        howBody:
          '标题栏图标、侧栏图标（开启时）、本页和 /restart-desktop 命令都会执行同一次重启。',
        commandHint:
          '/restart-desktop — 有任务运行时加 --force。',
        canRestart: '已识别桌面版。',
        cannotRestart: '当前无法重启。',
        checkFailed: '无法读取重启状态：{message}',
        httpError: '重启请求失败（HTTP {status}）。',
        forceHint: '中断运行中的任务前，服务端会再次要求确认。',
        sessionsResume: '应用重新打开后，会话会从日志继续。',
      },
    };

    const CSS = `
      .dsh-restart-icon-button {
        width: 28px;
        height: 28px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        transition: background 120ms ease, color 120ms ease;
      }
      .dsh-restart-icon-button:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-icon-button:active {
        background: var(--dsw-alias-border-l1);
      }
      .dsh-restart-page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 0 28px;
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsh-restart-card-head {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .dsh-restart-card-icon {
        width: 34px;
        height: 34px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsh-restart-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.35;
      }
      .dsh-restart-subtitle {
        margin: 3px 0 0;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-section-title {
        margin: 0 0 2px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
      }
      .dsh-restart-status-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .dsh-restart-status-line {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-dot {
        width: 8px;
        height: 8px;
        margin-top: 5px;
        flex: none;
        border-radius: 50%;
        background: var(--dsw-alias-state-idle-primary);
      }
      .dsh-restart-dot-ok { background: var(--dsw-alias-state-success-primary); }
      .dsh-restart-dot-warn { background: var(--dsw-alias-state-warn-primary); }
      .dsh-restart-dot-error { background: var(--dsw-alias-state-error-primary); }
      .dsh-restart-meta {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 11.5px;
        line-height: 1.45;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-meta-row {
        display: flex;
        gap: 8px;
        min-width: 0;
      }
      .dsh-restart-meta-key {
        flex: none;
        min-width: 68px;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-code {
        min-width: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        overflow-wrap: anywhere;
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .dsh-restart-button {
        appearance: none;
        font: inherit;
        font-size: 12.5px;
        line-height: 1;
        padding: 8px 13px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }
      .dsh-restart-button:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsh-restart-button-primary {
        border-color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
      }
      .dsh-restart-button-primary:hover:not(:disabled) {
        background: var(--dsw-alias-brand-primary);
        filter: brightness(1.06);
      }
      .dsh-restart-button-danger {
        border-color: var(--dsw-alias-state-error-primary);
        background: var(--dsw-alias-state-error-primary);
        color: var(--dsw-alias-bg-base);
      }
      .dsh-restart-button-danger:hover:not(:disabled) {
        background: var(--dsw-alias-state-error-primary);
        filter: brightness(1.06);
      }
      .dsh-restart-button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .dsh-restart-toggle-row {
        display: flex;
        gap: 14px;
        align-items: center;
        justify-content: space-between;
      }
      .dsh-restart-toggle-text {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 2px;
      }
      .dsh-restart-toggle-label {
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-toggle-desc {
        font-size: 11.5px;
        line-height: 1.45;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-switch {
        width: 36px;
        height: 20px;
        flex: none;
        position: relative;
        padding: 0;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }
      .dsh-restart-switch[aria-checked='true'] {
        border-color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-brand-primary);
      }
      .dsh-restart-switch-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--dsw-alias-bg-base);
        transition: transform 120ms ease;
      }
      .dsh-restart-switch[aria-checked='true'] .dsh-restart-switch-knob {
        transform: translateX(16px);
      }
      .dsh-restart-note {
        margin: 0;
        font-size: 12px;
        line-height: 1.55;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        pointer-events: auto;
      }
      .dsh-restart-scrim {
        position: absolute;
        inset: 0;
        background: var(--dsw-alias-bg-overlay);
        opacity: 0.62;
      }
      .dsh-restart-dialog {
        position: relative;
        z-index: 1;
        width: min(520px, 100%);
        max-height: min(82vh, 680px);
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        box-shadow: 0 18px 48px var(--dsw-alias-bg-overlay);
      }
      .dsh-restart-dialog-head {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .dsh-restart-dialog-icon {
        width: 34px;
        height: 34px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-2);
      }
      .dsh-restart-dialog-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.35;
        flex: 1;
      }
      .dsh-restart-close {
        width: 26px;
        height: 26px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }
      .dsh-restart-close:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-risk {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        border: 1px solid var(--dsw-alias-state-warn-primary);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        font-size: 12.5px;
        line-height: 1.5;
      }
      .dsh-restart-risk-title {
        font-weight: 600;
      }
      .dsh-restart-error {
        padding: 10px 12px;
        border: 1px solid var(--dsw-alias-state-error-primary);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        font-size: 12.5px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .dsh-restart-spinner {
        width: 16px;
        height: 16px;
        flex: none;
        border: 2px solid var(--dsw-alias-border-l2);
        border-top-color: var(--dsw-alias-brand-primary);
        border-radius: 50%;
        animation: dsh-restart-spin 900ms linear infinite;
      }
      @keyframes dsh-restart-spin {
        to { transform: rotate(360deg); }
      }
      .dsh-restart-inline-loading {
        display: flex;
        gap: 9px;
        align-items: center;
        font-size: 12.5px;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-restart-dialog-footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        align-items: center;
      }
      .dsh-restart-float {
        position: fixed;
        z-index: 2147483000;
        width: 38px;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 50%;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        box-shadow: 0 4px 14px var(--dsw-alias-bg-overlay);
        cursor: grab;
        touch-action: none;
        pointer-events: auto;
        transition: background 120ms ease, color 120ms ease;
      }
      .dsh-restart-float:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-restart-float-dragging {
        cursor: grabbing;
      }
    `;

    function RestartIcon(props) {
      const size = props && props.size ? props.size : 15;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('rect', { x: 1.6, y: 2.6, width: 12.8, height: 10.8, rx: 2.6 }),
        h('path', { d: 'M8 5.6v3.1', strokeWidth: 1.8 }),
        h('path', { d: 'M6.2 6.5a2.3 2.3 0 1 0 3.6 0' }),
      );
    }

    function messageOf(error) {
      if (error instanceof Error) return error.message;
      return String(error);
    }

    const DEFAULT_PREFS = {
      showHeaderIcon: true,
      showSidebarIcon: false,
      showFloatingIcon: false,
      float: { x: null, y: null },
    };

    function readPrefs() {
      try {
        const stored = JSON.parse(
          window.localStorage.getItem(PREFS_KEY) || 'null',
        );
        if (stored === null || typeof stored !== 'object') {
          return {
            ...DEFAULT_PREFS,
            float: { ...DEFAULT_PREFS.float },
          };
        }
        return {
          ...DEFAULT_PREFS,
          ...stored,
          float: { ...DEFAULT_PREFS.float, ...(stored.float || {}) },
        };
      } catch {
        return { ...DEFAULT_PREFS, float: { ...DEFAULT_PREFS.float } };
      }
    }

    function createPrefs() {
      let state = readPrefs();
      const listeners = new Set();
      const emit = () => {
        try {
          window.localStorage.setItem(PREFS_KEY, JSON.stringify(state));
        } catch {
          // A blocked localStorage must not break the buttons.
        }
        for (const listener of listeners) {
          try {
            listener();
          } catch {
            // One bad subscriber cannot take the other buttons down.
          }
        }
      };
      return {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        set: (patch) => {
          state = {
            ...state,
            ...patch,
            float: patch && patch.float
              ? { ...state.float, ...patch.float }
              : state.float,
          };
          emit();
        },
      };
    }

    function usePrefs(prefs) {
      return React.useSyncExternalStore(
        prefs.subscribe,
        prefs.getSnapshot,
        prefs.getSnapshot,
      );
    }

    function createController(t) {
      let state = {
        open: false,
        phase: 'idle',
        status: null,
        statusError: null,
        error: null,
        risk: null,
        result: null,
        blocked: null,
        logAction: null,
      };
      const listeners = new Set();
      let stalledTimer = null;

      const emit = () => {
        for (const listener of listeners) {
          try {
            listener();
          } catch {
            // Keep the controller alive even if one view throws.
          }
        }
      };
      const set = (patch) => {
        state = { ...state, ...patch };
        emit();
      };
      const clearStalled = () => {
        if (stalledTimer !== null) {
          clearTimeout(stalledTimer);
          stalledTimer = null;
        }
      };

      async function requestStatus() {
        const response = await fetch(`${API}/status`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body || body.ok !== true) {
          throw new Error(
            (body && body.message) || `HTTP ${response.status}`,
          );
        }
        return body;
      }

      async function loadStatus() {
        try {
          const status = await requestStatus();
          set({ status, statusError: null });
          return { status, error: null };
        } catch (error) {
          const message = messageOf(error);
          set({ statusError: message });
          return { status: null, error: message };
        }
      }

      async function open() {
        clearStalled();
        set({
          open: true,
          phase: 'loading',
          error: null,
          risk: null,
          result: null,
          blocked: null,
          statusError: null,
        });
        const loaded = await loadStatus();
        set({
          phase: loaded.status ? 'ready' : 'error',
          error: loaded.error,
        });
      }

      function close() {
        clearStalled();
        set({
          open: false,
          phase: 'idle',
          error: null,
          risk: null,
          result: null,
          blocked: null,
        });
      }

      function errorForCode(code, fallback) {
        switch (code) {
          case 'not-desktop':
            return t('notDesktop');
          case 'restart-disabled':
            return t('disabled');
          case 'unsupported-platform':
            return t('unsupported');
          case 'plugin-operation':
            return t('pluginBusy');
          default:
            return fallback;
        }
      }

      async function openLogs(target) {
        set({ logAction: { state: 'working', target, message: null } });
        try {
          const response = await fetch(`${API}/open-logs`, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ confirm: true, target }),
          });
          const body = await response.json().catch(() => null);
          if (!response.ok || !body || body.ok !== true) {
            throw new Error((body && body.message) || `HTTP ${response.status}`);
          }
          set({ logAction: { state: 'done', target, message: null } });
        } catch (error) {
          set({
            logAction: { state: 'error', target, message: messageOf(error) },
          });
        }
      }

      async function confirm(force, forceStale) {
        if (state.phase === 'submitting' || state.phase === 'restarting') return;
        set({
          phase: 'submitting',
          error: null,
          risk: null,
          blocked: null,
        });
        try {
          const response = await fetch(`${API}/restart`, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              confirm: true,
              force: force === true,
              forceStale: forceStale === true,
            }),
          });
          const body = await response.json().catch(() => null);

          if (response.status === 202) {
            set({
              phase: 'restarting',
              result: body,
              error: null,
              risk: null,
            });
            clearStalled();
            stalledTimer = setTimeout(() => {
              set({
                phase: 'stalled',
                error: t('stalledHint', {
                  log: (body && body.log) || t('logLabel'),
                }),
              });
            }, 20_000);
            return;
          }

          if (response.status === 409 && body && body.code === 'busy') {
            set({ phase: 'risk', risk: body, error: null });
            return;
          }

          set({
            phase:
              response.status === 423 ? 'blocked' : 'error',
            blocked: response.status === 423 ? body : null,
            error: errorForCode(
              body && body.code,
              (body && body.message) || t('httpError', { status: response.status }),
            ),
          });
        } catch (error) {
          // The process can disappear before the response arrives; that is the
          // success path for a restart request.
          if (state.phase === 'submitting') {
            set({ phase: 'restarting', error: null });
            clearStalled();
            stalledTimer = setTimeout(() => {
              set({ phase: 'stalled', error: t('stalledHint', { log: t('logLabel') }) });
            }, 20_000);
          } else {
            set({ phase: 'error', error: messageOf(error) });
          }
        }
      }

      return {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        open,
        close,
        confirm,
        loadStatus,
        openLogs,
        retry: open,
      };
    }

    function useController(controller) {
      return React.useSyncExternalStore(
        controller.subscribe,
        controller.getSnapshot,
        controller.getSnapshot,
      );
    }

    function StatusLine(props) {
      const tone = props.tone || 'idle';
      return h(
        'div',
        { className: 'dsh-restart-status-line' },
        h('span', { className: `dsh-restart-dot dsh-restart-dot-${tone}` }),
        h('span', null, props.children),
      );
    }

    function HeaderButton(props) {
      const { controller, prefs, t } = props;
      const values = usePrefs(prefs);
      if (!values.showHeaderIcon) return null;
      return h(
        'button',
        {
          type: 'button',
          className: 'dsh-restart-icon-button',
          title: t('restart'),
          'aria-label': t('restart'),
          onClick: () => controller.open(),
        },
        h(RestartIcon, { size: 16 }),
      );
    }

    function SidebarButton(props) {
      const { controller, prefs, t } = props;
      const values = usePrefs(prefs);
      if (!values.showSidebarIcon) return null;
      return h(
        'button',
        {
          type: 'button',
          className: 'dsh-restart-icon-button',
          title: t('restart'),
          'aria-label': t('restart'),
          onClick: () => controller.open(),
        },
        h(RestartIcon, { size: 16 }),
      );
    }

    function clampFloat(point) {
      const width = Math.max(360, window.innerWidth || 0);
      const height = Math.max(320, window.innerHeight || 0);
      const maxX = Math.max(8, width - FLOAT_SIZE - 8);
      const maxY = Math.max(8, height - FLOAT_SIZE - 8);
      const rawX = point && Number.isFinite(point.x) ? point.x : maxX - 8;
      const rawY = point && Number.isFinite(point.y) ? point.y : 74;
      return {
        x: Math.min(Math.max(8, rawX), maxX),
        y: Math.min(Math.max(8, rawY), maxY),
      };
    }

    function FloatingButton(props) {
      const { controller, prefs, t } = props;
      const values = usePrefs(prefs);
      const [position, setPosition] = React.useState(() =>
        clampFloat(values.float),
      );
      const positionRef = React.useRef(position);
      const dragRef = React.useRef(null);
      const [dragging, setDragging] = React.useState(false);

      React.useEffect(() => {
        const next = clampFloat(values.float);
        positionRef.current = next;
        setPosition(next);
      }, [values.float && values.float.x, values.float && values.float.y]);

      React.useEffect(() => {
        if (!values.showFloatingIcon) return undefined;
        const onResize = () => {
          const next = clampFloat(positionRef.current);
          positionRef.current = next;
          setPosition(next);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, [values.showFloatingIcon]);

      if (!values.showFloatingIcon) return null;

      const onPointerDown = (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is an enhancement, not a requirement.
        }
        dragRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          origin: positionRef.current,
          moved: false,
        };
        setDragging(true);
      };

      const onPointerMove = (event) => {
        const drag = dragRef.current;
        if (drag === null) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        const next = clampFloat({
          x: drag.origin.x + dx,
          y: drag.origin.y + dy,
        });
        positionRef.current = next;
        setPosition(next);
      };

      const endDrag = (event, cancelled) => {
        const drag = dragRef.current;
        dragRef.current = null;
        setDragging(false);
        if (drag === null) return;
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Already released.
        }
        if (!cancelled && !drag.moved) {
          controller.open();
          return;
        }
        prefs.set({
          float: {
            x: positionRef.current.x,
            y: positionRef.current.y,
          },
        });
      };

      return h(
        'button',
        {
          type: 'button',
          className: `dsh-restart-float${dragging ? ' dsh-restart-float-dragging' : ''}`,
          style: { left: `${position.x}px`, top: `${position.y}px` },
          title: t('restart'),
          'aria-label': t('restart'),
          onPointerDown,
          onPointerMove,
          onPointerUp: (event) => endDrag(event, false),
          onPointerCancel: (event) => endDrag(event, true),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              controller.open();
            }
          },
        },
        h(RestartIcon, { size: 17 }),
      );
    }

    function ModalBody(props) {
      const { snap, t } = props;
      const blockedStatus = snap.blocked && snap.blocked.status;
      const blockedStale = Boolean(
        blockedStatus &&
          blockedStatus.pluginOperation &&
          blockedStatus.pluginOperation.stale,
      );
      if (snap.phase === 'loading' || snap.phase === 'submitting') {
        return h(
          'div',
          { className: 'dsh-restart-inline-loading' },
          h('span', { className: 'dsh-restart-spinner' }),
          h(
            'span',
            null,
            snap.phase === 'loading' ? t('checking') : t('submitting'),
          ),
        );
      }

      if (snap.phase === 'restarting') {
        return h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'dsh-restart-inline-loading' },
            h('span', { className: 'dsh-restart-spinner' }),
            h('span', null, t('restarting')),
          ),
          h('p', { className: 'dsh-restart-note' }, t('restartingHint')),
        );
      }

      if (snap.phase === 'stalled') {
        return h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'dsh-restart-risk' },
            h('span', { className: 'dsh-restart-risk-title' }, t('stalledTitle')),
            h('span', null, snap.error || t('stalledHint', { log: t('logLabel') })),
          ),
          h('p', { className: 'dsh-restart-note' }, t('sessionsResume')),
        );
      }

      if (snap.phase === 'risk') {
        const risk = snap.risk || {};
        const agents = Array.isArray(risk.runningAgents) ? risk.runningAgents : [];
        return h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'dsh-restart-risk' },
            h('span', { className: 'dsh-restart-risk-title' }, t('riskTitle')),
            h('span', null, t('riskBody')),
            agents.length
              ? h(
                  'span',
                  { className: 'dsh-restart-code' },
                  agents.join(', '),
                )
              : null,
          ),
          h('p', { className: 'dsh-restart-note' }, t('sessionsResume')),
        );
      }

      if (snap.phase === 'error' || snap.phase === 'blocked') {
        return h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'dsh-restart-error' },
            h(
              'span',
              { className: 'dsh-restart-risk-title' },
              snap.phase === 'blocked' ? t('blockedTitle') : t('errorTitle'),
            ),
            h('span', null, snap.error || t('cannotRestart')),
          ),
          snap.statusError
            ? h('p', { className: 'dsh-restart-note' }, t('checkFailed', { message: snap.statusError }))
            : null,
          snap.phase === 'blocked' && blockedStale
            ? h(
                'div',
                { className: 'dsh-restart-risk' },
                h('span', { className: 'dsh-restart-risk-title' }, t('managerStuck')),
                h('span', null, t('managerStuckHint')),
                h('span', { className: 'dsh-restart-note' }, t('forceStaleHint')),
              )
            : null,
        );
      }

      const status = snap.status;
      if (status === null) {
        return h('p', { className: 'dsh-restart-note' }, t('checkFailed', {
          message: snap.statusError || t('cannotRestart'),
        }));
      }

      const agents = Array.isArray(status.runningAgents)
        ? status.runningAgents
        : [];
      const operationActive = Boolean(
        status.pluginOperation && status.pluginOperation.active,
      );
      const stale = Boolean(
        status.pluginOperation && status.pluginOperation.stale,
      );
      return h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'dsh-restart-status-list' },
          h(
            StatusLine,
            { tone: status.desktop ? 'ok' : 'warn' },
            status.desktop ? t('canRestart') : t('notDesktop'),
          ),
          h(
            StatusLine,
            { tone: agents.length ? 'warn' : 'ok' },
            agents.length
              ? t('runningCount', { count: agents.length })
              : t('idle'),
          ),
          operationActive
            ? h(
                StatusLine,
                { tone: 'error' },
                stale ? t('managerStuck') : t('pluginBusy'),
              )
            : null,
          !status.allowRestart
            ? h(StatusLine, { tone: 'error' }, t('disabled'))
            : null,
        ),
        stale
          ? h(
              'div',
              { className: 'dsh-restart-risk' },
              h('span', { className: 'dsh-restart-risk-title' }, t('managerStuck')),
              h('span', null, t('managerStuckHint')),
              h('span', { className: 'dsh-restart-note' }, t('forceStaleHint')),
            )
          : null,
        h(
          'div',
          { className: 'dsh-restart-meta' },
          h(
            'div',
            { className: 'dsh-restart-meta-row' },
            h('span', { className: 'dsh-restart-meta-key' }, t('appLabel')),
            h(
              'span',
              { className: 'dsh-restart-code' },
              (status.desktopSignals && status.desktopSignals.appBundle) ||
                t('cannotRestart'),
            ),
          ),
          h(
            'div',
            { className: 'dsh-restart-meta-row' },
            h('span', { className: 'dsh-restart-meta-key' }, t('portLabel')),
            h('span', { className: 'dsh-restart-code' }, String(status.port || '—')),
          ),
          h(
            'div',
            { className: 'dsh-restart-meta-row' },
            h('span', { className: 'dsh-restart-meta-key' }, t('logLabel')),
            h(
              'span',
              { className: 'dsh-restart-code' },
              (status.logs && status.logs.dir) || '—',
            ),
          ),
        ),
        agents.length
          ? h('p', { className: 'dsh-restart-note' }, t('forceHint'))
          : null,
      );
    }

    function RestartDialog(props) {
      const { controller, t } = props;
      const snap = useController(controller);
      const dialogRef = React.useRef(null);
      const previousFocusRef = React.useRef(null);

      React.useEffect(() => {
        if (!snap.open) return undefined;
        previousFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const timer = window.setTimeout(() => {
          const dialog = dialogRef.current;
          if (dialog === null) return;
          const target = dialog.querySelector(
            '.dsh-restart-button-primary, .dsh-restart-button-danger, .dsh-restart-button',
          );
          if (target instanceof HTMLElement) target.focus();
        }, 0);

        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            controller.close();
            return;
          }
          if (event.key !== 'Tab') return;
          const dialog = dialogRef.current;
          if (dialog === null) return;
          const focusable = Array.from(
            dialog.querySelectorAll(
              'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => element instanceof HTMLElement);
          if (focusable.length === 0) {
            event.preventDefault();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
          window.clearTimeout(timer);
          document.removeEventListener('keydown', onKeyDown, true);
          const previous = previousFocusRef.current;
          if (previous && document.contains(previous)) {
            try {
              previous.focus();
            } catch {
              // The old control may belong to a collapsed slot.
            }
          }
        };
      }, [snap.open, controller]);

      if (!snap.open) return null;

      const status = snap.status;
      const canRestart = Boolean(status && status.canRestart);
      const busy = Array.isArray(status && status.runningAgents)
        ? status.runningAgents.length > 0
        : false;
      const stale = Boolean(
        (status &&
          status.pluginOperation &&
          status.pluginOperation.stale) ||
          (snap.blocked &&
            snap.blocked.status &&
            snap.blocked.status.pluginOperation &&
            snap.blocked.status.pluginOperation.stale),
      );

      let primary = null;
      if (snap.phase === 'ready') {
        primary = stale
          ? h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button dsh-restart-button-danger',
                onClick: () => controller.confirm(true, true),
              },
              t('forceStale'),
            )
          : h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button dsh-restart-button-primary',
                disabled: !canRestart,
                onClick: () => controller.confirm(false),
              },
              canRestart ? t('restartNow') : t('cannotRestart'),
            );
      } else if (snap.phase === 'risk') {
        primary = h(
          'button',
          {
            type: 'button',
            className: 'dsh-restart-button dsh-restart-button-danger',
            onClick: () => controller.confirm(true),
          },
          t('restartAnyway'),
        );
      } else if (snap.phase === 'blocked' && stale) {
        primary = h(
          'button',
          {
            type: 'button',
            className: 'dsh-restart-button dsh-restart-button-danger',
            onClick: () => controller.confirm(true, true),
          },
          t('forceStale'),
        );
      } else if (
        snap.phase === 'error' ||
        snap.phase === 'blocked' ||
        snap.phase === 'stalled'
      ) {
        primary = h(
          'button',
          {
            type: 'button',
            className: 'dsh-restart-button dsh-restart-button-primary',
            onClick: () => controller.retry(),
          },
          t('retry'),
        );
      } else if (snap.phase === 'restarting' || snap.phase === 'submitting') {
        primary = h(
          'button',
          {
            type: 'button',
            className: 'dsh-restart-button dsh-restart-button-primary',
            disabled: true,
          },
          snap.phase === 'restarting' ? t('restarting') : t('submitting'),
        );
      }

      return h(
        'div',
        {
          className: 'dsh-restart-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) controller.close();
          },
        },
        h('div', { className: 'dsh-restart-scrim' }),
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-restart-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-restart-dialog-title',
            onMouseDown: (event) => event.stopPropagation(),
          },
          h(
            'div',
            { className: 'dsh-restart-dialog-head' },
            h(
              'span',
              { className: 'dsh-restart-dialog-icon' },
              h(RestartIcon, { size: 18 }),
            ),
            h(
              'h2',
              { id: 'dsh-restart-dialog-title', className: 'dsh-restart-dialog-title' },
              t('dialogTitle'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-close',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => controller.close(),
              },
              '×',
            ),
          ),
          h('p', { className: 'dsh-restart-note' }, t('dialogSubtitle')),
          h(ModalBody, { snap, t }),
          h(
            'div',
            { className: 'dsh-restart-dialog-footer' },
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button',
                onClick: () => controller.close(),
              },
              t('cancel'),
            ),
            primary,
          ),
        ),
      );
    }

    function Overlay(props) {
      const { controller, prefs, t } = props;
      return h(
        React.Fragment,
        null,
        h(RestartDialog, { controller, t }),
        h(FloatingButton, { controller, prefs, t }),
      );
    }

    function Toggle(props) {
      const { label, description, checked, onChange } = props;
      return h(
        'div',
        { className: 'dsh-restart-toggle-row' },
        h(
          'div',
          { className: 'dsh-restart-toggle-text' },
          h('span', { className: 'dsh-restart-toggle-label' }, label),
          description
            ? h('span', { className: 'dsh-restart-toggle-desc' }, description)
            : null,
        ),
        h(
          'button',
          {
            type: 'button',
            role: 'switch',
            'aria-checked': checked ? 'true' : 'false',
            'aria-label': label,
            className: 'dsh-restart-switch',
            onClick: () => onChange(!checked),
          },
          h('span', { className: 'dsh-restart-switch-knob' }),
        ),
      );
    }

    function phaseLabel(phase, t) {
      if (!phase) return '';
      const camel = String(phase)
        .split('-')
        .map((part, index) =>
          index === 0
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join('');
      const key = `phase${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
      const label = t(key);
      return label === key ? String(phase) : label;
    }

    function SettingsPage(props) {
      const { controller, prefs, t } = props;
      const snap = useController(controller);
      const values = usePrefs(prefs);

      React.useEffect(() => {
        controller.loadStatus();
      }, [controller]);

      const status = snap.status;
      const operationActive = Boolean(
        status && status.pluginOperation && status.pluginOperation.active,
      );
      const stale = Boolean(
        status && status.pluginOperation && status.pluginOperation.stale,
      );
      const agents =
        status && Array.isArray(status.runningAgents)
          ? status.runningAgents.length
          : 0;
      const canRestart = Boolean(status && status.canRestart);
      const statusTone = status
        ? !status.desktop || !status.allowRestart || operationActive
          ? 'error'
          : agents > 0
            ? 'warn'
            : 'ok'
        : 'warn';
      const statusText = status
        ? !status.desktop
          ? t('notDesktop')
          : !status.allowRestart
            ? t('disabled')
            : operationActive
              ? stale
                ? t('managerStuck')
                : t('pluginBusy')
              : agents > 0
                ? t('runningCount', { count: agents })
                : t('canRestart')
        : snap.statusError
          ? t('checkFailed', { message: snap.statusError })
          : t('loadingStatus');
      const last = status && status.lastRestart;
      const lastPhase = last ? phaseLabel(last.phase, t) : '';
      const lastUpdated =
        last && last.updatedAt
          ? new Date(last.updatedAt).toLocaleString()
          : '';
      const latestLog = status && status.logs && status.logs.latest;
      const logAction = snap.logAction;

      return h(
        'div',
        { className: 'dsh-restart-page' },
        h(
          'section',
          { className: 'dsh-restart-card' },
          h(
            'div',
            { className: 'dsh-restart-card-head' },
            h(
              'span',
              { className: 'dsh-restart-card-icon' },
              h(RestartIcon, { size: 18 }),
            ),
            h(
              'div',
              null,
              h('h2', { className: 'dsh-restart-title' }, t('restart')),
              h('p', { className: 'dsh-restart-subtitle' }, t('settingsIntro')),
            ),
          ),
          h(
            'div',
            { className: 'dsh-restart-status-list' },
            h(
              'div',
              { className: 'dsh-restart-status-line' },
              h('span', {
                className: `dsh-restart-dot dsh-restart-dot-${statusTone}`,
              }),
              h('span', null, statusText),
            ),
          ),
          stale
            ? h('p', { className: 'dsh-restart-note' }, t('managerStuckHint'))
            : null,
          h(
            'div',
            { className: 'dsh-restart-meta' },
            h(
              'div',
              { className: 'dsh-restart-meta-row' },
              h('span', { className: 'dsh-restart-meta-key' }, t('appLabel')),
              h(
                'span',
                { className: 'dsh-restart-code' },
                (status && status.desktopSignals && status.desktopSignals.appBundle) ||
                  '—',
              ),
            ),
            h(
              'div',
              { className: 'dsh-restart-meta-row' },
              h('span', { className: 'dsh-restart-meta-key' }, t('portLabel')),
              h(
                'span',
                { className: 'dsh-restart-code' },
                String((status && status.port) || '—'),
              ),
            ),
            h(
              'div',
              { className: 'dsh-restart-meta-row' },
              h('span', { className: 'dsh-restart-meta-key' }, t('logLabel')),
              h(
                'span',
                { className: 'dsh-restart-code' },
                (status && status.logs && status.logs.dir) || '—',
              ),
            ),
          ),
          h(
            'div',
            { className: 'dsh-restart-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button dsh-restart-button-primary',
                onClick: () => controller.open(),
              },
              t('restartNow'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button',
                onClick: () => controller.loadStatus(),
              },
              t('retry'),
            ),
          ),
          !canRestart && status
            ? h('p', { className: 'dsh-restart-note' }, t('cannotRestart'))
            : null,
        ),
        h(
          'section',
          { className: 'dsh-restart-card' },
          h(
            'h3',
            { className: 'dsh-restart-section-title' },
            t('lastRestartTitle'),
          ),
          last
            ? h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'dsh-restart-status-list' },
                  h(
                    StatusLine,
                    {
                      tone:
                        last.phase === 'opened'
                          ? 'ok'
                          : last.phase === 'failed'
                            ? 'error'
                            : 'warn',
                    },
                    `${lastPhase}${lastUpdated ? ` · ${lastUpdated}` : ''}`,
                  ),
                ),
                last.phase === 'failed' && last.note
                  ? h('p', { className: 'dsh-restart-note' }, last.note)
                  : null,
                last.phase === 'failed' && last.error
                  ? h('p', { className: 'dsh-restart-note' }, last.error)
                  : null,
                h('p', { className: 'dsh-restart-note' }, t('lastRestartNote')),
              )
            : h('p', { className: 'dsh-restart-note' }, t('lastRestartNone')),
          h(
            'div',
            { className: 'dsh-restart-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-restart-button',
                disabled: !latestLog,
                onClick: () => controller.openLogs('latest'),
              },
              latestLog ? t('openLatestLog') : t('noLatestLog'),
            ),
          ),
          logAction && logAction.state === 'error'
            ? h(
                'p',
                { className: 'dsh-restart-note' },
                t('logActionFailed', { message: logAction.message || '' }),
              )
            : null,
        ),
        h(
          'section',
          { className: 'dsh-restart-card' },
          h('h3', { className: 'dsh-restart-section-title' }, t('appearanceTitle')),
          h(Toggle, {
            label: t('showHeader'),
            description: t('showHeaderDesc'),
            checked: values.showHeaderIcon,
            onChange: (checked) => prefs.set({ showHeaderIcon: checked }),
          }),
          h(Toggle, {
            label: t('showSidebar'),
            description: t('showSidebarDesc'),
            checked: values.showSidebarIcon,
            onChange: (checked) => prefs.set({ showSidebarIcon: checked }),
          }),
          h(Toggle, {
            label: t('showFloating'),
            description: t('showFloatingDesc'),
            checked: values.showFloatingIcon,
            onChange: (checked) => prefs.set({ showFloatingIcon: checked }),
          }),
          values.showFloatingIcon
            ? h(
                'div',
                { className: 'dsh-restart-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-restart-button',
                    onClick: () => prefs.set({ float: { x: null, y: null } }),
                  },
                  t('resetFloat'),
                ),
              )
            : null,
        ),
        h(
          'section',
          { className: 'dsh-restart-card' },
          h('h3', { className: 'dsh-restart-section-title' }, t('howTitle')),
          h('p', { className: 'dsh-restart-note' }, t('howBody')),
          h('p', { className: 'dsh-restart-note' }, t('commandHint')),
          h('p', { className: 'dsh-restart-note' }, t('sessionsResume')),
        ),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { en: DICT.en, zh: DICT.zh }),
          'dsh-restart: dictionaries',
        );
        const t = ctx.locale.bind(NS);
        const prefs = createPrefs();
        const controller = createController(t);

        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'dsh-restart:header',
              order: 30,
              locale: NS,
            },
            () => h(HeaderButton, { controller, prefs, t }),
          ),
        );

        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'dsh-restart:sidebar',
              order: 20,
              locale: NS,
              label: () => t('restartShort'),
            },
            () => h(SidebarButton, { controller, prefs, t }),
          ),
        );

        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'dsh-restart',
              order: 60,
              locale: NS,
              label: () => t('settingsNav'),
            },
            () => h(SettingsPage, { controller, prefs, t }),
          ),
        );

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'dsh-restart:overlay',
              order: 40,
              locale: NS,
            },
            () => h(Overlay, { controller, prefs, t }),
          ),
        );

        // One stylesheet per Client activation; the plugin context removes it
        // when the plugin unloads.
        ctx.effect(() => {
          const style = document.createElement('style');
          style.setAttribute('data-dsh-restart', '');
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'dsh-restart: styles');
      },
    };
  },
});
