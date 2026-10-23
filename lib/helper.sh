#!/bin/sh
# dsh-restart helper: runs detached from the DSH desktop host, stops the
# Electron main process, waits for the host to exit and release the web port,
# then relaunches the exact .app bundle.
#
# usage:
#   helper.sh [--dry-run] <main-pid-hint> <bin> <app-bundle> <port> <log> <host-pid> <state> <restart-id>
#   helper.sh --opener <old-main-pid> <bin> <app-bundle> <port> <log> <host-pid> <state> <restart-id>
#
# The killer is the primary path. The `--opener` mode is started before it and
# only waits/opens; if the killer is torn down with the old process tree, the
# opener can still bring the app back. The killer also opens as a fallback, so
# a failed opener never makes the restart worse than it was before.
#
# Only the Electron MAIN process is terminated. The host is a child of it and
# shuts itself down gracefully when its IPC channel disappears; killing the
# host first could lose the last session-log checkpoint. The host is force
# stopped only when it refuses to exit.

set -u
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH

DRY_RUN=0
OPENER=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  shift
fi
if [ "${1:-}" = "--opener" ]; then
  OPENER=1
  shift
fi

MAIN_HINT="${1:-0}"
BIN="${2:-}"
APP="${3:-}"
PORT="${4:-0}"
LOG="${5:-}"
HOST_PID="${6:-0}"
STATE="${7:-}"
RESTART_ID="${8:-}"
FORCE_KILL="${9:-0}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*"
}

# The Electron main process has the app executable as its complete command
# line (no arguments). pgrep is deliberately not used: it is unavailable in
# some sandboxed environments where `ps -ax` still works.
main_pids() {
  /bin/ps -ax -o pid=,command= 2>/dev/null | /usr/bin/awk -v b="$BIN" '
    {
      pid = $1
      sub(/^[[:space:]]*[0-9]+[[:space:]]+/, "", $0)
      if ($0 == b) print pid
    }'
}

# The desktop host is the same executable with --expose-internals and the
# dsh-desktop-host entry on its command line.
host_pids() {
  /bin/ps -ax -o pid=,command= 2>/dev/null | /usr/bin/awk -v b="$BIN --expose-internals" '
    {
      pid = $1
      sub(/^[[:space:]]*[0-9]+[[:space:]]+/, "", $0)
      if (index($0, b) == 1) print pid
    }'
}

choose_main() {
  if [ "$MAIN_HINT" -gt 1 ] 2>/dev/null; then
    for p in $(main_pids); do
      if [ "$p" = "$MAIN_HINT" ]; then
        printf '%s\n' "$p"
        return 0
      fi
    done
  fi
  main_pids | /usr/bin/head -n 1
}

hosts_alive() {
  [ -n "$(host_pids)" ]
}

wait_hosts_gone() {
  limit="$1"
  i=0
  while [ "$i" -lt "$limit" ]; do
    hosts_alive || return 0
    sleep 0.5
    i=$((i + 1))
  done
  ! hosts_alive
}

current_phase() {
  [ -f "$STATE" ] || return 0
  /usr/bin/sed -n 's/.*"phase":"\([^"]*\)".*/\1/p' "$STATE" 2>/dev/null | /usr/bin/head -n 1
}

# Atomic enough for the two writers: each builds a private temp file and
# renames it over the shared state. The last writer wins.
state_write() {
  [ -n "$STATE" ] || return 0
  phase="$1"
  note="${2:-}"
  # Once one helper has confirmed the app is back, keep the FIRST success
  # record. A late failure, or another "already-running" observation, must not
  # rewrite the phase/note/timestamp.
  if [ "$(current_phase)" = "opened" ]; then
    return 0
  fi
  updated="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  tmp="${STATE}.tmp.$$"
  printf '{"restartId":"%s","phase":"%s","note":"%s","updatedAt":"%s","hostPid":%s,"mainPid":%s,"port":%s,"log":"%s","app":"%s"}\n' \
    "$RESTART_ID" "$phase" "$note" "$updated" "$HOST_PID" "$MAIN_HINT" "$PORT" "$LOG" "$APP" >"$tmp" 2>/dev/null || return 0
  /bin/mv -f "$tmp" "$STATE" 2>/dev/null || /bin/rm -f "$tmp" 2>/dev/null || true
}

wait_port_free() {
  [ "$PORT" -gt 0 ] 2>/dev/null || return 0
  i=0
  while [ "$i" -lt 120 ]; do
    if ! /usr/bin/nc -z -w 1 127.0.0.1 "$PORT" >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
    i=$((i + 1))
  done
  if [ "$i" -ge 120 ]; then
    log "port ${PORT} still appears in use after 30s; opening anyway"
  else
    log "port ${PORT} released (waited ${i} checks)"
  fi
}

# Open the app and verify a main process appeared. `MAIN_HINT` is the OLD main
# pid; a different pid (or the old pid disappearing) proves a new instance.
relaunch() {
  state_write "opening" ""
  log "relaunching ${APP}"
  if ! /usr/bin/open -a "$APP"; then
    log "open -a bundle path failed; trying the application name"
    if ! /usr/bin/open -a "DeepSeek Harness"; then
      log "relaunch failed"
      state_write "failed" "open-failed"
      /usr/bin/osascript -e 'display dialog "DeepSeek Harness was closed but could not reopen. Please start it again manually. Restart logs are in ~/.dsh/dsh-restart." buttons {"OK"} default button "OK" with icon caution' >/dev/null 2>&1 || true
      return 1
    fi
  fi

  i=0
  while [ "$i" -lt 24 ]; do
    M2="$(main_pids | /usr/bin/head -n 1)"
    if [ -n "$M2" ]; then
      old_alive=0
      for p in $(main_pids); do
        if [ "$p" = "$MAIN_HINT" ]; then
          old_alive=1
        fi
      done
      if [ "$old_alive" = "0" ] || [ "$M2" != "$MAIN_HINT" ]; then
        state_write "opened" "relaunched"
        log "relaunched successfully (main pid ${M2})"
        return 0
      fi
    fi
    sleep 0.5
    i=$((i + 1))
  done

  log "the app did not come back within 12s"
  state_write "failed" "app-did-not-return"
  /usr/bin/osascript -e 'display dialog "DeepSeek Harness was closed but did not come back. Please open it again manually. Restart logs are in ~/.dsh/dsh-restart." buttons {"OK"} default button "OK" with icon caution' >/dev/null 2>&1 || true
  return 1
}

if [ "$DRY_RUN" = "1" ]; then
  if ! /bin/ps -ax -o pid=,command= >/dev/null 2>&1; then
    echo 'error=ps-unavailable'
    exit 3
  fi
  M="$(choose_main)"
  H="$(host_pids | /usr/bin/tr '\n' ' ')"
  printf 'main=%s\n' "${M:-none}"
  printf 'hosts=%s\n' "${H:-none}"
  exit 0
fi

if [ -z "$LOG" ]; then
  LOG="${TMPDIR:-/tmp}/dsh-restart-helper.log"
fi
/bin/mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
exec >>"$LOG" 2>&1

if [ "$OPENER" = "1" ]; then
  log "opener starting (pid $$, old main ${MAIN_HINT}, port ${PORT})"
  log "bin=${BIN}"
  log "app=${APP}"
  state_write "opener-started" ""
  if [ -z "$BIN" ] || [ -z "$APP" ]; then
    log "missing app executable or bundle path; refusing to act"
    state_write "failed" "missing-args"
    exit 2
  fi
  if ! /bin/ps -ax -o pid=,command= >/dev/null 2>&1; then
    log "ps is unavailable; cannot locate the desktop processes safely"
    state_write "failed" "ps-unavailable"
    exit 3
  fi

  state_write "waiting-old-main" ""
  i=0
  while [ "$i" -lt 120 ]; do
    if [ "$(current_phase)" = "cancelled" ]; then
      log "the restart was cancelled; opener exiting without opening"
      exit 0
    fi
    M_NOW="$(main_pids | /usr/bin/head -n 1)"
    if [ -n "$M_NOW" ] && [ "$M_NOW" != "$MAIN_HINT" ]; then
      log "app already back as ${M_NOW}; nothing to open"
      state_write "opened" "already-running"
      exit 0
    fi
    if [ -z "$M_NOW" ]; then
      break
    fi
    sleep 0.5
    i=$((i + 1))
  done
  if [ "$i" -ge 120 ]; then
    log "old main did not exit in 60s; not opening a second instance"
    state_write "failed" "old-main-still-running"
    exit 1
  fi

  state_write "waiting-port" ""
  wait_port_free
  state_write "port-free" ""
  relaunch
  exit $?
fi

log "helper starting (pid $$, host ${HOST_PID}, main hint ${MAIN_HINT}, port ${PORT})"
log "bin=${BIN}"
log "app=${APP}"
state_write "starting" ""

if [ -z "$BIN" ] || [ -z "$APP" ]; then
  log "missing app executable or bundle path; refusing to act"
  state_write "failed" "missing-args"
  exit 2
fi

if ! /bin/ps -ax -o pid=,command= >/dev/null 2>&1; then
  log "ps is unavailable; cannot locate the desktop processes safely"
  state_write "failed" "ps-unavailable"
  /usr/bin/osascript -e 'display dialog "DeepSeek Harness could not be restarted because process inspection failed. Please quit and reopen the app manually." buttons {"OK"} default button "OK" with icon caution' >/dev/null 2>&1 || true
  exit 3
fi

# Let the HTTP 202 reach the browser before the window disappears.
sleep 1.5

M="$(choose_main)"
if [ -z "$M" ]; then
  log "no Electron main process found; treating this as a relaunch"
  state_write "no-main" "relaunch-only"
  for p in $(host_pids); do
    log "stopping orphaned host pid $p"
    kill -TERM "$p" 2>/dev/null || true
  done
  sleep 1
  for p in $(host_pids); do
    kill -KILL "$p" 2>/dev/null || true
  done
else
  if [ "$FORCE_KILL" = "1" ]; then
    # Explicit advanced path only (a stuck manager). This bypasses the app's
    # quit confirmation, which also means the main process may skip its final
    # account/session flush. The host still exits through IPC disconnect.
    log "force-ending Electron main pid $M (advanced: bypasses the app quit confirmation)"
    state_write "killing" "sigkill-main"
    kill -KILL "$M" 2>/dev/null || true

    # The host normally exits within a few seconds once its IPC channel drops.
    state_write "waiting-host" ""
    if ! wait_hosts_gone 40; then
      log "host still alive 20s after the main process was killed; stopping host processes"
      state_write "escalated" "stopping-host"
      for p in $(host_pids); do
        kill -TERM "$p" 2>/dev/null || true
      done
      sleep 2
      for p in $(host_pids); do
        log "force stopping host pid $p"
        kill -KILL "$p" 2>/dev/null || true
      done
      sleep 1
    fi
  else
    # Default: ordinary quit. The app shows its own quit confirmation when
    # scheduled tasks or other interruptible work exist; choosing Quit is what
    # lets the main process flush account/session state. We never escalate to
    # SIGKILL here: Cancel must really cancel, and an unanswered dialog must
    # not silently corrupt the next boot.
    log "sending SIGTERM to Electron main pid $M (the app may show its own quit confirmation; choose Quit to save state)"
    state_write "killing" "sigterm-main"
    kill -TERM "$M" 2>/dev/null || true
    state_write "waiting-host" ""
    if ! wait_hosts_gone 6; then
      # The main process is the quit decision point. If it is still alive, the
      # user cancelled (or never answered) the app's confirmation. If it is
      # already gone, the quit was confirmed; the old host may simply still be
      # flushing, and cancelling here would be a false negative after the
      # opener has already relaunched the app.
      if kill -0 "$M" 2>/dev/null; then
        log "main still alive 3s after SIGTERM; treating the quit confirmation as cancelled"
        state_write "cancelled" "quit-cancelled"
        exit 4
      fi
      log "main exited but the old host is still shutting down; waiting without cancelling"
      wait_hosts_gone 40 || true
    fi
  fi
fi

state_write "host-exited" ""

# The independent opener may already have brought the app back. Do not
# overwrite its final "opened" state with a later helper phase.
if [ "$(current_phase)" = "opened" ]; then
  log "opener already relaunched the app; helper exiting"
  exit 0
fi

state_write "waiting-port" ""
wait_port_free
state_write "port-free" ""
relaunch
exit $?
