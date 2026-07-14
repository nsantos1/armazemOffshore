// Globais usadas pelo roteador hash-based (ver app-shell/router.ts) para repassar
// uma âncora pendente entre navegações (ex.: "/#contato" -> rota "/" + scroll).
declare global {
  interface Window {
    __pendingHash?: string | null;
  }
}

export {};
