import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TsvInput } from "@/components/tsv-input";
import { PredictionsTable } from "@/components/predictions-table";
import { TopBets } from "@/components/top-bets";
import { ParlayBuilder } from "@/components/parlay-builder";
import type { Prediction } from "@/lib/types";

export default function App() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [collapsed, setCollapsed] = useState(false);

    function handleDataLoaded(data: Prediction[]) {
        setPredictions(data);
        setCollapsed(true);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                            🏀
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight tracking-tight">
                                Cody Viewer
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Basketball prediction analysis & parlay builder
                            </p>
                        </div>
                    </div>
                    {predictions.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {predictions.length} games loaded
                        </p>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                {/* TSV Input — collapsible after data is loaded */}
                {!collapsed ? (
                    <TsvInput onDataLoaded={handleDataLoaded} />
                ) : (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg border border-dashed hover:border-primary/50 cursor-pointer"
                    >
                        ✏️ Click to edit or re-paste prediction data ({predictions.length} games loaded)
                    </button>
                )}

                {/* Tabs (only visible when we have data) */}
                {predictions.length > 0 && (
                    <Tabs defaultValue="predictions" className="space-y-4">
                        <TabsList className="w-full sm:w-auto">
                            <TabsTrigger value="predictions">All Predictions</TabsTrigger>
                            <TabsTrigger value="top-bets">Top 5 Bets</TabsTrigger>
                            <TabsTrigger value="parlay">Parlay Builder</TabsTrigger>
                        </TabsList>

                        <TabsContent value="predictions">
                            <PredictionsTable predictions={predictions} />
                        </TabsContent>

                        <TabsContent value="top-bets">
                            <TopBets predictions={predictions} />
                        </TabsContent>

                        <TabsContent value="parlay">
                            <ParlayBuilder predictions={predictions} />
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
}