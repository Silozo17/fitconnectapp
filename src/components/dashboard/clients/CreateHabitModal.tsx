import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useCreateHabit, useUpdateHabit, Habit, HABIT_CATEGORIES_LIST, WEARABLE_HABIT_TARGETS } from "@/hooks/useHabits";
import { Watch, ShieldCheck } from "lucide-react";
import { getCategoryIcon } from "@/lib/habit-icons";

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  clientId: string;
  habit?: Habit; // For editing
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const CreateHabitModal = ({ open, onOpenChange, coachId, clientId, habit }: CreateHabitModalProps) => {
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const isEditing = !!habit;
  
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || 'other',
    frequency: habit?.frequency || 'daily',
    specific_days: habit?.specific_days || [],
    target_count: habit?.target_count || 1,
    reminder_time: habit?.reminder_time || '',
    start_date: habit?.start_date || new Date().toISOString().split('T')[0],
    end_date: habit?.end_date || '',
    wearable_target_type: habit?.wearable_target_type || '',
    wearable_target_value: habit?.wearable_target_value || 0,
  });
  
  const [useWearable, setUseWearable] = useState(!!habit?.wearable_target_type);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const wearableTarget = WEARABLE_HABIT_TARGETS.find(t => t.value === formData.wearable_target_type);
    
    const data = {
      ...formData,
      coach_id: coachId,
      client_id: clientId,
      is_active: true,
      description: formData.description || null,
      reminder_time: formData.reminder_time || null,
      end_date: formData.end_date || null,
      wearable_target_type: useWearable && formData.wearable_target_type ? formData.wearable_target_type : null,
      wearable_target_value: useWearable && formData.wearable_target_value ? formData.wearable_target_value : null,
    };
    
    if (isEditing) {
      await updateHabit.mutateAsync({ id: habit.id, ...data });
    } else {
      await createHabit.mutateAsync(data);
    }
    
    onOpenChange(false);
  };
  
  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      specific_days: prev.specific_days.includes(day)
        ? prev.specific_days.filter(d => d !== day)
        : [...prev.specific_days, day].sort(),
    }));
  };
  
  const handleWearableTypeChange = (type: string) => {
    const wearableTarget = WEARABLE_HABIT_TARGETS.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      wearable_target_type: type,
      wearable_target_value: wearableTarget?.defaultValue || 0,
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any helpful details or instructions..."
              rows={2}
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES_LIST.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span className={cat.color}>{getCategoryIcon(cat.icon, "h-4 w-4")}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="specific_days">Specific Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Specific Days */}
          {formData.frequency === 'specific_days' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.specific_days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Target Count */}
          <div className="space-y-2">
            <Label htmlFor="target">Times per day</Label>
            <Input
              id="target"
              type="number"
              min={1}
              max={20}
              value={formData.target_count}
              onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 1 })}
            />
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                className="w-full"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                className="w-full"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          
          {/* Wearable Auto-Verification */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Watch className="h-4 w-4 text-primary" />
                <Label htmlFor="wearable-toggle" className="font-medium">Link to Wearable Data</Label>
              </div>
              <Switch
                id="wearable-toggle"
                checked={useWearable}
                onCheckedChange={setUseWearable}
              />
            </div>
            
            {useWearable && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Habit will auto-complete when wearable data meets the target
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <Select
                      value={formData.wearable_target_type}
                      onValueChange={handleWearableTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEARABLE_HABIT_TARGETS.map((target) => (
                          <SelectItem key={target.value} value={target.value}>
                            {target.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={formData.wearable_target_value}
                        onChange={(e) => setFormData({ ...formData, wearable_target_value: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground shrink-0">
                        {WEARABLE_HABIT_TARGETS.find(t => t.value === formData.wearable_target_type)?.unit || ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Reminder Time */}
          <div className="space-y-2">
            <Label htmlFor="reminder">Reminder Time (optional)</Label>
            <Input
              id="reminder"
              type="time"
              value={formData.reminder_time}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
            />
          </div>
          
        </div>
        
        {/* Actions - outside scrollable area */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createHabit.isPending || updateHabit.isPending}>
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHabitModal;
