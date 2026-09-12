# Capture test

## Tool and model

- **Tool:** Cursor (Desktop / IDE Agent)
- **Model:** Cursor Grok 4.6 (`cursor-grok-4.6-high-fast`). Same model plans and executes. There is no separate planner.

## Mechanism

Cursor project hooks fire on their own. No one has to remember to run a command.

| File | Role |
|---|---|
| `.cursor/hooks.json` | Wires `beforeSubmitPrompt`, `afterAgentResponse`, and `stop` to the capture script |
| `.cursor/hooks/capture.py` | Appends `PROMPT` / `RESPONSE` in the required format |
| `.cursor/hooks/capture.cmd` | Windows launcher (kept; hooks.json now calls `python` directly) |
| `.cursor/rules/agent-capture.mdc` | Tells the agent not to edit or tidy the logs |
| `.gitignore` | Ignores only `.cursor/hooks/state/`. `.agent-logs/` is **not** ignored |

- `beforeSubmitPrompt` writes the prompt, verbatim
- `afterAgentResponse` stores the final assistant `text`
- `stop` flushes that text as the `RESPONSE` entry

## Log files the canaries landed in

- Canary 1 (session that installed the hook): `.agent-logs/2026-09-12_09-30-14_2fa7299a-6fec-41c7-9c98-96ebadccfa66.md`
- Canary 2 (a new Cursor chat): `.agent-logs/2026-09-12_09-36-14_9ee36ac3-e203-404b-a7c1-847a1acefc63.md`

Different `session_id` values (`2fa7299a…` vs `9ee36ac3…`). The hook is not limited to the chat that created it.

Canary 2 `RESPONSE num=1` is in that file. Confirmed after the second session ended.

## Canary 1 — raw from the log

```
[LOG_ENTRY type=PROMPT num=3 session=2fa7299a]
timestamp: 2026-09-12T09:34:15.358Z
model: cursor-grok-4.6-high-fast

CAPTURE TEST â€” 8x assignment, Affaf Ghani


[LOG_ENTRY type=RESPONSE num=3 session=2fa7299a]
timestamp: 2026-09-12T09:35:30.791Z
model: cursor-grok-4.6-high-fast

The first canary **prompt** landed on its own in:

`.agent-logs/2026-09-12_09-30-14_2fa7299a-6fec-41c7-9c98-96ebadccfa66.md`

Raw entry:

```
[LOG_ENTRY type=PROMPT num=3 session=2fa7299a]
timestamp: 2026-09-12T09:34:15.358Z
model: cursor-grok-4.6-high-fast

CAPTURE TEST â€” 8x assignment, Affaf Ghani
```

This turnâ€™s **response** is not in the file yet. `afterAgentResponse` / `stop` write that when the turn ends, so it should appear right after this reply. I am not editing that log.

Two hook bugs showed up on this first live fire; both are fixed for the next session, and the existing log is left as-is:

- Exchange numbers jumped 1 â†’ 3 because the assignment text contains example `[LOG_ENTRY type=PROMPT num=2]` lines. Numbering now matches only real headers.
- The `cmd` launcher mojibaked the em dash. Hooks now call `python` directly.

Do **not** start the product build yet. `CAPTURE-TEST.md` waits until canary 2 lands.

Open a **new** Cursor chat in this repo and send exactly:

```
CAPTURE TEST 2 â€” 8x assignment, Affaf Ghani
```

A hook that only works in the session that created it is not installed. After that second log file exists, I will write `CAPTURE-TEST.md`.
```

## Canary 2 — raw from the log

```
[LOG_ENTRY type=PROMPT num=1 session=9ee36ac3]
timestamp: 2026-09-12T09:36:14.847Z
model: cursor-grok-4.6-high-fast

CAPTURE TEST 2 â€” 8x assignment, Affaf Ghani


[LOG_ENTRY type=RESPONSE num=1 session=9ee36ac3]
timestamp: 2026-09-12T09:38:49.167Z
model: cursor-grok-4.6-high-fast

**Canary 2 landed in a new session.** The hook is not limited to the chat that installed it.

| | Session | Log |
|---|---|---|
| Canary 1 | `2fa7299aâ€¦` | `.agent-logs/2026-09-12_09-30-14_2fa7299a-6fec-41c7-9c98-96ebadccfa66.md` |
| Canary 2 | `9ee36ac3â€¦` | `.agent-logs/2026-09-12_09-36-14_9ee36ac3-e203-404b-a7c1-847a1acefc63.md` |

Raw prompt already in the second file:

```
[LOG_ENTRY type=PROMPT num=1 session=9ee36ac3]
timestamp: 2026-09-12T09:36:14.847Z
model: cursor-grok-4.6-high-fast

CAPTURE TEST 2 Ã¢â‚¬â€ 8x assignment, Affaf Ghani
```

`afterAgentResponse` / `stop` will append this reply as `RESPONSE num=1` when the turn ends. I am not editing that log.

`CAPTURE-TEST.md` is in the repo root with tool/model, hook files, both log paths, both canaries pasted raw, and what failed first. One of those failures is still true: the em dash still stores as `Ã¢â‚¬"`. Switching off the `.cmd` launcher did not fix it. Existing entries were left alone.

Do **not** start the product build until you confirm `RESPONSE num=1` is in the second log. After that, capture is green.
```

The logs were not edited by hand.

## What was tried that did not work

- The assignment paste itself is not a canary. It was sent before the hook existed, so that first turn is not proof.
- A local dry-run of `capture.py` wrote a fake session file. That file was deleted so it would not ship.
- First live fire numbered the canary as `num=3` instead of `num=2`. The assignment text includes example `[LOG_ENTRY type=PROMPT num=2]` lines, and the first numbering regex counted those. Numbering now matches only real headers (`^\[LOG_ENTRY type=PROMPT num=`). The existing log was left as-is.
- `.cursor/hooks/capture.cmd` mojibaked the em dash (`—` → `â€"`). `hooks.json` was switched to `python .cursor/hooks/capture.py` and the `.cmd` file was given `chcp 65001` / `PYTHONUTF8=1`. **That did not fix it.** Both live canary prompts still store `â€"` in the log. Cursor's hook payload on Windows is already wrong, or stdin is still not UTF-8. Existing log entries were not rewritten.
- After capture was confirmed green, `capture.py` got a cp1252→UTF-8 mojibake repair for future writes only. Old canary lines were left as-is. Not treated as proven until a later prompt with an em dash lands clean.
- `CAPTURE-TEST.md` was not written after canary 1. The assignment requires a second session first.
