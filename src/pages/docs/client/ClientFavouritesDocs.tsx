import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Search, Star, Users, Clock, BookmarkPlus } from "lucide-react";

export default function ClientFavouritesDocs() {
  return (
    <DocsLayout
      title="Save Favourite Coaches | FitConnect Client Guide"
      description="Bookmark coaches to compare later. Build your shortlist before booking sessions."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Favourites" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for clients who are browsing coaches and want to save interesting profiles 
            for later. Whether you're researching coaches before making a decision or keeping track of 
            specialists for different training goals, favourites help you stay organised.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Save Coaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bookmark coaches you're interested in with a single click to review later.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookmarkPlus className="h-4 w-4 text-primary" />
                  Build a Shortlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create a curated list of coaches you're considering before making your final choice.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Easy Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access all your saved coaches in one place to compare services, prices, and reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Return to coach profiles instantly without searching again.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Choosing the right coach is an important decision that often requires research and 
            comparison. The favourites feature exists to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Save time by not having to search for the same coaches repeatedly</li>
            <li>Help you compare multiple coaches side-by-side</li>
            <li>Allow you to research at your own pace without losing track of interesting profiles</li>
            <li>Keep different types of coaches organised (e.g., nutritionists vs personal trainers)</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How to Save a Coach</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Browse Coaches">
              Navigate to the coach marketplace or search for coaches using the search bar.
            </DocStep>

            <DocStep stepNumber={2} title="Find the Heart Icon">
              On any coach card or profile page, look for the heart icon in the top corner.
            </DocStep>

            <DocStep stepNumber={3} title="Click to Save">
              Click the heart icon to add the coach to your favourites. The heart will fill in to 
              confirm they've been saved.
            </DocStep>

            <DocStep stepNumber={4} title="Access Your Favourites">
              View all your saved coaches by going to "Favourites" in your dashboard sidebar.
            </DocStep>
          </div>
        </section>

        {/* Managing Favourites */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Managing Your Favourites</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Viewing Your List</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to Dashboard → Favourites to see all your saved coaches. Each coach card 
                shows their photo, name, specialty, rating, and pricing.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Removing a Coach</h3>
              <p className="text-sm text-muted-foreground">
                Click the filled heart icon on any saved coach to remove them from your favourites. 
                This doesn't affect any existing bookings or relationships.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Going to Profile</h3>
              <p className="text-sm text-muted-foreground">
                Click on any coach card in your favourites to view their full profile, services, 
                reviews, and availability.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Tips for Using Favourites</h2>
          <DocTip>
            Save coaches from different specialties if you have multiple goals. For example, save 
            a personal trainer for workouts and a nutritionist for meal planning.
          </DocTip>

          <DocInfo className="mt-4">
            There's no limit to how many coaches you can save. Use favourites freely while 
            researching to ensure you don't miss anyone interesting.
          </DocInfo>
        </section>

        {/* Common Use Cases */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Common Use Cases</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Research Phase</h3>
              <p className="text-sm text-muted-foreground">
                When first looking for a coach, save several options to your favourites. Then 
                take time to review each profile, read reviews, and compare before reaching out.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Future Goals</h3>
              <p className="text-sm text-muted-foreground">
                Save coaches for goals you want to work on in the future. For example, save a 
                boxing coach now even if you're focusing on weight loss first.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Budget Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Save coaches at different price points to compare what you get at each level 
                before deciding how much to invest.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                When someone recommends a coach, save them to your favourites so you can check 
                them out later when you have time.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can coaches see if I favourited them?</h3>
              <p className="text-sm text-muted-foreground">
                No, coaches cannot see who has added them to their favourites. Your shortlist is 
                completely private.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Is there a limit to how many coaches I can save?</h3>
              <p className="text-sm text-muted-foreground">
                No, you can save as many coaches as you like. There's no limit to your favourites list.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What happens if a coach I saved becomes unavailable?</h3>
              <p className="text-sm text-muted-foreground">
                If a coach deactivates their profile or leaves the platform, they will automatically 
                be removed from your favourites.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do I need to favourite a coach to book them?</h3>
              <p className="text-sm text-muted-foreground">
                No, favouriting is optional. You can book any coach directly from their profile 
                without adding them to your favourites first.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
