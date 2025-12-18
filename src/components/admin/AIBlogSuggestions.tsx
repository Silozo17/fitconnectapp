import { useState } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, FileText, Search, Tag, X } from "lucide-react";
import { AIBlogSuggestions as AIBlogSuggestionsType } from "@/hooks/useAIBlogFormatter";

interface AIBlogSuggestionsProps {
  suggestions: AIBlogSuggestionsType;
  onApply: (selected: {
    content?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  }) => void;
  onClose: () => void;
}

export const AIBlogSuggestions = ({ suggestions, onApply, onClose }: AIBlogSuggestionsProps) => {
  const [selected, setSelected] = useState({
    content: true,
    excerpt: true,
    metaTitle: true,
    metaDescription: true,
    keywords: true,
  });

  const handleApply = () => {
    onApply({
      content: selected.content ? suggestions.formattedContent : undefined,
      excerpt: selected.excerpt ? suggestions.suggestedExcerpt : undefined,
      metaTitle: selected.metaTitle ? suggestions.suggestedMetaTitle : undefined,
      metaDescription: selected.metaDescription ? suggestions.suggestedMetaDescription : undefined,
      keywords: selected.keywords ? suggestions.suggestedKeywords : undefined,
    });
    onClose();
  };

  const handleApplyAll = () => {
    onApply({
      content: suggestions.formattedContent,
      excerpt: suggestions.suggestedExcerpt,
      metaTitle: suggestions.suggestedMetaTitle,
      metaDescription: suggestions.suggestedMetaDescription,
      keywords: suggestions.suggestedKeywords,
    });
    onClose();
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">✨</span>
            AI Suggestions
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formatted Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="apply-content"
              checked={selected.content}
              onCheckedChange={(checked) => setSelected(prev => ({ ...prev, content: !!checked }))}
            />
            <label htmlFor="apply-content" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-primary" />
              Formatted Content
            </label>
          </div>
          <ScrollArea className="h-48 border rounded-md p-3 bg-muted/30">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(suggestions.formattedContent, {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'br', 'span', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
              }) }}
            />
          </ScrollArea>
        </div>

        <Separator />

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="apply-excerpt"
              checked={selected.excerpt}
              onCheckedChange={(checked) => setSelected(prev => ({ ...prev, excerpt: !!checked }))}
            />
            <label htmlFor="apply-excerpt" className="text-sm font-medium cursor-pointer">
              Excerpt
            </label>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            {suggestions.suggestedExcerpt}
          </p>
        </div>

        <Separator />

        {/* SEO Fields */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 text-primary" />
            SEO Suggestions
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="apply-meta-title"
                checked={selected.metaTitle}
                onCheckedChange={(checked) => setSelected(prev => ({ ...prev, metaTitle: !!checked }))}
              />
              <label htmlFor="apply-meta-title" className="text-xs text-muted-foreground cursor-pointer">
                Meta Title ({suggestions.suggestedMetaTitle.length}/60)
              </label>
            </div>
            <p className="text-sm bg-muted/30 p-2 rounded-md">{suggestions.suggestedMetaTitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="apply-meta-desc"
                checked={selected.metaDescription}
                onCheckedChange={(checked) => setSelected(prev => ({ ...prev, metaDescription: !!checked }))}
              />
              <label htmlFor="apply-meta-desc" className="text-xs text-muted-foreground cursor-pointer">
                Meta Description ({suggestions.suggestedMetaDescription.length}/160)
              </label>
            </div>
            <p className="text-sm bg-muted/30 p-2 rounded-md">{suggestions.suggestedMetaDescription}</p>
          </div>
        </div>

        <Separator />

        {/* Keywords */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="apply-keywords"
              checked={selected.keywords}
              onCheckedChange={(checked) => setSelected(prev => ({ ...prev, keywords: !!checked }))}
            />
            <label htmlFor="apply-keywords" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <Tag className="h-4 w-4 text-primary" />
              Keywords
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestedKeywords.map((keyword, i) => (
              <Badge key={i} variant="secondary">{keyword}</Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApplyAll} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Apply All
          </Button>
          <Button onClick={handleApply} variant="outline" className="flex-1">
            Apply Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
