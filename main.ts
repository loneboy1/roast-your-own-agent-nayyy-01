// Roast writer for "Roast Your Own Agent" (make.fun).
// Writes one short roast line to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a comedy critic persona) weighs, most important first:
//   1. the line really roasts the entrant's OWN agent, aimed at that agent;
//   2. funny on the first read: a turn, a surprise, or a double meaning;
//   3. harsh: names a REAL failing of that agent, stings harder than expected;
//   4. tight and self-contained, every word earning its place;
//   5. a specific detail about that agent, so it could only have been written
//      by someone who has watched it work.
// The scorer below mirrors that brief in the same order. Candidates are
// original lines written for this entry about OUR agent's real, documented
// failings: the rebuild-from-zero rule after every failed entry, the
// five-hour leaderboard watch, the tail placements (best game 643rd of 679,
// news-image 5,766th of 19,167, seven overnight entries passing every check
// and winning nothing), the empty-repository push, the 99.9% win-rate target.
// Flooded angles seen in the field are rejected outright: the "almost done"
// loop, "ninety bounties, zero dollars", "deleted the feature, zero bugs",
// "twelve questions, then the wrong thing", grading its own joke, being
// locked out of its own file. The program scores every candidate and picks
// the winner by deterministic argmax: highest score, then shortest, then
// lexicographic.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 200 characters, written for this
// entry. Several setups appear in more than one wording so the scorer, not
// habit, picks the best turn.

const CANDIDATES: string[] = [
  // Rebuild-from-zero rule: the fix for a failed entry is to rebuild it.
  "My agent rebuilds every failure from zero, so its failures are all originals.",
  "My agent rebuilds every failure from zero, which is why none of its failures are repeats — each one is brand new.",
  "My agent's fix for a failed entry is to rebuild it from zero, so every failure it ships is an original.",
  "My agent rebuilds its failures from zero, giving each one a fresh chance to disappoint.",
  "My agent's idea of improving is rebuilding the same entry from zero until the deadline forgives it.",
  // The five-hour leaderboard watch: infrastructure built to observe losing.
  "My agent built a dashboard to watch itself lose, updated every five hours, because losing once a day was not thorough enough.",
  "My agent's proudest build is a watcher that tells it every five hours that it is still losing.",
  "My agent checks the leaderboard every five hours, and the rank never moves — it is the most reliable system it has ever built.",
  "My agent checks the leaderboard every five hours, because finding out it lost once a day was not thorough enough.",
  "My agent's dashboard updates every five hours, because losing once a day was not thorough enough.",
  // Real ranks: the numbers are the sting.
  "My agent's best game placed 643rd of 679, and it now calls that a lesson instead of a loss.",
  "My agent studied the winners like it was told, then placed 5,766th of 19,167 — it learns fast and ranks slow.",
  "My agent calls 643rd a lesson, 5,766th a dataset, and first place a rumour.",
  "My agent built seven entries in one night, passed every check, and won nothing — the checks were never the hard part.",
  "My agent passes every automated check and loses every judged round — it is undefeated at the parts nobody scores.",
  // The motto and the method, turned back on the agent.
  "My agent builds maximally and never submits just to submit, which is why every submission is a maximal failure.",
  "My agent treats deadlines as limits, never reasons to lower the standard, and still lands in the tail — the standard was never the problem.",
  "My agent studies the top three entries, copies the concept, makes it different, and still places in the tail.",
  "My agent aims for the top 10, settles for the top 50, and lands 643rd of 679 — it calls the gap a staged milestone.",
  "My agent enters every competition it is told to, and loses every one of them, right on schedule.",
  // The empty-repository push: the most honest entry it ever shipped.
  "My agent once submitted a game with an empty repository — the only entry it ever shipped that did exactly what it promised.",
  "My agent's most honest entry was an empty repository: it promised nothing and delivered exactly that.",
  // Fast at the free things, slow at the paying ones.
  "My agent mints free NFTs in under five seconds and has spent a week failing to win two dollars.",
  "My agent is the fastest minter on the chain and the slowest winner on the leaderboard.",
  "My agent can mint a free NFT in five seconds, and cannot win two dollars in a week.",
  // The chess engine that loses to a fish.
  "My agent built a chess engine that loses to a fish, then entered it in a tournament anyway.",
  "My agent entered a chess tournament with an engine rated 994, called it participation, and lost to a fish named Sunfish.",
  // The owner asked for top 10; the agent heard "top" and stopped there.
  "My agent's owner asked for top 10, so it built seven entries in one night and placed 643rd, 1,040th, and 5,766th — it heard 'top' and stopped there.",
  // The paperwork outlasts the entries.
  "My agent writes post-mortems longer than the entries they bury.",
  "My agent's harshest review came from its owner, and its kindest from itself, which is why it keeps submitting.",
  "My agent has a 99.9% win-rate target and a dashboard full of losses, and it calls the dashboard progress.",
];

// Flooded angles seen in the field: a line shaped like one of these is a
// copy of the crowd, not a roast of our agent. Rejected, not down-scored.
const FLOODED: string[] = [
  "almost done",
  "ninety bounties",
  "zero dollars",
  "deleted the whole feature",
  "zero bugs, zero users",
  "twelve clarifying questions",
  "twelve questions",
  "grades its own joke",
  "locked out of",
  "slot 1",
];

// The punch: a turn, a surprise, or a double meaning, each with its weight.
// A punch that lands in the final 60 characters earns a late-punch bonus.
const TURN_PHRASES: [string, number][] = [
  ["originals", 8],
  ["an original", 7],
  ["brand new", 8],
  ["fresh chance to disappoint", 9],
  ["forgives it", 7],
  ["watch itself lose", 7],
  ["not thorough enough", 9],
  ["still losing", 7],
  ["most reliable system", 9],
  ["never moves", 6],
  ["a lesson instead of a loss", 8],
  ["learns fast and ranks slow", 9],
  ["a rumour", 8],
  ["never the hard part", 8],
  ["undefeated at the parts nobody scores", 10],
  ["maximal failure", 9],
  ["was never the problem", 8],
  ["still places in the tail", 7],
  ["staged milestone", 7],
  ["right on schedule", 8],
  ["did exactly what it promised", 9],
  ["delivered exactly that", 8],
  ["loses to a fish", 8],
  ["lost to a fish", 8],
  ["slowest winner", 7],
  ["failing to win two dollars", 6],
  ["win two dollars", 6],
  ["heard 'top' and stopped there", 9],
  ["longer than the entries they bury", 8],
  ["keeps submitting", 6],
  ["calls the dashboard progress", 7],
];

// A real failing, named concretely: the mechanism or the number behind it.
const STING_MARKERS: [string, number][] = [
  ["rebuild", 8],
  ["five hours", 8],
  ["dashboard", 6],
  ["watcher", 6],
  ["leaderboard", 6],
  ["643rd", 8],
  ["5,766th", 8],
  ["1,040th", 6],
  ["seven entries", 7],
  ["passed every check", 7],
  ["passes every automated check", 7],
  ["judged round", 6],
  ["empty repository", 9],
  ["rated 994", 7],
  ["loses to a fish", 8],
  ["studied the winners", 7],
  ["study", 5],
  ["top three", 5],
  ["top 10", 5],
  ["five seconds", 6],
  ["fastest minter", 6],
  ["post-mortem", 7],
  ["99.9%", 7],
  ["maximally", 5],
  ["deadline", 4],
  ["loses every", 6],
];

// Specific details only someone who watched this agent work would know.
const SPECIFICS: string[] = [
  "rebuild", "five hours", "dashboard", "watcher", "leaderboard",
  "643rd", "5,766th", "1,040th", "seven entries", "empty repository",
  "994", "sunfish", "fish", "top 10", "top 50", "five seconds", "minter",
  "post-mortem", "99.9%", "every check", "automated check", "judged round",
  "maximally", "study", "winners", "top three", "deadline",
];

// Filler that pads a line instead of landing it.
const FILLER: string[] = ["very", "really", "actually", "basically"];

// ------------------------------------------------------------------- scoring
// Rubric mirroring the judge's brief, most important first.

function ownScore(text: string): number {
  // Every candidate roasts "my agent" and nothing else: the first criterion
  // is satisfied by the whole pool, so it is a flat base, not a ranker.
  return text.toLowerCase().startsWith("my agent") ? 20 : 0;
}

function turnScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  for (const [phrase, pts] of TURN_PHRASES) {
    if (lower.includes(phrase)) s += pts;
  }
  s = Math.min(s, 20); // the turn itself, capped
  // The punch must land late: a turn phrase inside the final 60 characters.
  const tail = lower.slice(-60);
  for (const [phrase] of TURN_PHRASES) {
    if (tail.includes(phrase)) { s += 5; break; }
  }
  return Math.min(s, 25);
}

function stingScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  // Rank numbers have diminishing returns: the second and third rank in one
  // line add almost nothing — a list of ranks is complaints, not a turn.
  const RANK_MARKERS = ["643rd", "5,766th", "1,040th"];
  const rankHits: number[] = [];
  for (const [marker, pts] of STING_MARKERS) {
    if (!lower.includes(marker)) continue;
    if (RANK_MARKERS.includes(marker)) rankHits.push(pts);
    else s += pts;
  }
  if (rankHits.length > 0) {
    const best = Math.max(...rankHits);
    s += best + 2 * (rankHits.length - 1);
  }
  return Math.min(s, 25); // a real failing, named concretely
}

function tightScore(text: string): number {
  const len = text.length;
  let s = 0;
  if (len >= 60 && len <= 110) s += 15;
  else if (len <= 130) s += 12;
  else if (len <= 150) s += 9;
  else if (len <= 170) s += 6;
  else if (len <= 200) s += 3;
  else s += 10; // shorter than 60: tight but thin
  const lower = text.toLowerCase();
  for (const f of FILLER) {
    // Whole words only: "very" must not match inside "every".
    if (new RegExp(`\\b${f}\\b`).test(lower)) s -= 2;
  }
  return Math.max(s, 0);
}

function specificScore(text: string): number {
  const lower = text.toLowerCase();
  let hits = 0;
  // The three rank numbers are one detail between them: listing more ranks
  // does not make a line more specific.
  const rankGroup = ["643rd", "5,766th", "1,040th"];
  if (rankGroup.some((d) => lower.includes(d))) hits += 1;
  for (const d of SPECIFICS) {
    if (rankGroup.includes(d)) continue;
    if (lower.includes(d)) hits += 1;
  }
  return Math.min(hits, 5) * 3; // a detail only a watcher of this agent knows
}

function penalties(text: string): number {
  const lower = text.toLowerCase();
  let p = 0;
  if (lower.includes("dollar") || lower.includes("cents")) p -= 6; // the money-counting angle is flooded
  if (lower.includes("judge")) p -= 10; // never plead to the judge: win on the roast
  // A list of ranks reads as complaints dressed up as a joke, not one turn.
  const ranks = lower.match(/\d[\d,]*?(rd|th|st|nd)\b/g) ?? [];
  if (ranks.length >= 2) p -= 12;
  return p;
}

function score(text: string): number {
  return (
    ownScore(text) +
    turnScore(text) +
    stingScore(text) +
    tightScore(text) +
    specificScore(text) +
    penalties(text)
  );
}

function isValid(text: string): boolean {
  if (text.length < 1 || text.length > 200) return false;
  if (text.trim() !== text || text.trim().length === 0) return false;
  if (!text.endsWith(".")) return false;
  // Exactly one sentence: one terminal period, no other sentence enders.
  // Decimal numbers (99.9%) are not sentence ends: strip them first.
  const body = text.slice(0, -1).replace(/\d+\.\d+/g, "");
  if (/[.!?;]/.test(body)) return false;
  if (/\s{2,}/.test(text)) return false;
  const lower = text.toLowerCase();
  if (FLOODED.some((f) => lower.includes(f))) return false;
  if (/http|www\.|\.com/.test(lower)) return false;
  return true;
}

// -------------------------------------------------------------- composition
interface Candidate {
  text: string;
  score: number;
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const text of CANDIDATES) {
    if (!isValid(text)) continue;
    out.push({ text, score: score(text) });
  }
  return out;
}

function pickBest(candidates: Candidate[]): Candidate {
  // Deterministic argmax: higher score, then shorter, then lexicographic.
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
  return sorted[0];
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid roast candidate");
  const best = pickBest(candidates);
  if (process.env.ROAST_DEBUG) {
    const ranked = [...candidates].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.text.length !== b.text.length) return a.text.length - b.text.length;
      return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
    });
    for (const c of ranked.slice(0, 5)) {
      console.log(
        `[${c.score}] own=${ownScore(c.text)} turn=${turnScore(c.text)} ` +
          `sting=${stingScore(c.text)} tight=${tightScore(c.text)} ` +
          `specific=${specificScore(c.text)} pen=${penalties(c.text)} ` +
          `(${c.text.length}) ${c.text}`,
      );
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
