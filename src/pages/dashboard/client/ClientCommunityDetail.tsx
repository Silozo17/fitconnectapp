import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Heart, Pin, Megaphone, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
  useCommunityPosts,
  useCreatePost,
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

// Post card for client view
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
    } catch {
      toast.error(t("community.commentFailed"));
    }
  };

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50">
      <CardContent className="p-5 space-y-3">
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

        <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

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

        {showComments && (
          <div className="space-y-3 pt-2 border-t border-border/30">
            {comments.map((c) => (
              <div key={c.id} className="text-sm pl-3 border-l-2 border-border/50">
                <p>{c.content}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
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

const ClientCommunityDetail = () => {
  const { t } = useTranslation("client");
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useCommunityPosts(communityId);
  const { data: members = [] } = useCommunityMembers(communityId);
  const createPost = useCreatePost();
  const [newPost, setNewPost] = useState("");

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
      await createPost.mutateAsync({ community_id: communityId, content: newPost.trim() });
      setNewPost("");
      toast.success(t("community.postCreated"));
    } catch {
      toast.error(t("community.postFailed"));
    }
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
            <p className="text-sm text-muted-foreground">
              {members.length} {t("community.members")}
            </p>
          </div>
        </div>

        {/* Create Post */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder={t("community.writePost")}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={createPost.isPending || !newPost.trim()}>
                {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                {t("community.post")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
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
          <div className="space-y-4">
            {posts.map((post) => <ClientPostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientCommunityDetail;
