"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  placement: "top" | "bottom" | "left" | "right";
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  isCompleted: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

interface TutorialProviderProps {
  children: React.ReactNode;
  steps: TutorialStep[];
  storageKey?: string;
}

export function TutorialProvider({
  children,
  steps,
  storageKey = "nulldental_tutorial_completed",
}: TutorialProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial has been completed
    try {
      const completed = localStorage.getItem(storageKey) === "true";
      setIsCompleted(completed);
    } catch (error) {
      console.warn("Failed to check tutorial completion status:", error);
    }
  }, [storageKey]);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTutorial = () => {
    setIsActive(false);
    setIsCompleted(true);
    try {
      localStorage.setItem(storageKey, "true");
    } catch (error) {
      console.warn("Failed to save tutorial completion status:", error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    endTutorial();
  };

  // Auto-start tutorial for new users (only if not completed)
  useEffect(() => {
    if (!isCompleted && steps.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, steps.length]);

  const value = {
    isActive,
    currentStep,
    steps,
    startTutorial,
    endTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    isCompleted,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}
