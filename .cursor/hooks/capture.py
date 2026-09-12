import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

AUTHOR = "affafghani98"
PROJECT = "naano-rebuild"
TOOL = "cursor"
DEFAULT_MODEL = "cursor-grok-4.6"


def utc_now():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{int(dt.microsecond / 1000):03d}Z"


def read_stdin():
    raw = sys.stdin.buffer.read()
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    if not raw.strip():
        return {}
    for encoding in ("utf-8", "utf-8-sig", "cp1252"):
        try:
            return json.loads(raw.decode(encoding))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    return json.loads(raw.decode("utf-8", errors="replace"))


def repair_mojibake(text):
    if not text or "â€" not in text and "Ã¢" not in text:
        return text
    current = text
    for _ in range(3):
        if "â€" not in current and "Ã¢" not in current:
            return current
        repaired = None
        for encoding in ("cp1252", "latin-1"):
            try:
                candidate = current.encode(encoding).decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                continue
            if candidate != current:
                repaired = candidate
                break
        if repaired is None:
            return current
        current = repaired
    return current


def project_root():
    env = os.environ.get("CURSOR_PROJECT_DIR") or os.environ.get("CLAUDE_PROJECT_DIR")
    if env:
        return Path(env)
    return Path(__file__).resolve().parents[2]


def logs_dir(root):
    path = root / ".agent-logs"
    path.mkdir(parents=True, exist_ok=True)
    return path


def state_dir(root):
    path = root / ".cursor" / "hooks" / "state"
    path.mkdir(parents=True, exist_ok=True)
    return path


def session_id(payload):
    return payload.get("conversation_id") or payload.get("session_id") or "unknown"


def model_name(payload):
    return payload.get("model") or payload.get("model_id") or DEFAULT_MODEL


def short_id(sid):
    return sid.split("-")[0] if "-" in sid else sid[:8]


def find_log_file(logs, sid):
    matches = sorted(logs.glob(f"*_{sid}.md"))
    return matches[0] if matches else None


def debug(root, event, payload):
    line = json.dumps(
        {
            "ts": iso(utc_now()),
            "event": event,
            "conversation_id": session_id(payload),
            "model": model_name(payload),
            "prompt_len": len(payload.get("prompt") or ""),
            "text_len": len(payload.get("text") or payload.get("response") or ""),
            "status": payload.get("status"),
            "transcript_path": payload.get("transcript_path"),
        },
        ensure_ascii=True,
    )
    with (state_dir(root) / "events.log").open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def ensure_log(logs, sid, model, ts):
    existing = find_log_file(logs, sid)
    if existing:
        return existing
    path = logs / f"{ts.strftime('%Y-%m-%d_%H-%M-%S')}_{sid}.md"
    date = ts.strftime("%Y-%m-%d")
    stamp = iso(ts)
    path.write_text(
        (
            f"---\n"
            f"session_id: {sid}\n"
            f"date: {date}\n"
            f"author: {AUTHOR}\n"
            f"model: {model}\n"
            f"tool: {TOOL}\n"
            f"project: {PROJECT}\n"
            f"total_exchanges: 0\n"
            f"first_prompt_time: {stamp}\n"
            f"last_prompt_time: {stamp}\n"
            f"---\n"
            f"\n"
            f"# Session Log - {date}\n"
            f"\n"
            f"Session: `{short_id(sid)}` | Project: `{PROJECT}` | Author: `{AUTHOR}`\n"
            f"\n"
            f"---\n"
        ),
        encoding="utf-8",
    )
    return path


def update_frontmatter(path, **fields):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return
    end = text.find("\n---", 3)
    if end == -1:
        return
    header = text[4:end]
    body = text[end + 4 :]
    for key, value in fields.items():
        if re.search(rf"^{re.escape(key)}:", header, re.M):
            header = re.sub(
                rf"^{re.escape(key)}:.*$",
                f"{key}: {value}",
                header,
                count=1,
                flags=re.M,
            )
        else:
            header += f"\n{key}: {value}"
    path.write_text("---\n" + header + "\n---" + body, encoding="utf-8")


def next_prompt_num(text):
    nums = [
        int(match)
        for match in re.findall(r"^\[LOG_ENTRY type=PROMPT num=(\d+)", text, re.M)
    ]
    return (max(nums) + 1) if nums else 1


def has_response(text, num):
    return (
        re.search(rf"^\[LOG_ENTRY type=RESPONSE num={num} ", text, re.M) is not None
    )


def append_entry(path, entry_type, num, sid, ts, model, body):
    block = (
        f"\n[LOG_ENTRY type={entry_type} num={num} session={short_id(sid)}]\n"
        f"timestamp: {iso(ts)}\n"
        f"model: {model}\n"
        f"\n"
        f"{(body or '').rstrip()}\n"
        f"\n"
    )
    with path.open("a", encoding="utf-8") as handle:
        handle.write(block)


def load_state(root, sid):
    path = state_dir(root) / f"{sid}.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(root, sid, data):
    (state_dir(root) / f"{sid}.json").write_text(
        json.dumps(data, ensure_ascii=False),
        encoding="utf-8",
    )


def extract_text(obj):
    message = obj.get("message") if isinstance(obj.get("message"), dict) else obj
    content = message.get("content") if isinstance(message, dict) else None
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts = []
    for item in content:
        if isinstance(item, dict) and item.get("type") == "text":
            parts.append(item.get("text") or "")
        elif isinstance(item, str):
            parts.append(item)
    return "".join(parts)


def find_transcript(payload, sid):
    candidates = [
        payload.get("transcript_path"),
        os.environ.get("CURSOR_TRANSCRIPT_PATH"),
    ]
    projects = Path.home() / ".cursor" / "projects"
    if projects.is_dir():
        candidates.extend(
            str(path) for path in projects.glob(f"*/agent-transcripts/{sid}/{sid}.jsonl")
        )
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return Path(candidate)
    return None


def transcript_pairs(transcript_path):
    pairs = []
    current_user = None
    last_assistant = ""
    for line in transcript_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        role = obj.get("role")
        text = extract_text(obj)
        if role == "user":
            if current_user is not None:
                pairs.append((current_user, last_assistant))
            current_user = text
            last_assistant = ""
        elif role == "assistant" and text.strip():
            last_assistant = text
    if current_user is not None:
        pairs.append((current_user, last_assistant))
    return pairs


def handle_prompt(payload, root):
    ts = utc_now()
    sid = session_id(payload)
    model = model_name(payload)
    prompt = repair_mojibake(payload.get("prompt") or "")
    path = ensure_log(logs_dir(root), sid, model, ts)
    text = path.read_text(encoding="utf-8")
    num = next_prompt_num(text)
    append_entry(path, "PROMPT", num, sid, ts, model, prompt)
    fields = {"last_prompt_time": iso(ts), "total_exchanges": num, "model": model}
    if num == 1:
        fields["first_prompt_time"] = iso(ts)
    update_frontmatter(path, **fields)
    state = load_state(root, sid)
    state.update({"num": num, "model": model, "written": False})
    save_state(root, sid, state)


def handle_response(payload, root):
    sid = session_id(payload)
    text = repair_mojibake(payload.get("text") or payload.get("response") or "")
    state = load_state(root, sid)
    state["response_text"] = text
    state["response_model"] = model_name(payload)
    save_state(root, sid, state)


def flush_response(root, sid, payload):
    logs = logs_dir(root)
    path = find_log_file(logs, sid)
    if not path:
        return
    state = load_state(root, sid)
    existing = path.read_text(encoding="utf-8")
    num = state.get("num") or max(next_prompt_num(existing) - 1, 1)
    if has_response(existing, num):
        return
    text = state.get("response_text") or ""
    if not text.strip():
        transcript = find_transcript(payload, sid)
        if transcript:
            pairs = transcript_pairs(transcript)
            if pairs:
                text = pairs[-1][1]
    if not text.strip():
        return
    model = state.get("response_model") or model_name(payload)
    append_entry(path, "RESPONSE", num, sid, utc_now(), model, text)
    state["written"] = True
    save_state(root, sid, state)


def backfill_from_transcript(payload, root):
    sid = session_id(payload)
    transcript = find_transcript(payload, sid)
    if not transcript:
        return
    pairs = transcript_pairs(transcript)
    if not pairs:
        return
    logs = logs_dir(root)
    ts = utc_now()
    model = model_name(payload)
    path = ensure_log(logs, sid, model, ts)
    existing = path.read_text(encoding="utf-8")
    already = next_prompt_num(existing) - 1
    for index, (prompt, response) in enumerate(pairs, start=1):
        if index <= already:
            continue
        append_entry(path, "PROMPT", index, sid, ts, model, prompt)
        if response.strip():
            append_entry(path, "RESPONSE", index, sid, utc_now(), model, response)
        update_frontmatter(
            path,
            last_prompt_time=iso(ts),
            total_exchanges=index,
            model=model,
        )
        if index == 1:
            update_frontmatter(path, first_prompt_time=iso(ts))
        save_state(
            root,
            sid,
            {"num": index, "model": model, "written": bool(response.strip())},
        )


def handle_stop(payload, root):
    sid = session_id(payload)
    logs = logs_dir(root)
    path = find_log_file(logs, sid)
    if path is None or "[LOG_ENTRY type=PROMPT " not in path.read_text(encoding="utf-8"):
        backfill_from_transcript(payload, root)
    flush_response(root, sid, payload)


def emit(obj):
    sys.stdout.write(json.dumps(obj))
    sys.stdout.flush()


def main():
    root = project_root()
    try:
        payload = read_stdin()
        event = payload.get("hook_event_name") or ""
        debug(root, event, payload)
        if event == "beforeSubmitPrompt" or (not event and "prompt" in payload):
            handle_prompt(payload, root)
            emit({"continue": True})
            return
        if event == "afterAgentResponse" or (not event and ("text" in payload or "response" in payload)):
            handle_response(payload, root)
            emit({})
            return
        if event == "stop" or (not event and "status" in payload):
            handle_stop(payload, root)
            emit({})
            return
        emit({})
    except Exception as exc:
        sys.stderr.write(f"capture hook error: {exc}\n")
        emit({"continue": True})


if __name__ == "__main__":
    main()
