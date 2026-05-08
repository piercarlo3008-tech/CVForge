export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  description: string;
};

export type Contact = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
};

export type Language = {
  id: string;
  name: string;
  level: string;
};

export type ResumeData = {
  contact: Contact;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  languages: Language[];
};

export type ResumeStyle = {
  template: 'minimal' | 'modern' | 'creative' | 'two-column' | 'sidebar' | 'elegant' | 'fluid' | 'timeline' | 'bold-organic' | 'editorial';
  primaryColor: string;
  fontFamily: string;
  sectionOrder: string[];
  textScale?: number;
};

export const defaultResumeStyle: ResumeStyle = {
  template: 'modern',
  primaryColor: '#2563eb',
  fontFamily: 'font-sans',
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'languages'],
  textScale: 1
};

export type ATSSuggestion = {
  score: number;
  scoreMessage: string;
  keywordsToInclude: {
    keyword: string;
    reason: string;
  }[];
  actionVerbs: {
    original: string;
    suggested: string;
    context: string;
  }[];
  formattingTips: string[];
  generalFeedback: string;
};

export const defaultResumeData: ResumeData = {
  contact: {
    fullName: "Marco Rossi",
    email: "marco.rossi@email.com",
    phone: "+39 333 1234567",
    location: "Milano, IT",
    linkedin: "linkedin.com/in/marcorossi",
    website: "marcorossi.design",
  },
  summary: "Product Designer con 5+ anni di esperienza nel creare prodotti digitali user-centered. Specializzato in design system, ricerca utente e interfacce data-driven per startup ad alta crescita.",
  experience: [
    {
      id: "1",
      role: "Senior Product Designer",
      company: "Acme Inc.",
      location: "Milano",
      startDate: "2020",
      endDate: "Presente",
      description: "- Ho ridisegnato il flusso di onboarding aumentando l'attivazione del 38%.\n- Ho creato un design system adottato da 4 team prodotto."
    },
    {
      id: "2",
      role: "Product Designer",
      company: "Startup XYZ",
      location: "Roma",
      startDate: "2018",
      endDate: "2020",
      description: "- Ho guidato il redesign della dashboard riducendo i ticket di supporto del 25%."
    }
  ],
  education: [
    {
      id: "1",
      degree: "Laurea in Design",
      institution: "Politecnico di Milano",
      location: "Milano",
      graduationDate: "2017",
      description: ""
    }
  ],
  skills: ["Figma", "Design System", "User Research", "Prototyping", "HTML/CSS", "Accessibility"],
  projects: [],
  languages: [
    { id: "1", name: "Italiano", level: "Madrelingua" },
    { id: "2", name: "Inglese", level: "C1" }
  ],
};
