/**
 * UX Design Principles & Guidelines
 * Based on the philosophies of world-class designers:
 * Don Norman, Steve Krug, Luke Wroblewski, Aarron Walter, Jonathan Ive, 
 * Julie Zhuo, Dieter Rams, Farai Madzima, Alan Cooper, Susan Weinschenk
 */

export const UX_PRINCIPLES = {
  // Don Norman - The Design of Everyday Things
  NORMAN: {
    discoverability: "Make functions discoverable through clear affordances",
    feedback: "Provide immediate and clear feedback for all actions",
    conceptualModel: "Create clear mental models that match user expectations",
    constraints: "Use constraints to guide users toward correct actions",
    mapping: "Ensure natural mapping between controls and their effects",
    signifiers: "Use clear signifiers to indicate possible actions"
  },

  // Steve Krug - Don't Make Me Think
  KRUG: {
    clarity: "Remove question marks - make everything self-evident",
    scannability: "Design for scanning, not reading",
    clicks: "Minimize cognitive load, not just click count",
    navigation: "Always show where users are and where they can go",
    conventions: "Follow established conventions unless you have a compelling reason not to"
  },

  // Luke Wroblewski - Mobile First & Forms
  WROBLEWSKI: {
    mobileFirst: "Design for mobile constraints first, then enhance",
    formSimplicity: "Minimize form fields and make completion obvious",
    touchTargets: "Ensure touch targets are appropriately sized (44px minimum)",
    contentPriority: "Lead with content, not navigation",
    performance: "Optimize for performance on slower connections"
  },

  // Aarron Walter - Designing for Emotion
  WALTER: {
    hierarchy: "Functional → Reliable → Usable → Pleasurable",
    personality: "Inject personality to create emotional connections",
    surprise: "Use delightful moments to create positive memories",
    empathy: "Design with genuine empathy for user needs",
    storytelling: "Use narrative to guide users through experiences"
  },

  // Jonathan Ive - Simplicity & Craftsmanship
  IVE: {
    simplicity: "Achieve simplicity through understanding, not removal",
    materials: "Honor the nature of digital materials",
    details: "Perfect the details that users will touch and see",
    purpose: "Every element must serve a clear purpose",
    restraint: "Show restraint - less is more when it's done right"
  },

  // Julie Zhuo - Building Design Teams & Systems
  ZHUO: {
    systemsThinking: "Design systems, not just screens",
    consistency: "Maintain consistency across all touchpoints",
    scalability: "Design decisions should scale across the product",
    collaboration: "Design is a team sport - involve stakeholders",
    iteration: "Embrace iteration and continuous improvement"
  },

  // Dieter Rams - Ten Principles of Good Design
  RAMS: {
    innovative: "Good design is innovative",
    useful: "Good design makes a product useful",
    aesthetic: "Good design is aesthetic",
    understandable: "Good design makes a product understandable",
    unobtrusive: "Good design is unobtrusive",
    honest: "Good design is honest",
    longlasting: "Good design is long-lasting",
    thorough: "Good design is thorough down to the last detail",
    environmental: "Good design is environmentally friendly",
    minimal: "Good design is as little design as possible"
  },

  // Farai Madzima - Inclusive Design
  MADZIMA: {
    inclusion: "Design for the margins - it benefits everyone",
    accessibility: "Accessibility is not optional - it's fundamental",
    diversity: "Embrace diverse perspectives in design decisions",
    universal: "Strive for universal usability",
    equity: "Design for equity, not just equality"
  },

  // Alan Cooper - About Face & Interaction Design
  COOPER: {
    goals: "Design for user goals, not tasks",
    personas: "Design for specific personas, not generic users",
    scenarios: "Use scenarios to drive design decisions",
    forgiveness: "Design forgiving interfaces that prevent errors",
    direct: "Provide direct manipulation where possible"
  },

  // Susan Weinschenk - Psychology of Design
  WEINSCHENK: {
    attention: "People scan before they read - design for scanning",
    memory: "Working memory is limited - don't overload users",
    motivation: "Understand what motivates your users",
    social: "People are inherently social - leverage social proof",
    mental_models: "Design to match users' existing mental models",
    chunking: "Group related information together",
    recognition: "Recognition is easier than recall"
  }
};

export const DESIGN_CHECKLIST = {
  // Before designing any component or page
  PLANNING: [
    "Who is the primary user and what are their goals? (Cooper)",
    "What is the core task this interface enables? (Norman)",
    "How does this fit into the user's mental model? (Weinschenk)",
    "What emotional response do we want to create? (Walter)",
    "Is this accessible to users with disabilities? (Madzima)"
  ],

  // During design process
  DESIGN: [
    "Is the primary action immediately obvious? (Krug)",
    "Can users scan and understand in 3 seconds? (Krug/Weinschenk)",
    "Are we following established conventions? (Krug)",
    "Is feedback provided for all user actions? (Norman)",
    "Are error states helpful and actionable? (Cooper)",
    "Does this work on mobile first? (Wroblewski)",
    "Is every element serving a clear purpose? (Ive/Rams)"
  ],

  // After implementation
  VALIDATION: [
    "Does it work well on mobile devices? (Wroblewski)",
    "Is the loading state clear and informative? (Norman)",
    "Are micro-interactions smooth and purposeful? (Walter)",
    "Is the information hierarchy clear? (Weinschenk)",
    "Does it feel consistent with the rest of the system? (Zhuo)",
    "Is it as simple as possible but no simpler? (Rams)"
  ]
};

// Apply these principles to every component
export function applyUXPrinciples(componentType: string) {
  const principles = {
    // Forms - Following Wroblewski & Cooper
    form: {
      layout: "Single column layout reduces cognitive load",
      labels: "Clear, descriptive labels above fields",
      validation: "Real-time validation with helpful messages",
      progress: "Show progress and remaining steps",
      errors: "Contextual error messages near relevant fields"
    },

    // Navigation - Following Krug & Norman
    navigation: {
      orientation: "Always show current location and path",
      grouping: "Group related items logically",
      affordances: "Clear visual cues for interactive elements",
      consistency: "Consistent placement and behavior",
      hierarchy: "Clear information hierarchy"
    },

    // Cards - Following Rams & Ive
    card: {
      purpose: "Each card serves a single, clear purpose",
      content: "Lead with most important information",
      actions: "Primary action clearly distinguished",
      spacing: "Generous whitespace for readability",
      feedback: "Clear hover and interaction states"
    },

    // Buttons - Following Norman & Walter
    button: {
      affordance: "Clearly looks clickable/tappable",
      hierarchy: "Visual hierarchy matches importance",
      feedback: "Immediate feedback on interaction",
      size: "Minimum 44px touch target",
      context: "Action verbs that describe outcome"
    },

    // Lists - Following Weinschenk & Krug
    list: {
      scanning: "Designed for quick scanning",
      chunking: "Related items grouped together",
      priority: "Most important items first",
      consistency: "Consistent item structure",
      selection: "Clear selected/active states"
    }
  };

  return principles[componentType as keyof typeof principles] || {};
}

// Color system based on psychology and accessibility
export const COLOR_SYSTEM = {
  PRIMARY: {
    color: "Blue",
    psychology: "Trust, reliability, professionalism",
    usage: "Primary actions, links, system status",
    accessibility: "WCAG AA compliant contrast ratios"
  },
  SUCCESS: {
    color: "Green", 
    psychology: "Success, progress, positive actions",
    usage: "Confirmations, completed states, positive feedback",
    accessibility: "Avoid red-green only combinations"
  },
  WARNING: {
    color: "Orange/Amber",
    psychology: "Caution, attention needed",
    usage: "Warnings, pending states, important notices",
    accessibility: "High contrast for visibility"
  },
  ERROR: {
    color: "Red",
    psychology: "Danger, error, stop",
    usage: "Errors, destructive actions, critical alerts",
    accessibility: "Never rely on color alone"
  }
};

// Typography following readability principles
export const TYPOGRAPHY_PRINCIPLES = {
  HIERARCHY: "Clear visual hierarchy guides attention (Weinschenk)",
  READABILITY: "Optimal line length 45-75 characters (Krug)",
  CONTRAST: "Minimum 4.5:1 contrast ratio (Madzima)",
  CONSISTENCY: "Consistent type scale across system (Zhuo)",
  SCANNING: "Typography optimized for scanning (Krug)"
};

// Interaction design patterns
export const INTERACTION_PATTERNS = {
  PROGRESSIVE_DISCLOSURE: "Reveal information progressively (Norman)",
  DIRECT_MANIPULATION: "Allow direct interaction with objects (Cooper)",
  IMMEDIATE_FEEDBACK: "Provide instant feedback for actions (Norman)",
  FORGIVING_INTERFACE: "Prevent errors and allow easy recovery (Cooper)",
  SOCIAL_PROOF: "Show what others are doing (Weinschenk)"
};