import { 
  BookOpen, 
  User, 
  Dumbbell, 
  Shield,
  Home,
  UserPlus,
  Search,
  Calendar,
  ClipboardList,
  TrendingUp,
  Trophy,
  Settings,
  CreditCard,
  Users,
  MessageSquare,
  FileCheck,
  BarChart3,
  Flame,
  ShoppingCart,
  Target,
  Calculator,
  Library,
  Link2,
  Kanban,
  Package,
  Rocket,
  Utensils,
  Sparkles,
  Star,
  LayoutDashboard,
  FileText,
  Plug,
  Brain,
  AlertTriangle,
  Activity,
  LineChart,
  UsersRound
} from "lucide-react";

export interface DocSearchItem {
  title: string;
  href: string;
  category: string;
  keywords: string[];
  icon: React.ElementType;
}

export const docsSearchIndex: DocSearchItem[] = [
  // Getting Started
  { 
    title: "Getting Started", 
    href: "/docs/getting-started", 
    category: "Getting Started",
    keywords: ["start", "begin", "intro", "introduction", "setup", "first"],
    icon: BookOpen 
  },

  // For Clients
  { 
    title: "Client Overview", 
    href: "/docs/client", 
    category: "For Clients",
    keywords: ["client", "user", "overview", "home"],
    icon: Home 
  },
  { 
    title: "Creating Your Profile", 
    href: "/docs/client/profile", 
    category: "For Clients",
    keywords: ["profile", "account", "setup", "details", "information", "bio"],
    icon: UserPlus 
  },
  { 
    title: "Finding Coaches", 
    href: "/docs/client/coaches", 
    category: "For Clients",
    keywords: ["coach", "trainer", "find", "search", "browse", "discover"],
    icon: Search 
  },
  { 
    title: "Booking Sessions", 
    href: "/docs/client/sessions", 
    category: "For Clients",
    keywords: ["book", "session", "appointment", "schedule", "calendar"],
    icon: Calendar 
  },
  { 
    title: "Messages", 
    href: "/docs/client/messages", 
    category: "For Clients",
    keywords: ["message", "chat", "communicate", "conversation", "inbox"],
    icon: MessageSquare 
  },
  { 
    title: "Workout & Nutrition Plans", 
    href: "/docs/client/plans", 
    category: "For Clients",
    keywords: ["workout", "nutrition", "plan", "diet", "exercise", "training"],
    icon: ClipboardList 
  },
  { 
    title: "Food Diary", 
    href: "/docs/client/food-diary", 
    category: "For Clients",
    keywords: ["food", "diary", "log", "track", "meals", "calories", "macros"],
    icon: Utensils 
  },
  { 
    title: "Training Logs", 
    href: "/docs/client/training-logs", 
    category: "For Clients",
    keywords: ["training", "log", "workout", "exercise", "record", "history"],
    icon: Dumbbell 
  },
  { 
    title: "Tracking Progress", 
    href: "/docs/client/progress", 
    category: "For Clients",
    keywords: ["progress", "track", "weight", "measurements", "photos", "results"],
    icon: TrendingUp 
  },
  { 
    title: "Habits & Streaks", 
    href: "/docs/client/habits", 
    category: "For Clients",
    keywords: ["habit", "streak", "daily", "routine", "consistency"],
    icon: Flame 
  },
  { 
    title: "Readiness Score", 
    href: "/docs/client/readiness", 
    category: "For Clients",
    keywords: ["readiness", "score", "recovery", "sleep", "energy"],
    icon: Target 
  },
  { 
    title: "Wearable Trends", 
    href: "/docs/client/trends", 
    category: "For Clients",
    keywords: ["trends", "wearable", "data", "analytics", "insights"],
    icon: TrendingUp 
  },
  { 
    title: "Micro Wins", 
    href: "/docs/client/micro-wins", 
    category: "For Clients",
    keywords: ["micro", "wins", "achievements", "small", "progress"],
    icon: Trophy 
  },
  { 
    title: "Goal Suggestions", 
    href: "/docs/client/goal-suggestions", 
    category: "For Clients",
    keywords: ["goal", "suggestions", "recommendations", "targets"],
    icon: Sparkles 
  },
  { 
    title: "Shopping Lists", 
    href: "/docs/client/grocery", 
    category: "For Clients",
    keywords: ["shopping", "grocery", "list", "food", "buy", "supermarket"],
    icon: ShoppingCart 
  },
  { 
    title: "Challenges", 
    href: "/docs/client/challenges", 
    category: "For Clients",
    keywords: ["challenge", "competition", "event", "participate", "join"],
    icon: Target 
  },
  { 
    title: "Achievements", 
    href: "/docs/client/achievements", 
    category: "For Clients",
    keywords: ["achievement", "badge", "reward", "unlock", "earn"],
    icon: Trophy 
  },
  { 
    title: "Leaderboards", 
    href: "/docs/client/leaderboards", 
    category: "For Clients",
    keywords: ["leaderboard", "rank", "ranking", "competition", "top"],
    icon: BarChart3 
  },
  { 
    title: "Fitness Tools", 
    href: "/docs/client/tools", 
    category: "For Clients",
    keywords: ["tools", "calculator", "bmi", "tdee", "calories"],
    icon: Calculator 
  },
  { 
    title: "Marketplace", 
    href: "/docs/client/marketplace", 
    category: "For Clients",
    keywords: ["marketplace", "products", "buy", "shop", "digital"],
    icon: Package 
  },
  { 
    title: "Digital Library", 
    href: "/docs/client/library", 
    category: "For Clients",
    keywords: ["library", "digital", "products", "ebooks", "courses"],
    icon: Library 
  },
  { 
    title: "Favourites", 
    href: "/docs/client/favourites", 
    category: "For Clients",
    keywords: ["favourite", "favorite", "save", "bookmark", "like"],
    icon: Star 
  },
  { 
    title: "Receipts", 
    href: "/docs/client/receipts", 
    category: "For Clients",
    keywords: ["receipt", "invoice", "payment", "history", "transaction"],
    icon: CreditCard 
  },
  { 
    title: "Connections", 
    href: "/docs/client/connections", 
    category: "For Clients",
    keywords: ["connection", "link", "integrate", "connect"],
    icon: Link2 
  },
  { 
    title: "Data Sharing", 
    href: "/docs/client/data-sharing", 
    category: "For Clients",
    keywords: ["data", "sharing", "privacy", "permissions", "access"],
    icon: Shield 
  },
  { 
    title: "Account Security", 
    href: "/docs/client/security", 
    category: "For Clients",
    keywords: ["security", "password", "2fa", "authentication", "protect"],
    icon: Shield 
  },
  { 
    title: "Wearables", 
    href: "/docs/client/wearables", 
    category: "For Clients",
    keywords: ["wearable", "device", "watch", "fitbit", "garmin", "apple"],
    icon: Settings 
  },
  { 
    title: "Settings", 
    href: "/docs/client/settings", 
    category: "For Clients",
    keywords: ["settings", "preferences", "configure", "options"],
    icon: Settings 
  },

  // For Coaches
  { 
    title: "Coach Overview", 
    href: "/docs/coach", 
    category: "For Coaches",
    keywords: ["coach", "trainer", "overview", "home"],
    icon: Home 
  },
  { 
    title: "Getting Started as Coach", 
    href: "/docs/coach/onboarding", 
    category: "For Coaches",
    keywords: ["onboarding", "start", "begin", "setup", "new"],
    icon: BookOpen 
  },
  { 
    title: "Profile Setup", 
    href: "/docs/coach/profile", 
    category: "For Coaches",
    keywords: ["profile", "setup", "bio", "photo", "about"],
    icon: UserPlus 
  },
  { 
    title: "Managing Clients", 
    href: "/docs/coach/clients", 
    category: "For Coaches",
    keywords: ["client", "manage", "roster", "users"],
    icon: Users 
  },
  { 
    title: "Client Comparison", 
    href: "/docs/coach/comparison", 
    category: "For Coaches",
    keywords: ["compare", "comparison", "analytics", "metrics"],
    icon: BarChart3 
  },
  { 
    title: "Client Wearables", 
    href: "/docs/coach/wearables", 
    category: "For Coaches",
    keywords: ["wearable", "device", "data", "sync", "health"],
    icon: Settings 
  },
  { 
    title: "Client Risk Detection", 
    href: "/docs/coach/client-risk", 
    category: "For Coaches",
    keywords: ["risk", "detection", "churn", "at-risk", "alert"],
    icon: AlertTriangle 
  },
  { 
    title: "Plateau Detection", 
    href: "/docs/coach/plateau-detection", 
    category: "For Coaches",
    keywords: ["plateau", "stuck", "progress", "stall"],
    icon: Activity 
  },
  { 
    title: "Sales Pipeline", 
    href: "/docs/coach/pipeline", 
    category: "For Coaches",
    keywords: ["pipeline", "sales", "leads", "prospects", "crm"],
    icon: Kanban 
  },
  { 
    title: "Messaging & Templates", 
    href: "/docs/coach/messaging", 
    category: "For Coaches",
    keywords: ["message", "template", "communication", "chat"],
    icon: MessageSquare 
  },
  { 
    title: "Building Plans", 
    href: "/docs/coach/plans", 
    category: "For Coaches",
    keywords: ["plan", "workout", "program", "build", "create"],
    icon: ClipboardList 
  },
  { 
    title: "Nutrition Builder", 
    href: "/docs/coach/nutrition", 
    category: "For Coaches",
    keywords: ["nutrition", "meal", "diet", "food", "macros"],
    icon: Utensils 
  },
  { 
    title: "Digital Products", 
    href: "/docs/coach/products", 
    category: "For Coaches",
    keywords: ["product", "digital", "ebook", "course", "sell"],
    icon: Package 
  },
  { 
    title: "Schedule & Sessions", 
    href: "/docs/coach/schedule", 
    category: "For Coaches",
    keywords: ["schedule", "session", "availability", "calendar", "booking"],
    icon: Calendar 
  },
  { 
    title: "Packages & Pricing", 
    href: "/docs/coach/packages", 
    category: "For Coaches",
    keywords: ["package", "pricing", "subscription", "bundle", "price"],
    icon: CreditCard 
  },
  { 
    title: "Package Analytics", 
    href: "/docs/coach/package-analytics", 
    category: "For Coaches",
    keywords: ["analytics", "package", "sales", "revenue", "stats"],
    icon: BarChart3 
  },
  { 
    title: "Group Classes", 
    href: "/docs/coach/group-classes", 
    category: "For Coaches",
    keywords: ["group", "class", "session", "multiple", "participants"],
    icon: UsersRound 
  },
  { 
    title: "Financial Management", 
    href: "/docs/coach/financial", 
    category: "For Coaches",
    keywords: ["financial", "money", "revenue", "income", "earnings"],
    icon: CreditCard 
  },
  { 
    title: "Revenue Forecasting", 
    href: "/docs/coach/revenue-forecast", 
    category: "For Coaches",
    keywords: ["forecast", "revenue", "predict", "future", "projection"],
    icon: LineChart 
  },
  { 
    title: "Boost Marketing", 
    href: "/docs/coach/boost", 
    category: "For Coaches",
    keywords: ["boost", "marketing", "promote", "visibility", "ads"],
    icon: Rocket 
  },
  { 
    title: "Engagement Scoring", 
    href: "/docs/coach/engagement-scoring", 
    category: "For Coaches",
    keywords: ["engagement", "score", "activity", "participation"],
    icon: Activity 
  },
  { 
    title: "Client LTV", 
    href: "/docs/coach/client-ltv", 
    category: "For Coaches",
    keywords: ["ltv", "lifetime", "value", "revenue", "client"],
    icon: CreditCard 
  },
  { 
    title: "Upsell Insights", 
    href: "/docs/coach/upsell-insights", 
    category: "For Coaches",
    keywords: ["upsell", "insights", "opportunity", "revenue"],
    icon: TrendingUp 
  },
  { 
    title: "Goal Adherence", 
    href: "/docs/coach/goal-adherence", 
    category: "For Coaches",
    keywords: ["goal", "adherence", "compliance", "tracking"],
    icon: Target 
  },
  { 
    title: "AI Tools", 
    href: "/docs/coach/ai", 
    category: "For Coaches",
    keywords: ["ai", "artificial", "intelligence", "generate", "automate"],
    icon: Sparkles 
  },
  { 
    title: "AI Recommendations", 
    href: "/docs/coach/ai-recommendations", 
    category: "For Coaches",
    keywords: ["ai", "recommendations", "suggestions", "smart"],
    icon: Brain 
  },
  { 
    title: "Check-in Suggestions", 
    href: "/docs/coach/checkin-suggestions", 
    category: "For Coaches",
    keywords: ["checkin", "check-in", "suggestion", "prompt"],
    icon: MessageSquare 
  },
  { 
    title: "Automations", 
    href: "/docs/coach/automations", 
    category: "For Coaches",
    keywords: ["automation", "automate", "workflow", "automatic"],
    icon: Settings 
  },
  { 
    title: "Outcome Showcase", 
    href: "/docs/coach/showcase", 
    category: "For Coaches",
    keywords: ["showcase", "results", "transformation", "portfolio"],
    icon: Trophy 
  },
  { 
    title: "Case Studies", 
    href: "/docs/coach/case-studies", 
    category: "For Coaches",
    keywords: ["case", "study", "success", "story", "testimonial"],
    icon: FileText 
  },
  { 
    title: "Managing Reviews", 
    href: "/docs/coach/reviews", 
    category: "For Coaches",
    keywords: ["review", "rating", "feedback", "testimonial"],
    icon: Star 
  },
  { 
    title: "Verification", 
    href: "/docs/coach/verification", 
    category: "For Coaches",
    keywords: ["verification", "verify", "badge", "certified", "credentials"],
    icon: FileCheck 
  },
  { 
    title: "Earnings & Stripe", 
    href: "/docs/coach/earnings", 
    category: "For Coaches",
    keywords: ["earnings", "stripe", "payment", "payout", "money"],
    icon: BarChart3 
  },
  { 
    title: "Integrations", 
    href: "/docs/coach/integrations", 
    category: "For Coaches",
    keywords: ["integration", "connect", "third-party", "apps"],
    icon: Plug 
  },
  { 
    title: "Connections", 
    href: "/docs/coach/connections", 
    category: "For Coaches",
    keywords: ["connection", "link", "integrate"],
    icon: Link2 
  },
  { 
    title: "Coach Settings", 
    href: "/docs/coach/settings", 
    category: "For Coaches",
    keywords: ["settings", "preferences", "configure", "options"],
    icon: Settings 
  },
  { 
    title: "Coach Achievements", 
    href: "/docs/coach/achievements", 
    category: "For Coaches",
    keywords: ["achievement", "badge", "milestone", "reward"],
    icon: Trophy 
  },

  // Integrations
  { 
    title: "Wearables Overview", 
    href: "/docs/integrations/wearables", 
    category: "Integrations",
    keywords: ["wearable", "device", "sync", "connect", "health"],
    icon: Settings 
  },
  { 
    title: "Apple Health", 
    href: "/docs/integrations/apple-health", 
    category: "Integrations",
    keywords: ["apple", "health", "iphone", "ios", "watch"],
    icon: Settings 
  },
  { 
    title: "Health Connect", 
    href: "/docs/integrations/health-connect", 
    category: "Integrations",
    keywords: ["health", "connect", "android", "google"],
    icon: Settings 
  },
  { 
    title: "Garmin", 
    href: "/docs/integrations/garmin", 
    category: "Integrations",
    keywords: ["garmin", "watch", "device", "sync"],
    icon: Settings 
  },
  { 
    title: "Fitbit", 
    href: "/docs/integrations/fitbit", 
    category: "Integrations",
    keywords: ["fitbit", "tracker", "watch", "sync"],
    icon: Settings 
  },
  { 
    title: "Zoom", 
    href: "/docs/integrations/zoom", 
    category: "Integrations",
    keywords: ["zoom", "video", "call", "meeting", "online"],
    icon: Plug 
  },
  { 
    title: "Google Meet", 
    href: "/docs/integrations/google-meet", 
    category: "Integrations",
    keywords: ["google", "meet", "video", "call", "meeting"],
    icon: Plug 
  },
  { 
    title: "Google Calendar", 
    href: "/docs/integrations/google-calendar", 
    category: "Integrations",
    keywords: ["google", "calendar", "sync", "schedule"],
    icon: Calendar 
  },
  { 
    title: "Apple Calendar", 
    href: "/docs/integrations/apple-calendar", 
    category: "Integrations",
    keywords: ["apple", "calendar", "ical", "sync", "schedule"],
    icon: Calendar 
  },

  // Admin (will be filtered based on role)
  { 
    title: "Admin Overview", 
    href: "/docs/admin", 
    category: "For Administrators",
    keywords: ["admin", "overview", "dashboard"],
    icon: Home 
  },
  { 
    title: "Admin Dashboard", 
    href: "/docs/admin/dashboard", 
    category: "For Administrators",
    keywords: ["dashboard", "admin", "overview", "stats"],
    icon: LayoutDashboard 
  },
  { 
    title: "User Management", 
    href: "/docs/admin/users", 
    category: "For Administrators",
    keywords: ["user", "manage", "accounts", "clients"],
    icon: Users 
  },
  { 
    title: "Coach Management", 
    href: "/docs/admin/coaches", 
    category: "For Administrators",
    keywords: ["coach", "manage", "trainers"],
    icon: Dumbbell 
  },
  { 
    title: "Team Management", 
    href: "/docs/admin/team", 
    category: "For Administrators",
    keywords: ["team", "staff", "roles", "permissions"],
    icon: Shield 
  },
  { 
    title: "Revenue", 
    href: "/docs/admin/revenue", 
    category: "For Administrators",
    keywords: ["revenue", "income", "money", "payments"],
    icon: CreditCard 
  },
  { 
    title: "Platform Analytics", 
    href: "/docs/admin/analytics", 
    category: "For Administrators",
    keywords: ["analytics", "stats", "metrics", "data"],
    icon: BarChart3 
  },
  { 
    title: "Managing Challenges", 
    href: "/docs/admin/challenges", 
    category: "For Administrators",
    keywords: ["challenge", "event", "competition"],
    icon: Trophy 
  },
  { 
    title: "Blog Management", 
    href: "/docs/admin/blog", 
    category: "For Administrators",
    keywords: ["blog", "post", "article", "content"],
    icon: FileText 
  },
  { 
    title: "Boost Management", 
    href: "/docs/admin/boosts", 
    category: "For Administrators",
    keywords: ["boost", "marketing", "ads", "promotion"],
    icon: Rocket 
  },
  { 
    title: "Platform Integrations", 
    href: "/docs/admin/integrations", 
    category: "For Administrators",
    keywords: ["integration", "api", "connect", "third-party"],
    icon: Plug 
  },
  { 
    title: "Audit Log", 
    href: "/docs/admin/audit", 
    category: "For Administrators",
    keywords: ["audit", "log", "history", "activity", "security"],
    icon: FileCheck 
  },
];
