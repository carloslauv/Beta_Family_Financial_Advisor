'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { IntakeData } from '@/types';

type BasicsData = IntakeData['basics'];

export default function BasicsPage() {
  const router = useRouter();
  const { intake, updateBasics, markSectionComplete } = useIntake();

  const existing = intake.basics;

  const [userAge, setUserAge] = useState<number | ''>(existing?.user_age ?? '');
  const [partnerAge, setPartnerAge] = useState<number | ''>(existing?.partner_age ?? '');
  const [hasPartner, setHasPartner] = useState<boolean | null>(
    existing?.partner_age !== undefined ? true : null
  );
  const [numKids, setNumKids] = useState<number | ''>(
    existing?.kids?.length !== undefined ? existing.kids.length : ''
  );
  const [kidAges, setKidAges] = useState<(number | '')[]>(
    existing?.kids?.map((k) => k.age) ?? []
  );
  const [numParents, setNumParents] = useState<number | ''>(
    existing?.parents?.length !== undefined ? existing.parents.length : ''
  );
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(existing?.has_business ?? null);

  const [step, setStep] = useState(0);

  const TOTAL_STEPS = 5; // age, partner, kids/ages, parents, business

  const buildAndSave = () => {
    const kids = (kidAges || []).slice(0, Number(numKids) || 0).map((age, i) => ({
      age: Number(age) || 10,
      name: undefined,
    }));

    const parents: BasicsData['parents'] = [];
    for (let i = 0; i < (Number(numParents) || 0); i++) {
      parents.push({ age: 70, relationship: 'parent' });
    }

    const data: BasicsData = {
      user_age: Number(userAge) || 40,
      partner_age: hasPartner && partnerAge !== '' ? Number(partnerAge) : undefined,
      kids,
      parents,
      has_business: hasBusiness ?? false,
    };

    updateBasics(data);
    markSectionComplete('basics');
    router.push('/intake/retirement');
  };

  const skip = () => {
    buildAndSave();
  };

  // Step 0: Age
  if (step === 0) {
    return (
      <QuestionCard
        question="Let's start with the basics. How old are you?"
        helper="This helps us calculate your years to retirement and timeline across all five dimensions."
        onNext={() => {
          if (userAge !== '') setStep(1);
        }}
        onSkip={() => { setUserAge(40); setStep(1); }}
        nextDisabled={userAge === ''}
        showBack={false}
      >
        <NumberInput
          value={userAge}
          onChange={setUserAge}
          placeholder="e.g. 42"
          suffix="years old"
          min={18}
          max={80}
        />
      </QuestionCard>
    );
  }

  // Step 1: Partner
  if (step === 1) {
    return (
      <QuestionCard
        question="Do you have a partner or spouse whose finances are part of this picture?"
        onNext={() => {
          if (hasPartner === false) { setStep(2); }
          else if (hasPartner === true) { setStep(1.5 as unknown as number); setStep(10); } // inner partner age step
          else setStep(2);
        }}
        onBack={() => setStep(0)}
        onSkip={() => setStep(2)}
        nextDisabled={hasPartner === null}
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes, I have a partner / spouse"
            selected={hasPartner === true}
            onClick={() => setHasPartner(true)}
          />
          <OptionButton
            label="No, just me"
            selected={hasPartner === false}
            onClick={() => setHasPartner(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 10 (partner age)
  if (step === 10) {
    return (
      <QuestionCard
        question="How old is your partner?"
        onNext={() => setStep(2)}
        onBack={() => setStep(1)}
        onSkip={() => setStep(2)}
        nextDisabled={partnerAge === ''}
      >
        <NumberInput
          value={partnerAge}
          onChange={setPartnerAge}
          placeholder="e.g. 40"
          suffix="years old"
          min={18}
          max={80}
        />
      </QuestionCard>
    );
  }

  // Step 2: Kids
  if (step === 2) {
    return (
      <QuestionCard
        question="Do you have children? If so, how many?"
        helper="We'll tailor the education section based on your kids' ages."
        onNext={() => {
          if (numKids === '' || numKids === 0) {
            setNumKids(0);
            setKidAges([]);
            setStep(3);
          } else {
            setKidAges(Array(Number(numKids)).fill(''));
            setStep(20);
          }
        }}
        onBack={() => setStep(hasPartner ? 10 : 1)}
        onSkip={() => { setNumKids(0); setKidAges([]); setStep(3); }}
        nextDisabled={numKids === ''}
      >
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((n) => (
            <OptionButton
              key={n}
              label={n === 0 ? 'No children' : `${n} child${n > 1 ? 'ren' : ''}`}
              selected={numKids === n}
              onClick={() => setNumKids(n)}
            />
          ))}
          <OptionButton
            label="5 or more"
            selected={Number(numKids) >= 5}
            onClick={() => setNumKids(5)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 20: Kid ages
  if (step === 20) {
    const count = Number(numKids) || 0;
    return (
      <QuestionCard
        question={`What are your ${count === 1 ? "child's age" : "children's ages"}?`}
        helper="Approximate ages are fine — we'll use these to calculate education timelines."
        onNext={() => setStep(3)}
        onBack={() => setStep(2)}
        onSkip={() => { setKidAges(Array(count).fill(10)); setStep(3); }}
      >
        <div className="space-y-3">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24 shrink-0">
                Child {i + 1} age:
              </span>
              <NumberInput
                value={kidAges[i] ?? ''}
                onChange={(v) => {
                  const updated = [...kidAges];
                  updated[i] = v;
                  setKidAges(updated);
                }}
                placeholder="Age"
                min={0}
                max={25}
              />
            </div>
          ))}
        </div>
      </QuestionCard>
    );
  }

  // Step 3: Parents
  if (step === 3) {
    return (
      <QuestionCard
        question="Do you have aging parents whose financial situation might affect yours?"
        helper="Even if they're fully independent today, we'll factor in potential future scenarios."
        onNext={() => setStep(4)}
        onBack={() => (numKids === 0 ? setStep(2) : setStep(20))}
        onSkip={() => { setNumParents(0); setStep(4); }}
        nextDisabled={numParents === ''}
      >
        <div className="space-y-3">
          {[0, 1, 2].map((n) => (
            <OptionButton
              key={n}
              label={
                n === 0
                  ? 'No aging parents to consider'
                  : `${n} parent${n > 1 ? 's' : ''}`
              }
              selected={numParents === n}
              onClick={() => setNumParents(n)}
            />
          ))}
          <OptionButton
            label="3 or more"
            selected={Number(numParents) >= 3}
            onClick={() => setNumParents(3)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 4: Business
  if (step === 4) {
    return (
      <QuestionCard
        question="Do you own a business or have significant company equity?"
        helper="This determines whether we show you the founder track or employee track in the career section."
        onNext={buildAndSave}
        onBack={() => setStep(3)}
        onSkip={() => { setHasBusiness(false); buildAndSave(); }}
        nextDisabled={hasBusiness === null}
        isLastQuestion
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — I own a business or have equity"
            description="Founder, co-founder, partner, or significant equity stake"
            emoji="🏢"
            selected={hasBusiness === true}
            onClick={() => setHasBusiness(true)}
          />
          <OptionButton
            label="No — I'm an employee"
            description="Salary, bonus, RSUs — but no ownership stake"
            emoji="💼"
            selected={hasBusiness === false}
            onClick={() => setHasBusiness(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  return null;
}
