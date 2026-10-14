export const site = {
  name: "Vision Thoughts",
  tagline: "Transforming Ideas into Digital Experiences",
  url: "https://visionthoughts.com",
  email: "vijay@visionthoughts.com",
  phone: "+91 83091 70263",
  phoneHref: "+918309170263",
  whatsapp: "https://wa.me/918309170263",
  location: "Kukatpally, Hyderabad",
  hours: "Mon – Sat · 9AM – 7PM",
  description:
    "Vision Thoughts is a creative digital agency specialising in web design, web development, e-commerce, mobile apps, digital marketing and hosting — turning ideas into digital products that move businesses forward.",
} as const;

export type Service = {
  index: string;
  name: string;
  short: string;
  description: string;
  /** Keywords surfaced next to the active service. */
  facets: string[];
};

/** Service names & copy taken from visionthoughts.com */
export const services: Service[] = [
  {
    index: "01",
    name: "Web Designing",
    short: "Design",
    description:
      "Creative, responsive, and user-focused website designs that captivate your audience and convert visitors into customers.",
    facets: ["UI / UX", "Responsive", "Brand Systems"],
  },
  {
    index: "02",
    name: "Web Development",
    short: "Build",
    description:
      "Custom websites built with modern technologies and best practices for speed, security, and scalability.",
    facets: ["Modern Stack", "Performance", "Scalable"],
  },
  {
    index: "03",
    name: "E-Commerce Development",
    short: "Commerce",
    description:
      "Online stores with secure payments, seamless shopping experiences, and powerful sales features.",
    facets: ["Secure Payments", "Catalogue", "Conversion"],
  },
  {
    index: "04",
    name: "Mobile App Development",
    short: "Mobile",
    description:
      "Android and iOS applications tailored to your business needs — intuitive, fast, and built to scale.",
    facets: ["Android", "iOS", "Built to Scale"],
  },
  {
    index: "05",
    name: "Digital Marketing",
    short: "Growth",
    description:
      "SEO, social media marketing, paid advertising, and lead generation to grow your brand online.",
    facets: ["SEO", "Paid Ads", "Lead Gen"],
  },
  {
    index: "06",
    name: "Web Hosting",
    short: "Infrastructure",
    description:
      "Reliable, secure, and high-performance hosting solutions with 99.9% uptime and expert support.",
    facets: ["99.9% Uptime", "Secure", "Expert Support"],
  },
];

/** Differentiators taken from visionthoughts.com */
export const reasons = [
  {
    word: "Result-Oriented",
    claim: "Professional, result-oriented digital solutions.",
  },
  {
    word: "Responsive",
    claim: "Mobile-friendly designs that work on every device.",
  },
  {
    word: "Fast",
    claim: "Fast project delivery without cutting corners.",
  },
  {
    word: "Discoverable",
    claim: "SEO optimised websites built to rank and convert.",
  },
  {
    word: "Transparent",
    claim: "Transparent, affordable pricing for all business sizes.",
  },
  {
    word: "Committed",
    claim: "Ongoing support and a long-term partnership.",
  },
] as const;

export const stats = [
  { value: "100%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "99.9%", label: "Hosting Uptime" },
] as const;
