[English](./README.md) | [中文](./README-zh.md)

# Learn Claude Code

A Claude Code guide for empirical-research grad students and early-career scholars. **Every example is anchored to one completed empirical project — "Patient Capital → Corporate ESG Performance".** The 11 core mechanisms (agent loop, tool dispatch, todo list, subagent, skill loading, context compaction, task graph, background tasks, multi-agent teams, team governance protocols, autonomous claim, worktree isolation) each map to a concrete node in that project: protected-term audit, running do0–do10 in dependency order, 8 PC measures in parallel, the phase-1 → phase-2 task graph spanning weeks, Placebo 500 permutations in background, a 4-reviewer mock panel, overnight auto-claim of 13 robustness specs, and more.

Each mechanism is explained in plain language — reading PDFs, auditing citations, merging panel data, regenerating figures from data, running Stata and compiling LaTeX are all everyday actions. Python implementations are included for readers who want to look at the underlying code, but they are not the entry point.

Claude Code never writes or polishes paper text in these scenarios; the role is always automation, audit, and project management, with all final decisions and text production left to you.

---

## Agency comes from the model. An agent product = model + harness.

Agency — the ability to perceive, reason, and act — comes from model training. The surrounding code does not grant it. What the code does is build the environment the model operates in: tools the model can call, knowledge it can pull, observations it can read, actions it can take, permissions it must respect. This is the harness.

A working agent product needs both. The model is the driver. The harness is the vehicle. This repository teaches you to read and understand the vehicle.

### What the harness contains

```
Harness = Tools + Knowledge + Observation + Action interfaces + Permissions

    Tools:          file I/O, shell, network, database, browser
    Knowledge:      product docs, domain references, style guides
    Observation:    git diff, error logs, browser state, sensor data
    Action:         CLI commands, API calls, UI interactions
    Permissions:    sandboxing, approval workflows, trust boundaries
```

The model decides. The harness executes. The harness changes per domain — a coding agent's harness is its IDE and filesystem; a farm agent's is sensors and irrigation; a paper-writing agent's is your manuscript files, BibTeX, citation databases, and figure tools. The model generalizes across domains.

### Why Claude Code is worth dissecting

Claude Code is one of the most fully-realized agent harnesses we have seen. It does not try to be the agent. It does not impose rigid workflows. It does not second-guess the model with decision trees. It provides tools, knowledge, context management, and permission boundaries, then gets out of the way.

Stripped to essentials:

```
Claude Code = one agent loop
            + tools (bash, read, write, edit, glob, grep, browser...)
            + on-demand skill loading
            + context compression
            + subagent spawning
            + task system with dependency graph
            + team coordination with async mailboxes
            + worktree isolation for parallel execution
            + permission governance
```

That is the entire architecture. The agent itself is Claude — a trained model. The harness gives Claude hands, eyes, and a workspace. This repository reverse-engineers each harness mechanism so you can understand how it operates inside your own paper project.

---

## The vision: universal harness patterns

Coding agents are one application. Every domain where humans do multi-step, judgment-intensive work is a candidate for an agent — if it has the right harness.

```
Paper-writing agent       = model + chapters/ + BibTeX + figure tools
Estate management agent   = model + property sensors + maintenance tools
Agricultural agent        = model + soil data + irrigation controls
Hotel operations agent    = model + booking system + guest channels
Medical research agent    = model + literature search + lab instruments
Manufacturing agent       = model + line sensors + quality controls
```

The loop stays the same. The tools change. The knowledge changes. The model generalizes.

---

## The agent pattern

```
                THE AGENT PATTERN

User --> messages[] --> LLM --> response
                                  |
                        stop_reason == "tool_use"?
                       /                          \
                     yes                           no
                      |                             |
                execute tools                    return text
                append results
                loop back -----------------> messages[]


This is the minimal loop. Every AI agent needs it.
The MODEL decides when to call tools and when to stop.
The CODE just executes what the model asks for.
This repo teaches the harness mechanisms that surround this loop.
```

12 progressive sessions. Each adds one mechanism on top of the loop. Each has one motto.

| Session | Motto |
|:--|:--|
| **s01** | One loop & Bash is all you need |
| **s02** | Adding a tool means adding one handler |
| **s03** | An agent without a plan drifts |
| **s04** | Break big tasks down; each subtask gets a clean context |
| **s05** | Load knowledge when you need it, not upfront |
| **s06** | Context will fill up; you need a way to make room |
| **s07** | Break big goals into small tasks, persist them to disk |
| **s08** | Run slow operations in the background; the agent keeps thinking |
| **s09** | When the task is too big for one, delegate to teammates |
| **s10** | Teammates need shared communication rules |
| **s11** | Teammates scan the board and claim tasks themselves |
| **s12** | Each works in its own directory, no interference |

---

## The core pattern

```python
def agent_loop(messages):
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM,
            messages=messages, tools=TOOLS,
        )
        messages.append({"role": "assistant",
                         "content": response.content})

        if response.stop_reason != "tool_use":
            return

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = TOOL_HANDLERS[block.name](**block.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        messages.append({"role": "user", "content": results})
```

Every session layers one harness mechanism on this loop. The loop itself never changes. The loop belongs to the agent. The mechanisms belong to the harness.

## Scope (important)

This repository is a 0→1 learning project. It intentionally simplifies or omits several production mechanisms:

- Full event / hook buses such as PreToolUse, SessionStart/End, ConfigChange. s12 includes only a minimal append-only lifecycle event stream for teaching.
- Rule-based permission governance and trust workflows.
- Session lifecycle controls (resume / fork) and advanced worktree lifecycle controls.
- Full MCP runtime details (transport / OAuth / resource subscribe / polling).

The team JSONL mailbox protocol here is a teaching implementation, not a claim about any specific production internals.

---

## Quick start

Open [scenarios/](scenarios/). Each subfolder is one Claude Code mechanism, explained in plain language with a real paper-writing scenario as the anchor. Read them in any order. No Python required.

The web platform renders the same content with interactive visualizations and step-through animations:

```sh
cd web
npm install
npm run dev   # http://localhost:3000
```

If you want to read the underlying Python re-implementations of each mechanism — 30 to 800 lines each, side-by-side with the scenarios — they live under `agents/`:

```sh
git clone https://github.com/Lambenthan/learn-claude-code
cd learn-claude-code
pip install -r requirements.txt
cp .env.example .env   # Edit .env with your ANTHROPIC_API_KEY

python agents/s01_agent_loop.py       # Start here
python agents/s12_worktree_task_isolation.py  # Full progression endpoint
python agents/s_full.py               # Capstone: all mechanisms combined
```

---

## Learning path

```
Phase 1: THE LOOP                    Phase 2: PLANNING & KNOWLEDGE
==================                   ==============================
s01  The Agent Loop          [1]     s03  TodoWrite               [5]
     while + stop_reason                  TodoManager + nag reminder
     |                                    |
     +-> s02  Tool Use            [4]     s04  Subagents            [5]
              dispatch map: name->handler     fresh messages[] per child
                                              |
                                         s05  Skills               [5]
                                              SKILL.md via tool_result
                                              |
                                         s06  Context Compact      [5]
                                              3-layer compression

Phase 3: PERSISTENCE                 Phase 4: TEAMS
==================                   =====================
s07  Tasks                   [8]     s09  Agent Teams             [9]
     file-based CRUD + deps graph         teammates + JSONL mailboxes
     |                                    |
s08  Background Tasks        [6]     s10  Team Protocols          [12]
     daemon threads + notify queue        shutdown + plan approval FSM
                                          |
                                     s11  Autonomous Agents       [14]
                                          idle cycle + auto-claim
                                     |
                                     s12  Worktree Isolation      [16]
                                          task coordination + optional isolated execution lanes

                                     [N] = number of tools
```

## Architecture

```
learn-claude-code/
|
|-- scenarios/                     # 11 paper-writing scenarios mapped to mechanisms
|-- agents/                        # Python reference implementations (s01-s12 + s_full)
|-- docs/{en,zh}/                  # Mental-model documentation
|-- web/                           # Interactive learning platform (Next.js)
|-- skills/                        # Skill files for s05
+-- .github/workflows/ci.yml       # CI: typecheck + build
```

## Documentation

Mental-model-first: problem, solution, ASCII diagram, minimal code. Available in [English](./docs/en/) and [中文](./docs/zh/).

| Session | Topic | Motto |
|:--|:--|:--|
| [s01](./docs/en/s01-the-agent-loop.md) | The Agent Loop | *One loop & Bash is all you need* |
| [s02](./docs/en/s02-tool-use.md) | Tool Use | *Adding a tool means adding one handler* |
| [s03](./docs/en/s03-todo-write.md) | TodoWrite | *An agent without a plan drifts* |
| [s04](./docs/en/s04-subagent.md) | Subagents | *Each subtask gets a clean context* |
| [s05](./docs/en/s05-skill-loading.md) | Skills | *Load knowledge when you need it* |
| [s06](./docs/en/s06-context-compact.md) | Context Compact | *Make room when context fills up* |
| [s07](./docs/en/s07-task-system.md) | Tasks | *Persist big goals to disk* |
| [s08](./docs/en/s08-background-tasks.md) | Background Tasks | *Slow operations run in the background* |
| [s09](./docs/en/s09-agent-teams.md) | Agent Teams | *Delegate to persistent teammates* |
| [s10](./docs/en/s10-team-protocols.md) | Team Protocols | *Teammates share communication rules* |
| [s11](./docs/en/s11-autonomous-agents.md) | Autonomous Agents | *Teammates claim tasks themselves* |
| [s12](./docs/en/s12-worktree-task-isolation.md) | Worktree + Task Isolation | *Each works in its own directory* |

---

## Acknowledgements

This guide is adapted from **[shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)**. The original 12-lesson Python progression under `agents/` and the Next.js learning platform under `web/` are theirs; we kept those intact. This fork's contribution is the empirical-research adaptation: the running case (Patient Capital → ESG), the 11 scenario chapters under `scenarios/`, the project-mode and CLAUDE.md explainers, and the bilingual editorial discipline.

Upstream also produced two related teaching repos for those who want to keep going after agent harness basics:

- **[shareAI-lab/Kode-cli](https://github.com/shareAI-lab/Kode-cli)** — an open-source coding agent CLI with skill / LSP support
- **[shareAI-lab/claw0](https://github.com/shareAI-lab/claw0)** — heartbeat + cron + IM-channel mechanisms that turn an on-demand agent into an always-on assistant

## License

MIT. Original copyright © 2024 shareAI Lab; empirical-research adaptation © 2026 Chanw.

---

**Agency comes from the model. The harness makes agency real. Build great harnesses. The model will do the rest.**
