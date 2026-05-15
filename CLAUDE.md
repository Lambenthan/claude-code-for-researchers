# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A teaching codebase for **agent harness engineering**, not a library or product. Two unrelated codebases share the repo:

- `agents/` — twelve standalone Python REPLs (`s01_*.py` … `s12_*.py`) plus a capstone `s_full.py`. Each lesson keeps every mechanism from earlier lessons and adds exactly one new one; the lesson order is load-bearing — never refactor a later script in a way that drops mechanisms from earlier scripts. `s_full.py` integrates s01–s11; s12 (worktree+task isolation) is taught separately. The README's "学习路径 / Learning Path" table is authoritative for which mechanism belongs to which lesson.
- `web/` — Next.js 16 (App Router, React 19, Tailwind v4) static-export site that visualizes the lessons. **Zero backend, no LLM calls.** `web/scripts/extract-content.ts` parses `agents/*.py` and `docs/{en,zh}/*.md` at build time into JSON under `web/src/data/generated/`. `npm run dev` and `npm run build` auto-run extraction via `predev`/`prebuild` hooks; if you edit Python or docs and the site doesn't reflect it, re-run a build.
- `scenarios/` — 11 long-form mechanism explainers (`scenario.md` per folder) written in researcher-friendly Chinese, all anchored to a single running case: **Patient Capital → Corporate ESG Performance**. Each scenario carries a `> 本节贯穿示例：...` blockquote that the web side extracts and renders as a dedicated "Running example" card on both `/sNN` and `/scenarios/[slug]` pages.

## Running the Python agents

```sh
pip install -r requirements.txt          # anthropic, python-dotenv, pyyaml
cp .env.example .env                     # fill ANTHROPIC_API_KEY + MODEL_ID
python agents/s01_agent_loop.py          # any sNN file is a self-contained REPL
```

Required env (read at import time, missing → `KeyError`):

- `MODEL_ID` — always required
- `ANTHROPIC_API_KEY` — required unless using a compatible provider
- `ANTHROPIC_BASE_URL` — optional; when set, the code explicitly pops `ANTHROPIC_AUTH_TOKEN` so Anthropic-CLI-injected auth doesn't override. `.env.example` lists working endpoints for MiniMax / GLM / Kimi / DeepSeek (Anthropic-compatible).

Each REPL exits on `q`, `exit`, empty line, or Ctrl-D.

## Running the web platform

```sh
cd web
npm install
npm run dev      # http://localhost:3000, includes extract-content
npm run build    # static export to web/out/
npx tsc --noEmit # type check (this is what CI runs)
```

Routing is `[locale]/...` (en/zh — Japanese was removed in May 2026). `next.config.ts` has `output: "export"` — there is no Next.js server runtime in production. `vercel.json` does a Vercel-side `/` → `/en` redirect that **will not work** on other static hosts; handle root routing at the host level if deploying elsewhere.

## Tests

CI runs two independent jobs ([.github/workflows/test.yml](.github/workflows/test.yml), [.github/workflows/ci.yml](.github/workflows/ci.yml)):

```sh
python -m pytest tests/test_agents_smoke.py -q   # py_compile every agents/*.py
python -m unittest tests.test_s_full_background  # only behavioral test today
```

`test_agents_smoke.py` is a compile-only sweep — it catches syntax errors across all 13 agent scripts but does **not** exercise them. `test_s_full_background.py` shows the pattern for behavioral tests: stub `anthropic` and `dotenv` via `sys.modules` before loading `agents/s_full.py`, since the module instantiates `Anthropic()` and reads `os.environ["MODEL_ID"]` at import time. Reuse `load_s_full_module()` from that file when adding tests against `s_full`.

Single test: `python -m pytest tests/test_agents_smoke.py::test_agent_scripts_compile[s07_task_system.py] -q`

## Architecture conventions to preserve

- **One file per lesson.** Don't extract shared helpers across `sNN` files — duplication is pedagogical. Every script re-defines `run_bash`, `safe_path`, the tool dispatch map, etc.
- **Tool dispatch is a flat dict**, `name → handler`. The agent loop never branches on tool name; it looks up the handler. New tools land in both `TOOLS` (schema list) and the dispatch map.
- **State lives in workspace dirs**, not in memory. Agents that need persistence write to `.tasks/`, `.team/inbox/`, `.transcripts/`, `skills/` under `WORKDIR`. These are gitignored runtime state (except `skills/`, which is repo-tracked SKILL.md content for s05).
- **Safety primitives are duplicated, not shared.** Every agent that calls `run_bash` blocks the same hardcoded list (`rm -rf /`, `sudo`, `shutdown`, `reboot`, `> /dev/`). Every agent that touches paths runs `safe_path()` to enforce `WORKDIR` containment. Keep both in any new script.
- **The lesson is the comment.** Each `sNN` file opens with an ASCII diagram of the mechanism it adds. Preserve and update these diagrams when editing — they're the canonical explanation, not the prose docs.

## Intentional omissions (per README "范围说明")

This is a 0→1 teaching repo. The following are **deliberately not implemented** — don't add them unless explicitly asked:

- Full hook/event bus (PreToolUse, SessionStart/End, etc.); s12 has only a minimal append-only lifecycle stream
- Rule-based permission governance, approval workflows
- Session resume/fork, full worktree lifecycle
- Full MCP runtime (transport, OAuth, resource subscription, polling)

The team JSONL mailbox protocol in s09–s11 is a teaching implementation; it is not claiming to mirror any production system.

## Documentation surface

Two surfaces, two audiences:

- `docs/{en,zh}/sNN-*.md` — short "mental model + Try It" lesson cards consumed by the `/sNN` Learn tab via `docs.json`. Engineering-leaning (Python snippets, dispatch map diagrams). Keep both locales in sync; missing translations show as gaps in the UI.
- `scenarios/<slug>/scenario.md` — long-form researcher-facing chapters (definition / mechanism / design reasoning / pitfalls / knowledge map). Each carries a `> 本节贯穿示例：...` blockquote with the concrete node from the running case. The web side parses these via `web/src/lib/scenarios.ts` and renders an "Overview" + "Running example" card pair on `/sNN` and `/scenarios/[slug]`.

## Editorial discipline

Chinese prose in `scenarios/` and `web/src/i18n/messages/zh.json` follows the `book-writing-default` skill red lines: no "不是 A 而是 B" sentence patterns, no number-led enumerations ("两件事 / 三件事"), no AI clichés ("值得注意的是 / 综上所述"), no metaphor verbs ("押注 / 保险绳 / 工具箱 / 账本"), no rendering modifiers ("真实发生的事 / 活生生"). The role of Claude Code in every scenario is **automation, audit, and project management only** — never drafting, polishing, or text production.
