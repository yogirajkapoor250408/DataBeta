export type PresenceDomain =
  | 'revenue_growth'
  | 'profit_leak'
  | 'tax_deduction'
  | 'crm_pipeline'
  | 'cash_runway'
  | 'anomaly_audit'
  | 'ledger_sync';

export interface PresenceEvent {
  id: string;
  domain: PresenceDomain;
  headline: string;
  detail: string;
  persona: string;
  location: string;
  metricFormatted: string;
  timeAgo: string;
  iconType: 'revenue' | 'leak' | 'tax' | 'crm' | 'runway' | 'audit' | 'sync';
  verified: boolean;
}

// 1. Personas & Business Archetypes
const PERSONAS = [
  'SaaS Founder',
  'E-commerce Merchant',
  'Creative Agency Lead',
  'B2B Services Director',
  'Logistics Operator',
  'Healthcare Platform Founder',
  'Consultancy Partner',
  'Fintech Operator',
  'Direct-to-Consumer Brand',
  'Digital Product Studio',
  'Independent Software Vendor',
  'Boutique Advisory Firm',
];

// 2. Global Commercial Hubs
const LOCATIONS = [
  'Austin, TX',
  'San Francisco, CA',
  'London, UK',
  'New York, NY',
  'Singapore',
  'Berlin, DE',
  'Toronto, CA',
  'Zurich, CH',
  'Tokyo, JP',
  'Amsterdam, NL',
  'Sydney, AU',
  'Dubai, UAE',
  'Stockholm, SE',
  'Paris, FR',
  'Chicago, IL',
  'Seattle, WA',
  'Boston, MA',
  'Dublin, IE',
  'Melbourne, AU',
  'Hong Kong',
];

// 3. Structured Archetype Domain Blueprints
interface DomainBlueprint {
  domain: PresenceDomain;
  iconType: PresenceEvent['iconType'];
  metrics: string[];
  templates: {
    headline: (metric: string, persona: string, loc: string) => string;
    detail: (metric: string, persona: string, loc: string) => string;
  }[];
}

const DOMAIN_BLUEPRINTS: DomainBlueprint[] = [
  {
    domain: 'revenue_growth',
    iconType: 'revenue',
    metrics: [
      '$42,500 MRR',
      '$185,000 ARR',
      '$92,000 GMV',
      '$310,000 Annualized Revenue',
      '$64,000 Net Expansion',
      '$515,000 Gross Volume',
      '$28,400 Monthly Income',
      '$1.2M Run-rate',
      '$740,000 Q3 Bookings',
      '$128,000 Invoiced Sales',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} reached ${m}`,
        detail: (m) => `Synchronized 1,240 verified transaction entries across Stripe and Shopify channels.`,
      },
      {
        headline: (m, p, l) => `${p} unlocked ${m} in recurring revenue`,
        detail: () => `Achieved 34% net expansion margin across core enterprise customer segments.`,
      },
      {
        headline: (m, p, l) => `${l} enterprise team booked ${m}`,
        detail: () => `Modelled multi-month customer retention trajectory with zero manual spreadsheet reconciliation.`,
      },
      {
        headline: (m, p, l) => `${p} logged ${m} revenue milestone`,
        detail: () => `Identified 4.2x customer lifetime value acceleration in primary product offering.`,
      },
    ],
  },
  {
    domain: 'profit_leak',
    iconType: 'leak',
    metrics: [
      '$1,420/mo',
      '$2,850/mo',
      '$840/mo',
      '$4,600/yr',
      '$12,400/yr',
      '$3,200/mo',
      '$950/mo',
      '$6,800/yr',
      '$18,200/yr',
      '$540/mo',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} plugged a ${m} profit leak`,
        detail: () => `Eliminated redundant duplicate cloud subscriptions and legacy SaaS seat drift.`,
      },
      {
        headline: (m, p, l) => `${p} audited ${m} in vendor price creep`,
        detail: (m) => `Automated contract renewal re-negotiation preserving ${m} in net operating margin.`,
      },
      {
        headline: (m, p, l) => `Restored ${m} margin in ${l}`,
        detail: () => `Detected sub-zero unit margin on legacy client retainer before quarterly close.`,
      },
      {
        headline: (m, p, l) => `${p} eliminated ${m} expense outlier`,
        detail: () => `Autonomous leak detection engine flagged recurring logistics overcharge.`,
      },
    ],
  },
  {
    domain: 'tax_deduction',
    iconType: 'tax',
    metrics: [
      '$14,800',
      '$28,400',
      '$9,600',
      '$42,000',
      '$18,750',
      '$33,200',
      '$8,400',
      '$51,000',
      '$12,900',
      '$64,500',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} identified ${m} in Schedule C deductions`,
        detail: () => `Categorized software infrastructure, digital ads, and contractor fees under IRS Line 18 & 22.`,
      },
      {
        headline: (m, p, l) => `Calculated ${m} eligible tax deductions for ${p}`,
        detail: () => `Automated quarterly 1040-ES installment forecasting with zero CPA prep friction.`,
      },
      {
        headline: (m, p, l) => `${p} in ${l} saved ${m} on effective tax liability`,
        detail: () => `Mapped eligible equipment, shipping freight, and professional services deductions.`,
      },
      {
        headline: (m, p, l) => `Validated ${m} deductible write-offs in ${l}`,
        detail: () => `Direct ledger classification verified against Schedule C tax schedule specifications.`,
      },
    ],
  },
  {
    domain: 'crm_pipeline',
    iconType: 'crm',
    metrics: [
      '$65,000',
      '$120,000',
      '$45,000',
      '$250,000',
      '$88,000',
      '$35,000',
      '$180,000',
      '$500,000',
      '$22,500',
      '$95,000',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} closed a ${m} enterprise deal`,
        detail: () => `Moved sales opportunity from Proposal to Won with verified multi-year SLA.`,
      },
      {
        headline: (m, p, l) => `${p} advanced ${m} pipeline opportunity`,
        detail: () => `Completed executive stakeholder review with 80% weighted win probability.`,
      },
      {
        headline: (m, p, l) => `${l} team expanded account by ${m}`,
        detail: () => `Linked Customer 360 purchasing history to identify high-confidence expansion tier.`,
      },
      {
        headline: (m, p, l) => `${p} converted ${m} qualified opportunity`,
        detail: () => `Seamless Kanban stage progression with deterministic revenue forecasting.`,
      },
    ],
  },
  {
    domain: 'cash_runway',
    iconType: 'runway',
    metrics: [
      '18.4 Months',
      '24.0 Months',
      '14.2 Months',
      '36.0 Months',
      '16.8 Months',
      '28.5 Months',
      '12.0 Months',
      '42.0 Months',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} extended runway to ${m}`,
        detail: () => `Optimized working capital velocity and reduced daily cash burn rate by 18%.`,
      },
      {
        headline: (m, p, l) => `Secured ${m} cash buffer for ${p}`,
        detail: () => `Stabilized fixed overhead against trailing 90-day gross realized earnings.`,
      },
      {
        headline: (m, p, l) => `${l} operator modelled ${m} liquidity horizon`,
        detail: () => `Deterministic Monte Carlo cash runway simulator projected multi-quarter solvency.`,
      },
    ],
  },
  {
    domain: 'anomaly_audit',
    iconType: 'audit',
    metrics: [
      '3.4σ Outlier',
      '2.8σ Variance',
      '4.1σ Anomaly',
      '99.8% Confidence',
      '100% Reconciled',
      '0 Discrepancies',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} resolved a ${m} ledger anomaly`,
        detail: () => `Autonomous statistical auditor flagged unexpected transaction spike before month-end close.`,
      },
      {
        headline: (m, p, l) => `Clean audit completed in ${l} (${m})`,
        detail: () => `Verified 2,400+ ledger entries across dual-entry accounting categories.`,
      },
    ],
  },
  {
    domain: 'ledger_sync',
    iconType: 'sync',
    metrics: [
      '4,850 Records',
      '12,200 Records',
      '1,650 Records',
      '8,400 Records',
      '24,000 Records',
      '3,100 Records',
    ],
    templates: [
      {
        headline: (m, p, l) => `${p} in ${l} synchronized ${m}`,
        detail: () => `Universal CSV/Excel schema normalization completed in 420 milliseconds.`,
      },
      {
        headline: (m, p, l) => `Imported ${m} with zero data loss in ${l}`,
        detail: () => `Instant column mapper classified revenue, expense, customer, and category vectors.`,
      },
    ],
  },
];

const TIME_AGOS = [
  'Just now',
  '1m ago',
  '2m ago',
  '4m ago',
  '7m ago',
  '12m ago',
  '18m ago',
  '25m ago',
  '34m ago',
  '48m ago',
  '1h ago',
  '2h ago',
];

/**
 * Deterministic PRNG Generator using Mulberry32 algorithm.
 * Guarantees mathematical variety without external latency.
 */
function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Enterprise Presence Engine: Generates over 10,000+ distinct, high-context,
 * mathematically coherent message variants categorized by domain and persona.
 */
export class PresenceEngine {
  private static cachedLibrary: PresenceEvent[] | null = null;

  /**
   * Generates or returns the catalog of 10,000+ structured presence events.
   */
  public static getLibrary(totalTarget = 10000): PresenceEvent[] {
    if (this.cachedLibrary && this.cachedLibrary.length >= totalTarget) {
      return this.cachedLibrary;
    }

    const events: PresenceEvent[] = [];
    let idCounter = 1;
    const prng = createSeededRandom(42069);

    // Combinatorial Generation Loop
    for (const blueprint of DOMAIN_BLUEPRINTS) {
      for (const persona of PERSONAS) {
        for (const loc of LOCATIONS) {
          for (const metric of blueprint.metrics) {
            for (const template of blueprint.templates) {
              const headline = template.headline(metric, persona, loc);
              const detail = template.detail(metric, persona, loc);
              const timeIdx = Math.floor(prng() * TIME_AGOS.length);

              events.push({
                id: `presence-${idCounter++}`,
                domain: blueprint.domain,
                headline,
                detail,
                persona,
                location: loc,
                metricFormatted: metric,
                timeAgo: TIME_AGOS[timeIdx],
                iconType: blueprint.iconType,
                verified: true,
              });

              if (events.length >= totalTarget) break;
            }
            if (events.length >= totalTarget) break;
          }
          if (events.length >= totalTarget) break;
        }
        if (events.length >= totalTarget) break;
      }
      if (events.length >= totalTarget) break;
    }

    this.cachedLibrary = events;
    return events;
  }

  /**
   * Returns a contextual slice of live presence events tailored for specific app views.
   */
  public static getContextualEvents(
    context: 'landing' | 'overview' | 'crm' | 'finance' | 'insights' | 'reports',
    limit = 25
  ): PresenceEvent[] {
    const all = this.getLibrary();

    let targetDomains: PresenceDomain[] = [];
    switch (context) {
      case 'crm':
        targetDomains = ['crm_pipeline', 'revenue_growth'];
        break;
      case 'finance':
        targetDomains = ['tax_deduction', 'profit_leak', 'cash_runway', 'ledger_sync'];
        break;
      case 'insights':
        targetDomains = ['profit_leak', 'anomaly_audit', 'cash_runway'];
        break;
      case 'reports':
        targetDomains = ['revenue_growth', 'tax_deduction', 'ledger_sync'];
        break;
      case 'overview':
      case 'landing':
      default:
        targetDomains = [
          'revenue_growth',
          'profit_leak',
          'tax_deduction',
          'crm_pipeline',
          'cash_runway',
          'anomaly_audit',
        ];
        break;
    }

    const filtered = all.filter((e) => targetDomains.includes(e.domain));
    
    // Pick a deterministic yet rotating slice based on current hour/minute
    const now = new Date();
    const startIndex = (now.getHours() * 60 + now.getMinutes()) % Math.max(1, filtered.length - limit);
    return filtered.slice(startIndex, startIndex + limit);
  }

  /**
   * Returns total count of verified event variants currently indexed.
   */
  public static getTotalVariantsCount(): number {
    return this.getLibrary().length;
  }
}
