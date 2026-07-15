// Dados de semente (seed) usados para popular o conteúdo do site na 1ª execução
// (o banco é semeado a partir daqui — ver content-store).
import type {
  AnalyticsConfig,
  Banner,
  Certifications,
  Identity,
  Partner,
  Settings,
} from "./types";

export const SEED_CATEGORIES: string[] = [
  "Insights Offshore",
  "Empresa",
  "Operações",
  "Qualidade",
  "Conteúdo Técnico",
  "Mercado",
];

export const SEED_BANNERS: Banner[] = [
  {
    id: "b1", title: "Suprimentos para quem move o offshore.",
    subtitle: "Há mais de 39 anos abastecendo a indústria naval e petrolífera com agilidade, técnica e padrão ISO 9001:2015.",
    ctaText: "Fale Conosco", ctaLink: "#contato",
    image: "/assets/banner-suprimentos.png", hue: 210, position: "left", active: true, order: 1
  },
  {
    id: "b2", title: "Base no Porto do Açu. Estamos onde a operação acontece.",
    subtitle: "Única empresa de suprimentos com sede dentro do Porto do Açu — pronta-resposta para sua frota.",
    ctaText: "Conheça nossas bases", ctaLink: "#quem-somos",
    image: "/assets/banner-porto-acu.png", hue: 200, position: "left", active: true, order: 2
  },
  {
    id: "b3", title: "Catálogo completo, do EPI à tinta industrial.",
    subtitle: "Material elétrico, ferramentas, máquinas e suprimentos críticos — de fornecedores estratégicos no Brasil e exterior.",
    ctaText: "Ver soluções", ctaLink: "#solucoes",
    image: null, hue: 220, position: "left", active: false, order: 3
  },
];

// Nota: a descrição longa (`about`) é exibida no modal aberto a partir de cada card.
// As logos vivem em /public/marcasParceiras e /public/clientesParceiros.
export const SEED_PARTNERS: Partner[] = [
  // Fornecedores / marcas parceiras
  { id: "f1", name: "3M", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/3m.html", image: "/marcasParceiras/logo3m.png", desc: "EPIs e soluções industriais",
    about: "Multinacional norte-americana de ciência e tecnologia, referência mundial em equipamentos de proteção individual — proteção respiratória, auditiva e ocular —, além de abrasivos, adesivos e fitas de alto desempenho para a indústria naval e de óleo e gás.", active: true, order: 1 },
  { id: "f2", name: "Bosch", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/bosch.html", image: "/marcasParceiras/logoBosch.png", desc: "Ferramentas elétricas",
    about: "Multinacional alemã líder em ferramentas elétricas e a bateria de uso profissional, acessórios e tecnologia industrial. Linha robusta de furadeiras, esmerilhadeiras, marteletes e ferramentas de medição para manutenção e reparo.", active: true, order: 2 },
  { id: "f3", name: "Delta Plus", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/delta-plus.html", image: "/marcasParceiras/logoDeltaPlus.svg", desc: "Equipamentos de proteção",
    about: "Fabricante francês especializado em equipamentos de proteção individual da cabeça aos pés — capacetes, luvas, calçados de segurança, vestimentas e proteção contra quedas — para ambientes industriais e offshore de alto risco.", active: true, order: 3 },
  { id: "f4", name: "ESAB", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/esab.html", image: "/marcasParceiras/logoEsab.jpeg", desc: "Soldagem e corte",
    about: "Referência global em soldagem e corte, com eletrodos, arames, varetas, máquinas e consumíveis para os processos mais exigentes da indústria naval, de estruturas metálicas e de óleo e gás.", active: true, order: 4 },
  { id: "f5", name: "FLIR", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/flir.html", image: "/marcasParceiras/logoFlir.png", desc: "Termografia e sensores",
    about: "Líder mundial em câmeras termográficas e sensores de imagem infravermelha. Soluções voltadas à inspeção industrial, manutenção preditiva e detecção de falhas em equipamentos elétricos e mecânicos.", active: true, order: 5 },
  { id: "f6", name: "Loctite", kind: "supplier", url: "https://www.armazemdassoldas.com.br/marca/loctite.html", image: "/marcasParceiras/logoLoctite.webp", desc: "Adesivos e selantes",
    about: "Marca da Henkel líder em adesivos, selantes e travas químicas industriais de alto desempenho. Produtos essenciais para montagem, vedação e manutenção de equipamentos rotativos e roscados.", active: true, order: 6 },
  // Clientes / clientes parceiros
  { id: "c1", name: "Petrobras", kind: "client", url: "https://www.petrobras.com.br", image: "/clientesParceiros/logoPetrobras.gif", desc: "Operadora nacional de energia",
    about: "Maior companhia de energia do Brasil e uma das maiores operadoras de águas profundas do mundo, líder na exploração e produção de petróleo no pré-sal e nas bacias de Campos e Santos.", active: true, order: 1 },
  { id: "c2", name: "Equinor", kind: "client", url: "https://www.equinor.com.br", image: "/clientesParceiros/logoEquinor.png", desc: "Operadora de óleo e gás",
    about: "Empresa norueguesa de energia e uma das maiores operadoras offshore do mundo, com forte presença no pré-sal brasileiro, incluindo o campo de Bacalhau e a operação de Roncador.", active: true, order: 2 },
  { id: "c3", name: "Halliburton", kind: "client", url: "https://www.halliburton.com", image: "/clientesParceiros/logoHalliburton.png", desc: "Serviços de campo",
    about: "Uma das maiores prestadoras de serviços para a indústria de óleo e gás (oilfield services) do mundo, atuante em perfuração, completação, estimulação e avaliação de reservatórios.", active: true, order: 3 },
  { id: "c4", name: "SLB", kind: "client", url: "https://www.slb.com", image: "/clientesParceiros/logoSlb.webp", desc: "Tecnologia para energia",
    about: "Antiga Schlumberger, é a maior empresa de tecnologia e serviços para energia do mundo, presente em toda a cadeia de exploração e produção, da perfuração à produção digital.", active: true, order: 4 },
  { id: "c5", name: "MODEC", kind: "client", url: "https://www.modec.com", image: "/clientesParceiros/logoModec.png", desc: "Sistemas flutuantes (FPSO)",
    about: "Fornecedora japonesa de sistemas flutuantes de produção — FPSOs e FSOs — para a indústria offshore, com diversas unidades em operação no litoral brasileiro.", active: true, order: 5 },
  { id: "c6", name: "SBM Offshore", kind: "client", url: "https://www.sbmoffshore.com", image: "/clientesParceiros/logoSbm.png", desc: "FPSOs e sistemas offshore",
    about: "Líder mundial no fornecimento, instalação e operação de plataformas flutuantes de produção (FPSOs), com grande atuação no pré-sal brasileiro e décadas de experiência em águas profundas.", active: true, order: 6 },
];

// Conteúdo inicial da página de Certificações (editável no painel admin).
export const SEED_CERTS: Certifications = {
  bannerImage: null,
  visao:
    "Ser referência em fornecimento de consumíveis e equipamentos nas áreas de Manutenção, Reparo e Operações visando a indústria de Óleo e Gás dos estados do Rio de Janeiro e Espírito Santo, se destacando em qualidade e fornecimento em até 3 anos.",
  politica:
    "Atuar na indústria de Óleo e Gás, comercializando produtos de vários segmentos, visando atender a necessidade do cliente e consequentemente a sua satisfação, buscando sempre a melhoria contínua do sistema de gestão da qualidade.",
  valores: [
    "Ética nos negócios;",
    "Foco nos processos internos e controle de desperdício;",
    "Foco no atendimento ao cliente e suas demandas;",
    "Respeito aos funcionários;",
    "Respeito ao meio ambiente e a segurança do trabalho.",
  ].join("\n"),
  qualidadeIntro:
    "Nosso sistema de gestão da qualidade é certificado ISO 9001. Acesse abaixo nossos certificados e documentos oficiais.",
  anchors: [
    { id: "a1", label: "Certificação ISO 9001 – Grupo Armazém", url: "../documentosPdf/ARMAZEM-9001.pdf" },
    { id: "a2", label: "Certificação ISO 9001", url: "./documentosPdf/ARMAZEM-IQNET.pdf" },
    { id: "a3", label: "Código de Conduta e Ética", url: "./documentosPdf/CodigoDeCondutaEEticaArmazem.pdf" },
    { id: "a4", label: "Formulário de denúncia", url: "https://pt.surveymonkey.com/r/denunciaarmazem" },
  ],
};

export const SEED_IDENTITY: Identity = {
  logoVariant: "default", // 'default' = mark estilizado original
  logoCustom: null,       // base64 (opcional)
  logoAlt: "Armazém Offshore",
  logoMaxWidth: 180,
  faviconCustom: null,    // base64
};

const SEED_ANALYTICS: AnalyticsConfig = {
  enabled: false,
  ga4Id: "",      // ID de medição GA4 (ex.: G-XXXXXXXXXX)
  gtmId: "",      // ID do Google Tag Manager (ex.: GTM-XXXXXXX)
  customCode: "", // Tag/código personalizado fornecido pela agência (cole o snippet completo)
};

export const SEED_SETTINGS: Settings = {
  phone: "(22) 2763-4600",
  whatsapp: "552227634600",
  email: "contato@armazemoffshore.com.br",
  bases: [
    { id: "sede", city: "Macaé - RJ", label: "Sede",
      address: "Av. Acadêmico Paulo Sérgio de Carvalho Vasconcellos, 555 - Quadra D, Novo Cavaleiros, Macaé - RJ, 27930-260",
      mapQuery: "Armazém Offshore" },
    { id: "filial", city: "Vila Velha - ES", label: "Filial",
      address: "Rod. Darly Santos, 4723-A, Sala 19, 2º andar - Nossa Senhora da Penha, Vila Velha - ES, 29110-340",
      mapQuery: "Rod. Darly Santos, 4723, Nossa Senhora da Penha, Vila Velha - ES, 29110-340" },
    { id: "acu", city: "São João da Barra - RJ", label: "Porto do Açu",
      address: "Distrito Industrial Açu — São João da Barra/RJ",
      mapQuery: "Porto do Açu, São João da Barra, RJ, Brasil" },
  ],
  social: { instagram: "https://www.instagram.com/armazemoffshore/", linkedin: "https://www.linkedin.com/company/armazemoffshore/posts/?feedView=all", facebook: "https://www.facebook.com/ArmazemOffshore" },
  about: "Fundada em 1987 em Macaé-RJ, a Armazém Offshore é pioneira no fornecimento de MRO — Manutenção, Reparo e Operação — para os mercados onshore e offshore. Com bases estratégicas em Macaé, Vila Velha e Porto do Açu, atendemos a indústria naval e petrolífera com catálogo completo: equipamentos, EPIs, ferramentas, material elétrico, tintas e suprimentos de informática.",
  pillars: [
    { icon: "Eye", title: "Transparência", text: "Nosso principal ativo é a transparência em cada cotação, prazo e entrega." },
    { icon: "BadgeCheck", title: "Controles de Qualidade", text: "Sistema de gestão certificado ISO 9001:2015 desde 2023, auditado a cada ciclo." },
    { icon: "Globe2", title: "Importação Estratégica", text: "Rede de fornecedores ao redor do mundo para itens críticos com prazos competitivos." },
  ],
  solutions: [
    { icon: "Zap", title: "Material Elétrico", text: "Cabos, painéis, dispositivos e iluminação industrial." },
    { icon: "Wrench", title: "Ferramentas", text: "Manuais, elétricas e pneumáticas para manutenção naval." },
    { icon: "HardHat", title: "EPIs", text: "Proteção certificada para operações onshore e offshore." },
    { icon: "Cog", title: "Máquinas", text: "Equipamentos rotativos, bombas e geradores." },
    { icon: "Paintbrush", title: "Tintas Industriais", text: "Sistemas anti-corrosão e revestimentos especiais." },
    { icon: "Flame", title: "Soldas", text: "Eletrodos, varetas, arames e consumíveis para soldagem industrial." },
  ],
  storeUrl: "https://www.armazemdassoldas.com.br/",
  // Rastreamento / Google Analytics — tags fornecidas pela agência de marketing.
  analytics: SEED_ANALYTICS,
};
