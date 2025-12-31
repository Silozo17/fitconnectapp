import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocStep, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Apple, AlertTriangle, RefreshCw, Scale, Leaf, ShieldCheck } from "lucide-react";

export default function AIFoodSubstitutionsDocs() {
  return (
    <DocsLayout
      title="AI Food Substitutions"
      description="Find meal and ingredient alternatives that match macros while respecting dietary restrictions and preferences."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Food Substitutions" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How Food Substitution Works</h2>
        <p>
          The AI Food Substitution tool helps you find alternative foods or meals when your client 
          needs to swap something in their nutrition plan. The AI maintains macro balance while 
          respecting their dietary requirements.
        </p>
        
        <p>Use it when a client:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Dislikes a specific food in their plan</li>
          <li>Can't find an ingredient at their local shop</li>
          <li>Discovers a new food allergy or intolerance</li>
          <li>Wants more variety in their meals</li>
          <li>Is dining out and needs restaurant alternatives</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dietary Restriction Handling</h2>
        <p>
          The AI automatically filters suggestions based on the client's dietary profile:
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Dietary Types</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Vegetarian</li>
              <li>Vegan</li>
              <li>Pescatarian</li>
              <li>Keto</li>
              <li>Halal / Kosher</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Common Exclusions</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Gluten-free</li>
              <li>Dairy-free</li>
              <li>Low-sodium</li>
              <li>Low-FODMAP</li>
              <li>Sugar-free</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">Allergens</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Nuts / Tree nuts</li>
              <li>Shellfish</li>
              <li>Eggs</li>
              <li>Soy</li>
              <li>Sesame</li>
            </ul>
          </div>
        </div>
        
        <DocWarning>
          Always verify allergy information with clients. The AI provides guidance but should not 
          be relied upon for life-threatening allergies without human verification.
        </DocWarning>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Allergy Awareness</h2>
        <p>
          Client allergen preferences are set during onboarding and can be updated in their profile. 
          The AI cross-references all suggestions against their allergen list and clearly labels:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Safe</strong> – No known allergens present</li>
          <li><strong>Caution</strong> – May contain traces (cross-contamination risk)</li>
          <li><strong>Contains allergen</strong> – Explicitly contains a flagged ingredient</li>
        </ul>
        
        <DocInfo>
          Suggestions marked as "Caution" are hidden by default. Enable "Show caution items" if 
          your client can tolerate trace amounts.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Macro Preservation Logic</h2>
        <p>
          The AI prioritises keeping the macro balance close to the original food:
        </p>
        
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 border-b">Original Food</th>
                <th className="text-left p-3 border-b">Macros</th>
                <th className="text-left p-3 border-b">AI Suggestion</th>
                <th className="text-left p-3 border-b">Macros</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">Chicken Breast (150g)</td>
                <td className="p-3 border-b">46P / 0C / 4F</td>
                <td className="p-3 border-b">Turkey Breast (150g)</td>
                <td className="p-3 border-b">45P / 0C / 2F</td>
              </tr>
              <tr>
                <td className="p-3 border-b">White Rice (200g)</td>
                <td className="p-3 border-b">5P / 56C / 0F</td>
                <td className="p-3 border-b">Quinoa (180g)</td>
                <td className="p-3 border-b">8P / 52C / 4F</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Greek Yogurt (150g)</td>
                <td className="p-3 border-b">15P / 6C / 5F</td>
                <td className="p-3 border-b">Skyr (150g)</td>
                <td className="p-3 border-b">17P / 6C / 0F</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <DocTip>
          The AI shows macro differences as percentages. Aim for substitutions within ±15% of the 
          original macros for best results.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Use</h2>
        
        <DocStep stepNumber={1} title="Select the Food">
          In the nutrition plan or meal builder, click on the food item you want to replace and 
          select <strong>Find Substitutions</strong>.
        </DocStep>
        
        <DocStep stepNumber={2} title="Specify Reason (Optional)">
          Add context if helpful – "client doesn't like texture", "not available locally", 
          "too expensive".
        </DocStep>
        
        <DocStep stepNumber={3} title="Review Options">
          The AI presents 3-5 alternatives sorted by macro similarity. Each shows calories, 
          macros, and allergen status.
        </DocStep>
        
        <DocStep stepNumber={4} title="Adjust Portions">
          Select a substitution and the AI auto-calculates the portion size to match the 
          original macro targets. You can fine-tune manually.
        </DocStep>
        
        <DocStep stepNumber={5} title="Apply to Plan">
          Swap the food for this meal only, or replace it across all meals in the plan.
        </DocStep>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Client Preference Considerations</h2>
        <p>
          The AI learns from past choices. If a client repeatedly rejects certain foods or 
          substitutions, they're deprioritised in future suggestions.
        </p>
        
        <p>Preferences tracked include:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Foods the client has explicitly rejected</li>
          <li>Cuisine preferences (e.g., prefers Asian over Mexican)</li>
          <li>Texture preferences (e.g., dislikes mushy foods)</li>
          <li>Cooking skill level (simple vs complex recipes)</li>
          <li>Budget constraints</li>
        </ul>
        
        <DocInfo>
          Update client food preferences in their profile to improve future AI suggestions.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
