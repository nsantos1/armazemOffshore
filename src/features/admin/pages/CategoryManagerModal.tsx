"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/useConfirm";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { flushPersist } from "@/lib/storage";
import { isApiFailure } from "@/lib/types";

export interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
  currentCategory: string;
  onCategoryChange: (newCategory: string) => void;
  onChanged?: () => void;
}

export function CategoryManagerModal({ open, onClose, currentCategory, onCategoryChange, onChanged }: CategoryManagerModalProps) {
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [list, setList] = React.useState<string[]>([]);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setList(api.getCategories());
      setNewName("");
      setEditingId(null);
      setEditingValue("");
    }
  }, [open]);

  const reload = () => {
    setList(api.getCategories());
    onChanged?.();
  };

  // Confirma no servidor antes de avisar sucesso.
  const confirmSaved = async (okMsg: string) => {
    const ok = await flushPersist();
    toast(ok ? okMsg : "Não foi possível salvar no servidor. Tente novamente.", ok ? "success" : "error");
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) { toast("Digite um nome para a categoria.", "error"); return; }
    const r = api.addCategory(name);
    if (isApiFailure(r)) {
      if (r.reason === "duplicate") toast("Essa categoria já existe.", "error");
      else if (r.reason === "too_long") toast("Nome muito longo (máx. 40 caracteres).", "error");
      else toast("Nome inválido.", "error");
      return;
    }
    setNewName("");
    reload();
    await confirmSaved(`Categoria "${r.category}" adicionada.`);
  };

  const startEdit = (cat: string) => {
    setEditingId(cat);
    setEditingValue(cat);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async (oldName: string) => {
    const newVal = editingValue.trim();
    if (!newVal) { toast("Digite um nome válido.", "error"); return; }
    if (newVal === oldName) { cancelEdit(); return; }
    const r = api.renameCategory(oldName, newVal);
    if (isApiFailure(r)) {
      if (r.reason === "duplicate") toast("Já existe uma categoria com esse nome.", "error");
      else if (r.reason === "too_long") toast("Nome muito longo (máx. 40 caracteres).", "error");
      else toast("Nome inválido.", "error");
      return;
    }
    if (currentCategory === oldName) {
      onCategoryChange(r.category);
    }
    cancelEdit();
    reload();
    await confirmSaved(`Categoria renomeada para "${r.category}".`);
  };

  const handleDelete = async (cat: string) => {
    const ok = await confirm({
      title: "Excluir categoria",
      message: `Tem certeza que deseja excluir a categoria "${cat}"?`,
      danger: true,
      confirmText: "Excluir",
    });
    if (!ok) return;
    const r = api.deleteCategory(cat);
    if (isApiFailure(r)) {
      if (r.reason === "last_one") toast("Você precisa manter pelo menos uma categoria.", "error");
      else toast("Não foi possível excluir.", "error");
      return;
    }
    reload();
    await confirmSaved(`Categoria "${cat}" excluída.`);
  };

  return (
    <>
      {confirmNode}
      <Modal
        open={open}
        onClose={onClose}
        title="Gerenciar categorias"
        size="md"
        footer={<Button variant="primary" onClick={onClose}>Fechar</Button>}
      >
        <div className="space-y-4">
          {/* Add new */}
          <div className="rounded-lg bg-bg-soft border border-slate-200 p-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Nova categoria
            </label>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                placeholder="Ex: Tecnologia & Inovação"
                maxLength={40}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleAdd}>
                <Icon name="Plus" className="w-4 h-4" /> Adicionar
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-text-muted">Máximo 40 caracteres.</p>
          </div>

          {/* List */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Categorias existentes ({list.length})
            </label>
            {list.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">Nenhuma categoria cadastrada.</p>
            ) : (
              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 overflow-hidden">
                {list.map(cat => {
                  const isEditing = editingId === cat;
                  return (
                    <li key={cat} className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-bg-soft">
                      {isEditing ? (
                        <>
                          <Input
                            value={editingValue}
                            onChange={e => setEditingValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") { e.preventDefault(); saveEdit(cat); }
                              else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                            }}
                            autoFocus
                            maxLength={40}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(cat)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md"
                            title="Salvar"
                          >
                            <Icon name="Check" className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-2 text-text-muted hover:bg-slate-100 rounded-md"
                            title="Cancelar"
                          >
                            <Icon name="X" className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-700 whitespace-nowrap">
                            {cat}
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              className="p-2 text-text-muted hover:text-primary hover:bg-slate-100 rounded-md"
                              title="Renomear"
                            >
                              <Icon name="Pencil" className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              className="p-2 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50"
                              title="Excluir"
                            >
                              <Icon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-xs text-text-muted">
              <Icon name="Info" className="inline w-3 h-3 mr-1" />
              As notícias guardam o nome da categoria. Renomear/excluir aqui altera a lista de opções; notícias já publicadas mantêm a categoria com que foram salvas.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
