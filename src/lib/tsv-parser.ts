import type { Prediction } from "./types";

export function parseTSV(raw: string): Prediction[] {
    const lines = raw.trim().split("\n");
    if (lines.length < 2) return [];

    // Detect header row — first line should contain "Matchup" or "Home win"
    const headerLine = lines[0].toLowerCase();
    const hasHeader =
        headerLine.includes("matchup") || headerLine.includes("home win");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines
        .map((line) => {
            const cols = line.split("\t").map((c) => c.trim());
            if (cols.length < 4) return null;

            const [start, matchup, homeWinRaw, spreadRaw] = cols;

            // Parse matchup: "Away Team @ Home Team"
            const atIndex = matchup.lastIndexOf(" @ ");
            if (atIndex === -1) return null;
            const awayTeam = matchup.substring(0, atIndex).trim();
            const homeTeam = matchup.substring(atIndex + 3).trim();

            const homeWinPct = parseFloat(homeWinRaw);
            const impliedHomeSpread = parseFloat(spreadRaw);

            if (isNaN(homeWinPct) || isNaN(impliedHomeSpread)) return null;

            return {
                start,
                awayTeam,
                homeTeam,
                matchup,
                homeWinPct,
                impliedHomeSpread,
            } satisfies Prediction;
        })
        .filter((p): p is Prediction => p !== null);
}
