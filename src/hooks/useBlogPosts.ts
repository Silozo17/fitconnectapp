import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  reading_time_minutes: number | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BlogPostFilters {
  search?: string;
  category?: string;
  status?: "all" | "published" | "draft";
}

export const useBlogPosts = (filters?: BlogPostFilters) => {
  return useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.status === "published") {
        query = query.eq("is_published", true);
      } else if (filters?.status === "draft") {
        query = query.eq("is_published", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPost = (id: string | null) => {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (post: Omit<BlogPost, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({
        title: "Post created",
        description: "Blog post has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...post }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update({ ...post, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({
        title: "Post updated",
        description: "Blog post has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({
        title: "Post deleted",
        description: "Blog post has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("category")
        .order("category");

      if (error) throw error;
      
      const categories = [...new Set(data.map(p => p.category))];
      return categories;
    },
  });
};

export const useBlogStats = () => {
  return useQuery({
    queryKey: ["blog-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("is_published");

      if (error) throw error;

      const total = data.length;
      const published = data.filter(p => p.is_published).length;
      const drafts = total - published;

      return { total, published, drafts };
    },
  });
};
