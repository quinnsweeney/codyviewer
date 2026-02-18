export interface Prediction {
    start: string;
    awayTeam: string;
    homeTeam: string;
    matchup: string;
    homeWinPct: number;
    impliedHomeSpread: number;
}

export interface ParlayLeg {
    prediction: Prediction;
    pick: "home" | "away";
    winPct: number;
    americanOdds: number;
    decimalOdds: number;
}

export interface ParlaySlip {
    legs: ParlayLeg[];
    combinedDecimalOdds: number;
    combinedAmericanOdds: number;
    impliedProbability: number;
}
