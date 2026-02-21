import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pin, Megaphone, Send, MessageCircle, Heart, Trash2, BarChart3, Loader2, Users, Video, Plus, GripVertical, BookOpen, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import {
  useCommunityPosts, useCreatePost, useTogglePin, useDeletePost,
  useCommunityComments, useCreateComment, useToggleReaction,
  useCommunityMembers, type CommunityPost,
} from "@/hooks/useCommunity";
import {
  useCommunityModules, useCommunityLessons, useCreateModule,
  useUpdateModule, useDeleteModule, useCreateLesson, useUpdateLesson, useDeleteLesson,
  type CommunityModule,
} from "@/hooks/useCommunityClassroom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ===== Post Card Component =====
const PostCard = ({ post, communityId, isAdmin }: { post: CommunityPost; communityId: string; isAdmin: boolean }) => {
  const { t } = useTranslation("coach");
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments = [], isLoading: commentsLoading } = useCommunityComments(showComments ? post.id : undefined);
  const createComment = useCreateComment();
  const toggleReaction = useToggleReaction();
  const togglePin = useTogglePin();
  const deletePost = useDeletePost();

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
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {post.is_pinned && <Badge variant="secondary" className="text-xs"><Pin className="h-3 w-3 mr-1" /> {t("community.pinned")}</Badge>}
            {post.is_announcement && <Badge className="text-xs"><Megaphone className="h-3 w-3 mr-1" /> {t("community.announcement")}</Badge>}
            <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          {(isAdmin || post.author_id === user?.id) && (
            <div className="flex gap-1">
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePin.mutate({ postId: post.id, isPinned: post.is_pinned, communityId })}>
                  <Pin className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePost.mutate({ postId: post.id, communityId })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

        {/* Video Embed */}
        {post.embed_url && <VideoEmbed url={post.embed_url} />}

        {/* Poll */}
        {post.post_type === "poll" && post.poll_data && <PollDisplay postId={post.id} pollData={post.poll_data} />}

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
            {commentsLoading ? <Skeleton className="h-10 w-full" /> : comments.map((c) => (
              <div key={c.id} className="text-sm pl-3 border-l-2 border-border/50">
                <p className="text-foreground">{c.content}</p>
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

const PollDisplay = ({ postId, pollData }: { postId: string; pollData: any }) => {
  const { t } = useTranslation("coach");
  const options = pollData?.options || [];
  return (
    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> {t("community.poll")}</div>
      {options.map((opt: string, idx: number) => (<div key={idx} className="text-sm p-2 rounded bg-background border border-border/50">{opt}</div>))}
    </div>
  );
};

// ===== Classroom Module Card =====
const ModuleCard = ({ module, communityId }: { module: CommunityModule; communityId: string }) => {
  const { t } = useTranslation("coach");
  const [isOpen, setIsOpen] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const { data: lessons = [], isLoading } = useCommunityLessons(isOpen ? module.id : undefined);
  const createLesson = useCreateLesson();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const deleteLesson = useDeleteLesson();

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    try {
      await createLesson.mutateAsync({
        module_id: module.id,
        community_id: communityId,
        title: lessonTitle.trim(),
        video_url: lessonVideoUrl.trim() || undefined,
        content: lessonContent.trim() || undefined,
        is_free_preview: lessonFreePreview,
        display_order: lessons.length,
      });
      setLessonTitle("");
      setLessonVideoUrl("");
      setLessonContent("");
      setLessonFreePreview(false);
      setShowAddLesson(false);
      toast.success(t("community.lessonCreated"));
    } catch { toast.error(t("community.lessonFailed")); }
  };

  return (
    <Card className="rounded-2xl border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <h3 className="font-semibold text-sm">{module.title}</h3>
                  {module.description && <p className="text-xs text-muted-foreground">{module.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); updateModule.mutate({ id: module.id, communityId, is_published: !module.is_published }); }}
                >
                  {module.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                  onClick={(e) => { e.stopPropagation(); deleteModule.mutate({ id: module.id, communityId }); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
            {isLoading ? <Skeleton className="h-10 w-full" /> : lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  {lesson.video_url ? <Video className="h-4 w-4 text-primary shrink-0" /> : <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2">
                      {lesson.is_free_preview && <Badge variant="outline" className="text-[10px]">{t("community.freePreview")}</Badge>}
                      {lesson.duration_minutes && <span className="text-[10px] text-muted-foreground">{lesson.duration_minutes} min</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteLesson.mutate({ id: lesson.id, moduleId: module.id, communityId })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowAddLesson(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {t("community.addLesson")}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("community.addLesson")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("community.lessonTitle")}</Label>
              <Input placeholder={t("community.lessonTitlePlaceholder")} value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("community.videoUrl")}</Label>
              <Input placeholder="https://youtube.com/watch?v=..." value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)} />
              {lessonVideoUrl && <VideoEmbed url={lessonVideoUrl} className="mt-2" />}
            </div>
            <div className="space-y-2">
              <Label>{t("community.lessonContent")}</Label>
              <Textarea placeholder={t("community.lessonContentPlaceholder")} value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} rows={4} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("community.freePreview")}</Label>
                <p className="text-xs text-muted-foreground">{t("community.freePreviewDesc")}</p>
              </div>
              <Switch checked={lessonFreePreview} onCheckedChange={setLessonFreePreview} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLesson(false)}>{t("community.cancel")}</Button>
            <Button onClick={handleAddLesson} disabled={createLesson.isPending || !lessonTitle.trim()}>
              {createLesson.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("community.addLesson")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ===== Main Page =====
const CoachCommunityDetail = () => {
  const { t } = useTranslation("coach");
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts(communityId);
  const { data: members = [] } = useCommunityMembers(communityId);
  const { data: modules = [], isLoading: modulesLoading } = useCommunityModules(communityId);
  const createPost = useCreatePost();
  const createModule = useCreateModule();

  const [newPostContent, setNewPostContent] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === "admin" || currentMember?.role === "moderator";

  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel(`community-posts-${communityId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: `community_id=eq.${communityId}` }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [communityId]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !communityId) return;
    try {
      await createPost.mutateAsync({
        community_id: communityId,
        content: newPostContent.trim(),
        is_announcement: isAnnouncement,
        embed_url: embedUrl.trim() || undefined,
        post_type: embedUrl.trim() ? "video" : "text",
      });
      setNewPostContent("");
      setEmbedUrl("");
      setShowEmbedInput(false);
      setIsAnnouncement(false);
      toast.success(t("community.postCreated"));
    } catch { toast.error(t("community.postFailed")); }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !communityId) return;
    try {
      await createModule.mutateAsync({
        community_id: communityId,
        title: newModuleTitle.trim(),
        display_order: modules.length,
      });
      setNewModuleTitle("");
      setShowAddModule(false);
      toast.success(t("community.moduleCreated"));
    } catch { toast.error(t("community.moduleFailed")); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/coach/community")}>
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
            <TabsTrigger value="members">{t("community.membersTab")}</TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4 mt-4">
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 space-y-3">
                <Textarea placeholder={t("community.writePost")} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} rows={3} />
                {showEmbedInput && (
                  <div className="space-y-2">
                    <Input placeholder="https://youtube.com/watch?v=..." value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} />
                    {embedUrl && <VideoEmbed url={embedUrl} />}
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEmbedInput(!showEmbedInput)}>
                      <Video className="h-3.5 w-3.5 mr-1.5" /> {t("community.addVideo")}
                    </Button>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Switch id="announcement" checked={isAnnouncement} onCheckedChange={setIsAnnouncement} />
                        <Label htmlFor="announcement" className="text-xs">{t("community.markAnnouncement")}</Label>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreatePost} disabled={createPost.isPending || !newPostContent.trim()} className="ml-auto">
                    {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" /> {t("community.post")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {postsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : posts.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="py-12 text-center"><MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">{t("community.noPosts")}</p></CardContent></Card>
            ) : posts.map((post) => <PostCard key={post.id} post={post} communityId={communityId!} isAdmin={isAdmin} />)}
          </TabsContent>

          {/* Classroom Tab */}
          <TabsContent value="classroom" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{t("community.classroom")}</h2>
                <p className="text-sm text-muted-foreground">{t("community.classroomDesc")}</p>
              </div>
              <Button onClick={() => setShowAddModule(true)} size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> {t("community.addModule")}
              </Button>
            </div>

            {modulesLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : modules.length === 0 ? (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">{t("community.noModules")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {modules.map((mod) => <ModuleCard key={mod.id} module={mod} communityId={communityId!} />)}
              </div>
            )}

            {/* Add Module Dialog */}
            <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{t("community.addModule")}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>{t("community.moduleTitle")}</Label>
                    <Input placeholder={t("community.moduleTitlePlaceholder")} value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModule(false)}>{t("community.cancel")}</Button>
                  <Button onClick={handleAddModule} disabled={createModule.isPending || !newModuleTitle.trim()}>
                    {createModule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("community.addModule")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-4">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Users className="h-4 w-4 text-muted-foreground" /></div>
                        <span className="text-sm font-medium">{member.user_id.slice(0, 8)}...</span>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CoachCommunityDetail;
