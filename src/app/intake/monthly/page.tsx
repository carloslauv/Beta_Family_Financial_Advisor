'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { IntakeData } from '@/types';
import { getEmergencyMonthsValue } from '@/lib/utils';

type MonthlyData = IntakeData['monthly'];

const EMERGENCY_RANGES = ['Less than 1', '1–3', '3–6', '6–12', '12+'];

export default function MonthlyPage() {
  const router = useRouter();
  const { intake, updateMonthly, markSectionComplete } = useIntake();
  const existing = intake.monthly;

  const [step, setStep] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(
    existing?.household_income_monthly ?? ''
  );
  const [essentialExpenses, setEssentialExpenses] = useState<number | ''>(
    existing?.essential_expenses ?? ''
  );
  const [discretionary, setDiscretionary] = useState<number | ''>(
    existing?.discretionary_spending ?? ''
  );
  const [emergencyMonths, setEmergencyMonths] = useState(existing?.emergency_months ?? '');
  const [debt, setDebt] = useState<number | ''>(existing?.total_debt_non_mortgage ?? '');
  const [mortgageRent, setMortgageRent] = useState<number | ''>(existing?.mortgage_rent ?? '');

  const buildAndSave = () => {
    const data: MonthlyData = {
      household_income_monthly: Number(monthlyIncome) || 0,
      essential_expenses: Number(essentialExpenses) || 0,
      discretionary_spending: Number(discretionary) || 0,
      emergency_months: emergencyMonths || '3–6',
      emergency_months_value: getEmergencyMonthsValue(emergencyMonths || '3–6'),
      total_debt_non_mortgage: Number(debt) || 0,
      mortgage_rent: Number(mortgageRent) || 0,
    };

    updateMonthly(data);
    markSectionComplete('monthly');
    router.push('/processing');
  };

  // Step 0: Monthly income
  if (step === 0) {
    return (
      <QuestionCard
        question="Roughly, what's your household's total monthly income after taxes?"
        helper="Include all sources: salary, distributions, freelance, rental income, etc. An estimate is perfect."
        onNext={() => monthlyIncome !== '' && setStep(1)}
        onSkip={() => { setMonthlyIncome(0); setStep(1); }}
        nextDisabled={monthlyIncome === ''}
        showBack={false}
      >
        <NumberInput
          value={monthlyIncome}
          onChange={setMonthlyIncome}
          prefix="$"
          placeholder="e.g. 12,000"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 1: Essential expenses
  if (step === 1) {
    return (
      <QuestionCard
        question="What are your total monthly essential expenses?"
        helper="Housing, food, utilities, insurance, transportation, childcare, debt payments — the non-negotiables."
        onNext={() => essentialExpenses !== '' && setStep(2)}
        onBack={() => setStep(0)}
        onSkip={() => { setEssentialExpenses(0); setStep(2); }}
        nextDisabled={essentialExpenses === ''}
      >
        <NumberInput
          value={essentialExpenses}
          onChange={setEssentialExpenses}
          prefix="$"
          placeholder="e.g. 7,500"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 2: Discretionary
  if (step === 2) {
    return (
      <QuestionCard
        question="What's your approximate monthly discretionary spending?"
        helper="Dining out, entertainment, travel, subscriptions, shopping — the enjoyable stuff."
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
        onSkip={() => { setDiscretionary(0); setStep(3); }}
      >
        <NumberInput
          value={discretionary}
          onChange={setDiscretionary}
          prefix="$"
          placeholder="e.g. 2,000"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 3: Emergency savings
  if (step === 3) {
    return (
      <QuestionCard
        question="How many months of expenses do you have in emergency savings?"
        helper="Emergency savings are liquid funds you could access in a crisis — separate from retirement accounts."
        onNext={() => emergencyMonths && setStep(4)}
        onBack={() => setStep(2)}
        onSkip={() => { setEmergencyMonths('1–3'); setStep(4); }}
        nextDisabled={!emergencyMonths}
      >
        <div className="space-y-3">
          {EMERGENCY_RANGES.map((range) => (
            <OptionButton
              key={range}
              label={range === 'Less than 1' ? 'Less than 1 month' : `${range} months`}
              description={
                range === 'Less than 1'
                  ? 'This is the highest-priority area to address'
                  : range === '1–3'
                  ? 'Growing — aim for 3–6 months'
                  : range === '3–6'
                  ? 'Healthy — at or near the standard benchmark'
                  : range === '6–12'
                  ? 'Strong buffer'
                  : 'Very resilient'
              }
              selected={emergencyMonths === range}
              onClick={() => setEmergencyMonths(range)}
            />
          ))}
        </div>
      </QuestionCard>
    );
  }

  // Step 4: Debt
  if (step === 4) {
    return (
      <QuestionCard
        question="What's your total outstanding debt, excluding your mortgage?"
        helper="Credit cards, car loans, student loans, personal loans. Enter $0 if you're debt-free outside your mortgage."
        onNext={() => setStep(5)}
        onBack={() => setStep(3)}
        onSkip={() => { setDebt(0); setStep(5); }}
      >
        <NumberInput
          value={debt}
          onChange={setDebt}
          prefix="$"
          placeholder="e.g. 25,000"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 5: Mortgage/rent
  if (step === 5) {
    return (
      <QuestionCard
        question="What's your monthly mortgage or rent payment?"
        helper="This is likely your biggest single expense — it's already included in essentials, but we track it separately for your picture."
        onNext={buildAndSave}
        onBack={() => setStep(4)}
        onSkip={() => { setMortgageRent(0); buildAndSave(); }}
        isLastQuestion
      >
        <NumberInput
          value={mortgageRent}
          onChange={setMortgageRent}
          prefix="$"
          placeholder="e.g. 3,500"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  return null;
}
