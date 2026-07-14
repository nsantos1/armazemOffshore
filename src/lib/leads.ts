// Leads do formulário de contato. Persistência via camada genérica de banco
// (ver db.ts): a lista de leads é um registro JSON sob a chave "leads".
// Server-only — importe só em route handlers.
//
// Observação: quando o banco real entrar, o ideal é que leads seja uma TABELA
// própria (um INSERT por lead) para evitar corrida em envios simultâneos. A
// interface abaixo (readLeads/saveLead) não muda — só a implementação do adapter.

import { getBlob, setBlob } from "./db";

const KEY = "leads";

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  newsletter: boolean;
  ip: string;
}

export async function readLeads(): Promise<Lead[]> {
  return (await getBlob<Lead[]>(KEY)) ?? [];
}

export async function saveLead(lead: Lead): Promise<void> {
  const list = await readLeads();
  list.push(lead);
  await setBlob(KEY, list);
}
