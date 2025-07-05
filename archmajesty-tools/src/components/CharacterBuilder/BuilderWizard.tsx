import React, { useState } from 'react';
import { useStore } from '../../services/store';
import { Character } from '../types';
import { generateCharacterPDF } from '../../services/export/characterPDF';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { AttributesStep } from './steps/AttributesStep';
import { SpellSelectionStep } from './steps/SpellSelectionStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { ReviewStep } from './steps/ReviewStep';

export type WizardStep = 'basic' | 'attributes' | 'spells' | 'equipment' | 'review';

const steps: { id: WizardStep; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'spells', label: 'Spells' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'review', label: 'Review' }
];

export const BuilderWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const { currentCharacter, setCurrentCharacter, updateCurrentCharacter } = useStore();

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: WizardStep) => {
    const clickedIndex = steps.findIndex(s => s.id === stepId);
    if (clickedIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleComplete = () => {
    if (currentCharacter) {
      generateCharacterPDF(currentCharacter as Character);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return <BasicInfoStep onNext={handleNext} />;
      case 'attributes':
        return <AttributesStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'spells':
        return <SpellSelectionStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'equipment':
        return <EquipmentStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'review':
        return <ReviewStep onPrevious={handlePrevious} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index <= currentStepIndex
                    ? 'bg-blue-500 border-blue-500 text-white cursor-pointer hover:bg-blue-600'
                    : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                disabled={index > currentStepIndex}
              >
                {index + 1}
              </button>
              <div className="ml-2 mr-4">
                <p className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
};