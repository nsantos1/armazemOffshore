"use client";

import * as React from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmOptions {
  title?: React.ReactNode;
  message: React.ReactNode;
  danger?: boolean;
  confirmText?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

// Diálogo de confirmação declarativo: `const [confirm, confirmNode] = useConfirm();`
// depois `if (!(await confirm({ message: "..." }))) return;` — renderize `confirmNode` no JSX.
export function useConfirm(): [ConfirmFn, React.ReactNode] {
  const [state, setState] = React.useState<ConfirmState | null>(null);
  const confirm: ConfirmFn = (opts) => new Promise(resolve => setState({ ...opts, resolve }));
  const node = state ? (
    <Modal
      open={true}
      onClose={() => { state.resolve(false); setState(null); }}
      title={state.title || "Confirmar"}
      footer={
        <>
          <Button variant="ghost" onClick={() => { state.resolve(false); setState(null); }}>Cancelar</Button>
          <Button variant={state.danger ? "danger" : "primary"} onClick={() => { state.resolve(true); setState(null); }}>
            {state.confirmText || "Confirmar"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{state.message}</p>
    </Modal>
  ) : null;
  return [confirm, node];
}
