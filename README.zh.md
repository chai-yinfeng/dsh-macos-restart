# macOS 桌面版重启（`dsh-macos-restart`）

[English](https://github.com/chai-yinfeng/dsh-macos-restart/blob/main/README.md) | 中文

macOS 桌面版一键重启：让无法热加载的插件在下次启动时生效。

这是 **DeepSeek Harness 桌面版** 的 macOS 一键重启插件。它处理 Electron 应用本身，不是 `dsh web` 宿主：重启的目的是让无法热加载的插件在下一次启动时加载。

## 范围

**仅适用于 macOS 桌面版。** 它不是通用的标题栏控件，也不是 `dsh web` 的重启按钮：

- 结束 Electron **主进程**，让桌面 host 通过自己的 IPC 断开路径退出；等待旧 web 端口释放后，对 `.app` 执行 `open -a`。
- 不支持 Windows、Linux、`dsh web` 或独立 `dsh` CLI。
- 刻意不提供“退出”动作；macOS 已有 Cmd+Q。这里的价值是自动重新拉起、运行中任务检查和插件安装门禁。

社区插件 `dsh-header-controls` 也会在会话标题栏放重启/退出按钮，但它文档中的机制是 `dsh web` launcher + Windows `taskkill`/`netstat` 流程，不会重启 macOS Electron 应用。两者只在“标题栏位置”这一层重合。

## 入口

- **标题栏图标**：会话右上角，默认开启。
- **侧栏底部图标**：设置按钮旁，默认关闭，可在设置里打开。
- **设置 → 桌面版重启**：状态、上次重启、日志、入口开关和重启按钮。
- **`/restart-desktop`** 命令；有任务运行时用 `--force`。
- **可拖动的浮动按钮**：默认关闭，位置会记住。

标题栏、侧栏、浮动按钮、设置页和命令都调用同一个 Host 操作。

## 重启过程

1. 客户端向 `POST /plugins/dsh-restart/restart` 发送 `{ "confirm": true }`。
2. Host 检查请求是否来自 loopback/同源、当前是否为 macOS 桌面 host、是否有插件安装/更新在跑、是否有任务在运行。
3. Host 写 handoff 记录和初始 `state.json`，然后启动一个**独立的 one-shot opener**（detached `/bin/sh`）。opener 只等待和打开，不杀进程。不要使用 `launchctl submit`：0.1.4 真机测试中，这个 job 会在应用回来后每约 10 秒重复拉起 opener。
4. Host 启动 killer helper。它向 **Electron 主进程** 发送 SIGTERM。应用可能会弹出自己的退出确认（定时任务）；点“退出”会让它保存账号/会话状态。host 是独立子进程，会看到 IPC 通道关闭并走自己的优雅关闭，所以会话日志仍会落盘。正常重启不会升级到 SIGKILL——取消必须真的取消，未回答的弹窗也不能被静默强杀。只有显式的 stale-manager **高级**路径会用 SIGKILL，并带自己的警告。
5. opener/killer 等待旧主进程消失、旧 web 端口释放，然后执行 `open -a "/Applications/DeepSeek Harness.app"`。`open -a` 对已在运行的应用只是激活，所以两个 helper 不会启动两个实例。
6. 如果 host 拒绝退出，会升级处理。失败时弹窗提示，日志在 `~/.dsh/dsh-restart/`。

## 诊断

- `~/.dsh/dsh-restart/state.json` 记录上次重启的阶段：`queued → opener-started/killing → waiting-host → host-exited → waiting-port → port-free → opening → opened`（或 `failed`）。
- 设置页显示上次阶段/时间，并提供一个 **在 Finder 中显示最近日志** 按钮。`POST /plugins/dsh-restart/open-logs` 从 Host 做同样的事，所以页面断开后也能用。它使用 `open -R`（Finder 显示并定位），因为直接 `open <file>.log` 依赖默认应用，可能看起来没反应。
- helper 日志包含进程级记录；state 文件是进程树被清理后仍能保留的简要版本。

## 卡住的安装恢复

如果插件管理器持有安装锁、且五分钟内没有任何 pnpm/安装进展，状态会变成 `pluginOperation.stale`，弹窗会出现 **强制重启（高级）**。这个入口只在锁属于当前 host，或根本没有 manager 锁时出现；不会绕过仍在运行的 pnpm 进程。强制重启会结束 host、释放锁并重开应用，未完成的安装会被中断；由于它绕过应用自己的退出确认，主进程可能不会完成最后的账号/窗口状态落盘。只在 manager 确实卡住时使用。

## 安全

- 只接受 loopback 请求。桌面文档代理可能同时去掉 `Host`/`Origin`，也可能只去掉 `Origin`；loopback `Host` 且没有 `Origin` 会被接受，带 `Origin` 时必须与 `Host` 匹配。`sec-fetch-site: cross-site` 会被拒绝。
- 有任务运行时返回 `409 busy`；客户端列出受影响的会话 id，并要求二次确认后才发送 `force: true`。
- 插件安装/更新中返回 `423`；唯一例外是上面描述的“stale manager 锁”高级强制路径。
- `cordis.patch.yml` 里 `allowRestart: false` 可完全禁用。
- 插件不修改 `app.asar`，也不会启动第二个服务器。

## 配置

```yaml
- id: dsh-restart
  name: 'dsh-macos-restart'
  config:
    allowRestart: true
```

## 文件

- `lib/index.js` — Host 路由（`/status`、`/restart`、`/open-logs`）、门禁、命令、state、helper/opener 调度。
- `lib/helper.sh` — detached killer/opener helper（支持 `--dry-run`）。
- `lib/client.js` — 标题栏图标、侧栏按钮、设置页、弹窗、浮动按钮、日志操作。
- `locale/{en,zh}.json` — 插件管理器显示元数据。
- `README.md` — 英文 README。
- `PUBLISHING.md` — npm + curated catalog 发布清单。

## 发布

见 [PUBLISHING.md](https://github.com/chai-yinfeng/dsh-macos-restart/blob/main/PUBLISHING.md)。当前包名 `dsh-macos-restart` 是本地开发名；可发布的包是 npm 上的 `dsh-macos-restart`。
