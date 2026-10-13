import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  X,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  Check,
  Folder,
} from "lucide-react";

export const CategoryManagerModal: React.FC = () => {
  const {
    categories,
    isCategoryModalOpen,
    setCategoryModalOpen,
    createCategory,
    renameCategory,
    deleteCategory,
    installedPlugins,
    movePluginToCategory,
  } = useAppStore();

  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  if (!isCategoryModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      createCategory(newCatName.trim());
      setNewCatName("");
    }
  };

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameCategory(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-[var(--tu-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[var(--tu-accent)]" />
            <h3 className="font-bold text-sm text-[var(--tu-text-primary)]">
              Manage Navigation Categories
            </h3>
          </div>
          <button
            onClick={() => setCategoryModalOpen(false)}
            className="text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] p-1 rounded hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Add Category Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Exam Prep, Daily Tools..."
              className="flex-1 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Folder className="w-4 h-4 text-[var(--tu-text-accent)] shrink-0" />
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveRename(cat.id)}
                          className="bg-[var(--tu-bg-base)] border border-[var(--tu-border)] rounded px-2 py-0.5 text-xs text-[var(--tu-text-primary)] w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(cat.id)}
                          className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-xs text-[var(--tu-text-primary)]">
                        {cat.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono text-[var(--tu-text-muted)] mr-2">
                      {cat.pluginIds.length} items
                    </span>
                    <button
                      onClick={() => handleStartRename(cat.id, cat.name)}
                      className="p-1 text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] rounded"
                      title="Rename category"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1 text-[var(--tu-danger)] hover:bg-[var(--tu-danger)]/10 rounded"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Plugins in this category */}
                {cat.pluginIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[var(--tu-border-subtle)]">
                    {cat.pluginIds.map((pluginId) => {
                      const p = installedPlugins[pluginId];
                      const name = p ? p.manifest.name : pluginId;
                      return (
                        <div
                          key={pluginId}
                          className="group/tag inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-secondary)]"
                        >
                          <span>{name}</span>
                          <select
                            value={cat.id}
                            onChange={(e) => movePluginToCategory(pluginId, e.target.value)}
                            className="opacity-0 group-hover/tag:opacity-100 bg-transparent text-[9px] text-[var(--tu-text-accent)] cursor-pointer"
                            title="Move to another category"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id} className="bg-[var(--tu-bg-surface)] text-[var(--tu-text-primary)]">
                                Move to: {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[var(--tu-bg-card)] border-t border-[var(--tu-border)] flex justify-end">
          <button
            onClick={() => setCategoryModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
