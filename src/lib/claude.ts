import Anthropic from '@anthropic-ai/sdk';
import { IntakeData, AIContent, ComputedMetrics } from '@/types';
import { formatCurrency, formatPercent } from './utils';

const SYSTEM_PROMPT = `You are the financial narrative engine for The Family Panorama, a tool that helps professionals and parents aged 35-50 see their full financial picture.

You will receive structured financial data for a user. Your job is to generate warm, clear, specific narrative content that helps them understand their situation.

TONE:
- Warm and empowering, never clinical or alarming
- Speak like a knowledgeable friend, not a financial advisor
- Use plain language — no jargon unless the user's data suggests financial sophistication
- Frame challenges as "starting points" not "problems"
- Be specific to THEIR numbers — never generic

RULES:
- Never give specific financial advice ("you should invest in X")
- Never make guarantees ("you will have $X by retirement")
- Always frame projections as estimates based on current trajectory
- Use phrases like "based on what you've shared" and "at current pace"
- Highlight connections between dimensions — this is the unique value
- When a dimension has missing data, acknowledge it without penalizing: "We don't have complete information on this yet — updating it will sharpen your picture"
- Keep each summary to 2-3 sentences max
- Keep interconnection body text to 2 sentences max
- Keep priority text to 2 sentences max

You must respond ONLY with valid JSON matching this exact structure (no markdown, no explanation, just raw JSON):
{
  "retirement_summary": "2-3 sentence narrative",
  "education_summary": "2-3 sentence narrative",
  "career_summary": "2-3 sentence narrative",
  "parents_summary": "2-3 sentence narrative",
  "monthly_summary": "2-3 sentence narrative",
  "interconnections": [
    { "icon": "emoji", "headline": "bold insight headline", "body": "2 sentence explanation" }
  ],
  "priorities": [
    { "level": "high|medium|low|keep", "text": "2 sentence insight", "action_teaser": "Coming soon: ..." }
  ]
}

Generate exactly 3-4 interconnections and exactly 4 priorities (mix of high, medium, low, keep).`;

function buildUserPrompt(data: Partial<IntakeData>, metrics: ComputedMetrics): string {
  const hasKids = (data.basics?.kids?.length ?? 0) > 0;
  const hasParents = (data.basics?.parents?.length ?? 0) > 0;

  return `Here is the user's financial data. Generate personalized narrative content for their Family Panorama.

USER CONTEXT:
- Age: ${data.basics?.user_age ?? 'unknown'}${data.basics?.partner_age ? `, partner age: ${data.basics.partner_age}` : ''}
- Children: ${hasKids ? data.basics?.kids?.map((k) => `age ${k.age}`).join(', ') : 'none'}
- Aging parents: ${hasParents ? data.basics?.parents?.length + ' parent(s)' : 'none'}
- Career type: ${data.career?.path ?? 'unknown'}

COMPUTED METRICS:
- Net worth: ${formatCurrency(metrics.net_worth)}
- Monthly cash flow: ${formatCurrency(metrics.monthly_cash_flow)}/mo (${metrics.monthly_cash_flow >= 0 ? 'surplus' : 'deficit'})
- Savings rate: ${formatPercent(metrics.savings_rate)}
- Retirement: ${formatPercent(Math.min(metrics.retirement_percentage, 999))} on track (${formatCurrency(metrics.retirement_projected)} projected vs ${formatCurrency(metrics.retirement_target)} target)
- Years to retirement: ${metrics.years_to_retirement}
- Education funded: ${formatPercent(metrics.education_funded_percentage)}${!hasKids ? ' (no children)' : ''}
- Emergency fund: ${metrics.emergency_fund_months.toFixed(1)} months
- Parent care risk: ${metrics.parent_care_risk}
- Overall readiness score: ${metrics.overall_score}/100

DIMENSION SCORES:
- Retirement: ${metrics.dimension_scores.retirement}/100
- Education: ${metrics.dimension_scores.education}/100
- Career: ${metrics.dimension_scores.career}/100
- Parents: ${metrics.dimension_scores.parents}/100
- Monthly: ${metrics.dimension_scores.monthly}/100

RETIREMENT DATA:
${data.retirement ? JSON.stringify(data.retirement, null, 2) : 'Not provided'}

EDUCATION DATA:
${data.education ? JSON.stringify(data.education, null, 2) : hasKids ? 'Has kids but no education data' : 'Not applicable'}

CAREER DATA:
${data.career ? JSON.stringify(data.career, null, 2) : 'Not provided'}

PARENTS DATA:
${data.parents ? JSON.stringify(data.parents, null, 2) : 'Not provided'}

MONTHLY DATA:
${data.monthly ? JSON.stringify(data.monthly, null, 2) : 'Not provided'}

Generate the JSON narrative content now. Remember: warm, specific, empowering. No generic advice.`;
}

export async function generatePanoramaNarratives(
  data: Partial<IntakeData>,
  metrics: ComputedMetrics
): Promise<AIContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key, return fallback narratives
  if (!apiKey) {
    return getFallbackNarratives(data, metrics);
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(data, metrics),
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const text = content.text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as AIContent;
    return parsed;
  } catch (error) {
    console.error('Claude API error:', error);
    return getFallbackNarratives(data, metrics);
  }
}

function getFallbackNarratives(data: Partial<IntakeData>, metrics: ComputedMetrics): AIContent {
  const hasKids = (data.basics?.kids?.length ?? 0) > 0;
  const isFounder = data.career?.path === 'founder';

  return {
    retirement_summary:
      metrics.retirement_percentage >= 80
        ? `Based on what you've shared, your retirement trajectory looks solid — you're projecting ${formatPercent(metrics.retirement_percentage)} of your target at your desired retirement age. At current pace, your consistent contributions are doing meaningful work for your future self.`
        : metrics.retirement_percentage >= 50
        ? `You have a foundation in place, but there's a meaningful gap between where you're headed and your retirement target. The good news: you have ${metrics.years_to_retirement} years for compounding to work in your favor.`
        : `Your retirement picture has room to grow — and that's a starting point, not a verdict. With ${metrics.years_to_retirement} years ahead, focused action now can significantly shift your trajectory.`,

    education_summary: hasKids
      ? metrics.education_funded_percentage >= 70
        ? `Your education savings are building well relative to projected costs. The consistency you've established gives your kids' future options room to grow.`
        : `Education funding is an area to build momentum. Even modest increases in monthly contributions now will compound meaningfully before your kids reach college age.`
      : `Education planning doesn't apply to your current picture. This dimension won't affect your overall readiness score.`,

    career_summary: isFounder
      ? data.career?.profitable
        ? `Your company is a meaningful part of your overall financial picture — both as income today and potential wealth tomorrow. A profitable, growing company creates optionality that few other financial tools can match.`
        : `Your company represents significant potential upside in your picture, alongside some income concentration risk. The path from here to your next milestone will shape multiple dimensions of your financial panorama.`
      : data.career?.income_stability === 'very_stable'
      ? `Your stable income is the engine powering everything else in your picture. It gives you the predictability to plan confidently across all five dimensions.`
      : `Your career trajectory is the foundation your entire financial picture is built on. Any changes to your income — up or down — ripple through retirement, education, and monthly sustainability.`,

    parents_summary:
      metrics.parent_care_risk === 'high'
        ? `Your parents' situation introduces real financial risk into your picture — not as a problem, but as something worth planning for deliberately. Having visibility on this now means you can prepare rather than react.`
        : metrics.parent_care_risk === 'medium'
        ? `There's some potential for your parents' needs to affect your finances in the coming years. Knowing this now gives you the head start to build flexibility into your plan.`
        : `Your parents appear largely financially independent, which is a positive in your overall picture. This dimension carries low risk for you at this stage.`,

    monthly_summary:
      metrics.monthly_cash_flow >= 500
        ? `Your monthly picture shows a healthy surplus — ${formatCurrency(metrics.monthly_cash_flow)}/mo is the fuel that feeds your savings, investments, and financial resilience. Your ${formatPercent(metrics.savings_rate)} savings rate is the single most important metric to protect.`
        : metrics.monthly_cash_flow >= 0
        ? `Your monthly finances are in balance, but the margin is tight. Protecting your current savings rate while finding room to build your emergency fund is the near-term priority.`
        : `Your monthly cash flow is running a deficit of ${formatCurrency(Math.abs(metrics.monthly_cash_flow))}/mo — this is the most pressing dimension in your picture, as it affects everything else. Understanding exactly where that gap comes from is the first step.`,

    interconnections: [
      {
        icon: '🔗',
        headline: isFounder
          ? 'Your exit outcome is your retirement plan'
          : 'Your income is the keystone of your panorama',
        body: isFounder
          ? `With ${formatCurrency(data.career?.equity_value_estimate ?? 0)} in estimated equity, your company represents a significant portion of your net worth. Your retirement trajectory changes dramatically depending on your exit outcome and timeline.`
          : `Every dollar you earn funds all five dimensions simultaneously. Income stability isn't just a career metric — it's the foundation your retirement, education savings, and monthly buffer all sit on.`,
      },
      {
        icon: '⚡',
        headline: 'Monthly cash flow connects everything',
        body: `Your ${metrics.monthly_cash_flow >= 0 ? formatCurrency(metrics.monthly_cash_flow) + ' monthly surplus' : formatCurrency(Math.abs(metrics.monthly_cash_flow)) + ' monthly deficit'} either fuels or strains every other dimension. Cash flow health is the lens through which we read everything else in your panorama.`,
      },
      {
        icon: '🕰️',
        headline: `Time is ${metrics.years_to_retirement > 15 ? 'your biggest asset' : 'becoming more valuable'}`,
        body: `With ${metrics.years_to_retirement} years to your target retirement age, compounding has ${metrics.years_to_retirement > 15 ? 'significant' : 'meaningful but limited'} room to work. The decisions you make in the next 2-3 years will have an outsized effect on your picture at retirement.`,
      },
      {
        icon: '🛡️',
        headline: 'Your emergency fund is your financial immune system',
        body: `At ${metrics.emergency_fund_months.toFixed(1)} months of expenses, your emergency cushion is ${metrics.emergency_fund_months >= 6 ? 'healthy' : metrics.emergency_fund_months >= 3 ? 'developing' : 'thin'}. A strong buffer protects your retirement contributions and education savings from life's disruptions.`,
      },
    ],

    priorities: [
      metrics.dimension_scores.monthly < 50
        ? {
            level: 'high',
            text: `Your monthly cash flow needs immediate attention — it's affecting your ability to save and build resilience across all dimensions. Understanding exactly where your spending is going is the critical first step.`,
            action_teaser: 'Coming soon: Cash flow analyzer to find your biggest levers',
          }
        : metrics.dimension_scores.retirement < 50
        ? {
            level: 'high',
            text: `Your retirement savings are behind your projected target. The most powerful move available to you right now is increasing your monthly contribution — even a small increase compounded over ${metrics.years_to_retirement} years makes a significant difference.`,
            action_teaser: 'Coming soon: Retirement gap calculator with scenario modeling',
          }
        : {
            level: 'high',
            text: `Your overall picture is in reasonable shape. The highest-impact focus area is closing the gap between where you are and where your strongest dimension could be — protecting what's working while strengthening what needs attention.`,
            action_teaser: 'Coming soon: Full gap map across all five dimensions',
          },
      {
        level: 'medium',
        text: hasKids
          ? `Education funding at ${formatPercent(metrics.education_funded_percentage)} means there's a projected gap to close before your ${data.basics?.kids?.[0] ? `oldest child (age ${data.basics.kids[0].age})` : 'children'} reaches college. Small, consistent monthly increases to 529 contributions now build significant momentum over time.`
          : `Your parent care situation carries ${metrics.parent_care_risk} risk. Building a dedicated contingency cushion — even a small one — would protect your other financial goals from a sudden care need.`,
        action_teaser: 'Coming soon: Education scenario planner with aid optimization',
      },
      {
        level: 'low',
        text: `Your emergency fund at ${metrics.emergency_fund_months.toFixed(1)} months ${metrics.emergency_fund_months < 6 ? 'is below the 6-month benchmark that gives most families meaningful resilience. Gradually building this over the next 12-18 months is a key defensive move.' : 'is in good shape. Maintaining this buffer is an important ongoing discipline.'}`,
        action_teaser: 'Coming soon: Emergency fund optimizer tied to your monthly picture',
      },
      {
        level: 'keep',
        text: metrics.savings_rate >= 10
          ? `Your savings rate of ${formatPercent(metrics.savings_rate)} is above the 10% threshold that most financial planners cite as the minimum for long-term wealth building. Keep protecting this discipline even as life expenses grow.`
          : `You've completed this assessment — that alone puts you ahead of most people your age in terms of clarity. The awareness of your full picture is the foundation for every good decision that follows.`,
        action_teaser: 'Coming soon: Monthly progress tracker to watch your panorama evolve',
      },
    ],
  };
}
