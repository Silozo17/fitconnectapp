import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, BarChart3, Users, AlertTriangle, Target, PieChart } from "lucide-react";

export default function CoachRevenueForecastDocs() {
  return (
    <DocsLayout
      title="Revenue Forecasting"
      description="Predict your future earnings and plan your coaching business with data-driven projections."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Revenue Forecast" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to understand and predict their future income. 
            Revenue forecasting helps you plan for growth, manage cash flow, and make informed 
            business decisions.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Income Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See predicted revenue for the next 1, 3, and 6 months based on current data.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Subscription Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track recurring revenue from subscriptions vs one-off session purchases.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Churn Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See how predicted client churn affects your revenue forecast.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Growth Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Model different growth scenarios: maintain, moderate growth, or aggressive expansion.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Running a coaching business requires financial planning. Revenue forecasting helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Plan for income fluctuations and seasonal changes</li>
            <li>Set realistic growth targets</li>
            <li>Identify revenue risks before they materialise</li>
            <li>Make informed decisions about investments (marketing, equipment, etc.)</li>
            <li>Understand the financial impact of client retention</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How Forecasting Works</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Historical Analysis">
              The system analyses your past 12 months of earnings, client acquisition, and churn rates.
            </DocStep>

            <DocStep stepNumber={2} title="Current State Assessment">
              It evaluates your current active subscriptions, booked sessions, and pipeline.
            </DocStep>

            <DocStep stepNumber={3} title="Trend Projection">
              Using historical patterns and current data, it projects future revenue with 
              confidence intervals.
            </DocStep>

            <DocStep stepNumber={4} title="Risk Adjustment">
              The forecast accounts for at-risk clients and potential churn based on 
              engagement data.
            </DocStep>
          </div>
        </section>

        {/* Revenue Breakdown */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Revenue Breakdown
          </h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recurring Revenue (MRR)
              </h3>
              <p className="text-sm text-muted-foreground">
                Monthly recurring revenue from active subscriptions. This is your most 
                predictable income stream.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                One-Off Sessions
              </h3>
              <p className="text-sm text-muted-foreground">
                Revenue from individual session bookings and consultation fees. More variable 
                than subscriptions.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Package Sales
              </h3>
              <p className="text-sm text-muted-foreground">
                Revenue from multi-session packages. Provides upfront cash but is earned 
                over time as sessions are used.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Digital Products
              </h3>
              <p className="text-sm text-muted-foreground">
                Sales of e-books, templates, and other digital offerings.
              </p>
            </div>
          </div>
        </section>

        {/* Growth Scenarios */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Growth Scenarios</h2>
          <p className="text-muted-foreground mb-4">
            The forecast shows three scenarios to help you plan:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Conservative</h3>
              <p className="text-sm text-muted-foreground">
                Assumes higher churn and no new client acquisition. Your floor if things slow down.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Baseline</h3>
              <p className="text-sm text-muted-foreground">
                Based on current trends continuing. Your most likely scenario.
              </p>
            </div>

            <div className="bg-card/50 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Optimistic</h3>
              <p className="text-sm text-muted-foreground">
                Assumes improved retention and growth in line with your best months.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Use the conservative scenario for essential expenses and baseline for realistic planning.
          </DocTip>
        </section>

        {/* Using the Forecast */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Using the Forecast</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Review Monthly">
              Check your forecast at least monthly to catch trends early.
            </DocStep>

            <DocStep stepNumber={2} title="Focus on Retention">
              The forecast shows how much revenue is at risk from potential churn. 
              Prioritise retaining at-risk clients.
            </DocStep>

            <DocStep stepNumber={3} title="Plan Marketing Spend">
              If the forecast shows capacity for growth, consider investing in marketing 
              to fill available slots.
            </DocStep>

            <DocStep stepNumber={4} title="Set Realistic Goals">
              Use the forecast to set achievable monthly and quarterly revenue targets.
            </DocStep>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How accurate are the forecasts?</h3>
              <p className="text-sm text-muted-foreground">
                Accuracy improves with more historical data. After 3+ months, forecasts are 
                typically within 10-15% of actual revenue.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Does it account for seasonality?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, if you have 12+ months of data, the system identifies seasonal patterns 
                (e.g., January surge, summer slowdown).
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I export forecast data?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can export forecast data to CSV for use in spreadsheets or accounting software.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if I'm just starting out?</h3>
              <p className="text-sm text-muted-foreground">
                With limited data, forecasts show current confirmed bookings and subscriptions. 
                Projections become more useful after 2-3 months.
              </p>
            </div>
          </div>
        </section>

        <DocInfo>
          Revenue forecasting is a planning tool, not a guarantee. Use it to inform decisions 
          but always maintain a financial buffer for unexpected changes.
        </DocInfo>
      </div>
    </DocsLayout>
  );
}