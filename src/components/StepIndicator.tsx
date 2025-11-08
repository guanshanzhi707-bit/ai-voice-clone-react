import React from 'react';
import styled from 'styled-components';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

interface StepProps {
  active?: boolean;
  completed?: boolean;
}

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e8e8e8;
    z-index: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: center;

    &::before {
      width: 2px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const Step = styled.div<StepProps>`
  position: relative;
  z-index: 1;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 15px;
  }
`;

const StepNumber = styled.div<StepProps>`
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-weight: bold;
  color: #999;
  transition: all 0.3s ease;

  ${props => props.active && `
    background: #5e7ce6;
    border-color: #5e7ce6;
    color: white;
    transform: scale(1.1);
  `}

  ${props => props.completed && `
    background: #52c41a;
    border-color: #52c41a;
    color: white;
  `}

  @media (max-width: 768px) {
    margin: 0;
    flex-shrink: 0;
  }
`;

const StepText = styled.span<StepProps>`
  font-size: 14px;
  color: #666;
  font-weight: 500;

  ${props => props.active && `
    color: #5e7ce6;
    font-weight: bold;
  `}
`;

const steps = [
  { number: 1, text: '录制声音' },
  { number: 2, text: '生成语音' }
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <StepsContainer>
      {steps.slice(0, totalSteps).map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <Step key={step.number} active={isActive} completed={isCompleted}>
            <StepNumber active={isActive} completed={isCompleted}>
              {step.number}
            </StepNumber>
            <StepText active={isActive} completed={isCompleted}>
              {step.text}
            </StepText>
          </Step>
        );
      })}
    </StepsContainer>
  );
};