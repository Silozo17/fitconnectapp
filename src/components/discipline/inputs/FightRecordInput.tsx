/**
 * Fight Record Input - For Boxing, MMA, Muay Thai, Kickboxing
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FightRecordValue } from "@/config/disciplines/types";

interface FightRecordInputProps {
  value: FightRecordValue | null;
  onChange: (value: FightRecordValue) => void;
  fields?: string[];
  className?: string;
}

export function FightRecordInput({
  value,
  onChange,
  fields = ['wins', 'losses', 'draws', 'ko_wins'],
  className,
}: FightRecordInputProps) {
  const [wins, setWins] = useState(value?.wins || 0);
  const [losses, setLosses] = useState(value?.losses || 0);
  const [draws, setDraws] = useState(value?.draws || 0);
  const [koWins, setKoWins] = useState(value?.koWins || 0);
  const [koLosses, setKoLosses] = useState(value?.koLosses || 0);
  const [nc, setNc] = useState(value?.nc || 0);

  useEffect(() => {
    onChange({
      wins,
      losses,
      draws,
      koWins: fields.includes('ko_wins') ? koWins : undefined,
      koLosses: fields.includes('ko_losses') ? koLosses : undefined,
      nc: fields.includes('nc') ? nc : undefined,
    });
  }, [wins, losses, draws, koWins, koLosses, nc]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Record W-L-D */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-green-500">Wins</Label>
          <Input
            type="number"
            min={0}
            value={wins}
            onChange={(e) => setWins(parseInt(e.target.value) || 0)}
            className="text-center text-lg font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-red-500">Losses</Label>
          <Input
            type="number"
            min={0}
            value={losses}
            onChange={(e) => setLosses(parseInt(e.target.value) || 0)}
            className="text-center text-lg font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Draws</Label>
          <Input
            type="number"
            min={0}
            value={draws}
            onChange={(e) => setDraws(parseInt(e.target.value) || 0)}
            className="text-center text-lg font-bold"
          />
        </div>
      </div>

      {/* Visual Record Display */}
      <div className="p-3 rounded-lg bg-muted/50 text-center">
        <span className="text-2xl font-bold tracking-wider">
          <span className="text-green-500">{wins}</span>
          <span className="text-muted-foreground mx-1">-</span>
          <span className="text-red-500">{losses}</span>
          <span className="text-muted-foreground mx-1">-</span>
          <span>{draws}</span>
        </span>
        {(fields.includes('ko_wins') && koWins > 0) && (
          <p className="text-sm text-muted-foreground mt-1">
            {koWins} KO{koWins > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Additional Fields */}
      {(fields.includes('ko_wins') || fields.includes('ko_losses') || fields.includes('submission_wins')) && (
        <div className="grid grid-cols-2 gap-3">
          {fields.includes('ko_wins') && (
            <div className="space-y-2">
              <Label className="text-xs">KO Wins</Label>
              <Input
                type="number"
                min={0}
                max={wins}
                value={koWins}
                onChange={(e) => setKoWins(Math.min(parseInt(e.target.value) || 0, wins))}
              />
            </div>
          )}
          {fields.includes('ko_losses') && (
            <div className="space-y-2">
              <Label className="text-xs">KO Losses</Label>
              <Input
                type="number"
                min={0}
                max={losses}
                value={koLosses}
                onChange={(e) => setKoLosses(Math.min(parseInt(e.target.value) || 0, losses))}
              />
            </div>
          )}
          {fields.includes('submission_wins') && (
            <div className="space-y-2">
              <Label className="text-xs">Submission Wins</Label>
              <Input
                type="number"
                min={0}
                max={wins}
                value={koWins} // Reusing koWins for submission wins
                onChange={(e) => setKoWins(Math.min(parseInt(e.target.value) || 0, wins))}
              />
            </div>
          )}
          {fields.includes('nc') && (
            <div className="space-y-2">
              <Label className="text-xs">No Contests</Label>
              <Input
                type="number"
                min={0}
                value={nc}
                onChange={(e) => setNc(parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
