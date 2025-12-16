// Display format types available for widgets
export type WidgetDisplayFormat = "number" | "bar" | "line" | "area" | "pie" | "donut";

// Define which formats are available for each widget category
export const WIDGET_FORMAT_OPTIONS: Record<string, { value: WidgetDisplayFormat; label: string }[]> = {
  stats: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "area", label: "Area Chart" },
    { value: "pie", label: "Pie Chart" },
  ],
  revenue: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "area", label: "Area Chart" },
    { value: "pie", label: "Pie Chart" },
  ],
  analytics: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "donut", label: "Donut Chart" },
  ],
  business: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "area", label: "Area Chart" },
  ],
  engagement: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
  ],
  charts: [
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "area", label: "Area Chart" },
  ],
  integrations: [
    { value: "number", label: "Number" },
    { value: "bar", label: "Bar Chart" },
  ],
  // Lists and actions don't have format options
  lists: [],
  actions: [],
};

// Get format options for a specific widget type
export function getFormatOptionsForWidget(category: string): { value: WidgetDisplayFormat; label: string }[] {
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
