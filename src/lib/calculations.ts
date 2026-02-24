import { IntakeData, ComputedMetrics, DimensionResult, Panorama } from '@/types';
import { getEmergencyMonthsValue, generateId, formatCurrency, formatPercent } from '@/lib/utils';

// Future Value formula
function futureValue(pv: number, pmt: number, r: number, n: number): number {
  if (n <= 0) return pv;
  if (r === 0) return pv + pmt * n;
  return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

export function computeMetrics(data: Partial<IntakeData>): ComputedMetrics {
  const basics = data.basics;
  const retirement = data.retirement;
  const education = data.education;
  const career = data.career;
  const parents = data.parents;
  const monthly = data.monthly;

  // ── Net Worth ──────────────────────────────────────────────────────────────
  const retirementSavings = retirement?.total_savings_estimate ?? 0;
  const educationSavings =
    education?.plans.reduce((sum, p) => sum + (p.current_savings_estimate ?? 0), 0) ?? 0;
  const equityValue = career?.equity_value_estimate ?? 0;
  const stockOptions = career?.stock_options_value ?? 0;
  const emergencyFund =
    monthly
      ? (monthly.emergency_months_value ?? getEmergencyMonthsValue(monthly.emergency_months ?? '')) *
        (monthly.essential_expenses ?? 0)
      : 0;

  const totalAssets = retirementSavings + educationSavings + equityValue + stockOptions + emergencyFund;
  const totalDebt = (monthly?.total_debt_non_mortgage ?? 0) + (monthly?.mortgage_rent ?? 0) * 120; // rough mortgage balance = 10yr of payments
  const net_worth = totalAssets - totalDebt;

  // ── Monthly Cash Flow ───────────────────────────────────────────────────────
  const monthlyIncome = monthly?.household_income_monthly ?? 0;
  const essential = monthly?.essential_expenses ?? 0;
  const discretionary = monthly?.discretionary_spending ?? 0;
  const retirementContrib = (retirement?.monthly_contribution ?? 0) + (retirement?.employer_match ?? 0);
  const educationContrib = education?.plans.reduce((s, p) => s + (p.monthly_contribution ?? 0), 0) ?? 0;
  const parentContrib = parents?.monthly_contribution ?? 0;

  const monthly_total_savings = retirementContrib + educationContrib;
  const monthly_cash_flow =
    monthlyIncome - essential - discretionary - retirementContrib - educationContrib - parentContrib;

  // ── Savings Rate ────────────────────────────────────────────────────────────
  const savings_rate =
    monthlyIncome > 0 ? (monthly_total_savings / monthlyIncome) * 100 : 0;

  // ── Retirement Projection ───────────────────────────────────────────────────
  const userAge = basics?.user_age ?? 45;
  const targetAge = retirement?.target_retirement_age ?? 65;
  const yearsToRetirement = Math.max(0, targetAge - userAge);

  const annualRetirementContrib =
    ((retirement?.monthly_contribution ?? 0) + (retirement?.employer_match ?? 0)) * 12;

  const retirement_projected = futureValue(
    retirementSavings,
    annualRetirementContrib,
    0.07,
    yearsToRetirement
  );

  // Desired spending: lifestyle multiplier applied to current spending
  const lifestyleMap = {
    modest: 0.8,
    similar: 1.0,
    comfortable: 1.25,
    unsure: 1.0,
  };
  const lifestyleMultiplier =
    lifestyleMap[retirement?.desired_lifestyle ?? 'similar'];
  const currentAnnualSpending = (essential + discretionary) * 12;
  const desiredAnnualSpending = currentAnnualSpending * lifestyleMultiplier;
  const retirement_target = desiredAnnualSpending * 25; // 4% rule

  const retirement_percentage =
    retirement_target > 0 ? (retirement_projected / retirement_target) * 100 : 0;

  // ── Education Projection ────────────────────────────────────────────────────
  let education_total_needed = 0;
  let education_total_saved = 0;

  if (education && basics?.kids) {
    education.plans.forEach((plan, i) => {
      const childAge = basics.kids[i]?.age ?? 10;
      const yearsUntilCollege = Math.max(0, 18 - childAge);
      const baseCostMap = {
        public: 35_000,
        private: 65_000,
        trade: 15_000,
        unsure: 35_000,
      };
      const annualCost = baseCostMap[plan.goal] ?? 35_000;
      const inflatedAnnual = annualCost * Math.pow(1.05, yearsUntilCollege);
      const totalCost = inflatedAnnual * 4;

      const futureSavings = futureValue(
        plan.current_savings_estimate ?? 0,
        (plan.monthly_contribution ?? 0) * 12,
        0.06,
        yearsUntilCollege
      );

      education_total_needed += totalCost;
      education_total_saved += futureSavings;
    });
  }

  const education_funded_percentage =
    education_total_needed > 0
      ? Math.min(100, (education_total_saved / education_total_needed) * 100)
      : basics?.kids?.length === 0
      ? 100
      : 0;

  // ── Parent Care Risk ────────────────────────────────────────────────────────
  let parent_care_risk: 'low' | 'medium' | 'high' = 'low';
  if (parents) {
    const likelihood = parents.care_likelihood;
    const independence = parents.financial_independence;
    const isResponsible = parents.primary_responsibility;

    if (
      (likelihood === 'likely' || likelihood === 'already') &&
      (independence === 'partially' || independence === 'significantly') &&
      isResponsible
    ) {
      parent_care_risk = 'high';
    } else if (
      likelihood !== 'no' &&
      (independence === 'partially' || independence === 'significantly')
    ) {
      parent_care_risk = 'medium';
    }
  }

  // ── Emergency Fund ──────────────────────────────────────────────────────────
  const emergency_fund_months =
    monthly?.emergency_months_value ??
    getEmergencyMonthsValue(monthly?.emergency_months ?? 'Less than 1');

  // ── Dimension Scores (0-100) ─────────────────────────────────────────────────

  // Retirement score
  let retirementScore = Math.min(100, retirement_percentage);
  if (!retirement?.monthly_contribution || retirement.monthly_contribution === 0) {
    retirementScore = Math.max(0, retirementScore - 20);
  }

  // Education score
  let educationScore = 100;
  if (basics?.kids && basics.kids.length > 0) {
    educationScore = Math.min(100, education_funded_percentage);
  }

  // Career score
  let careerScore = 60; // baseline
  if (career) {
    if (career.path === 'founder') {
      if (career.profitable) careerScore = 75;
      if (career.considering_exit) careerScore = Math.max(careerScore - 10, 40);
      if (career.has_vc) careerScore = Math.max(careerScore - 5, 40);
    } else {
      const stabilityMap = { very_stable: 85, somewhat: 65, uncertain: 40 };
      careerScore = stabilityMap[career.income_stability ?? 'somewhat'];
      if (career.considering_change) careerScore = Math.max(careerScore - 15, 30);
    }
  }

  // Parents score
  let parentsScore = 80;
  if (parents) {
    if (parent_care_risk === 'high') parentsScore = 30;
    else if (parent_care_risk === 'medium') parentsScore = 55;
    if (!parents.ltc_insurance) parentsScore = Math.max(parentsScore - 10, 20);
  }

  // Monthly score
  let monthlyScore = 50;
  if (monthly) {
    if (monthly_cash_flow >= 0) monthlyScore += 20;
    else monthlyScore -= 20;
    if (emergency_fund_months >= 6) monthlyScore += 20;
    else if (emergency_fund_months >= 3) monthlyScore += 10;
    else monthlyScore -= 10;
    if (savings_rate >= 15) monthlyScore += 15;
    else if (savings_rate >= 10) monthlyScore += 5;
    else monthlyScore -= 10;
    monthlyScore = Math.max(0, Math.min(100, monthlyScore));
  }

  // ── Overall Score (weighted) ─────────────────────────────────────────────────
  const dimension_scores = {
    retirement: Math.round(retirementScore),
    education: Math.round(educationScore),
    career: Math.round(careerScore),
    parents: Math.round(parentsScore),
    monthly: Math.round(monthlyScore),
  };

  const overall_score = Math.round(
    dimension_scores.retirement * 0.3 +
      dimension_scores.education * 0.25 +
      dimension_scores.monthly * 0.25 +
      dimension_scores.parents * 0.1 +
      dimension_scores.career * 0.1
  );

  return {
    net_worth,
    monthly_cash_flow,
    savings_rate,
    retirement_projected,
    retirement_target,
    retirement_percentage,
    years_to_retirement: yearsToRetirement,
    education_funded_percentage,
    education_total_needed,
    education_total_saved,
    monthly_total_savings,
    monthly_surplus_deficit: monthly_cash_flow,
    emergency_fund_months,
    parent_care_risk,
    dimension_scores,
    overall_score,
  };
}

function getDimensionStatus(
  score: number
): 'on_track' | 'needs_attention' | 'behind' | 'uncertain' | 'unplanned' {
  if (score >= 75) return 'on_track';
  if (score >= 50) return 'needs_attention';
  if (score >= 25) return 'behind';
  return 'uncertain';
}

type MetricColor = 'good' | 'warn' | 'alert' | 'neutral';
type MetricItem = { label: string; value: string; color: MetricColor };

export function buildDimensionResults(
  data: Partial<IntakeData>,
  metrics: ComputedMetrics
): Panorama['dimensions'] {
  const scores = metrics.dimension_scores;

  // ── Retirement ─────────────────────────────────────────────────────────────
  const retirementMetrics: MetricItem[] = [
    {
      label: 'Current Savings',
      value: formatCurrency(data.retirement?.total_savings_estimate ?? 0),
      color: 'neutral' as const,
    },
    {
      label: 'Projected at Retirement',
      value: formatCurrency(metrics.retirement_projected),
      color:
        metrics.retirement_percentage >= 100
          ? 'good'
          : metrics.retirement_percentage >= 70
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'On-Track',
      value: formatPercent(Math.min(metrics.retirement_percentage, 999)),
      color:
        metrics.retirement_percentage >= 100
          ? 'good'
          : metrics.retirement_percentage >= 70
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'Years to Retirement',
      value: `${metrics.years_to_retirement} years`,
      color: 'neutral' as const,
    },
    {
      label: 'Monthly Contribution',
      value: formatCurrency(
        (data.retirement?.monthly_contribution ?? 0) + (data.retirement?.employer_match ?? 0)
      ) + '/mo',
      color:
        (data.retirement?.monthly_contribution ?? 0) > 0
          ? 'good'
          : ('alert' as const),
    },
  ];

  // ── Education ──────────────────────────────────────────────────────────────
  const hasKids = (data.basics?.kids?.length ?? 0) > 0;
  const educationMetrics: MetricItem[] = hasKids
    ? [
        {
          label: 'Education Savings',
          value: formatCurrency(metrics.education_total_saved),
          color: 'neutral' as const,
        },
        {
          label: 'Projected Need',
          value: formatCurrency(metrics.education_total_needed),
          color: 'neutral' as const,
        },
        {
          label: 'Funded',
          value: formatPercent(metrics.education_funded_percentage),
          color:
            metrics.education_funded_percentage >= 75
              ? 'good'
              : metrics.education_funded_percentage >= 40
              ? 'warn'
              : ('alert' as const),
        },
        {
          label: 'Monthly Contribution',
          value:
            formatCurrency(
              data.education?.plans.reduce((s, p) => s + (p.monthly_contribution ?? 0), 0) ?? 0
            ) + '/mo',
          color: 'neutral' as const,
        },
      ]
    : [
        {
          label: 'Status',
          value: 'No children',
          color: 'neutral' as const,
        },
      ];

  // ── Career ─────────────────────────────────────────────────────────────────
  const careerMetrics: MetricItem[] =
    data.career?.path === 'founder'
      ? [
          {
            label: 'Annual Draw / Salary',
            value: formatCurrency(data.career.annual_income ?? 0),
            color: 'neutral' as const,
          },
          {
            label: 'Equity Estimate',
            value: formatCurrency(data.career.equity_value_estimate ?? 0),
            color: 'neutral' as const,
          },
          {
            label: 'Profitable',
            value: data.career.profitable ? 'Yes' : data.career.profitable === false ? 'No' : 'Unknown',
            color: data.career.profitable ? ('good' as const) : ('warn' as const),
          },
          {
            label: 'Exit Horizon',
            value: data.career.exit_timeline ?? 'Not planned',
            color: 'neutral' as const,
          },
        ]
      : [
          {
            label: 'Annual Compensation',
            value: formatCurrency(data.career?.annual_income ?? 0),
            color: 'neutral' as const,
          },
          {
            label: 'Income Stability',
            value:
              data.career?.income_stability === 'very_stable'
                ? 'Very stable'
                : data.career?.income_stability === 'somewhat'
                ? 'Somewhat stable'
                : data.career?.income_stability === 'uncertain'
                ? 'Uncertain'
                : 'Unknown',
            color:
              data.career?.income_stability === 'very_stable'
                ? 'good'
                : data.career?.income_stability === 'uncertain'
                ? 'alert'
                : ('warn' as const),
          },
          {
            label: 'Stock Options / RSUs',
            value:
              (data.career?.stock_options_value ?? 0) > 0
                ? formatCurrency(data.career?.stock_options_value ?? 0)
                : 'None',
            color: 'neutral' as const,
          },
        ];

  // ── Parents ────────────────────────────────────────────────────────────────
  const parentsMetrics: MetricItem[] = [
    {
      label: 'Financial Independence',
      value:
        data.parents?.financial_independence === 'fully'
          ? 'Fully independent'
          : data.parents?.financial_independence === 'mostly'
          ? 'Mostly independent'
          : data.parents?.financial_independence === 'partially'
          ? 'Partially dependent'
          : data.parents?.financial_independence === 'significantly'
          ? 'Significantly dependent'
          : 'Unknown',
      color:
        data.parents?.financial_independence === 'fully'
          ? 'good'
          : data.parents?.financial_independence === 'mostly'
          ? 'good'
          : data.parents?.financial_independence === 'partially'
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'Care Likelihood',
      value:
        data.parents?.care_likelihood === 'no'
          ? 'Unlikely'
          : data.parents?.care_likelihood === 'possibly'
          ? 'Possible'
          : data.parents?.care_likelihood === 'likely'
          ? 'Likely'
          : data.parents?.care_likelihood === 'already'
          ? 'Already receiving care'
          : 'Unknown',
      color:
        data.parents?.care_likelihood === 'no'
          ? 'good'
          : data.parents?.care_likelihood === 'already' ||
            data.parents?.care_likelihood === 'likely'
          ? 'alert'
          : ('warn' as const),
    },
    {
      label: 'LTC Insurance',
      value:
        data.parents?.ltc_insurance === true
          ? 'Yes'
          : data.parents?.ltc_insurance === false
          ? 'No'
          : 'Unknown',
      color:
        data.parents?.ltc_insurance === true
          ? 'good'
          : data.parents?.ltc_insurance === false
          ? 'warn'
          : ('neutral' as const),
    },
    {
      label: 'Monthly Support',
      value:
        (data.parents?.monthly_contribution ?? 0) > 0
          ? formatCurrency(data.parents?.monthly_contribution ?? 0) + '/mo'
          : 'None currently',
      color: 'neutral' as const,
    },
  ];

  // ── Monthly ────────────────────────────────────────────────────────────────
  const monthlyMetrics: MetricItem[] = [
    {
      label: 'Monthly Income',
      value: formatCurrency(data.monthly?.household_income_monthly ?? 0) + '/mo',
      color: 'neutral' as const,
    },
    {
      label: 'Cash Flow',
      value: formatCurrency(metrics.monthly_cash_flow) + '/mo',
      color:
        metrics.monthly_cash_flow >= 0
          ? 'good'
          : metrics.monthly_cash_flow >= -500
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'Savings Rate',
      value: formatPercent(metrics.savings_rate),
      color:
        metrics.savings_rate >= 15
          ? 'good'
          : metrics.savings_rate >= 10
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'Emergency Fund',
      value: `${metrics.emergency_fund_months.toFixed(1)} months`,
      color:
        metrics.emergency_fund_months >= 6
          ? 'good'
          : metrics.emergency_fund_months >= 3
          ? 'warn'
          : ('alert' as const),
    },
    {
      label: 'Non-Mortgage Debt',
      value: formatCurrency(data.monthly?.total_debt_non_mortgage ?? 0),
      color:
        (data.monthly?.total_debt_non_mortgage ?? 0) === 0
          ? 'good'
          : (data.monthly?.total_debt_non_mortgage ?? 0) < 50_000
          ? 'warn'
          : ('alert' as const),
    },
  ];

  return {
    retirement: {
      status: !data.retirement ? 'unplanned' : getDimensionStatus(scores.retirement),
      score: scores.retirement,
      metrics: retirementMetrics,
      connection_to: 'career',
      connection_text:
        data.career?.equity_value_estimate && data.career.equity_value_estimate > 0
          ? `Your company equity (${formatCurrency(data.career.equity_value_estimate)}) represents ${Math.round((data.career.equity_value_estimate / Math.max(metrics.net_worth, 1)) * 100)}% of your estimated net worth — your retirement picture is meaningfully tied to your exit outcome.`
          : `Your retirement savings are your primary long-term asset. Consistent contributions are the most important lever you have.`,
    },
    education: {
      status: !hasKids
        ? 'unplanned'
        : !data.education
        ? 'unplanned'
        : getDimensionStatus(scores.education),
      score: scores.education,
      metrics: educationMetrics,
      connection_to: 'monthly',
      connection_text: hasKids
        ? `Education savings of ${formatCurrency(data.education?.plans.reduce((s, p) => s + p.monthly_contribution, 0) ?? 0)}/mo come out of your monthly cash flow — changes to one directly affect the other.`
        : `No dependent children — this dimension does not apply to your current situation.`,
    },
    career: {
      status: !data.career ? 'unplanned' : getDimensionStatus(scores.career),
      score: scores.career,
      metrics: careerMetrics,
      connection_to: 'retirement',
      connection_text:
        data.career?.path === 'founder'
          ? `As a founder, your income and exit outcome are the primary drivers of your entire financial picture. Your liquidity event could accelerate or significantly alter your retirement trajectory.`
          : `Your income stability is the engine powering all other dimensions. A career change or disruption would ripple through your retirement and monthly stability plans.`,
    },
    parents: {
      status: !data.parents ? 'unplanned' : getDimensionStatus(scores.parents),
      score: scores.parents,
      metrics: parentsMetrics,
      connection_to: 'monthly',
      connection_text:
        metrics.parent_care_risk === 'high'
          ? `High care likelihood combined with significant financial dependence means potential future care costs could substantially impact your monthly cash flow and retirement savings.`
          : metrics.parent_care_risk === 'medium'
          ? `There's meaningful potential for care support in the coming years. Planning now while your cash flow is healthy is far easier than managing it reactively.`
          : `Your parents appear largely independent. This is a positive in your picture — but revisiting this annually is wise as circumstances change.`,
    },
    monthly: {
      status: !data.monthly ? 'unplanned' : getDimensionStatus(scores.monthly),
      score: scores.monthly,
      metrics: monthlyMetrics,
      connection_to: 'retirement',
      connection_text: `Your monthly cash flow is the foundation everything else sits on. Your current ${metrics.monthly_cash_flow >= 0 ? 'surplus' : 'deficit'} of ${formatCurrency(Math.abs(metrics.monthly_cash_flow))}/mo ${metrics.monthly_cash_flow >= 0 ? 'creates room to build toward your goals' : 'is creating pressure across your other dimensions'}.`,
    },
  };
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 65) return 'On Track';
  if (score >= 50) return 'Moderate — Some areas need attention';
  if (score >= 35) return 'Developing — Several areas need focus';
  return 'Needs Work — Starting points identified';
}

export function buildPanorama(data: Partial<IntakeData>): Omit<Panorama, 'ai_narratives'> {
  const metrics = computeMetrics(data);
  const dimensions = buildDimensionResults(data, metrics);

  return {
    id: generateId(),
    generated_at: new Date(),
    net_worth_estimate: metrics.net_worth,
    monthly_cash_flow: metrics.monthly_cash_flow,
    savings_rate: metrics.savings_rate,
    overall_readiness_score: metrics.overall_score,
    overall_readiness_label: getReadinessLabel(metrics.overall_score),
    dimensions,
  };
}
