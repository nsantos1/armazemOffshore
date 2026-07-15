"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { NavigateFn, Settings } from "@/lib/types";

export interface PrivacyPageProps {
  settings: Settings;
  navigate: NavigateFn;
}

// Política de Privacidade (LGPD — Lei nº 13.709/2018). Documento legal bilíngue
// (PT/EN): o conteúdo acompanha o idioma selecionado no site.
export function PrivacyPage({ settings, navigate }: PrivacyPageProps) {
  const { lang, t } = useLang();
  const email = settings.email || "contato@armazemoffshore.com.br";
  const isEn = lang === "en";

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <section className="iso-stripe-bg text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 lg:py-16">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-accent transition mb-6">
            <Icon name="ArrowLeft" className="w-4 h-4" /> {t("certs.back")}
          </button>
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3">LGPD</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {isEn ? "Privacy Policy" : "Política de Privacidade"}
          </h1>
          <p className="mt-4 max-w-2xl text-white/75 leading-relaxed">
            {isEn
              ? "How Armazém Offshore collects, uses, stores and protects your personal data, in compliance with the Brazilian General Data Protection Law (LGPD — Law No. 13.709/2018)."
              : "Como a Armazém Offshore coleta, usa, armazena e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."}
          </p>
          <p className="mt-3 text-xs text-white/50">
            {isEn ? "Last updated: July 2026" : "Última atualização: julho de 2026"}
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 privacy-body">
          {isEn ? <EnglishBody email={email} /> : <PortugueseBody email={email} />}

          <div className="mt-10">
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2.5 text-sm font-bold hover:bg-primary-700 transition">
              <Icon name="ArrowLeft" className="w-4 h-4" /> {t("certs.back")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function PortugueseBody({ email }: { email: string }) {
  return (
    <>
      <p>
        A <strong>Armazém Offshore</strong> respeita a sua privacidade e está comprometida com a
        proteção dos dados pessoais tratados por meio deste site (<span className="font-mono">armazemoffshore.com.br</span>).
        Esta Política explica quais dados coletamos, com quais finalidades, como os utilizamos e
        quais são os seus direitos como titular.
      </p>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O controlador, responsável pelas decisões sobre o tratamento dos seus dados pessoais, é a
        <strong> Armazém Offshore</strong>. Para qualquer assunto relacionado a privacidade e proteção
        de dados, entre em contato pelo e-mail <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <p>Coletamos apenas os dados necessários para atender às suas solicitações:</p>
      <ul>
        <li><strong>Formulário de contato:</strong> nome, e-mail, telefone, empresa e a mensagem que você envia.</li>
        <li><strong>Newsletter:</strong> o e-mail informado, quando você opta por receber nossas comunicações.</li>
        <li><strong>Dados de navegação:</strong> informações técnicas coletadas automaticamente (como endereço IP e dados de uso), inclusive por ferramentas de análise, quando ativas.</li>
      </ul>

      <h2>3. Para que usamos os seus dados (finalidades e base legal)</h2>
      <ul>
        <li>Responder às suas solicitações de contato e cotação — base legal: execução de procedimentos preliminares a um contrato e legítimo interesse.</li>
        <li>Enviar comunicações e novidades por e-mail (newsletter) — base legal: o seu consentimento, que pode ser retirado a qualquer momento.</li>
        <li>Melhorar o funcionamento e a segurança do site — base legal: legítimo interesse.</li>
        <li>Cumprir obrigações legais e regulatórias, quando aplicável.</li>
      </ul>

      <h2>4. Cookies e tecnologias de análise</h2>
      <p>
        O site pode utilizar cookies e ferramentas de análise (por exemplo, Google Analytics) para
        entender como os visitantes o utilizam e aprimorar a experiência. Você pode gerenciar ou
        bloquear cookies nas configurações do seu navegador; a desativação pode afetar algumas
        funcionalidades.
      </p>

      <h2>5. Compartilhamento de dados</h2>
      <p>
        Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com prestadores de serviço
        que nos apoiam na operação do site e no envio de e-mails (por exemplo, provedores de
        hospedagem, banco de dados e serviço de e-mail), sempre limitados ao necessário e obrigados a
        protegê-los, ou quando exigido por lei ou autoridade competente.
      </p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados pelo tempo necessário para cumprir as finalidades desta Política e as
        obrigações legais. Os dados de contato e de inscrição na newsletter são mantidos enquanto
        houver relacionamento ou até que você solicite a exclusão ou cancele a inscrição.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Adotamos medidas técnicas e administrativas para proteger os dados contra acessos não
        autorizados, perda ou alteração. Nenhum sistema, porém, é totalmente imune a incidentes;
        trabalhamos continuamente para mitigar riscos.
      </p>

      <h2>8. Seus direitos como titular</h2>
      <p>Nos termos da LGPD, você pode, a qualquer momento:</p>
      <ul>
        <li>confirmar a existência de tratamento e acessar seus dados;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários;</li>
        <li>solicitar a portabilidade dos dados;</li>
        <li>revogar o consentimento e solicitar a eliminação dos dados tratados com base nele;</li>
        <li>obter informação sobre com quem compartilhamos seus dados.</li>
      </ul>

      <h2>9. Como exercer seus direitos</h2>
      <p>
        Para exercer qualquer um desses direitos, ou para cancelar a inscrição na newsletter, envie um
        e-mail para <a href={`mailto:${email}`}>{email}</a>. Responderemos no menor prazo possível.
      </p>

      <h2>10. Alterações desta Política</h2>
      <p>
        Esta Política pode ser atualizada periodicamente. A versão vigente estará sempre disponível
        nesta página, com a data da última atualização indicada acima.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre esta Política ou sobre o tratamento dos seus dados podem ser encaminhadas para
        <a href={`mailto:${email}`}> {email}</a>.
      </p>
    </>
  );
}

function EnglishBody({ email }: { email: string }) {
  return (
    <>
      <p>
        <strong>Armazém Offshore</strong> respects your privacy and is committed to protecting the
        personal data processed through this website (<span className="font-mono">armazemoffshore.com.br</span>).
        This Policy explains which data we collect, for which purposes, how we use it and what your
        rights as a data subject are.
      </p>

      <h2>1. Who is the data controller</h2>
      <p>
        The controller, responsible for the decisions regarding the processing of your personal data,
        is <strong>Armazém Offshore</strong>. For any matter related to privacy and data protection,
        please contact us at <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. What data we collect</h2>
      <p>We collect only the data necessary to respond to your requests:</p>
      <ul>
        <li><strong>Contact form:</strong> name, e-mail, phone number, company and the message you send.</li>
        <li><strong>Newsletter:</strong> the e-mail address you provide when you choose to receive our communications.</li>
        <li><strong>Browsing data:</strong> technical information collected automatically (such as IP address and usage data), including through analytics tools, when active.</li>
      </ul>

      <h2>3. How we use your data (purposes and legal basis)</h2>
      <ul>
        <li>Respond to your contact and quotation requests — legal basis: taking steps prior to entering into a contract and legitimate interest.</li>
        <li>Send communications and updates by e-mail (newsletter) — legal basis: your consent, which may be withdrawn at any time.</li>
        <li>Improve the operation and security of the website — legal basis: legitimate interest.</li>
        <li>Comply with legal and regulatory obligations, where applicable.</li>
      </ul>

      <h2>4. Cookies and analytics technologies</h2>
      <p>
        The website may use cookies and analytics tools (for example, Google Analytics) to understand
        how visitors use it and to improve the experience. You can manage or block cookies in your
        browser settings; disabling them may affect some features.
      </p>

      <h2>5. Data sharing</h2>
      <p>
        We do not sell your personal data. We may share it only with service providers that support us
        in operating the website and sending e-mails (for example, hosting, database and e-mail service
        providers), always limited to what is necessary and bound to protect it, or when required by
        law or a competent authority.
      </p>

      <h2>6. How long we keep your data</h2>
      <p>
        We retain data for as long as necessary to fulfil the purposes of this Policy and our legal
        obligations. Contact and newsletter subscription data are kept while there is an active
        relationship or until you request deletion or unsubscribe.
      </p>

      <h2>7. Security</h2>
      <p>
        We adopt technical and administrative measures to protect data against unauthorised access,
        loss or alteration. No system, however, is entirely immune to incidents; we work continuously
        to mitigate risks.
      </p>

      <h2>8. Your rights as a data subject</h2>
      <p>Under the LGPD, you may, at any time:</p>
      <ul>
        <li>confirm the existence of processing and access your data;</li>
        <li>correct incomplete, inaccurate or outdated data;</li>
        <li>request the anonymisation, blocking or deletion of unnecessary data;</li>
        <li>request the portability of your data;</li>
        <li>withdraw your consent and request the deletion of data processed on that basis;</li>
        <li>obtain information about with whom we share your data.</li>
      </ul>

      <h2>9. How to exercise your rights</h2>
      <p>
        To exercise any of these rights, or to unsubscribe from the newsletter, send an e-mail to
        <a href={`mailto:${email}`}> {email}</a>. We will respond as soon as possible.
      </p>

      <h2>10. Changes to this Policy</h2>
      <p>
        This Policy may be updated from time to time. The current version will always be available on
        this page, with the date of the last update indicated above.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Policy or about the processing of your data may be sent to
        <a href={`mailto:${email}`}> {email}</a>.
      </p>
    </>
  );
}
