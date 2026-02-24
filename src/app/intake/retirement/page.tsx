'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput, SliderInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { RangeSelector } from '@/components/intake/option-button';
import { IntakeData } from '@/types';
import { getRangeMidpoint } from '@/lib/utils';

type RetirementData = IntakeData['retirement'];

const SAVINGS_RANGES = [
  '$0–$50K',
  '$50K–$150K',
  '$150K–$300K',
  '$300K–$500K',
  '$500K–$1M',
  '$1M+',
];

export default function RetirementPage() {
  const router = useRouter();
  const { intake, updateRetirement, markSectionComplete } = useIntake();
  const existing = intake.retirement;

  const [step, setStep] = useState(0);
  const [savingsRange, setSavingsRange] = useState(existing?.total_savings_range ?? '');
  const [monthlyContrib, setMonthlyContrib] = useState<number | ''>(
    existing?.monthly_contribution ?? ''
  );
  const [employerMatch, setEmployerMatch] = useState<number | ''>(
    existing?.employer_match ?? ''
  );
  const [retirementAge, setRetirementAge] = useState(existing?.target_retirement_age ?? 65);
  const [lifestyle, setLifestyle] = useState<RetirementData['desired_lifestyle'] | null>(
    existing?.desired_lifestyle ?? null
  );
  const [hasPension, setHasPension] = useState<boolean | null>(existing?.has_pension ?? null);

  const buildAndSave = () => {
    const data: RetirementData = {
      total_savings_range: savingsRange || 'Not provided',
      total_savings_estimate: savingsRange ? getRangeMidpoint(savingsRange) : 0,
      monthly_contribution: Number(monthlyContrib) || 0,
      employer_match: Number(employerMatch) || 0,
      target_retirement_age: retirementAge,
      desired_lifestyle: lifestyle ?? 'similar',
      has_pension: hasPension,
    };
    updateRetirement(data);
    markSectionComplete('retirement');

    // Skip education if no kids
    if (!intake.basics?.kids || intake.basics.kids.length === 0) {
      router.push('/intake/career');
    } else {
      router.push('/intake/education');
    }
  };

  // Step 0: Savings
  if (step === 0) {
    return (
      <QuestionCard
        question="Roughly, how much do you have saved for retirement right now?"
        helper="All accounts combined: 401(k), IRA, Roth IRA, pension value, etc. A range is perfectly fine."
        onNext={() => savingsRange && setStep(1)}
        onSkip={() => { setSavingsRange(''); setStep(1); }}
        nextDisabled={!savingsRange}
        showBack={false}
      >
        <RangeSelector
          ranges={SAVINGS_RANGES}
          selected={savingsRange}
          onSelect={setSavingsRange}
        />
      </QuestionCard>
    );
  }

  // Step 1: Monthly contributions
  if (step === 1) {
    return (
      <QuestionCard
        question="How much do you contribute to retirement accounts each month?"
        helper="Include your personal contributions only — we'll ask about employer match separately."
        onNext={() => setStep(15)}
        onBack={() => setStep(0)}
        onSkip={() => { setMonthlyContrib(0); setStep(15); }}
      >
        <NumberInput
          value={monthlyContrib}
          onChange={setMonthlyContrib}
          prefix="$"
          placeholder="e.g. 1,500"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 15: Employer match
  if (step === 15) {
    return (
      <QuestionCard
        question="Does your employer contribute to your retirement? If so, how much per month?"
        helper="Include 401(k) match, pension contributions, or other employer retirement contributions."
        onNext={() => setStep(2)}
        onBack={() => setStep(1)}
        onSkip={() => { setEmployerMatch(0); setStep(2); }}
      >
        <NumberInput
          value={employerMatch}
          onChange={setEmployerMatch}
          prefix="$"
          placeholder="e.g. 500"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step 2: Target retirement age
  if (step === 2) {
    return (
      <QuestionCard
        question="At what age do you hope to retire?"
        helper="Drag the slider to your ideal retirement age. This is your goal — not a commitment."
        onNext={() => setStep(3)}
        onBack={() => setStep(15)}
        onSkip={() => { setRetirementAge(65); setStep(3); }}
      >
        <SliderInput
          value={retirementAge}
          onChange={setRetirementAge}
          min={50}
          max={75}
          step={1}
          formatLabel={(v) => `Age ${v}`}
        />
      </QuestionCard>
    );
  }

  // Step 3: Lifestyle
  if (step === 3) {
    return (
      <QuestionCard
        question="What kind of lifestyle are you aiming for in retirement?"
        helper="This helps us estimate how much you'll need. Think about travel, activities, housing."
        onNext={() => lifestyle && setStep(4)}
        onBack={() => setStep(2)}
        onSkip={() => { setLifestyle('similar'); setStep(4); }}
        nextDisabled={!lifestyle}
      >
        <div className="space-y-3">
          <OptionButton
            label="Similar to today"
            description="Roughly the same spending as now"
            emoji="↔️"
            selected={lifestyle === 'similar'}
            onClick={() => setLifestyle('similar')}
          />
          <OptionButton
            label="More modest"
            description="Expect to spend less — smaller home, less travel"
            emoji="⬇️"
            selected={lifestyle === 'modest'}
            onClick={() => setLifestyle('modest')}
          />
          <OptionButton
            label="More comfortable"
            description="Expect to spend more — travel, experiences, maybe a second home"
            emoji="⬆️"
            selected={lifestyle === 'comfortable'}
            onClick={() => setLifestyle('comfortable')}
          />
          <OptionButton
            label="Not sure yet"
            emoji="🤷"
            selected={lifestyle === 'unsure'}
            onClick={() => setLifestyle('unsure')}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 4: Pension / Social Security
  if (step === 4) {
    return (
      <QuestionCard
        question="Do you have a pension or expect meaningful Social Security income in retirement?"
        helper="Even a rough 'yes' helps us show a more complete retirement picture."
        onNext={buildAndSave}
        onBack={() => setStep(3)}
        onSkip={() => { setHasPension(null); buildAndSave(); }}
        nextDisabled={hasPension === null}
        isLastQuestion
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — I have a pension or will get meaningful Social Security"
            emoji="✅"
            selected={hasPension === true}
            onClick={() => setHasPension(true)}
          />
          <OptionButton
            label="No — I'm not counting on either"
            emoji="❌"
            selected={hasPension === false}
            onClick={() => setHasPension(false)}
          />
          <OptionButton
            label="Not sure"
            emoji="🤷"
            selected={hasPension === null && step === 4 ? false : hasPension === null}
            onClick={() => setHasPension(null)}
          />
        </div>
      </QuestionCard>
    );
  }

  return null;
}
