/**
 * Skill Checklist Input - For Calisthenics skills unlocked
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SkillChecklistValue } from "@/config/disciplines/types";

interface SkillChecklistInputProps {
  value: SkillChecklistValue | null;
  onChange: (value: SkillChecklistValue) => void;
  skills: string[];
  className?: string;
}

export function SkillChecklistInput({
  value,
  onChange,
  skills,
  className,
}: SkillChecklistInputProps) {
  const [selectedSkills, setSelectedSkills] = useState<
    Array<{ skillId: string; achieved: boolean; achievedAt?: string }>
  >(
    value?.skills ||
    skills.map(s => ({ skillId: s, achieved: false }))
  );

  useEffect(() => {
    onChange({ skills: selectedSkills });
  }, [selectedSkills]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.map(s =>
        s.skillId === skillId
          ? {
              ...s,
              achieved: !s.achieved,
              achievedAt: !s.achieved ? new Date().toISOString() : undefined,
            }
          : s
      )
    );
  };

  const achievedCount = selectedSkills.filter(s => s.achieved).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label>Skills Unlocked</Label>
        <span className="text-sm text-muted-foreground">
          {achievedCount} of {skills.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${(achievedCount / skills.length) * 100}%` }}
        />
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {skills.map(skill => {
          const skillData = selectedSkills.find(s => s.skillId === skill);
          const isAchieved = skillData?.achieved || false;

          return (
            <Button
              key={skill}
              type="button"
              variant="outline"
              onClick={() => toggleSkill(skill)}
              className={cn(
                "h-auto py-2 px-3 justify-start text-left",
                isAchieved && "border-teal-500/50 bg-teal-500/10"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center transition-colors",
                isAchieved
                  ? "border-teal-500 bg-teal-500"
                  : "border-muted-foreground/30"
              )}>
                {isAchieved && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={cn(
                "text-xs",
                isAchieved && "font-medium text-teal-400"
              )}>
                {skill}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Achievement Summary */}
      {achievedCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
          <Trophy className="w-5 h-5 text-teal-400" />
          <span className="text-sm">
            {achievedCount} skill{achievedCount > 1 ? 's' : ''} unlocked
          </span>
        </div>
      )}
    </div>
  );
}
