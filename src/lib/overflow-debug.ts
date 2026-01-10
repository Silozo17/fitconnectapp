/**
 * Development-only overflow detection utility.
 * Identifies elements causing horizontal overflow on a page.
 */

interface OverflowingElement {
  element: Element;
  tagName: string;
  id: string;
  className: string;
  overflowX: number;
  overflowRight: number;
  overflowLeft: number;
  scrollWidth: number;
  clientWidth: number;
  rectLeft: number;
  rectRight: number;
  computedOverflow: string;
}

export function findOverflowingElements(
  root: Element = document.documentElement,
  thresholdPx: number = 1
): OverflowingElement[] {
  if (!import.meta.env.DEV) return [];

  const viewportWidth = window.innerWidth;
  const offenders: OverflowingElement[] = [];

  const elements = root.querySelectorAll('*');
  
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    
    const scrollWidth = (el as HTMLElement).scrollWidth || 0;
    const clientWidth = (el as HTMLElement).clientWidth || 0;
    
    const overflowX = scrollWidth - clientWidth;
    const overflowRight = rect.right - viewportWidth;
    const overflowLeft = -rect.left;

    const isOverflowing = 
      overflowX > thresholdPx ||
      overflowRight > thresholdPx ||
      overflowLeft > thresholdPx;

    if (isOverflowing) {
      offenders.push({
        element: el,
        tagName: el.tagName.toLowerCase(),
        id: el.id || '',
        className: el.className?.toString?.() || '',
        overflowX,
        overflowRight,
        overflowLeft,
        scrollWidth,
        clientWidth,
        rectLeft: rect.left,
        rectRight: rect.right,
        computedOverflow: computed.overflowX,
      });
    }
  });

  // Sort by worst overflow
  offenders.sort((a, b) => {
    const aMax = Math.max(a.overflowX, a.overflowRight, a.overflowLeft);
    const bMax = Math.max(b.overflowX, b.overflowRight, b.overflowLeft);
    return bMax - aMax;
  });

  return offenders;
}

export function logOverflowReport(offenders: OverflowingElement[]): void {
  if (!import.meta.env.DEV) return;

  const docScrollWidth = document.documentElement.scrollWidth;
  const viewportWidth = window.innerWidth;

  console.group('🔍 Overflow Debug Report');
  console.log(`Document scrollWidth: ${docScrollWidth}px`);
  console.log(`Viewport width: ${viewportWidth}px`);
  console.log(`Document overflow: ${docScrollWidth - viewportWidth}px`);
  
  if (offenders.length === 0) {
    console.log('✅ No overflowing elements found!');
  } else {
    console.log(`❌ Found ${offenders.length} overflowing elements:`);
    
    // Show top 10 worst offenders
    const top10 = offenders.slice(0, 10);
    top10.forEach((o, i) => {
      const shortClass = o.className.length > 60 
        ? o.className.slice(0, 60) + '...' 
        : o.className;
      console.log(
        `${i + 1}. <${o.tagName}${o.id ? `#${o.id}` : ''}> ` +
        `overflow: ${Math.max(o.overflowX, o.overflowRight, o.overflowLeft).toFixed(0)}px ` +
        `(scrollW: ${o.scrollWidth}, clientW: ${o.clientWidth}, right: ${o.overflowRight.toFixed(0)}) ` +
        `class="${shortClass}"`
      );
    });

    console.table(top10.map(o => ({
      tag: `<${o.tagName}${o.id ? `#${o.id}` : ''}>`,
      overflowX: o.overflowX.toFixed(0),
      overflowRight: o.overflowRight.toFixed(0),
      overflowLeft: o.overflowLeft.toFixed(0),
      computedOverflow: o.computedOverflow,
    })));
  }
  
  console.groupEnd();
}

export function highlightOffenders(offenders: OverflowingElement[]): () => void {
  if (!import.meta.env.DEV) return () => {};

  const originalStyles = new Map<Element, string>();

  offenders.slice(0, 10).forEach((o) => {
    const el = o.element as HTMLElement;
    originalStyles.set(el, el.style.outline);
    el.style.outline = '3px solid red';
  });

  // Return cleanup function
  return () => {
    originalStyles.forEach((style, el) => {
      (el as HTMLElement).style.outline = style;
    });
  };
}
