import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquarePlus, Bug, Lightbulb, Sparkles, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSubmitFeedback } from "@/hooks/useFeedback";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FirstTimeTooltip } from "@/components/shared/FirstTimeTooltip";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const feedbackSchema = z.object({
  category: z.enum(["bug", "feature", "improvement", "general"]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100, "Subject must be less than 100 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const CATEGORY_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  improvement: Sparkles,
  general: HelpCircle,
} as const;

export const FeedbackModal = () => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "general",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback(
      {
        category: data.category,
        subject: data.subject,
        message: data.message,
      },
      {
        onSuccess: () => {
          toast({
            title: t("feedback.success"),
            description: t("feedback.successDescription"),
          });
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast({
            title: t("feedback.error"),
            description: t("feedback.errorDescription"),
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <FirstTimeTooltip
        storageKey={STORAGE_KEYS.FEEDBACK_TOOLTIP_SEEN}
        message="Got ideas? Share feedback! 💡"
        position="bottom"
        showDelay={4500}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("feedback.sendFeedback")}</p>
          </TooltipContent>
        </Tooltip>
      </FirstTimeTooltip>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
            </div>
            {t("feedback.sendFeedback")}
          </DialogTitle>
          <DialogDescription>
            {t("feedback.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("feedback.category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t("feedback.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(["bug", "feature", "improvement", "general"] as const).map((cat) => {
                        const Icon = CATEGORY_ICONS[cat];
                        return (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {t(`feedback.categories.${cat}`)}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("feedback.subject")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("feedback.subjectPlaceholder")} className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("feedback.message")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("feedback.placeholder")}
                      className="min-h-[120px] resize-none rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl"
              >
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-xl">
                {isPending ? t("feedback.submitting") : t("feedback.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
