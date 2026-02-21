import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pin, Megaphone, Send, MessageCircle, Heart, Trash2, BarChart3, Loader2, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCommunityPosts,
  useCreatePost,
  useTogglePin,
  useDeletePost,
  useCommunityComments,
  useCreateComment,
  useToggleReaction,
  useCommunityMembers,
  type CommunityPost,
} from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ===== Post Card Component =====
const PostCard = ({
  post,
  communityId,
  isAdmin,
}: {
  post: CommunityPost;
  communityId: string;
  isAdmin: boolean;
}) => {
  const { t } = useTranslation("coach");
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments = [], isLoading: commentsLoading } = useCommunityComments(
    showComments ? post.id : undefined
  );
  const createComment = useCreateComment();
  const toggleReaction = useToggleReaction();
  const togglePin = useTogglePin();
  const deletePost = useDeletePost();

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ post_id: post.id, content: commentText.trim() });
      setCommentText("");
    } catch {
      toast.error(t("community.commentFailed"));
    }
  };

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50">
      <CardContent className="p-5 space-y-3">
        {/* Post header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {post.is_pinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="h-3 w-3 mr-1" /> {t("community.pinned")}
              </Badge>
            )}
            {post.is_announcement && (
              <Badge className="text-xs">
                <Megaphone className="h-3 w-3 mr-1" /> {t("community.announcement")}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          {(isAdmin || post.author_id === user?.id) && (
            <div className="flex gap-1">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    togglePin.mutate({ postId: post.id, isPinned: post.is_pinned, communityId })
                  }
                >
                  <Pin className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deletePost.mutate({ postId: post.id, communityId })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

        {/* Poll */}
        {post.post_type === "poll" && post.poll_data && (
          <PollDisplay postId={post.id} pollData={post.poll_data} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => toggleReaction.mutate({ postId: post.id })}
          >
            <Heart className="h-3.5 w-3.5" />
            {post.likes_count || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comments_count || 0}
          </Button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3 pt-2 border-t border-border/30">
            {commentsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="text-sm pl-3 border-l-2 border-border/50">
                  <p className="text-foreground">{comment.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder={t("community.writeComment")}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                className="min-h-[36px] text-sm"
              />
              <Button
                size="icon"
                className="shrink-0 h-9 w-9"
                onClick={handleComment}
                disabled={createComment.isPending || !commentText.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== Simple Poll Display =====
const PollDisplay = ({ postId, pollData }: { postId: string; pollData: any }) => {
  const { t } = useTranslation("coach");
  const options = pollData?.options || [];

  return (
    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        {t("community.poll")}
      </div>
      {options.map((opt: string, idx: number) => (
        <div key={idx} className="text-sm p-2 rounded bg-background border border-border/50">
          {opt}
        </div>
      ))}
    </div>
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
  const createPost = useCreatePost();

  const [newPostContent, setNewPostContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  // Check admin
  const currentMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === "admin" || currentMember?.role === "moderator";

  // Realtime subscription
  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel(`community-posts-${communityId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: `community_id=eq.${communityId}` }, () => {
        // React Query will refetch
      })
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
      });
      setNewPostContent("");
      setIsAnnouncement(false);
      toast.success(t("community.postCreated"));
    } catch {
      toast.error(t("community.postFailed"));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/coach/community")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">{t("community.communityFeed")}</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} {t("community.members")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">{t("community.feed")}</TabsTrigger>
            <TabsTrigger value="members">{t("community.membersTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 mt-4">
            {/* Create Post */}
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder={t("community.writePost")}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="announcement"
                        checked={isAnnouncement}
                        onCheckedChange={setIsAnnouncement}
                      />
                      <Label htmlFor="announcement" className="text-xs">
                        {t("community.markAnnouncement")}
                      </Label>
                    </div>
                  )}
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPost.isPending || !newPostContent.trim()}
                    className="ml-auto"
                  >
                    {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" />
                    {t("community.post")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : posts.length === 0 ? (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">{t("community.noPosts")}</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  communityId={communityId!}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
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
