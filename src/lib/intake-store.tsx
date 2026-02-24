'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { IntakeData } from '@/types';

const STORAGE_KEY = 'family_panorama_intake_v1';
const PANORAMA_KEY = 'family_panorama_result_v1';

interface IntakeContextType {
  intake: Partial<IntakeData>;
  updateBasics: (data: IntakeData['basics']) => void;
  updateRetirement: (data: IntakeData['retirement']) => void;
  updateEducation: (data: IntakeData['education']) => void;
  updateCareer: (data: IntakeData['career']) => void;
  updateParents: (data: IntakeData['parents']) => void;
  updateMonthly: (data: IntakeData['monthly']) => void;
  clearIntake: () => void;
  isLoaded: boolean;
  completedSections: Set<string>;
  markSectionComplete: (section: string) => void;
}

const IntakeContext = createContext<IntakeContextType | null>(null);

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intake, setIntake] = useState<Partial<IntakeData>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setIntake(parsed.intake ?? {});
        setCompletedSections(new Set(parsed.completedSections ?? []));
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback(
    (newIntake: Partial<IntakeData>, newCompleted: Set<string>) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            intake: newIntake,
            completedSections: Array.from(newCompleted),
          })
        );
      } catch {
        // Ignore storage errors
      }
    },
    []
  );

  const updateBasics = useCallback(
    (data: IntakeData['basics']) => {
      setIntake((prev) => {
        const updated = { ...prev, basics: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const updateRetirement = useCallback(
    (data: IntakeData['retirement']) => {
      setIntake((prev) => {
        const updated = { ...prev, retirement: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const updateEducation = useCallback(
    (data: IntakeData['education']) => {
      setIntake((prev) => {
        const updated = { ...prev, education: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const updateCareer = useCallback(
    (data: IntakeData['career']) => {
      setIntake((prev) => {
        const updated = { ...prev, career: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const updateParents = useCallback(
    (data: IntakeData['parents']) => {
      setIntake((prev) => {
        const updated = { ...prev, parents: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const updateMonthly = useCallback(
    (data: IntakeData['monthly']) => {
      setIntake((prev) => {
        const updated = { ...prev, monthly: data };
        persist(updated, completedSections);
        return updated;
      });
    },
    [persist, completedSections]
  );

  const markSectionComplete = useCallback(
    (section: string) => {
      setCompletedSections((prev) => {
        const next = new Set(prev);
        next.add(section);
        persist(intake, next);
        return next;
      });
    },
    [persist, intake]
  );

  const clearIntake = useCallback(() => {
    setIntake({});
    setCompletedSections(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PANORAMA_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <IntakeContext.Provider
      value={{
        intake,
        updateBasics,
        updateRetirement,
        updateEducation,
        updateCareer,
        updateParents,
        updateMonthly,
        clearIntake,
        isLoaded,
        completedSections,
        markSectionComplete,
      }}
    >
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake() {
  const context = useContext(IntakeContext);
  if (!context) throw new Error('useIntake must be used within IntakeProvider');
  return context;
}

// Helper to save/load panorama result
export function savePanorama(panorama: unknown) {
  try {
    localStorage.setItem(PANORAMA_KEY, JSON.stringify(panorama));
  } catch {
    // Ignore
  }
}

export function loadPanorama(): unknown {
  try {
    const stored = localStorage.getItem(PANORAMA_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
