import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Heart, Pin, Megaphone, Users, BookOpen, Video, CheckCircle2, Circle, Package, ShoppingBag, Image } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import {
  useCommunityPosts, useCreatePost, useCommunityComments, useCreateComment,
  useToggleReaction, useCommunityMembers, type CommunityPost,
} from "@/hooks/useCommunity";
import {
  useCommunityModules, useAllCommunityLessons, useLessonProgress, useMarkLessonComplete,
  type CommunityModule, type CommunityLesson,
} from "@/hooks/useCommunityClassroom";
import {
  useCommunityLinkedPackages, useCommunityLinkedProducts,
} from "@/hooks/useCommunityLinkedContent";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ===== Post Card =====
const ClientPostCard = ({ post }: { post: CommunityPost }) => {
  const { t } = useTranslation("client");
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments = [] } = useCommunityComments(showComments ? post.id : undefined);
  const createComment = useCreateComment();
  const toggleReaction = useToggleReaction();

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ post_id: post.id, content: commentText.trim() });
      setCommentText("");
    } catch { toast.error(t("community.commentFailed")); }
  };

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {post.is_pinned && <Badge variant="secondary" className="text-xs"><Pin className="h-3 w-3 mr-1" /> {t("community.pinned")}</Badge>}
          {post.is_announcement && <Badge className="text-xs"><Megaphone className="h-3 w-3 mr-1" /> {t("community.announcement")}</Badge>}
          <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
        {post.embed_url && <VideoEmbed url={post.embed_url} />}
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => toggleReaction.mutate({ postId: post.id })}>
            <Heart className="h-3.5 w-3.5" /> {post.likes_count || 0}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count || 0}
          </Button>
        </div>
        {showComments && (
          <div className="space-y-3 pt-2 border-t border-border/30">
            {comments.map((c) => (
              <div key={c.id} className="text-sm pl-3 border-l-2 border-border/50">
                <p>{c.content}</p>
                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea placeholder={t("community.writeComment")} value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={1} className="min-h-[36px] text-sm" />
              <Button size="icon" className="shrink-0 h-9 w-9" onClick={handleComment} disabled={createComment.isPending || !commentText.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== Lesson Viewer =====
const LessonViewer = ({ lesson, isCompleted, communityId }: { lesson: CommunityLesson; isCompleted: boolean; communityId: string }) => {
  const { t } = useTranslation("client");
  const markComplete = useMarkLessonComplete();

  return (
    <Card className="rounded-2xl border-border/50">
      <CardContent className="p-5 space-y-4">
        {(lesson as any).preview_image_url && !lesson.video_url && (
          <img src={(lesson as any).preview_image_url} alt={lesson.title} className="w-full h-48 object-cover rounded-xl" />
        )}
        {lesson.video_url && <VideoEmbed url={lesson.video_url} restricted />}
        <div>
          <h3 className="font-semibold text-lg">{lesson.title}</h3>
          {lesson.description && <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>}
        </div>
        {lesson.content && <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/20 rounded-lg p-4">{lesson.content}</div>}
        <Button
          variant={isCompleted ? "secondary" : "default"}
          className="w-full"
          onClick={() => markComplete.mutate({ lessonId: lesson.id, communityId, completed: !isCompleted })}
          disabled={markComplete.isPending}
        >
          {isCompleted ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Circle className="h-4 w-4 mr-2" />}
          {isCompleted ? t("community.completed") : t("community.markComplete")}
        </Button>
      </CardContent>
    </Card>
  );
};

// ===== Resources Tab =====
const ResourcesTab = ({ communityId }: { communityId: string }) => {
  const { t } = useTranslation("client");
  const { data: linkedPackages = [], isLoading: packagesLoading } = useCommunityLinkedPackages(communityId);
  const { data: linkedProducts = [], isLoading: productsLoading } = useCommunityLinkedProducts(communityId);

  const isLoading = packagesLoading || productsLoading;
  const hasContent = linkedPackages.length > 0 || linkedProducts.length > 0;

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  if (!hasContent) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="py-12 text-center">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("community.noResources")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {linkedPackages.length > 0 && (
        <div className="space-y-3">
          {linkedPackages.map((lp: any) => (
            <Card key={lp.id} className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{lp.coach_packages?.name || "Package"}</p>
                    {lp.coach_packages?.description && <p className="text-xs text-muted-foreground line-clamp-1">{lp.coach_packages.description}</p>}
                  </div>
                </div>
                {lp.is_free_for_members && (
                  <Badge variant="secondary" className="text-xs">{t("community.freeForMembers")}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {linkedProducts.length > 0 && (
        <div className="space-y-3">
          {linkedProducts.map((lp: any) => (
            <Card key={lp.id} className="rounded-2xl border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lp.digital_products?.cover_image_url ? (
                    <img src={lp.digital_products.cover_image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{lp.digital_products?.title || "Product"}</p>
                    {lp.digital_products?.description && <p className="text-xs text-muted-foreground line-clamp-1">{lp.digital_products.description}</p>}
                  </div>
                </div>
                {lp.is_free_for_members && (
                  <Badge variant="secondary" className="text-xs">{t("community.freeForMembers")}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Main Page =====
const ClientCommunityDetail = () => {
  const { t } = useTranslation("client");
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useCommunityPosts(communityId);
  const { data: members = [] } = useCommunityMembers(communityId);
  const { data: modules = [], isLoading: modulesLoading } = useCommunityModules(communityId);
  const { data: allLessons = [] } = useAllCommunityLessons(communityId);
  const { data: progress = [] } = useLessonProgress(communityId);
  const createPost = useCreatePost();
  const [newPost, setNewPost] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<CommunityLesson | null>(null);

  const completedLessonIds = new Set(progress.filter((p) => p.completed_at).map((p) => p.lesson_id));
  const totalLessons = allLessons.filter((l) => l.is_published).length;
  const completedCount = allLessons.filter((l) => l.is_published && completedLessonIds.has(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel(`community-posts-client-${communityId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: `community_id=eq.${communityId}` }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [communityId]);

  const handlePost = async () => {
    if (!newPost.trim() || !communityId) return;
    try {
      await createPost.mutateAsync({
        community_id: communityId,
        content: newPost.trim(),
        embed_url: embedUrl.trim() || undefined,
        post_type: embedUrl.trim() ? "video" : "text",
      });
      setNewPost("");
      setEmbedUrl("");
      setShowEmbedInput(false);
      toast.success(t("community.postCreated"));
    } catch { toast.error(t("community.postFailed")); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/client/community")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">{t("community.communityFeed")}</h1>
            <p className="text-sm text-muted-foreground">{members.length} {t("community.members")}</p>
          </div>
        </div>

        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">{t("community.feed")}</TabsTrigger>
            <TabsTrigger value="classroom"><BookOpen className="h-3.5 w-3.5 mr-1.5" />{t("community.classroom")}</TabsTrigger>
            <TabsTrigger value="resources"><Package className="h-3.5 w-3.5 mr-1.5" />{t("community.resources")}</TabsTrigger>
          </TabsList>

          {/* Feed */}
          <TabsContent value="feed" className="space-y-4 mt-4">
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 space-y-3">
                <Textarea placeholder={t("community.writePost")} value={newPost} onChange={(e) => setNewPost(e.target.value)} rows={3} />
                {showEmbedInput && (
                  <div className="space-y-2">
                    <Input placeholder="https://youtube.com/watch?v=..." value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} />
                    {embedUrl && <VideoEmbed url={embedUrl} />}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEmbedInput(!showEmbedInput)}>
                    <Video className="h-3.5 w-3.5 mr-1.5" /> {t("community.addVideo")}
                  </Button>
                  <Button onClick={handlePost} disabled={createPost.isPending || !newPost.trim()}>
                    {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" /> {t("community.post")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {isLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : posts.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="py-12 text-center"><MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">{t("community.noPosts")}</p></CardContent></Card>
            ) : (
              <div className="space-y-4">{posts.map((post) => <ClientPostCard key={post.id} post={post} />)}</div>
            )}
          </TabsContent>

          {/* Classroom */}
          <TabsContent value="classroom" className="space-y-4 mt-4">
            {/* Progress */}
            {totalLessons > 0 && (
              <Card className="rounded-2xl border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t("community.yourProgress")}</span>
                    <span className="text-sm text-muted-foreground">{completedCount}/{totalLessons} ({progressPercent}%)</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </CardContent>
              </Card>
            )}

            {selectedLesson ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> {t("community.backToModules")}
                </Button>
                <LessonViewer lesson={selectedLesson} isCompleted={completedLessonIds.has(selectedLesson.id)} communityId={communityId!} />
              </div>
            ) : modulesLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : modules.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="py-12 text-center"><BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">{t("community.noClassroom")}</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {modules.filter((m) => m.is_published).map((mod) => {
                  const moduleLessons = allLessons.filter((l) => l.module_id === mod.id && l.is_published);
                  const moduleCompleted = moduleLessons.filter((l) => completedLessonIds.has(l.id)).length;
                  return (
                    <Collapsible key={mod.id} defaultOpen>
                      <Card className="rounded-2xl border-border/50">
                        <CollapsibleTrigger asChild>
                          <CardContent className="p-4 cursor-pointer hover:bg-muted/20 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-sm">{mod.title}</h3>
                                {mod.description && <p className="text-xs text-muted-foreground">{mod.description}</p>}
                              </div>
                              <Badge variant="outline" className="text-xs">{moduleCompleted}/{moduleLessons.length}</Badge>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-1.5 border-t border-border/30 pt-3">
                            {moduleLessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
                                onClick={() => setSelectedLesson(lesson)}
                              >
                                {completedLessonIds.has(lesson.id)
                                  ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                  : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                }
                                {(lesson as any).preview_image_url && (
                                  <img src={(lesson as any).preview_image_url} alt="" className="w-12 h-8 rounded object-cover shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                                  <div className="flex items-center gap-2">
                                    {lesson.video_url && <Video className="h-3 w-3 text-muted-foreground" />}
                                    {lesson.duration_minutes && <span className="text-[10px] text-muted-foreground">{lesson.duration_minutes} min</span>}
                                    {lesson.is_free_preview && <Badge variant="outline" className="text-[10px]">{t("community.freePreview")}</Badge>}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="mt-4">
            <ResourcesTab communityId={communityId!} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientCommunityDetail;
