import fs from "node:fs";
import path from "node:path";

const SCENARIOS_DIR = path.join(process.cwd(), "..", "scenarios");

export interface ScenarioMeta {
  slug: string;
  number: string;
  title: string;
  pythonRef: string;
  /** Plain overview paragraph: what this mechanism does. */
  description: string;
  /** The "本节贯穿示例" blockquote content, stripped of `>` and prefix. Null if not present. */
  runningExample: string | null;
}

export interface Scenario extends ScenarioMeta {
  content: string;
}

export interface ReplayStep {
  step: number;
  role:
    | "user"
    | "assistant"
    | "tool_use"
    | "tool_result"
    | "thinking"
    | "note"
    | "stop";
  /** Optional timestamp tag (used by background-task / autonomous scenarios). */
  t?: string;
  /** Body text for user / assistant / thinking / note. */
  text?: string;
  /** Tool name (when role === "tool_use"). */
  tool?: string;
  /** Brief argument summary (when role === "tool_use"). */
  args?: string;
  /** Tool result summary (when role === "tool_result"). */
  result?: string;
  /** Stop reason (when role === "stop"). */
  reason?: string;
  /** Optional agent identity for multi-agent scenarios (main / sub-N / runner-1 / method_reviewer / …). */
  agent?: string;
}

export interface Replay {
  slug: string;
  steps: ReplayStep[];
}

function parseScenarioMeta(slug: string, md: string): ScenarioMeta {
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const fullTitle = titleMatch ? titleMatch[1].trim() : slug;
  const numberMatch = fullTitle.match(/^(\d+)\s*[·.]\s*(.+)$/);
  const number = numberMatch ? numberMatch[1] : "";
  const title = numberMatch ? numberMatch[2].trim() : fullTitle;

  const pyMatch = md.match(/\*\*Python 复刻\*\*[：:]\s*\[([^\]]+)\]\(([^)]+)\)/);
  const pythonRef = pyMatch ? pyMatch[1] : "";

  // Grab everything between **Python 复刻** line and the first `---` separator.
  const introMatch = md.match(/\*\*Python 复刻\*\*[：:][^\n]+\n+([\s\S]*?)\n+---/);
  const intro = introMatch ? introMatch[1].trim() : "";

  // Split out the running-example blockquote (`> 本节贯穿示例：...`) from the overview.
  // Description = overview paragraph only; runningExample = blockquote body without the prefix.
  let description = intro;
  let runningExample: string | null = null;
  const bqMatch = intro.match(/^>\s*本节贯穿示例[：:]\s*([\s\S]+)$/m);
  if (bqMatch) {
    // The blockquote may span multiple lines, each prefixed with `> `. Strip them.
    const bqStart = intro.indexOf(bqMatch[0]);
    description = intro.slice(0, bqStart).trim();
    const raw = intro.slice(bqStart);
    runningExample = raw
      .split("\n")
      .map((line) => line.replace(/^>\s?/, ""))
      .join("\n")
      .replace(/^本节贯穿示例[：:]\s*/, "")
      .trim();
  }

  return { slug, number, title, pythonRef, description, runningExample };
}

export function listScenarios(): ScenarioMeta[] {
  if (!fs.existsSync(SCENARIOS_DIR)) return [];
  const entries = fs.readdirSync(SCENARIOS_DIR, { withFileTypes: true });
  const scenarios: ScenarioMeta[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const mdPath = path.join(SCENARIOS_DIR, slug, "scenario.md");
    if (!fs.existsSync(mdPath)) continue;
    const md = fs.readFileSync(mdPath, "utf-8");
    scenarios.push(parseScenarioMeta(slug, md));
  }
  return scenarios.sort((a, b) => {
    const aNum = parseInt(a.number || "999", 10);
    const bNum = parseInt(b.number || "999", 10);
    return aNum - bNum;
  });
}

export function getScenario(slug: string): Scenario | null {
  const mdPath = path.join(SCENARIOS_DIR, slug, "scenario.md");
  if (!fs.existsSync(mdPath)) return null;
  const md = fs.readFileSync(mdPath, "utf-8");
  const meta = parseScenarioMeta(slug, md);
  return { ...meta, content: md };
}

// Find scenario whose Python reference points to the given version (e.g. "s06").
// Scenario 10 (parallel citation audit) covers Subagent which lives in s04, so
// version → scenario mapping is not 1:1 with scenario numbers.
export function getScenarioByVersion(version: string): ScenarioMeta | null {
  const scenarios = listScenarios();
  const needle = `/${version}_`;
  return scenarios.find((s) => s.pythonRef.includes(needle)) ?? null;
}

export function getReplay(slug: string): Replay | null {
  const replayPath = path.join(SCENARIOS_DIR, slug, "replay.jsonl");
  if (!fs.existsSync(replayPath)) return null;
  const raw = fs.readFileSync(replayPath, "utf-8");
  const steps: ReplayStep[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as ReplayStep;
      steps.push(parsed);
    } catch {
      // Silently skip malformed lines so a single broken row doesn't bring down the page.
    }
  }
  return steps.length ? { slug, steps } : null;
}
