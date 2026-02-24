'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { QuestionCard, NumberInput } from '@/components/intake/question-card';
import { OptionButton } from '@/components/intake/option-button';
import { RangeSelector } from '@/components/intake/option-button';
import { IntakeData } from '@/types';
import { getRangeMidpoint } from '@/lib/utils';

type CareerData = IntakeData['career'];

const EQUITY_RANGES = [
  '$0–$250K',
  '$250K–$1M',
  '$1M–$3M',
  '$3M–$10M',
  '$10M–$30M',
  '$30M+',
];

export default function CareerPage() {
  const router = useRouter();
  const { intake, updateCareer, markSectionComplete } = useIntake();
  const existing = intake.career;
  const hasBusiness = intake.basics?.has_business ?? false;

  const [step, setStep] = useState(0);
  const [annualIncome, setAnnualIncome] = useState<number | ''>(existing?.annual_income ?? '');

  // Founder-specific
  const [equityRange, setEquityRange] = useState(existing?.equity_value_range ?? '');
  const [consideringExit, setConsideringExit] = useState<boolean | null>(
    existing?.considering_exit ?? null
  );
  const [exitTimeline, setExitTimeline] = useState(existing?.exit_timeline ?? '');
  const [hasVC, setHasVC] = useState<boolean | null>(existing?.has_vc ?? null);
  const [profitable, setProfitable] = useState<boolean | null>(existing?.profitable ?? null);

  // Employee-specific
  const [stability, setStability] = useState<CareerData['income_stability'] | null>(
    existing?.income_stability ?? null
  );
  const [consideringChange, setConsideringChange] = useState<boolean | null>(
    existing?.considering_change ?? null
  );
  const [stockOptions, setStockOptions] = useState<number | ''>(
    existing?.stock_options_value ?? ''
  );

  const buildAndSave = () => {
    const base = {
      path: hasBusiness ? ('founder' as const) : ('employee' as const),
      annual_income: Number(annualIncome) || 0,
    };

    let data: CareerData;

    if (hasBusiness) {
      data = {
        ...base,
        equity_value_range: equityRange || 'Not provided',
        equity_value_estimate: equityRange ? getRangeMidpoint(equityRange) : 0,
        considering_exit: consideringExit,
        exit_timeline: exitTimeline || undefined,
        has_vc: hasVC ?? false,
        profitable: profitable ?? false,
      };
    } else {
      data = {
        ...base,
        income_stability: stability ?? 'somewhat',
        considering_change: consideringChange,
        stock_options_value: Number(stockOptions) || 0,
      };
    }

    updateCareer(data);
    markSectionComplete('career');
    router.push('/intake/parents');
  };

  // Step 0: Annual income
  if (step === 0) {
    return (
      <QuestionCard
        question={
          hasBusiness
            ? "What's your annual salary or draw from your company?"
            : "What's your approximate total annual compensation?"
        }
        helper={
          hasBusiness
            ? "Your salary/draw — separate from company equity or distributions."
            : "Include base salary + target bonus + RSU vesting value if applicable."
        }
        onNext={() => setStep(1)}
        onBack={() => router.push('/intake/education')}
        onSkip={() => { setAnnualIncome(0); setStep(1); }}
      >
        <NumberInput
          value={annualIncome}
          onChange={setAnnualIncome}
          prefix="$"
          placeholder="e.g. 200,000"
          suffix="/year"
          min={0}
        />
      </QuestionCard>
    );
  }

  // ─── FOUNDER PATH ────────────────────────────────────────────────────────────

  if (hasBusiness) {
    // Step 1: Equity value
    if (step === 1) {
      return (
        <QuestionCard
          question="What's your best estimate of your equity or ownership stake's current value?"
          helper="This is your gut estimate — it doesn't need to be precise. We'll show how different outcomes affect your picture."
          onNext={() => equityRange && setStep(2)}
          onBack={() => setStep(0)}
          onSkip={() => { setEquityRange(''); setStep(2); }}
          nextDisabled={!equityRange}
        >
          <RangeSelector
            ranges={EQUITY_RANGES}
            selected={equityRange}
            onSelect={setEquityRange}
          />
        </QuestionCard>
      );
    }

    // Step 2: Profitable
    if (step === 2) {
      return (
        <QuestionCard
          question="Is your company currently profitable or cash-flow positive?"
          helper="This gives us a signal on the stability of your income and company trajectory."
          onNext={() => profitable !== null && setStep(3)}
          onBack={() => setStep(1)}
          onSkip={() => { setProfitable(null); setStep(3); }}
          nextDisabled={profitable === null}
        >
          <div className="space-y-3">
            <OptionButton
              label="Yes — profitable / cash-flow positive"
              emoji="✅"
              selected={profitable === true}
              onClick={() => setProfitable(true)}
            />
            <OptionButton
              label="Not yet — investing in growth"
              emoji="📈"
              selected={profitable === false}
              onClick={() => setProfitable(false)}
            />
          </div>
        </QuestionCard>
      );
    }

    // Step 3: Considering exit
    if (step === 3) {
      return (
        <QuestionCard
          question="Are you considering a company exit (sale, merger, IPO) in the next 1–5 years?"
          helper="This affects how we show your equity contributing to your retirement and net worth."
          onNext={() => setStep(consideringExit === true ? 35 : 4)}
          onBack={() => setStep(2)}
          onSkip={() => { setConsideringExit(null); setStep(4); }}
          nextDisabled={consideringExit === undefined}
        >
          <div className="space-y-3">
            <OptionButton
              label="Yes — actively working toward an exit"
              emoji="🎯"
              selected={consideringExit === true}
              onClick={() => setConsideringExit(true)}
            />
            <OptionButton
              label="Maybe — it's on the horizon but not immediate"
              emoji="🔭"
              selected={consideringExit === null}
              onClick={() => setConsideringExit(null)}
            />
            <OptionButton
              label="No — not planning an exit anytime soon"
              emoji="🏗️"
              selected={consideringExit === false}
              onClick={() => setConsideringExit(false)}
            />
          </div>
        </QuestionCard>
      );
    }

    // Step 35: Exit timeline (only if considering exit)
    if (step === 35) {
      return (
        <QuestionCard
          question="What's your rough exit timeline?"
          onNext={() => setStep(4)}
          onBack={() => setStep(3)}
          onSkip={() => { setExitTimeline(''); setStep(4); }}
        >
          <div className="space-y-3">
            {['1–2 years', '2–3 years', '3–5 years', '5+ years'].map((t) => (
              <OptionButton
                key={t}
                label={t}
                selected={exitTimeline === t}
                onClick={() => setExitTimeline(t)}
              />
            ))}
          </div>
        </QuestionCard>
      );
    }

    // Step 4: VC investors
    if (step === 4) {
      return (
        <QuestionCard
          question="Do you have VC or institutional investors?"
          helper="VC investment can affect your exit options and proceeds — this gives us a more complete picture."
          onNext={buildAndSave}
          onBack={() => setStep(consideringExit === true ? 35 : 3)}
          onSkip={() => { setHasVC(null); buildAndSave(); }}
          nextDisabled={hasVC === null && step === 4 ? false : hasVC === null}
          isLastQuestion
        >
          <div className="space-y-3">
            <OptionButton
              label="Yes — VC or institutional investors"
              emoji="💼"
              selected={hasVC === true}
              onClick={() => setHasVC(true)}
            />
            <OptionButton
              label="No — bootstrapped or family/friends"
              emoji="🌱"
              selected={hasVC === false}
              onClick={() => setHasVC(false)}
            />
          </div>
        </QuestionCard>
      );
    }
  }

  // ─── EMPLOYEE PATH ────────────────────────────────────────────────────────────

  // Step 1: Income stability
  if (step === 1) {
    return (
      <QuestionCard
        question="How stable is your current income?"
        helper="This is a gut check — it helps us understand the reliability of the income powering your plan."
        onNext={() => stability && setStep(2)}
        onBack={() => setStep(0)}
        onSkip={() => { setStability('somewhat'); setStep(2); }}
        nextDisabled={!stability}
      >
        <div className="space-y-3">
          <OptionButton
            label="Very stable"
            description="Secure position, consistent income, low risk of change"
            emoji="🔒"
            selected={stability === 'very_stable'}
            onClick={() => setStability('very_stable')}
          />
          <OptionButton
            label="Somewhat stable"
            description="Generally stable but some uncertainty"
            emoji="〰️"
            selected={stability === 'somewhat'}
            onClick={() => setStability('somewhat')}
          />
          <OptionButton
            label="Uncertain"
            description="Industry changes, role at risk, or high volatility"
            emoji="🌊"
            selected={stability === 'uncertain'}
            onClick={() => setStability('uncertain')}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 2: Career change
  if (step === 2) {
    return (
      <QuestionCard
        question="Are you considering a career change, job switch, or career pivot in the next 1–3 years?"
        helper="A potential income gap or transition period can meaningfully affect your financial picture."
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
        onSkip={() => { setConsideringChange(null); setStep(3); }}
      >
        <div className="space-y-3">
          <OptionButton
            label="Yes — I'm actively considering a change"
            emoji="🔀"
            selected={consideringChange === true}
            onClick={() => setConsideringChange(true)}
          />
          <OptionButton
            label="Maybe — it's on my mind"
            emoji="🤔"
            selected={consideringChange === null}
            onClick={() => setConsideringChange(null)}
          />
          <OptionButton
            label="No — I'm staying the course"
            emoji="➡️"
            selected={consideringChange === false}
            onClick={() => setConsideringChange(false)}
          />
        </div>
      </QuestionCard>
    );
  }

  // Step 3: Stock options / RSUs
  if (step === 3) {
    return (
      <QuestionCard
        question="Do you have unvested stock options or RSUs? If so, what's their approximate current value?"
        helper="Enter $0 if you don't have equity compensation — that's completely normal."
        onNext={buildAndSave}
        onBack={() => setStep(2)}
        onSkip={() => { setStockOptions(0); buildAndSave(); }}
        isLastQuestion
      >
        <NumberInput
          value={stockOptions}
          onChange={setStockOptions}
          prefix="$"
          placeholder="e.g. 50,000"
          min={0}
        />
      </QuestionCard>
    );
  }

  return null;
}
