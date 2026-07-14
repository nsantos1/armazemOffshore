// Sobreposição em inglês do CONTEÚDO EDITORIAL (não da interface — isso fica em i18n.tsx).
// Traduz os campos de texto gerenciados pelo admin (sobre, pilares, soluções, banners,
// certificações, descrições de parceiros) para o site em inglês, PRESERVANDO os dados
// de contato vivos (telefone, e-mail, endereços, URLs, logos) editáveis no admin em PT.
//
// Estratégia: cada função recebe o dado PT vivo e devolve uma cópia com os campos
// textuais traduzidos. O casamento é por id (parceiros/banners) ou pelo texto PT
// conhecido (pilares/soluções/labels/âncoras); qualquer item novo/editado que não tenha
// tradução conhecida simplesmente permanece em PT (degradação suave).
//
// O conteúdo de NOTÍCIAS (posts) não é traduzido, conforme solicitado.

import type { Banner, Certifications, Partner, Settings } from "./types";

const ABOUT_EN =
  "Founded in 1987 in Macaé-RJ, Armazém Offshore is a pioneer in supplying MRO — Maintenance, Repair and Operations — for the onshore and offshore markets. With strategic bases in Macaé, Vila Velha and Porto do Açu, we serve the naval and oil industry with a complete catalog: equipment, PPE, tools, electrical material, paints and IT supplies.";

const PILLARS_EN: Record<string, { title: string; text: string }> = {
  "Transparência": { title: "Transparency", text: "Transparency is our main asset in every quote, deadline and delivery." },
  "Controles de Qualidade": { title: "Quality Controls", text: "Management system certified to ISO 9001:2015 since 2023, audited every cycle." },
  "Importação Estratégica": { title: "Strategic Importing", text: "A worldwide supplier network for critical items with competitive lead times." },
};

const SOLUTIONS_EN: Record<string, { title: string; text: string }> = {
  "Material Elétrico": { title: "Electrical Material", text: "Cables, panels, devices and industrial lighting." },
  "Ferramentas": { title: "Tools", text: "Manual, electric and pneumatic tools for naval maintenance." },
  "EPIs": { title: "PPE", text: "Certified protection for onshore and offshore operations." },
  "Máquinas": { title: "Machines", text: "Rotating equipment, pumps and generators." },
  "Tintas Industriais": { title: "Industrial Paints", text: "Anti-corrosion systems and special coatings." },
  "Soldas": { title: "Welding", text: "Electrodes, rods, wires and consumables for industrial welding." },
};

const BASE_LABEL_EN: Record<string, string> = {
  "Sede": "Headquarters",
  "Filial": "Branch",
};

export function toEnSettings(s: Settings): Settings {
  return {
    ...s,
    about: ABOUT_EN,
    pillars: s.pillars.map(p => {
      const tr = PILLARS_EN[p.title];
      return tr ? { ...p, title: tr.title, text: tr.text } : p;
    }),
    solutions: s.solutions.map(sol => {
      const tr = SOLUTIONS_EN[sol.title];
      return tr ? { ...sol, title: tr.title, text: tr.text } : sol;
    }),
    bases: s.bases.map(b => ({ ...b, label: BASE_LABEL_EN[b.label] || b.label })),
  };
}

// ---- Certificações --------------------------------------------------------
const VISAO_EN =
  "To be a benchmark in supplying consumables and equipment in the areas of Maintenance, Repair and Operations for the Oil & Gas industry in the states of Rio de Janeiro and Espírito Santo, standing out in quality and supply within 3 years.";
const POLITICA_EN =
  "To operate in the Oil & Gas industry, trading products from various segments, aiming to meet customer needs and, consequently, their satisfaction, always seeking the continuous improvement of the quality management system.";
const VALORES_EN = [
  "Ethics in business;",
  "Focus on internal processes and waste control;",
  "Focus on customer service and their demands;",
  "Respect for employees;",
  "Respect for the environment and workplace safety.",
].join("\n");
const QUALIDADE_INTRO_EN =
  "Our quality management system is ISO 9001 certified. Access our certificates and official documents below.";

const CERT_ANCHOR_LABEL_EN: Record<string, string> = {
  "Certificação ISO 9001 – Grupo Armazém": "ISO 9001 Certification – Armazém Group",
  "Certificação ISO 9001": "ISO 9001 Certification",
  "Código de Conduta e Ética": "Code of Conduct and Ethics",
  "Formulário de denúncia": "Whistleblower Form",
};

export function toEnCerts(c: Certifications): Certifications {
  return {
    ...c,
    visao: VISAO_EN,
    politica: POLITICA_EN,
    valores: VALORES_EN,
    qualidadeIntro: QUALIDADE_INTRO_EN,
    anchors: c.anchors.map(a => ({ ...a, label: CERT_ANCHOR_LABEL_EN[a.label] || a.label })),
  };
}

// ---- Parceiros (por id) ---------------------------------------------------
const PARTNER_EN: Record<string, { desc: string; about: string }> = {
  f1: { desc: "PPE and industrial solutions", about: "A North American science and technology multinational, a world reference in personal protective equipment — respiratory, hearing and eye protection — as well as abrasives, adhesives and high-performance tapes for the naval and oil & gas industry." },
  f2: { desc: "Power tools", about: "A German multinational leader in professional power and cordless tools, accessories and industrial technology. A robust line of drills, grinders, hammer drills and measuring tools for maintenance and repair." },
  f3: { desc: "Protective equipment", about: "A French manufacturer specialized in head-to-toe personal protective equipment — helmets, gloves, safety footwear, garments and fall protection — for high-risk industrial and offshore environments." },
  f4: { desc: "Welding and cutting", about: "A global reference in welding and cutting, with electrodes, wires, rods, machines and consumables for the most demanding processes in the naval, steel structures and oil & gas industries." },
  f5: { desc: "Thermography and sensors", about: "A world leader in thermal cameras and infrared imaging sensors. Solutions focused on industrial inspection, predictive maintenance and fault detection in electrical and mechanical equipment." },
  f6: { desc: "Adhesives and sealants", about: "A Henkel brand leading in high-performance industrial adhesives, sealants and threadlockers. Essential products for assembling, sealing and maintaining rotating and threaded equipment." },
  c1: { desc: "National energy operator", about: "Brazil's largest energy company and one of the world's largest deepwater operators, a leader in oil exploration and production in the pre-salt and in the Campos and Santos basins." },
  c2: { desc: "Oil & gas operator", about: "A Norwegian energy company and one of the world's largest offshore operators, with a strong presence in the Brazilian pre-salt, including the Bacalhau field and the Roncador operation." },
  c3: { desc: "Oilfield services", about: "One of the world's largest oilfield services providers, active in drilling, completion, stimulation and reservoir evaluation." },
  c4: { desc: "Energy technology", about: "Formerly Schlumberger, it is the world's largest technology and services company for energy, present across the entire exploration and production chain, from drilling to digital production." },
  c5: { desc: "Floating systems (FPSO)", about: "A Japanese supplier of floating production systems — FPSOs and FSOs — for the offshore industry, with several units operating along the Brazilian coast." },
  c6: { desc: "FPSOs and offshore systems", about: "A world leader in the supply, installation and operation of floating production platforms (FPSOs), with a major presence in the Brazilian pre-salt and decades of experience in deep waters." },
};

export function toEnPartners(list: Partner[]): Partner[] {
  return list.map(p => {
    const tr = PARTNER_EN[p.id];
    return tr ? { ...p, desc: tr.desc, about: tr.about } : p;
  });
}

// ---- Banners (por id) -----------------------------------------------------
const BANNER_EN: Record<string, { title: string; subtitle: string; ctaText: string }> = {
  b1: {
    title: "Supplies for those who move the offshore.",
    subtitle: "For over 39 years supplying the naval and oil industry with agility, expertise and the ISO 9001:2015 standard.",
    ctaText: "Contact Us",
  },
  b2: {
    title: "Base at Porto do Açu. We're where the operation happens.",
    subtitle: "The only supplies company headquartered inside Porto do Açu — rapid response for your fleet.",
    ctaText: "See our bases",
  },
  b3: {
    title: "Complete catalog, from PPE to industrial paint.",
    subtitle: "Electrical material, tools, machines and critical supplies — from strategic suppliers in Brazil and abroad.",
    ctaText: "See solutions",
  },
};

export function toEnBanners(list: Banner[]): Banner[] {
  return list.map(b => {
    const tr = BANNER_EN[b.id];
    return tr ? { ...b, title: tr.title, subtitle: tr.subtitle, ctaText: tr.ctaText } : b;
  });
}
