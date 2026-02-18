import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseTSV } from "@/lib/tsv-parser";
import type { Prediction } from "@/lib/types";

interface TsvInputProps {
    onDataLoaded: (predictions: Prediction[]) => void;
}

export function TsvInput({ onDataLoaded }: TsvInputProps) {
    const [raw, setRaw] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleLoad() {
        const text = raw.trim();
        if (!text) {
            setError("Please paste your TSV data first.");
            return;
        }
        const predictions = parseTSV(text);
        if (predictions.length === 0) {
            setError("Could not parse any predictions. Make sure your data is tab-separated with columns: Start, Matchup, Home win %, Implied Home Spread.");
            return;
        }
        setError(null);
        onDataLoaded(predictions);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import Prediction Data</CardTitle>
                <CardDescription>
                    Paste tab-separated data with columns: Start, Matchup, Home win %, Implied Home Spread
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder={"Start\tMatchup\tHome win %\tImplied Home Spread\nFeb. 18, 2026, 5 p.m.\tCreighton @ UConn\t0.956\t18.2"}
                    value={raw}
                    onChange={(e) => {
                        setRaw(e.target.value);
                        if (error) setError(null);
                    }}
                    rows={8}
                    className="font-mono text-xs"
                />
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex gap-3">
                    <Button onClick={handleLoad}>
                        Load Data
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
