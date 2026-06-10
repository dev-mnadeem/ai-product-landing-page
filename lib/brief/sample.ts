import type { CampaignBrief } from "./types";

/**
 * The demo brief the app boots with. It lives in one place so the sections,
 * the export and the strategy generator all describe the same campaign.
 */
export const SAMPLE_BRIEF: CampaignBrief = {
  projectName: "NovaFlow Launch Campaign",
  client: "TechNova Inc.",
  clientDetails:
    "TechNova Inc. is a global SaaS company specializing in AI-driven business solutions. Founded in 2018, they have grown to serve over 10,000 enterprise clients worldwide. Their mission is to democratize AI technology for businesses of all sizes through intuitive, scalable platforms.",
  product: "NovaFlow",
  productDetails:
    "NovaFlow is TechNova's AI-powered workflow automation product. It helps businesses streamline operations by identifying bottlenecks, suggesting optimizations, and implementing process improvements. It integrates with existing enterprise systems and requires minimal technical expertise.",
  audience:
    "C-level executives and IT decision makers at mid to large enterprises",
  mandatoryRequirements:
    'All materials must include TechNova’s official logo and the tagline "Intelligence Simplified". Campaign must align with the brand palette (navy blue #1e3a8a, teal #0d9488, white). Avoid direct competitor comparisons. Ensure GDPR compliance for all data collection. Target audience: C-level executives and IT decision makers in mid to large enterprises.',
  marketBackground:
    "The AI workflow automation market is experiencing rapid growth, with a projected CAGR of 23.5% through 2028. Key drivers include digital transformation initiatives, remote work trends, and increasing demand for operational efficiency. NovaFlow positions itself in the mid-market segment.",
  competitors: [
    {
      name: "UiPath",
      note: "Market leader with 30% market share, strong enterprise focus, complex implementation.",
    },
    {
      name: "Automation Anywhere",
      note: "Cloud-native platform, good for SMBs, limited AI capabilities.",
    },
    {
      name: "Microsoft Power Automate",
      note: "Office 365 integration, basic automation, limited enterprise features.",
    },
    {
      name: "Zapier",
      note: "Simple workflow automation, limited enterprise security, no AI features.",
    },
  ],
  previousCampaigns: [
    {
      label: "Q3 2023 Campaign",
      detail:
        '"Automate in 30 Days" generated a 15% increase in trial signups but low conversion, attributed to complexity-led messaging.',
    },
    {
      label: "Key Learnings",
      detail:
        "Technical audiences prefer ROI-focused messaging over feature lists. Case studies with specific metrics outperform generic testimonials. Video demos lift conversion.",
    },
  ],
  objectives: [
    {
      title: "Increase Brand Awareness",
      detail:
        "Achieve 40% increase in brand recognition among target audience within 6 months through strategic content marketing and digital advertising.",
    },
    {
      title: "Drive Lead Generation",
      detail:
        "Generate 500 qualified leads per month through targeted campaigns and conversion-optimized landing pages.",
    },
    {
      title: "Improve Market Position",
      detail:
        "Establish thought leadership in the AI automation space and differentiate from competitors through a unique value proposition.",
    },
  ],
  successMetrics: [
    {
      title: "Brand Awareness",
      metrics: [
        "Brand recall: 40% increase",
        "Social media mentions: +60%",
        "Website traffic: +50%",
      ],
    },
    {
      title: "Lead Generation",
      metrics: [
        "Qualified leads: 500/month",
        "Conversion rate: 15%",
        "Cost per lead: <$50",
      ],
    },
    {
      title: "Engagement",
      metrics: [
        "Email open rate: 25%",
        "Content engagement: +80%",
        "Demo requests: 100/month",
      ],
    },
    {
      title: "Revenue Impact",
      metrics: [
        "Pipeline value: $2M+",
        "Sales cycle: -20%",
        "Customer acquisition cost: -30%",
      ],
    },
  ],
  kpis: [
    { label: "Website Traffic Growth", value: "+50%" },
    { label: "Lead Conversion Rate", value: "15%" },
    { label: "Social Media Engagement", value: "+80%" },
    { label: "Email Open Rate", value: "25%" },
    { label: "Cost Per Acquisition", value: "$45" },
  ],
};
