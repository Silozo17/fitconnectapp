import { createContext, useContext, useState, useCallback, ReactNode, RefObject } from "react";

interface Section {
  id: string;
  title: string;
  description: string;
  ref: RefObject<HTMLElement>;
}

interface ScrollSectionContextValue {
  sections: Map<string, Section>;
  registerSection: (section: Section) => void;
  unregisterSection: (id: string) => void;
  activeSection: Section | null;
  setActiveSection: (section: Section | null) => void;
  intersectionRatio: number;
  setIntersectionRatio: (ratio: number) => void;
  isAtTop: boolean;
  setIsAtTop: (atTop: boolean) => void;
}

const ScrollSectionContext = createContext<ScrollSectionContextValue | null>(null);

export const ScrollSectionProvider = ({ children }: { children: ReactNode }) => {
  const [sections] = useState<Map<string, Section>>(() => new Map());
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  const registerSection = useCallback((section: Section) => {
    sections.set(section.id, section);
  }, [sections]);

  const unregisterSection = useCallback((id: string) => {
    sections.delete(id);
  }, [sections]);

  return (
    <ScrollSectionContext.Provider
      value={{
        sections,
        registerSection,
        unregisterSection,
        activeSection,
        setActiveSection,
        intersectionRatio,
        setIntersectionRatio,
        isAtTop,
        setIsAtTop,
      }}
    >
      {children}
    </ScrollSectionContext.Provider>
  );
};

export const useScrollSectionContext = () => {
  const context = useContext(ScrollSectionContext);
  if (!context) {
    throw new Error("useScrollSectionContext must be used within ScrollSectionProvider");
  }
  return context;
};

export const useActiveSection = () => {
  const { activeSection, intersectionRatio, isAtTop } = useScrollSectionContext();
  return { activeSection, intersectionRatio, isAtTop };
};
