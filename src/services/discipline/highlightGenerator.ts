/**
 * Highlight Generation Layer
 * Interpolates highlight templates with computed metric values
 */

import { DisciplineHighlightConfig, ComputedMetric } from "@/config/disciplines/types";
import { getFormatterUnit } from "./metricResolvers";

/**
 * Generate the highlight string from template and computed metrics
 */
export function generateHighlight(
  highlightConfig: DisciplineHighlightConfig,
  metrics: ComputedMetric[]
): string {
  // Check if primary metric has data
  const primaryMetric = metrics.find(m => m.id === highlightConfig.primaryMetricId);
  
  if (!primaryMetric || primaryMetric.value === 0) {
    return highlightConfig.fallback;
  }

  // Create a map of metric values for interpolation
  const valueMap: Record<string, string> = {};
  
  for (const metric of metrics) {
    const unit = getFormatterUnit(metric.formatter);
    const displayValue = metric.formattedValue !== '—' 
      ? `${metric.formattedValue}${unit ? ` ${unit}` : ''}`
      : '0';
    valueMap[metric.id] = displayValue;
  }

  // Interpolate template
  let result = highlightConfig.template;
  
  for (const [key, value] of Object.entries(valueMap)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // Clean up any remaining placeholders
  result = result.replace(/\{[^}]+\}/g, '—');

  return result;
}

/**
 * Generate a trend description
 */
export function generateTrendDescription(
  currentValue: number,
  previousValue: number
): { direction: 'up' | 'down' | 'stable'; percent: number } | undefined {
  if (previousValue === 0) return undefined;
  
  const diff = currentValue - previousValue;
  const percent = Math.round((diff / previousValue) * 100);
  
  if (percent > 5) {
    return { direction: 'up', percent };
  } else if (percent < -5) {
    return { direction: 'down', percent: Math.abs(percent) };
  }
  
  return { direction: 'stable', percent: 0 };
}
