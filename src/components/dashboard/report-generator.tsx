"use client"

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
// import { useFlow } from "@genkit-ai/next/client";

// import { generateSalesReport } from "@/ai/flows/generate-sales-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReportGenerator() {
  const [criteria, setCriteria] = useState("Ventas mensuales de pasteles de chocolate");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = async () => {
    // TODO: Integrate with @genkit-ai/next when available
    setGenerating(true);
    // Placeholder: this will be replaced with actual AI flow
    setTimeout(() => {
      setReport("Reporte de IA no configurado. Por favor, instala @genkit-ai/next.");
      setGenerating(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Generador de Reportes con IA
        </CardTitle>
        <CardDescription>
          Genera análisis de ventas instantáneos. Pide lo que necesites, como "ventas de la última semana" o "productos más vendidos en mayo".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-2">
            <Label htmlFor="criteria">Criterios del reporte</Label>
            <Textarea
                id="criteria"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Ej: ventas de la última semana"
                rows={2}
            />
        </div>
        {report && (
          <div className="p-4 border bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Reporte Generado:</h4>
            <p className="text-sm whitespace-pre-wrap">{report}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={generating || !criteria}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : "Generar Reporte"}
        </Button>
      </CardFooter>
    </Card>
  );
}
