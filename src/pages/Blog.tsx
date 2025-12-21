import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import { BlogCard } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Filter } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const CATEGORIES = [
  "All",
  "Workout Apps",
  "Personal Training",
  "Nutrition",
  "Combat Sports",
  "Fitness Technology",
  "Weight Loss",
];

export default function Blog() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts", selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "FitConnect Fitness Blog",
    "description": "Expert fitness advice, workout tips, nutrition guides, and coaching insights from FitConnect.",
    "url": "https://getfitconnect.co.uk/blog",
    "publisher": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk",
    },
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <SEOHead
        title="Fitness Blog - Expert Workout Tips, Nutrition Guides & Coaching Advice"
        description="Discover expert fitness advice, workout tips, nutrition guides, and personal training insights. Learn from top coaches and transform your health journey with FitConnect."
        canonicalPath="/blog"
        keywords={["fitness blog", "workout tips", "nutrition advice", "personal training", "fitness guides", "exercise tips"]}
        schema={[blogSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          {/* Hero */}
          <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-gradient-to-b from-card/50 to-background border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Fitness Insights</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Fitness Blog
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Expert advice, workout tips, and industry insights to help you achieve your fitness goals.
                </p>

                {/* Search */}
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card border-border"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Category Filters */}
          <section className="py-6 border-b border-border bg-card/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Posts Grid */}
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      featured={index === 0 && selectedCategory === "All" && !searchQuery}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('empty.noPosts')}</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? t('empty.tryAdjusting')
                      : t('empty.nothingHere')}
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
