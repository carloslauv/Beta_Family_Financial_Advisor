'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { IntakeData } from '@/types';

type ParentsData = IntakeData['parents'];

export default function ParentsPage() {
  const router = useRouter();
  const { intake, updateParents, markSectionComplete } = useIntake();
  const existing = intake.parents;

  const hasParents = (intake.basics?.parents?.length ?? 0) > 0;

  const [step, setStep] = useState(0);
  const [financialIndependence, setFinancialIndependence] = useState<
    ParentsData['financial_independence'] | null
  >(existing?.financial_independence ?? null);
  const [ltcInsurance, setLtcInsurance] = useState<boolean | null>(existing?.ltc_insurance ?? null);
  const [careLikelihood, setCareLikelihood] = useState<ParentsData['care_likelihood'] | null>(
    existing?.care_likelihood ?? null
  );
  const [primaryResponsibility, setPrimaryResponsibility] = useState<boolean | null>(
    existing?.primary_responsibility ?? null
  );
  const [monthlyContrib, setMonthlyContrib] = useState<number | ''>(
    existing?.monthly_contribution ?? 0
  );

  const buildAndSave = () => {
    const data: ParentsData = {
      financial_independence: financialIndependence ?? 'fully',
      ltc_insurance: ltcInsurance,
      care_likelihood: careLikelihood ?? 'no',
      primary_responsibility: primaryResponsibility,
      monthly_contribution: Number(monthlyContrib) || 0,
    };

    updateParents(data);
    markSectionComplete('parents');
    router.push('/intake/monthly');
  };

  // If no aging parents, show a simplified version
  if (!hasParents) {
    return (
      <QuestionCard
        question="Quick question about aging parents — do you anticipate any financial responsibility for a parent in the coming years?"
        helper="Even if your parents are fully independent today, this is worth a quick check."
        onNext={buildAndSave}
        onBack={() => router.push('/intake/career')}
        onSkip={buildAndSave}
        isLastQuestion
        showBack={true}
      >
        <div className="space-y-3">
          <OptionButton
            label="No — my parents are fully independent"
            emoji="✅"
            selected={financialIndependence === 'fully'}
            onClick={() => {
              setFinancialIndependence('fully');
              setCareLikelihood('no');
            }}
          />
          <OptionButton
            label="Maybe — it's possible in the future"
            emoji="🤷"
            selected={financialIndependence === 'mostly'}
            onClick={() => {
              setFinancialIndependence('mostly');
              setCareLikelihood('possibly');
            }}
          />
          <OptionButton
            label="Yes — I already contribute or expect to"
            emoji="🤝"
            selected={financialIndependence === 'partially' || financialIndependence === 'significantly'}
            onClick={() => {
              setFinancialIndependence('partially');
              setCareLikelihood('likely');
            }}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 0: Financial independence
  if (step === 0) {
    return (
      <QuestionCard
        question="How would you describe your parents' financial independence right now?"
        helper="This helps us understand the risk level and potential financial impact on your picture."
        onNext={() => financialIndependence && setStep(1)}
        onBack={() => router.push('/intake/career')}
        onSkip={() => { setFinancialIndependence('mostly'); setStep(1); }}
        nextDisabled={!financialIndependence}
        showBack={false}
      >
        <div className="space-y-3">
          <OptionButton
            label="Fully independent"
            description="They have their own resources and don't need my help"
            emoji="💪"
            selected={financialIndependence === 'fully'}
            onClick={() => setFinancialIndependence('fully')}
          />
          <OptionButton
            label="Mostly independent"
            description="Mostly self-sufficient with occasional help from me"
            emoji="🤝"
            selected={financialIndependence === 'mostly'}
            onClick={() => setFinancialIndependence('mostly')}
          />
          <OptionButton
            label="Partially dependent on me"
            description="I contribute to some of their expenses regularly"
            emoji="↔️"
            selected={financialIndependence === 'partially'}
            onClick={() => setFinancialIndependence('partially')}
          />
          <OptionButton
            label="Significantly dependent on me"
            description="I'm a primary source of their financial support"
            emoji="🏠"
            selected={financialIndependence === 'significantly'}
            onClick={() => setFinancialIndependence('significantly')}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 1: LTC insurance
  if (step === 1) {
    return (
      <QuestionCard
        question="Do either of your parents have long-term care insurance?"
        helper="LTC insurance can significantly reduce the financial burden if care is needed."
        onNext={() => setStep(2)}
        onBack={() => setStep(0)}
        onSkip={() => { setLtcInsurance(null); setStep(2); }}
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — at least one has LTC insurance"
            emoji="✅"
            selected={ltcInsurance === true}
            onClick={() => setLtcInsurance(true)}
          />
          <OptionButton
            label="No — neither has it"
            emoji="❌"
            selected={ltcInsurance === false}
            onClick={() => setLtcInsurance(false)}
          />
          <OptionButton
            label="I don't know"
            emoji="🤷"
            selected={ltcInsurance === null}
            onClick={() => setLtcInsurance(null)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 2: Care likelihood
  if (step === 2) {
    return (
      <QuestionCard
        question="Are your parents currently receiving care support, or do you expect they'll need it in the next 5 years?"
        helper="This helps us assess the potential impact on your finances over the medium term."
        onNext={() => careLikelihood && setStep(3)}
        onBack={() => setStep(1)}
        onSkip={() => { setCareLikelihood('possibly'); setStep(3); }}
        nextDisabled={!careLikelihood}
      >
        <div className="space-y-3">
          <OptionButton
            label="No — unlikely in the next 5 years"
            emoji="✅"
            selected={careLikelihood === 'no'}
            onClick={() => setCareLikelihood('no')}
          />
          <OptionButton
            label="Possibly"
            emoji="🔶"
            selected={careLikelihood === 'possibly'}
            onClick={() => setCareLikelihood('possibly')}
          />
          <OptionButton
            label="Likely"
            emoji="🔴"
            selected={careLikelihood === 'likely'}
            onClick={() => setCareLikelihood('likely')}
          />
          <OptionButton
            label="Already receiving care"
            emoji="🏥"
            selected={careLikelihood === 'already'}
            onClick={() => setCareLikelihood('already')}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 3: Responsibility
  if (step === 3) {
    return (
      <QuestionCard
        question="If care is needed, would the financial responsibility fall primarily on you?"
        helper="Understanding this helps us factor the right level of risk into your panorama."
        onNext={() => setStep(4)}
        onBack={() => setStep(2)}
        onSkip={() => { setPrimaryResponsibility(null); setStep(4); }}
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — primarily my responsibility"
            emoji="💰"
            selected={primaryResponsibility === true}
            onClick={() => setPrimaryResponsibility(true)}
          />
          <OptionButton
            label="Shared with siblings or others"
            emoji="👨‍👩‍👧‍👦"
            selected={primaryResponsibility === null}
            onClick={() => setPrimaryResponsibility(null)}
          />
          <OptionButton
            label="Not my responsibility"
            emoji="✅"
            selected={primaryResponsibility === false}
            onClick={() => setPrimaryResponsibility(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 4: Monthly contribution
  if (step === 4) {
    return (
      <QuestionCard
        question="Are you currently contributing to your parents' living expenses? If so, how much per month?"
        helper="Enter $0 if you're not contributing financially. This goes directly into your monthly cash flow calculation."
        onNext={buildAndSave}
        onBack={() => setStep(3)}
        onSkip={() => { setMonthlyContrib(0); buildAndSave(); }}
        isLastQuestion
      >
        <NumberInput
          value={monthlyContrib}
          onChange={setMonthlyContrib}
          prefix="$"
          placeholder="e.g. 500"
          suffix="/month"
          min={0}
        />
      </QuestionCard>
    );
  }

  return null;
}
