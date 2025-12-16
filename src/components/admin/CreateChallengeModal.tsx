import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { CHALLENGE_TYPES } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/AuthContext';

const challengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  challenge_type: z.string(),
  target_value: z.number().min(1),
  target_unit: z.string(),
  xp_reward: z.number().min(10),
  start_date: z.string(),
  end_date: z.string(),
  target_audience: z.enum(['clients', 'coaches', 'all']),
  visibility: z.enum(['public', 'private']),
  is_active: z.boolean(),
  max_participants: z.number().nullable(),
});

type ChallengeForm = z.infer<typeof challengeSchema>;

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge?: any;
}

interface AISuggestion {
  title: string;
  description: string;
  target_value: number;
  target_unit: string;
  xp_reward: number;
  challenge_type: string;
  duration_days: number;
}

export function CreateChallengeModal({ open, onOpenChange, challenge }: CreateChallengeModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const isEdit = !!challenge;
  
  const form = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: '',
      description: '',
      challenge_type: 'habit_streak',
      target_value: 7,
      target_unit: 'days',
      xp_reward: 100,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      target_audience: 'clients',
      visibility: 'public',
      is_active: true,
      max_participants: null,
    },
  });
  
  useEffect(() => {
    if (challenge) {
      form.reset({
        title: challenge.title,
        description: challenge.description || '',
        challenge_type: challenge.challenge_type,
        target_value: challenge.target_value,
        target_unit: challenge.target_unit,
        xp_reward: challenge.xp_reward,
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        target_audience: challenge.target_audience || 'clients',
        visibility: challenge.visibility || 'public',
        is_active: challenge.is_active,
        max_participants: challenge.max_participants,
      });
    } else {
      form.reset();
    }
  }, [challenge, form]);
  
  const mutation = useMutation({
    mutationFn: async (data: ChallengeForm) => {
      // Get admin profile id
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (isEdit) {
        const { error } = await supabase
          .from('challenges')
          .update({
            title: data.title,
            description: data.description,
            challenge_type: data.challenge_type,
            target_value: data.target_value,
            target_unit: data.target_unit,
            xp_reward: data.xp_reward,
            start_date: data.start_date,
            end_date: data.end_date,
            visibility: data.visibility,
            is_active: data.is_active,
            max_participants: data.max_participants,
          })
          .eq('id', challenge.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('challenges').insert({
          title: data.title,
          description: data.description,
          challenge_type: data.challenge_type,
          target_value: data.target_value,
          target_unit: data.target_unit,
          xp_reward: data.xp_reward,
          start_date: data.start_date,
          end_date: data.end_date,
          visibility: data.visibility,
          is_active: data.is_active,
          max_participants: data.max_participants,
          created_by: adminProfile?.id || user?.id!,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success(isEdit ? 'Challenge updated' : 'Challenge created');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to save challenge');
    },
  });
  
  const generateAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-challenge-suggestions', {
        body: {
          target_audience: form.getValues('target_audience'),
          duration: 'weekly',
        },
      });
      
      if (error) throw error;
      setAiSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('AI suggestions error:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoadingAI(false);
    }
  };
  
  const applySuggestion = (suggestion: AISuggestion) => {
    form.setValue('title', suggestion.title);
    form.setValue('description', suggestion.description);
    form.setValue('target_value', suggestion.target_value);
    form.setValue('target_unit', suggestion.target_unit);
    form.setValue('xp_reward', suggestion.xp_reward);
    form.setValue('challenge_type', suggestion.challenge_type);
    form.setValue('end_date', format(addDays(new Date(), suggestion.duration_days), 'yyyy-MM-dd'));
    setAiSuggestions([]);
  };
  
  const selectedType = CHALLENGE_TYPES.find(t => t.value === form.watch('challenge_type'));
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Challenge' : 'Create Challenge'}</DialogTitle>
        </DialogHeader>
        
        {/* AI Suggestions */}
        {!isEdit && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Challenge Ideas
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAISuggestions}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>
            
            {aiSuggestions.length > 0 && (
              <div className="grid gap-2">
                {aiSuggestions.map((suggestion, i) => (
                  <Card
                    key={i}
                    className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {suggestion.xp_reward} XP
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="7-Day Workout Challenge"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Complete 7 workouts in 7 days to earn bonus XP!"
                rows={2}
              />
            </div>
            
            <div>
              <Label>Challenge Type</Label>
              <Select
                value={form.watch('challenge_type')}
                onValueChange={(v) => {
                  form.setValue('challenge_type', v);
                  const type = CHALLENGE_TYPES.find(t => t.value === v);
                  if (type) form.setValue('target_unit', type.unit);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHALLENGE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Target Audience</Label>
              <Select
                value={form.watch('target_audience')}
                onValueChange={(v: any) => form.setValue('target_audience', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clients">Clients Only</SelectItem>
                  <SelectItem value="coaches">Coaches Only</SelectItem>
                  <SelectItem value="all">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                {...form.register('target_value', { valueAsNumber: true })}
              />
            </div>
            
            <div>
              <Label htmlFor="target_unit">Target Unit</Label>
              <Input
                id="target_unit"
                {...form.register('target_unit')}
                placeholder={selectedType?.unit || 'days'}
              />
            </div>
            
            <div>
              <Label htmlFor="xp_reward">XP Reward</Label>
              <Input
                id="xp_reward"
                type="number"
                {...form.register('xp_reward', { valueAsNumber: true })}
              />
            </div>
            
            <div>
              <Label htmlFor="max_participants">Max Participants (optional)</Label>
              <Input
                id="max_participants"
                type="number"
                {...form.register('max_participants', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : Number(v)
                })}
                placeholder="Unlimited"
              />
            </div>
            
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...form.register('start_date')}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...form.register('end_date')}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(v) => form.setValue('is_active', v)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="visibility"
                  checked={form.watch('visibility') === 'public'}
                  onCheckedChange={(v) => form.setValue('visibility', v ? 'public' : 'private')}
                />
                <Label htmlFor="visibility">Public</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Update' : 'Create'} Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
