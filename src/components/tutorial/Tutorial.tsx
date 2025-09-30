"use client";

import React from "react";
import { useTutorial } from "./TutorialProvider";
import { TutorialTooltip } from "./TutorialTooltip";

export function Tutorial() {
  const { isActive, currentStep, steps, nextStep, previousStep, skipTutorial } =
    useTutorial();

  if (!isActive || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <TutorialTooltip
      step={step}
      isLast={isLast}
      onNext={nextStep}
      onPrevious={previousStep}
      onSkip={skipTutorial}
    />
  );
}
