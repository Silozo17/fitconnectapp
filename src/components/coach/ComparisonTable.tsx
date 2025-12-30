import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  data: any[];
}

export function ComparisonTable({ data }: Props) {
  const { t } = useTranslation("coach");

  const getTrendIcon = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-success" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("clientComparison.client")}</TableHead>
          <TableHead className="text-right">{t("clientComparison.startWeight")}</TableHead>
          <TableHead className="text-right">{t("clientComparison.currentWeight")}</TableHead>
          <TableHead className="text-right">{t("clientComparison.weightChange")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => (
          <TableRow key={client.clientId}>
            <TableCell className="font-medium">{client.clientName}</TableCell>
            <TableCell className="text-right">
              {client.startWeight ? `${client.startWeight} kg` : "—"}
            </TableCell>
            <TableCell className="text-right">
              {client.endWeight ? `${client.endWeight} kg` : "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {getTrendIcon(client.weightChange)}
                {client.weightChange !== null ? (
                  <Badge variant={client.weightChange < 0 ? "default" : "secondary"}>
                    {client.weightChange > 0 ? "+" : ""}{client.weightChange?.toFixed(1)} kg
                  </Badge>
                ) : "—"}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
