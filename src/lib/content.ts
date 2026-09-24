import { z } from "zod";

import aboutJson from "@content/about.json";
import benefitsJson from "@content/benefits.json";
import carInsuranceJson from "@content/car-insurance.json";
import contactJson from "@content/contact.json";
import contractReviewJson from "@content/contract-review.json";
import homeJson from "@content/home.json";
import mortgageJson from "@content/mortgage.json";
import notFoundJson from "@content/not-found.json";
import partnersJson from "@content/partners.json";
import processJson from "@content/process.json";
import servicesJson from "@content/services.json";
import siteJson from "@content/site.json";

/**
 * Veškerý text a obrázky webu žijí v `content/*.json`, aby je klient mohl
 * měnit v administraci na /admin bez zásahu do kódu.
 *
 * Schémata níže se kontrolují při buildu. Když někdo v administraci smaže
 * povinné pole, build spadne se srozumitelnou chybou – místo aby se na web
 * nasadila rozbitá stránka.
 */

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const infoCardSchema = z.object({
  icon: z.string(),
  title: z.string(),
  text: z.string(),
  highlighted: z.boolean().default(false),
});

const processItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  text: z.string(),
});

const stepSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
});

const siteSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  slogan: z.string(),
  phone: z.string(),
  phoneHref: z.string(),
  email: z.string(),
  emailHref: z.string(),
  ico: z.string(),
  address: z.array(z.string()),
  availability: z.string(),
  logo: z.string(),
  ogImage: z.string(),
  url: z.string(),
  social: z.array(
    z.object({
      label: z.string(),
      icon: z.string(),
      href: z.string(),
    }),
  ),
  footer: z.object({
    servicesHeading: z.string(),
    contactHeading: z.string(),
    socialHeading: z.string(),
    copyright: z.string(),
    legalLinks: z.array(linkSchema),
  }),
  navigation: z.object({
    sidebar: z.array(linkSchema.extend({ icon: z.string().optional() })),
    pages: z.array(linkSchema),
  }),
});

const homeSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    badge: z.string(),
    titleFirstLine: z.string(),
    titleSecondLine: z.string(),
    lead: z.string(),
    description: z.string(),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
    video: z.string(),
    videoLabel: z.string(),
    highlights: z.array(z.string()),
  }),
  servicesIntro: z.object({
    image: z.string(),
    imageAlt: z.string(),
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    linkLabel: z.string(),
  }),
  about: z.object({
    kicker: z.string(),
    title: z.string(),
    lead: z.string(),
    highlights: z.array(z.string()),
    paragraphs: z.array(z.string()),
  }),
  process: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  whyUs: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  reviews: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    ctaLabel: z.string(),
    items: z
      .array(
        z.object({
          name: z.string(),
          service: z.string(),
          rating: z.number().int().min(1).max(5),
          text: z.string(),
        }),
      )
      .min(1),
  }),
});

const servicesSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  listSection: z.object({ kicker: z.string(), title: z.string() }),
  processSection: z.object({ kicker: z.string(), title: z.string() }),
  categories: z.array(
    z.object({
      number: z.string(),
      title: z.string(),
      description: z.string(),
      href: z.string(),
      icon: z.string(),
      items: z.array(z.string()),
    }),
  ),
  quickActions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      label: z.string(),
      href: z.string(),
      icon: z.string(),
      highlighted: z.boolean().default(false),
    }),
  ),
});

const benefitsSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ),
});

const processSchema = z.object({
  steps: z.array(stepSchema),
});

const partnerSchema = z.object({
  name: z.string(),
  logo: z.string(),
});

const partnersSchema = z.object({
  kicker: z.string(),
  title: z.string(),
  description: z.string(),
  rowOne: z.array(partnerSchema),
  rowTwo: z.array(partnerSchema),
});

const contractReviewSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    cards: z.array(infoCardSchema),
    benefits: z.array(z.string()),
  }),
  pageSteps: z.array(processItemSchema),
  section: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    highlightTitle: z.string(),
    highlightText: z.string(),
    areasKicker: z.string(),
    areasTitle: z.string(),
    areas: z.array(z.object({ label: z.string(), icon: z.string() })),
    stepsKicker: z.string(),
    steps: z.array(stepSchema),
    reasonsTitle: z.string(),
    reasons: z.array(z.string()),
    reasonsNote: z.string(),
  }),
});

const formPageSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    cards: z.array(infoCardSchema),
  }),
  processSection: z.object({
    kicker: z.string(),
    title: z.string(),
    items: z.array(processItemSchema),
  }),
});

const aboutSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    kicker: z.string(),
    title: z.string(),
    description: z.string(),
    mediaTitle: z.string(),
    mediaSubtitle: z.string(),
    watchedAreas: z.array(z.string()),
  }),
  whoWeAre: z.object({ kicker: z.string(), title: z.string() }),
  benefitsSection: z.object({ kicker: z.string(), title: z.string() }),
  videoSection: z.object({
    kicker: z.string(),
    title: z.string(),
    video: z.string(),
    videoLabel: z.string(),
    asideKicker: z.string(),
    asideTitle: z.string(),
    asideItems: z.array(z.string()),
    asideFooter: z.string(),
  }),
  contactSection: z.object({
    kicker: z.string(),
    title: z.string(),
    phoneLabel: z.string(),
    emailLabel: z.string(),
    addressLabel: z.string(),
    availabilityLabel: z.string(),
  }),
});

const notFoundSchema = z.object({
  seo: seoSchema,
  kicker: z.string(),
  title: z.string(),
  description: z.string(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema,
  badgeLabel: z.string(),
});

const contactSchema = z.object({
  title: z.string(),
  description: z.string(),
  notes: z.array(z.string()),
  asideTitle: z.string(),
  calloutKicker: z.string(),
  calloutTitle: z.string(),
  calloutText: z.string(),
  services: z.array(z.string()),
  successTitle: z.string(),
  successText: z.string(),
  privacyConsentText: z.string(),
});

function parse<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  fileName: string,
): z.infer<TSchema> {
  const result = schema.safeParse(value);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(kořen)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Obsah v souboru content/${fileName} není platný:\n${issues}\n\n` +
        "Zkontrolujte prosím poslední úpravu v administraci na /admin.",
    );
  }

  return result.data;
}

export const site = parse(siteSchema, siteJson, "site.json");
export const home = parse(homeSchema, homeJson, "home.json");
export const services = parse(servicesSchema, servicesJson, "services.json");
export const benefits = parse(benefitsSchema, benefitsJson, "benefits.json");
export const processContent = parse(processSchema, processJson, "process.json");
export const partners = parse(partnersSchema, partnersJson, "partners.json");
export const contractReview = parse(
  contractReviewSchema,
  contractReviewJson,
  "contract-review.json",
);
export const carInsurance = parse(
  formPageSchema,
  carInsuranceJson,
  "car-insurance.json",
);
export const mortgage = parse(formPageSchema, mortgageJson, "mortgage.json");
export const about = parse(aboutSchema, aboutJson, "about.json");
export const notFound = parse(notFoundSchema, notFoundJson, "not-found.json");
export const contact = parse(contactSchema, contactJson, "contact.json");

export type Site = typeof site;
export type ServiceCategory = (typeof services.categories)[number];
export type QuickAction = (typeof services.quickActions)[number];
export type Benefit = (typeof benefits.items)[number];
export type ProcessStep = (typeof processContent.steps)[number];
export type Partner = (typeof partners.rowOne)[number];
export type InfoCard = z.infer<typeof infoCardSchema>;
export type ProcessItem = z.infer<typeof processItemSchema>;
