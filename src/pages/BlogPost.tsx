import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import { BlogCard } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin, Facebook, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", post?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, featured_image, category, reading_time_minutes, published_at, author")
        .eq("is_published", true)
        .eq("category", post?.category)
        .neq("id", post?.id)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!post?.category,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "image": post.featured_image || "https://getfitconnect.co.uk/og-image.png",
    "author": {
      "@type": "Organization",
      "name": post.author || "FitConnect",
      "url": "https://getfitconnect.co.uk",
    },
    "publisher": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://getfitconnect.co.uk/pwa-512x512.png",
      },
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://getfitconnect.co.uk/blog/${post.slug}`,
    },
    "keywords": post.keywords?.join(", "),
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const shareUrl = `https://getfitconnect.co.uk/blog/${post.slug}`;
  const shareText = post.title;

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featured_image || undefined}
        keywords={post.keywords || []}
        schema={[articleSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <article className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="max-w-4xl mx-auto mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="max-w-4xl mx-auto mb-8">
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <Badge className="bg-primary/20 text-primary mb-4">{post.category}</Badge>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.reading_time_minutes} min read
                </span>
                <span>By {post.author}</span>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share:
                </span>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleShare("twitter")}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleShare("linkedin")}>
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleShare("facebook")}>
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="max-w-4xl mx-auto mb-10">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto rounded-2xl object-cover aspect-video"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="max-w-3xl mx-auto prose prose-invert prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* CTA */}
            <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl text-center">
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                Ready to Start Your Fitness Journey?
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect with expert coaches who can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/coaches">Find a Coach</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/for-coaches">Become a Coach</Link>
                </Button>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section className="container mx-auto px-4 mt-16 pt-16 border-t border-border">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
