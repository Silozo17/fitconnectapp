import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  reading_time_minutes: number;
  published_at: string;
  author: string;
}

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const categoryColors: Record<string, string> = {
    "Workout Apps": "bg-primary/20 text-primary",
    "Personal Training": "bg-accent/20 text-accent",
    "Nutrition": "bg-emerald-500/20 text-emerald-400",
    "Combat Sports": "bg-orange-500/20 text-orange-400",
    "Fitness Technology": "bg-cyan-500/20 text-cyan-400",
    "Weight Loss": "bg-pink-500/20 text-pink-400",
  };

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className={`group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
          style={{
            backgroundImage: post.featured_image ? `url(${post.featured_image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={categoryColors[post.category] || "bg-primary/20 text-primary"}>
            {post.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h3 className={`font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 ${
          featured ? "text-xl sm:text-2xl" : "text-lg"
        }`}>
          {post.title}
        </h3>
        
        <p className={`text-muted-foreground line-clamp-2 mb-4 ${featured ? "text-base" : "text-sm"}`}>
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(post.published_at), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time_minutes} min read
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
