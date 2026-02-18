import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { probToAmericanOdds, formatAmericanOdds } from "@/lib/parlay";
import type { Prediction } from "@/lib/types";

interface TopBetsProps {
    predictions: Prediction[];
}

export function TopBets({ predictions }: TopBetsProps) {
    const topFive = useMemo(() => {
        // For each game, pick the side with higher win prob (money line best bet)
        const bets = predictions.map((p) => {
            const isHomeFavorite = p.homeWinPct >= 0.5;
            const winPct = isHomeFavorite ? p.homeWinPct : 1 - p.homeWinPct;
            const pickedTeam = isHomeFavorite ? p.homeTeam : p.awayTeam;
            const opponent = isHomeFavorite ? p.awayTeam : p.homeTeam;
            const odds = probToAmericanOdds(winPct);
            return { prediction: p, pickedTeam, opponent, winPct, odds, isHomeFavorite };
        });
        bets.sort((a, b) => b.winPct - a.winPct);
        return bets.slice(0, 5);
    }, [predictions]);

    if (predictions.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Load prediction data to see the top bets.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Top 5 Money Line Bets</h2>
                <p className="text-sm text-muted-foreground">
                    Ranked by model confidence — the strongest money-line picks of the day.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {topFive.map((bet, i) => (
                    <Card key={i} className="relative overflow-hidden">
                        {/* Rank ribbon */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />

                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <CardTitle className="text-base">
                                            {bet.pickedTeam}
                                        </CardTitle>
                                        <CardDescription>
                                            vs {bet.opponent} · {bet.prediction.start}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="default" className="text-sm px-3 py-1 h-auto">
                                    {formatAmericanOdds(bet.odds)}
                                </Badge>
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="pt-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Win Probability</p>
                                    <p className="text-lg font-bold mt-1">{(bet.winPct * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Money Line</p>
                                    <p className="text-lg font-bold font-mono mt-1">{formatAmericanOdds(bet.odds)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Spread</p>
                                    <p className="text-lg font-bold font-mono mt-1">
                                        {bet.isHomeFavorite
                                            ? (bet.prediction.impliedHomeSpread > 0
                                                ? `-${bet.prediction.impliedHomeSpread}`
                                                : `+${Math.abs(bet.prediction.impliedHomeSpread)}`)
                                            : (bet.prediction.impliedHomeSpread > 0
                                                ? `+${bet.prediction.impliedHomeSpread}`
                                                : `-${Math.abs(bet.prediction.impliedHomeSpread)}`)
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
