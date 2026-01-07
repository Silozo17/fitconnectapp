import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, FileText, Eye, FilePenLine, MoreHorizontal, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useBlogPosts, useBlogStats, useBlogCategories, useDeleteBlogPost, useUpdateBlogPost, BlogPost } from "@/hooks/useBlogPosts";
import { BlogPostModal } from "@/components/admin/BlogPostModal";
import { format } from "date-fns";
import { DashboardSectionHeader, MetricCard, ContentSection, StatsGrid } from "@/components/shared";

const AdminBlog = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const { data: posts, isLoading } = useBlogPosts({ search, category: categoryFilter, status: statusFilter });
  const { data: stats } = useBlogStats();
  const { data: categories } = useBlogCategories();
  const deletePost = useDeleteBlogPost();
  const updatePost = useUpdateBlogPost();

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletePostId) {
      await deletePost.mutateAsync(deletePostId);
      setDeletePostId(null);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await updatePost.mutateAsync({
      id: post.id,
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : null,
    });
  };

  const filteredByStatus = (status: "all" | "published" | "draft") => {
    if (!posts) return [];
    if (status === "all") return posts;
    if (status === "published") return posts.filter(p => p.is_published);
    return posts.filter(p => !p.is_published);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Blog Management | Admin Dashboard</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <DashboardSectionHeader
          title="Blog Management"
          description="Create and manage blog posts"
          action={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          }
          className="mb-0"
        />

        {/* Stats Cards - 2 columns */}
        <StatsGrid columns={2}>
          <MetricCard
            icon={FileText}
            label="Total Posts"
            value={stats?.total || 0}
            color="blue"
            size="sm"
          />
          <MetricCard
            icon={Eye}
            label="Published"
            value={stats?.published || 0}
            color="green"
            size="sm"
          />
          <MetricCard
            icon={FilePenLine}
            label="Drafts"
            value={stats?.drafts || 0}
            color="yellow"
            size="sm"
          />
        </StatsGrid>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts Table with Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All ({posts?.length || 0})</TabsTrigger>
            <TabsTrigger value="published">Published ({filteredByStatus("published").length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({filteredByStatus("draft").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            <ContentSection colorTheme="blue" withAccent padding="none">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No posts found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {search || categoryFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by creating your first blog post"}
                  </p>
                  {!search && categoryFilter === "all" && (
                    <Button onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[300px]">Title</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Author</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts?.map(post => (
                        <TableRow
                          key={post.id}
                          className="cursor-pointer"
                          onClick={() => handleEdit(post)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">/blog/{post.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={post.is_published ? "default" : "outline"}>
                              {post.is_published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                            {post.author}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                            {post.created_at && format(new Date(post.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(post)}>
                                  <FilePenLine className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePublish(post)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {post.is_published ? "Unpublish" : "Publish"}
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View on Site
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletePostId(post.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ContentSection>
          </TabsContent>
        </Tabs>
      </div>

      <BlogPostModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        post={selectedPost}
      />

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBlog;