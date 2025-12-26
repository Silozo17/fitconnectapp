// Display format types available for widgets
export type WidgetDisplayFormat = "number" | "bar" | "line" | "area" | "pie" | "donut";

// Define which formats are available for each widget category
export const WIDGET_FORMAT_OPTIONS: Record<string, { value: WidgetDisplayFormat; label: string; shortLabel: string }[]> = {
  stats: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
    { value: "line", label: "Line Chart", shortLabel: "Line" },
    { value: "area", label: "Area Chart", shortLabel: "Area" },
    { value: "pie", label: "Pie Chart", shortLabel: "Pie" },
  ],
  revenue: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
    { value: "line", label: "Line Chart", shortLabel: "Line" },
    { value: "area", label: "Area Chart", shortLabel: "Area" },
    { value: "pie", label: "Pie Chart", shortLabel: "Pie" },
  ],
  analytics: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
    { value: "pie", label: "Pie Chart", shortLabel: "Pie" },
    { value: "donut", label: "Donut Chart", shortLabel: "Donut" },
  ],
  business: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
    { value: "line", label: "Line Chart", shortLabel: "Line" },
    { value: "area", label: "Area Chart", shortLabel: "Area" },
  ],
  engagement: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
  ],
  charts: [
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
    { value: "line", label: "Line Chart", shortLabel: "Line" },
    { value: "area", label: "Area Chart", shortLabel: "Area" },
  ],
  integrations: [
    { value: "number", label: "Number", shortLabel: "Num" },
    { value: "bar", label: "Bar Chart", shortLabel: "Bar" },
  ],
  // Lists and actions don't have format options
  lists: [],
  actions: [],
};

// Size options with short labels
export const SIZE_OPTIONS = [
  { value: "small", label: "Small", shortLabel: "Sm" },
  { value: "medium", label: "Medium", shortLabel: "Md" },
  { value: "large", label: "Large", shortLabel: "Lg" },
  { value: "full", label: "Full", shortLabel: "Full" },
] as const;

// Get format options for a specific widget type
export function getFormatOptionsForWidget(category: string): { value: WidgetDisplayFormat; label: string; shortLabel: string }[] {
  return WIDGET_FORMAT_OPTIONS[category] || [];
}

// Check if a widget category supports format selection
export function supportsFormatSelection(category: string): boolean {
  const options = WIDGET_FORMAT_OPTIONS[category];
  return options && options.length > 0;
}

// Get default format for a category
export function getDefaultFormat(category: string): WidgetDisplayFormat {
  if (category === "charts") return "area";
  return "number";
}
