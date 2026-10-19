/* The shape of one ecosystem page copy (lib/ecosystem.ts). */
export interface EcoSection {
  title: string;
  lead: string;
  points: string[];
  cta: string;
}
export interface EcoCopy {
  menu: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  axto: EcoSection;
  xaa: EcoSection;
  rule: string;
  closing: string;
}
