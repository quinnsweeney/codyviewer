import type { Prediction, ParlayLeg, ParlaySlip } from "./types";

/**
 * Convert a win probability (0-1) to American odds.
 */
export function probToAmericanOdds(prob: number): number {
    if (prob <= 0 || prob >= 1) return 0;
    if (prob >= 0.5) {
        // Favorite: negative odds
        return Math.round((-prob / (1 - prob)) * 100);
    } else {
        // Underdog: positive odds
        return Math.round(((1 - prob) / prob) * 100);
    }
}

/**
 * Convert a win probability (0-1) to decimal odds.
 */
export function probToDecimalOdds(prob: number): number {
    if (prob <= 0 || prob >= 1) return 0;
    return 1 / prob;
}

/**
 * Convert decimal odds to American odds.
 */
export function decimalToAmericanOdds(decimal: number): number {
    if (decimal >= 2) {
        return Math.round((decimal - 1) * 100);
    } else {
        return Math.round(-100 / (decimal - 1));
    }
}

/**
 * Format American odds as a string with + or - prefix.
 */
export function formatAmericanOdds(odds: number): string {
    return odds > 0 ? `+${odds}` : `${odds}`;
}

/**
 * Create a ParlayLeg from a Prediction, picking the side with higher win probability.
 */
export function predictionToBestLeg(prediction: Prediction): ParlayLeg {
    const homeProb = prediction.homeWinPct;
    const awayProb = 1 - homeProb;
    const isHomeFavorite = homeProb >= awayProb;

    const winPct = isHomeFavorite ? homeProb : awayProb;
    return {
        prediction,
        pick: isHomeFavorite ? "home" : "away",
        winPct,
        americanOdds: probToAmericanOdds(winPct),
        decimalOdds: probToDecimalOdds(winPct),
    };
}

/**
 * Build a ParlaySlip from a set of legs.
 */
export function buildParlaySlip(legs: ParlayLeg[]): ParlaySlip {
    const combinedDecimalOdds = legs.reduce(
        (acc, leg) => acc * leg.decimalOdds,
        1
    );
    const impliedProbability = 1 / combinedDecimalOdds;
    const combinedAmericanOdds = decimalToAmericanOdds(combinedDecimalOdds);

    return {
        legs,
        combinedDecimalOdds,
        combinedAmericanOdds,
        impliedProbability,
    };
}

/**
 * Generate k-combinations from an array, capped at maxResults to prevent
 * freezing the browser on large inputs.
 */
function combinations<T>(arr: T[], k: number, maxResults = 10000): T[][] {
    if (k === 0) return [[]];
    if (arr.length < k) return [];
    const results: T[][] = [];
    let stopped = false;

    function backtrack(start: number, current: T[]) {
        if (stopped) return;
        if (current.length === k) {
            results.push([...current]);
            if (results.length >= maxResults) stopped = true;
            return;
        }
        for (let i = start; i < arr.length; i++) {
            if (stopped) return;
            current.push(arr[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return results;
}

export interface ParlayFilterOptions {
    numLegs: number;
    maxTotalOdds?: number; // American odds upper limit (e.g. 500 means +500)
    minTotalOdds?: number; // American odds lower limit (e.g. 200 means +200)
    maxPerLegOdds?: number; // American odds upper limit per leg
    minPerLegOdds?: number; // American odds lower limit per leg
}

/**
 * Generate the best parlays for a set of predictions.
 * Returns up to `limit` parlays sorted by expected value (highest first).
 */
export function generateParlays(
    predictions: Prediction[],
    options: ParlayFilterOptions,
    limit = 10
): ParlaySlip[] {
    // Build best-side legs for every prediction
    let legs = predictions.map(predictionToBestLeg);

    // Filter by per-leg odds range
    if (options.maxPerLegOdds !== undefined) {
        const maxAbs = Math.abs(options.maxPerLegOdds);
        legs = legs.filter((leg) => Math.abs(leg.americanOdds) <= maxAbs);
    }
    if (options.minPerLegOdds !== undefined) {
        const minAbs = Math.abs(options.minPerLegOdds);
        legs = legs.filter((leg) => Math.abs(leg.americanOdds) >= minAbs);
    }

    if (legs.length < options.numLegs) return [];

    const combos = combinations(legs, options.numLegs);
    let parlays = combos.map(buildParlaySlip);

    // Filter by total odds range
    if (options.maxTotalOdds !== undefined) {
        const maxTotal = options.maxTotalOdds;
        parlays = parlays.filter((p) => {
            if (p.combinedAmericanOdds > 0) return p.combinedAmericanOdds <= maxTotal;
            return true;
        });
    }
    if (options.minTotalOdds !== undefined) {
        const minTotal = options.minTotalOdds;
        parlays = parlays.filter((p) => {
            if (p.combinedAmericanOdds > 0) return p.combinedAmericanOdds >= minTotal;
            return false; // negative combined odds are below any positive minimum
        });
    }

    // Sort by combined odds descending (highest payout first)
    parlays.sort((a, b) => a.combinedDecimalOdds - b.combinedDecimalOdds);

    return parlays.slice(0, limit);
}
