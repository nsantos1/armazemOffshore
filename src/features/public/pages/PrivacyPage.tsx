"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import type { NavigateFn, Settings } from "@/lib/types";

export interface PrivacyPageProps {
  settings: Settings;
  navigate: NavigateFn;
}

// Política de Privacidade (LGPD — Lei nº 13.709/2018). Documento legal em português.
export function PrivacyPage({ settings, navigate }: PrivacyPageProps) {
  const { t } = useLang();
  const email = settings.email || "contato@armazemoffshore.com.br";

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <section className="iso-stripe-bg text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 lg:py-16">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-accent transition mb-6">
            <Icon name="ArrowLeft" className="w-4 h-4" /> {t("certs.back")}
          </button>
          <div className="text-xs font-bold uppercase tracking-[.25em] text-accent mb-3">LGPD</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Política de Privacidade</h1>
          <p className="mt-4 max-w-2xl text-white/75 leading-relaxed">
            Como a Armazém Offshore coleta, usa, armazena e protege os seus dados pessoais, em
            conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
          <p className="mt-3 text-xs text-white/50">Última atualização: julho de 2026</p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 privacy-body">
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
