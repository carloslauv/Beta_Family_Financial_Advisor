'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { RangeSelector } from '@/components/intake/option-button';
import { IntakeData } from '@/types';
import { getRangeMidpoint } from '@/lib/utils';

type EducationData = NonNullable<IntakeData['education']>;
type EducationPlan = EducationData['plans'][0];

const SAVINGS_RANGES = ['$0', '$1K–$10K', '$10K–$30K', '$30K–$75K', '$75K–$150K', '$150K+'];

const GOAL_OPTIONS: Array<{
  value: EducationPlan['goal'];
  label: string;
  desc: string;
  emoji: string;
}> = [
  { value: 'public', label: 'Public university', desc: '~$35K/year', emoji: '🏛️' },
  { value: 'private', label: 'Private university', desc: '~$65K/year', emoji: '🎓' },
  { value: 'trade', label: 'Trade / vocational', desc: '~$15K/year', emoji: '🔧' },
  { value: 'unsure', label: "Not sure yet", desc: "We'll use public as the estimate", emoji: '🤷' },
];

export default function EducationPage() {
  const router = useRouter();
  const { intake, updateEducation, markSectionComplete } = useIntake();
  const existing = intake.education;
  const kids = intake.basics?.kids ?? [];

  const numKids = kids.length;

  // Per-child state
  const [goals, setGoals] = useState<(EducationPlan['goal'] | null)[]>(
    existing?.plans.map((p) => p.goal) ?? Array(numKids).fill(null)
  );
  const [savingsRanges, setSavingsRanges] = useState<string[]>(
    existing?.plans.map((p) => p.current_savings_range) ?? Array(numKids).fill('')
  );
  const [monthlyContribs, setMonthlyContribs] = useState<(number | '')[]>(
    existing?.plans.map((p) => p.monthly_contribution) ?? Array(numKids).fill('')
  );
  const [familyContrib, setFamilyContrib] = useState<boolean | null>(
    existing?.family_contribution ?? null
  );
  const [financialAid, setFinancialAid] = useState<boolean | null>(
    existing?.financial_aid ?? null
  );

  const [step, setStep] = useState(0);
  const [currentKidIndex, setCurrentKidIndex] = useState(0);

  const buildAndSave = () => {
    const plans: EducationPlan[] = Array.from({ length: numKids }, (_, i) => ({
      child_index: i,
      goal: goals[i] ?? 'unsure',
      current_savings_range: savingsRanges[i] || '$0',
      current_savings_estimate: getRangeMidpoint(savingsRanges[i] || '$0'),
      monthly_contribution: Number(monthlyContribs[i]) || 0,
    }));

    const data: EducationData = {
      plans,
      family_contribution: familyContrib,
      financial_aid: financialAid,
    };

    updateEducation(data);
    markSectionComplete('education');
    router.push('/intake/career');
  };

  const kidLabel = (i: number) => {
    const kid = kids[i];
    return kid ? `Child ${i + 1} (age ${kid.age})` : `Child ${i + 1}`;
  };

  // If no kids, skip this section
  if (numKids === 0) {
    buildAndSave();
    return null;
  }

  // Step 0–N: Goal per child
  if (step < numKids) {
    const i = step;
    return (
      <QuestionCard
        question={`What's your education goal for ${kidLabel(i)}?`}
        helper="This helps us calculate the projected cost and how much you'll need to save."
        onNext={() => {
          if (goals[i]) {
            if (step < numKids - 1) setStep(step + 1);
            else setStep(numKids); // Move to savings section
          }
        }}
        onBack={() => step > 0 ? setStep(step - 1) : router.push('/intake/retirement')}
        onSkip={() => {
          const updated = [...goals];
          updated[i] = 'unsure';
          setGoals(updated);
          if (step < numKids - 1) setStep(step + 1);
          else setStep(numKids);
        }}
        nextDisabled={!goals[i]}
        showBack={step > 0}
      >
        <div className="space-y-3">
          {GOAL_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              description={opt.desc}
              emoji={opt.emoji}
              selected={goals[i] === opt.value}
              onClick={() => {
                const updated = [...goals];
                updated[i] = opt.value;
                setGoals(updated);
              }}
            />
          ))}
        </div>
      </QuestionCard>
    );
  }

  // Step N: Current education savings (shared question)
  if (step === numKids) {
    return (
      <QuestionCard
        question={
          numKids === 1
            ? "How much do you currently have saved for their education?"
            : "How much do you have saved for education across all your kids?"
        }
        helper="529 accounts, UGMA/UTMA, savings bonds, or other dedicated accounts. A range is fine."
        onNext={() => setStep(numKids + 1)}
        onBack={() => setStep(numKids - 1)}
        onSkip={() => {
          setSavingsRanges(Array(numKids).fill('$0'));
          setStep(numKids + 1);
        }}
      >
        {numKids === 1 ? (
          <RangeSelector
            ranges={SAVINGS_RANGES}
            selected={savingsRanges[0]}
            onSelect={(r) => setSavingsRanges([r])}
          />
        ) : (
          <div className="space-y-4">
            {Array.from({ length: numKids }, (_, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-gray-600 mb-2">{kidLabel(i)}</p>
                <RangeSelector
                  ranges={SAVINGS_RANGES}
                  selected={savingsRanges[i]}
                  onSelect={(r) => {
                    const updated = [...savingsRanges];
                    updated[i] = r;
                    setSavingsRanges(updated);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </QuestionCard>
    );
  }

  // Step N+1: Monthly contributions
  if (step === numKids + 1) {
    return (
      <QuestionCard
        question="How much do you contribute to education savings each month?"
        helper="Total across all children. Even a small consistent amount makes a big difference over time."
        onNext={() => setStep(numKids + 2)}
        onBack={() => setStep(numKids)}
        onSkip={() => { setMonthlyContribs(Array(numKids).fill(0)); setStep(numKids + 2); }}
      >
        <NumberInput
          value={monthlyContribs[0] ?? ''}
          onChange={(v) => setMonthlyContribs([v])}
          prefix="$"
          placeholder="e.g. 500"
          suffix="/month total"
          min={0}
        />
      </QuestionCard>
    );
  }

  // Step N+2: Family contribution
  if (step === numKids + 2) {
    return (
      <QuestionCard
        question="Is extended family (grandparents, etc.) likely to contribute to education costs?"
        helper="Even 'maybe' helps us show a more realistic funding picture."
        onNext={() => setStep(numKids + 3)}
        onBack={() => setStep(numKids + 1)}
        onSkip={() => { setFamilyContrib(null); setStep(numKids + 3); }}
        nextDisabled={familyContrib === undefined}
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — family will contribute"
            emoji="👨‍👩‍👧"
            selected={familyContrib === true}
            onClick={() => setFamilyContrib(true)}
          />
          <OptionButton
            label="Maybe — it's possible"
            emoji="🤷"
            selected={familyContrib === null}
            onClick={() => setFamilyContrib(null)}
          />
          <OptionButton
            label="No — it's all on us"
            emoji="💪"
            selected={familyContrib === false}
            onClick={() => setFamilyContrib(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step N+3: Financial aid
  if (step === numKids + 3) {
    return (
      <QuestionCard
        question="Are you planning on financial aid being part of the picture?"
        helper="Even if you think you won't qualify, it's worth knowing if aid is in your plan."
        onNext={buildAndSave}
        onBack={() => setStep(numKids + 2)}
        onSkip={() => { setFinancialAid(null); buildAndSave(); }}
        nextDisabled={financialAid === undefined}
        isLastQuestion
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — we're counting on financial aid"
            emoji="✅"
            selected={financialAid === true}
            onClick={() => setFinancialAid(true)}
          />
          <OptionButton
            label="Maybe — we'll apply and see"
            emoji="🤷"
            selected={financialAid === null}
            onClick={() => setFinancialAid(null)}
          />
          <OptionButton
            label="No — we're planning to cover it ourselves"
            emoji="💰"
            selected={financialAid === false}
            onClick={() => setFinancialAid(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  return null;
}
