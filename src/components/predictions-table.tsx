import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { probToAmericanOdds, formatAmericanOdds } from "@/lib/parlay";
import type { Prediction } from "@/lib/types";

type SortKey = "start" | "matchup" | "winPct" | "impliedHomeSpread";
type SortDir = "asc" | "desc";

interface PredictionsTableProps {
    predictions: Prediction[];
}

function winPctBadgeVariant(pct: number): "default" | "secondary" | "destructive" {
    if (pct >= 0.7) return "default";
    if (pct >= 0.5) return "secondary";
    return "destructive";
}

/** Derive the best-side win% for sorting/display */
function bestWinPct(p: Prediction): number {
    return p.homeWinPct >= 0.5 ? p.homeWinPct : 1 - p.homeWinPct;
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("winPct");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const sorted = useMemo(() => {
        const arr = [...predictions];
        arr.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "start":
                    cmp = a.start.localeCompare(b.start);
                    break;
                case "matchup":
                    cmp = a.matchup.localeCompare(b.matchup);
                    break;
                case "winPct":
                    cmp = bestWinPct(a) - bestWinPct(b);
                    break;
                case "impliedHomeSpread":
                    cmp = a.impliedHomeSpread - b.impliedHomeSpread;
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });
        return arr;
    }, [predictions, sortKey, sortDir]);

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    }

    const sortIndicator = (key: SortKey) =>
        sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Predictions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer select-none whitespace-nowrap"
                                    onClick={() => handleSort("start")}
                                >
                                    Time{sortIndicator("start")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort("matchup")}
                                >
                                    Matchup{sortIndicator("matchup")}
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Predicted Winner
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none whitespace-nowrap text-right"
                                    onClick={() => handleSort("winPct")}
                                >
                                    Win %{sortIndicator("winPct")}
                                </TableHead>
                                <TableHead className="text-right whitespace-nowrap">
                                    ML Odds
                                </TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map((p, i) => {
                                const isHomeFavorite = p.homeWinPct >= 0.5;
                                const winPct = isHomeFavorite ? p.homeWinPct : 1 - p.homeWinPct;
                                const predictedWinner = isHomeFavorite ? p.homeTeam : p.awayTeam;
                                const odds = probToAmericanOdds(winPct);
                                return (
                                    <TableRow key={i}>
                                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                                            {p.start}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{p.awayTeam}</span>
                                            <span className="text-muted-foreground mx-1">@</span>
                                            <span className="font-medium">{p.homeTeam}</span>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {predictedWinner}{" "}
                                            <span className="text-muted-foreground font-normal">
                                                (-{Math.abs(p.impliedHomeSpread)})
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={winPctBadgeVariant(winPct)}>
                                                {(winPct * 100).toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {formatAmericanOdds(odds)}
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
