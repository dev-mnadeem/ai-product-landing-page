import type { Persona } from "./types";

export const GOAL_OPTIONS: readonly string[] = [
  "Expand professional network",
  "Stay updated with latest trends",
  "Achieve career growth and leadership roles",
  "Develop new skills and expertise",
];

export const MOTIVATION_OPTIONS: readonly string[] = [
  "Growing career and achieving recognition",
  "Building strong professional connections",
  "Staying ahead of industry trends",
  "Personal development and self-improvement",
];

let personaCounter = 0;

export function nextPersonaId(): string {
  personaCounter += 1;
  return `persona-${personaCounter}`;
}

/**
 * An empty persona. Callers pass an id so an edit keeps the identity of the
 * persona it came from instead of creating a second one on save.
 */
export function emptyPersona(id: string = nextPersonaId()): Persona {
  return {
    id,
    name: "",
    category: "",
    demographic: "",
    lifestyles: "",
    behavioral: "",
    psychographic: "",
    personaPrompt: "",
    quote: "",
    age: "",
    gender: "",
    location: "",
    relationshipStatus: "",
    title: "",
    education: "",
    description: "",
    goals: [],
    motivations: [],
    documents: [],
  };
}

function seededPersona(
  id: string,
  name: string,
  category: string,
  overrides: Partial<Persona>
): Persona {
  return { ...emptyPersona(id), name, category, ...overrides };
}

/**
 * The audience list the demo boots with. These carry real field values, so
 * opening one for editing shows a populated form rather than a blank one.
 */
export const SEED_PERSONAS: readonly Persona[] = [
  seededPersona("persona-solo-living", "Solo Living", "Lifestyle", {
    demographic: "Age: 29, Gender: Female, Lives alone, Urban apartment",
    lifestyles:
      "Works remotely four days a week, optimises the home setup constantly, orders groceries on a schedule.",
    behavioral:
      "Trials new productivity tools monthly and abandons anything that needs more than one evening to set up.",
    psychographic:
      "Values autonomy and quiet competence. Distrusts marketing that over-promises.",
    quote: "If it takes a training course, it has already failed.",
    age: "29",
    gender: "Female",
    location: "Urban",
    relationshipStatus: "Single",
    title: "Operations Analyst",
    education: "BSc Business Information Systems",
    description:
      "Runs her own workflow stack with no IT support and judges every tool by how quickly it disappears into the background.",
    goals: ["Develop new skills and expertise"],
    motivations: ["Personal development and self-improvement"],
  }),
  seededPersona("persona-entrepreneur", "Entrepreneur", "Business", {
    demographic: "Age: 41, Gender: Male, Founder of a 12-person agency",
    lifestyles:
      "Splits the week between client delivery and business development, no dedicated ops function.",
    behavioral:
      "Buys tools on a corporate card, cancels them within two billing cycles if the team has not adopted them.",
    psychographic:
      "Cost-conscious and outcome-driven. Reads case studies before pricing pages.",
    quote: "Show me what it saved somebody like me.",
    age: "41",
    gender: "Male",
    location: "Metro",
    relationshipStatus: "Married",
    title: "Founder & Managing Director",
    education: "MBA",
    description:
      "Is the buyer, the budget holder and the first user. Needs a business case he can defend to himself.",
    goals: ["Achieve career growth and leadership roles"],
    motivations: ["Growing career and achieving recognition"],
  }),
  seededPersona("persona-designer", "Designer", "Creative", {
    demographic: "Age: 33, Gender: Non-binary, In-house brand team",
    lifestyles:
      "Deep-work blocks in the morning, reviews and handoffs in the afternoon.",
    behavioral:
      "Adopts a tool only once it fits the existing handoff between design and marketing.",
    psychographic:
      "Protective of craft. Sceptical of automation that flattens creative judgement.",
    quote: "Automate the handoff, not the thinking.",
    age: "33",
    gender: "Non-binary",
    location: "Hybrid",
    relationshipStatus: "Partnered",
    title: "Senior Brand Designer",
    education: "BA Graphic Design",
    description:
      "Cares about where the automation stops. Will champion a tool that removes admin and resist one that produces the work.",
    goals: ["Stay updated with latest trends"],
    motivations: ["Staying ahead of industry trends"],
  }),
  seededPersona("persona-developer", "Developer", "Technical", {
    demographic: "Age: 36, Gender: Male, Platform engineering team",
    lifestyles:
      "On-call rotation, allergic to anything that cannot be scripted or reviewed.",
    behavioral:
      "Reads the API docs before the landing page. Evaluates on integration surface and audit trail.",
    psychographic:
      "Trusts documentation over sales. Will veto a purchase on security grounds alone.",
    quote: "If there is no API, there is no deal.",
    age: "36",
    gender: "Male",
    location: "Remote",
    relationshipStatus: "Married",
    title: "Staff Platform Engineer",
    education: "MSc Computer Science",
    description:
      "Holds informal veto power in procurement. Convinced by docs, changelogs and a public status page.",
    goals: ["Develop new skills and expertise"],
    motivations: ["Staying ahead of industry trends"],
  }),
  seededPersona("persona-marketer", "Marketer", "Business", {
    demographic: "Age: 34, Gender: Female, Marketing Manager, Urban city",
    lifestyles:
      "Attends networking events, socialises with colleagues after work, runs campaigns across four channels.",
    behavioral:
      "Engages heavily with digital marketing platforms and actively experiments with new campaign tools.",
    psychographic:
      "Believes in the power of creativity and collaboration, values strong professional connections.",
    quote: "I thrive on connecting with people and staying ahead of new ideas.",
    age: "34",
    gender: "Female",
    location: "Urban city",
    relationshipStatus: "Single",
    title: "Marketing Manager",
    education: "BA Marketing Communications",
    description:
      "Owns the number the campaign is judged on and needs reporting she can put in front of leadership unedited.",
    goals: ["Expand professional network", "Stay updated with latest trends"],
    motivations: ["Building strong professional connections"],
  }),
];
