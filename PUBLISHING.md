# Publishing `dsh-restart`

This package is published as `dsh-macos-restart` on npm. The local development
copy remains `@local/dsh-restart`; the public artifact is generated from it.

## Current status (2026-10-22)

- npm: `dsh-macos-restart@0.1.7` is `latest`; **0.2.5 is built and pushed to
  GitHub, but npm publish is pending a fresh `npm login`** (the CLI token
  expired after the 0.1.7 release).
- GitHub: <https://github.com/chai-yinfeng/dsh-macos-restart> (public, 0.2.5,
  bilingual `README.md` / `README.zh.md`).
- Catalog: the entry is prepared on the fork branch
  `chai-yinfeng/awesome-dsh-plugin:add-dsh-macos-restart`
  (`data/plugins/chai-yinfeng__dsh-macos-restart.yml`, category `dev`).
  The 1-day repository-age rule is satisfied. The automatic PR reminder was
  cancelled; open the PR after npm 0.2.5 is published.
  Compare URL:
  <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/compare/main...chai-yinfeng:add-dsh-macos-restart?expand=1>

## Prepared defaults (change them if you want)

| Field | Recommended |
| --- | --- |
| Public npm name | `dsh-macos-restart` (available at the time of writing) |
| Version | `0.2.5` |
| License | MIT |
| GitHub repo | `https://github.com/chai-yinfeng/dsh-macos-restart` |
| Catalog category | **Development & Runtime** (`dev`; the prepared entry uses it) |
| Short description | macOS 桌面版一键重启 / One-click restart for the DeepSeek Harness desktop app. |

Do not publish under `@local/*`: that scope is a development placeholder.

## Current accounts

- GitHub CLI is authenticated as **`chai-yinfeng`** (repo scope). Repository
  creation/push and the catalog PR can use that account after you confirm.
- npm is logged in on this machine as **`blackmagicc`** (`npm whoami` verified).
  Never paste an npm password or token into chat; use `npm login` locally or an
  automation token in CI.

## Build the publishable copy

The working copy stays installed as `@local/dsh-restart`. The public copy is
generated, not hand-renamed:

```sh
node scripts/prepare-publish.mjs
cd dist/dsh-macos-restart
npm pack --dry-run
```

The script rewrites the three identifiers that must agree, so a mismatch cannot
silently ship:

- `package.json` → `name: dsh-macos-restart`, `private: false`, npm fields
- `cordis.patch.yml` → the inserted row's `name`
- `lib/client.js` → `window.__ModuleLoader__.load({ id: ... })`

It also copies `LICENSE`, the locale files, the icon, and the README. Inspect
`dist/dsh-macos-restart/package.json` and the tarball file list before
publishing.

## Before publishing

1. Run the build script above and confirm there is no leftover
   `@local/dsh-restart` string in `dist/`.
2. Keep `files` accurate. Runtime files: `lib/index.js`, `lib/client.js`,
   `lib/helper.sh`, `cordis.patch.yml`, `locale/*.json`, `icon.svg`,
   `README.md`, `LICENSE`. `PUBLISHING.md` is repository documentation, not
   runtime.
3. Install the packed tarball in a scratch profile. Do one real restart and
   confirm `~/.dsh/dsh-restart/state.json` reaches `phase: "opened"` (the opener
   is the new independent path).

## Publish to npm

Run these inside `dist/dsh-macos-restart`:

```sh
npm adduser          # create/sign in to your npm account; npm 2FA/token
npm pack --dry-run   # inspect the exact file list
npm publish --access public
```

- npm publishing does **not** require GitHub login. `npm login` authenticates to
  npm; GitHub is only involved if you choose GitHub Packages or npm's GitHub
  identity provider.
- If the name `dsh-macos-restart` is taken by the time you publish, use another
  available name or your own npm scope.
- After publishing, anyone can install it directly:

  ```sh
  dsh plugin add dsh-macos-restart
  ```

## List it in the marketplace

The DSH marketplace only installs sources present in the curated
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
registry. npm publication alone makes the package installable, not listed.

1. Create a public GitHub repository containing the generated public package
   (`dist/dsh-macos-restart`) plus this checklist. `gh` is already authenticated
   as `chai-yinfeng`. The local `@local/dsh-restart` install stays a separate
   development copy.
2. Open a PR against
   [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
   adding one entry under **UI Enhancements** (or **Development & Runtime**):

   ```markdown
   - [chai-yinfeng/dsh-macos-restart](https://github.com/chai-yinfeng/dsh-macos-restart) - macOS 桌面版一键重启 / One-click restart for the DeepSeek Harness desktop app; confirms running turns and blocks during plugin install/update.
   ```

3. The site and market pick the entry up automatically, usually within a day.
   The PR requires a GitHub account; npm publishing does not.

The catalog is a curated list, not a security review. It checks that the plugin
installs with `dsh plugin add`, does what its description says, sits in the
right category, and is maintained. Be precise: this plugin restarts the
**macOS desktop app**, not `dsh web`.

## GitHub login, precisely

| Task | Account needed |
| --- | --- |
| `npm publish` | npm account + 2FA/token. No GitHub login. |
| Public source repo / issues | GitHub account (`chai-yinfeng` is already authenticated here). |
| PR to awesome-dsh-plugin | GitHub account. |
| npm provenance via GitHub Actions | GitHub repo/workflow + npm token; the publish uses OIDC, not your personal login. |

## Release flow after the first publish

1. Bump `version` (semver) and update `README`/changelog.
2. `npm publish` (or `npm publish --provenance` from CI).
3. The market's update check compares the npm version; users update from the
   Plugins page. GitHub-only installs are not used for this package once npm is
   the source.

## Notes specific to this plugin

- The helper terminates the Electron **main** process; the host exits through
  its IPC-disconnect path. The catalog reviewer will read this, so keep the
  warning visible in the README.
- macOS-only in this version. Other platforms get `403` from the routes and no
  working button.
- The restart route is loopback/same-origin only, blocks during plugin
  install/update, and requires a second confirmation while a turn is running.
- The opener is independent from the killer and spawned as a one-shot detached
  process. Do **not** use `launchctl submit` for it: in the 0.1.4 verification
  that job kept restarting the opener every ~10s after the app was back,
  growing the log and rewriting `state.json`. The killer also opens as a
  fallback. `state.json` records phases so a failed restart leaves evidence.
- The helper is spawned with a clean environment (no `ELECTRON_RUN_AS_NODE`),
  waits for the host to exit and the port to be released, then verifies that a
  new main process appeared.
