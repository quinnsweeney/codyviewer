import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { generateParlays, formatAmericanOdds } from "@/lib/parlay";
import type { Prediction, ParlaySlip } from "@/lib/types";

interface ParlayBuilderProps {
    predictions: Prediction[];
}

export function ParlayBuilder({ predictions }: ParlayBuilderProps) {
    const [numLegs, setNumLegs] = useState(3);
    const [minTotalOdds, setMinTotalOdds] = useState<string>("");
    const [maxTotalOdds, setMaxTotalOdds] = useState<string>("");
    const [minPerLegOdds, setMinPerLegOdds] = useState<string>("");
    const [maxPerLegOdds, setMaxPerLegOdds] = useState<string>("");
    const [parlays, setParlays] = useState<ParlaySlip[]>([]);
    const [hasGenerated, setHasGenerated] = useState(false);

    const maxLegs = Math.min(10, predictions.length);

    function handleGenerate() {
        const options = {
            numLegs,
            minTotalOdds: minTotalOdds ? parseInt(minTotalOdds, 10) : undefined,
            maxTotalOdds: maxTotalOdds ? parseInt(maxTotalOdds, 10) : undefined,
            minPerLegOdds: minPerLegOdds ? parseInt(minPerLegOdds, 10) : undefined,
            maxPerLegOdds: maxPerLegOdds ? parseInt(maxPerLegOdds, 10) : undefined,
        };
        const results = generateParlays(predictions, options, 5);
        setParlays(results);
        setHasGenerated(true);
    }

    if (predictions.length < 2) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Load at least 2 predictions to build parlays.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Parlay Configuration</CardTitle>
                    <CardDescription>
                        Set your parlay parameters and generate the best combinations from today's predictions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Number of legs slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Number of Legs</Label>
                            <Badge variant="secondary" className="font-mono">
                                {numLegs}
                            </Badge>
                        </div>
                        <Slider
                            value={[numLegs]}
                            onValueChange={(v) => setNumLegs(v[0])}
                            min={2}
                            max={maxLegs}
                            step={1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>2</span>
                            <span>{maxLegs}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Odds filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minTotalOdds">Min Total Odds</Label>
                            <Input
                                id="minTotalOdds"
                                type="number"
                                placeholder="e.g. 200 for +200"
                                value={minTotalOdds}
                                onChange={(e) => setMinTotalOdds(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum combined American odds
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxTotalOdds">Max Total Odds</Label>
                            <Input
                                id="maxTotalOdds"
                                type="number"
                                placeholder="e.g. 500 for +500"
                                value={maxTotalOdds}
                                onChange={(e) => setMaxTotalOdds(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum combined American odds
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minPerLegOdds">Min Per-Leg Odds</Label>
                            <Input
                                id="minPerLegOdds"
                                type="number"
                                placeholder="e.g. 100 for ±100"
                                value={minPerLegOdds}
                                onChange={(e) => setMinPerLegOdds(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum absolute odds per leg
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxPerLegOdds">Max Per-Leg Odds</Label>
                            <Input
                                id="maxPerLegOdds"
                                type="number"
                                placeholder="e.g. 200 for ±200"
                                value={maxPerLegOdds}
                                onChange={(e) => setMaxPerLegOdds(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum absolute odds per leg
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleGenerate} className="w-full sm:w-auto">
                        Generate Parlays
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            {hasGenerated && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">
                            {parlays.length > 0
                                ? `Top ${parlays.length} Parlay${parlays.length === 1 ? "" : "s"}`
                                : "No Parlays Found"}
                        </h3>
                        {parlays.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                Ranked by expected value from the prediction model.
                            </p>
                        )}
                        {parlays.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your filters — loosen the odds limits or reduce the number of legs.
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {parlays.map((parlay, pi) => (
                            <Card key={pi}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {pi + 1}
                                            </span>
                                            <CardTitle className="text-base">
                                                {parlay.legs.length}-Leg Parlay
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="font-mono text-sm px-3 py-1 h-auto">
                                                {formatAmericanOdds(parlay.combinedAmericanOdds)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <Separator />

                                <CardContent className="pt-4">
                                    <div className="space-y-2">
                                        {parlay.legs.map((leg, li) => (
                                            <div
                                                key={li}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                                            >
                                                <div>
                                                    <span className="font-medium">
                                                        {leg.pick === "home"
                                                            ? leg.prediction.homeTeam
                                                            : leg.prediction.awayTeam}
                                                    </span>
                                                    <span className="text-muted-foreground text-sm ml-2">
                                                        vs{" "}
                                                        {leg.pick === "home"
                                                            ? leg.prediction.awayTeam
                                                            : leg.prediction.homeTeam}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        {(leg.winPct * 100).toFixed(1)}%
                                                    </span>
                                                    <Badge variant="outline" className="font-mono">
                                                        {formatAmericanOdds(leg.americanOdds)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Combined Odds</p>
                                            <p className="font-bold font-mono mt-1">
                                                {formatAmericanOdds(parlay.combinedAmericanOdds)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Implied Prob</p>
                                            <p className="font-bold mt-1">
                                                {(parlay.impliedProbability * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">$100 Payout</p>
                                            <p className="font-bold font-mono mt-1">
                                                ${(parlay.combinedDecimalOdds * 100).toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
