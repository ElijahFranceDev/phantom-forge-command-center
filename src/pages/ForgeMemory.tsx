import { useEffect, useState } from "react";
import { Pin, Plus, Trash2 } from "lucide-react";
import {
  createForgeMemory,
  deleteForgeMemory,
  getForgeMemory,
  updateForgeMemory,
} from "../api/forgeApi";
import type { ForgeMemory as ForgeMemoryItem, WorkspaceSlug } from "../types";
import "./ForgeDataPages.css";

type ForgeMemoryProps = {
  workspace: WorkspaceSlug;
};

function ForgeMemory({ workspace }: ForgeMemoryProps) {
  const [items, setItems] = useState<ForgeMemoryItem[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadMemory() {
    try {
      setLoading(true);
      setError("");
      setItems(await getForgeMemory(workspace));
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Could not load memory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemory();
  }, [workspace]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    try {
      setSaving(true);
      const memory = await createForgeMemory(workspace, {
        content: content.trim(),
        category,
        isPinned,
        source: "Forge Command",
      });
      setItems((current) => [memory, ...current]);
      setContent("");
      setCategory("GENERAL");
      setIsPinned(false);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Could not save memory.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(item: ForgeMemoryItem) {
    try {
      const updated = await updateForgeMemory(item.id, { isPinned: !item.isPinned });
      setItems((current) =>
        current
          .map((memory) => (memory.id === updated.id ? updated : memory))
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      );
    } catch (updateError) {
      console.error(updateError);
      setError(updateError instanceof Error ? updateError.message : "Could not update memory.");
    }
  }

  async function removeMemory(id: string) {
    try {
      await deleteForgeMemory(id);
      setItems((current) => current.filter((memory) => memory.id !== id));
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete memory.");
    }
  }

  return (
    <section className="forge-data-page">
      <header className="forge-data-header">
        <div>
          <span className="forge-pill">PHANTOMSYNC</span>
          <h1>{workspace === "ffs" ? "FFS" : "Forge Capital"} Memory</h1>
          <p>Durable workspace facts live here instead of disappearing when a conversation ends.</p>
        </div>
      </header>

      {error && <div className="forge-data-error">{error}</div>}

      <div className="forge-data-card">
        <form className="forge-memory-compose" onSubmit={handleSave}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Save a durable fact, rule, decision, or project context..."
          />
          <div className="forge-memory-options">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="GENERAL">General</option>
              <option value="OPERATIONS">Operations</option>
              <option value="FINANCE">Finance</option>
              <option value="PROJECT">Project</option>
              <option value="POLICY">Policy</option>
              <option value="DEAL">Deal</option>
              <option value="TECHNOLOGY">Technology</option>
            </select>
            <label className="forge-checkbox">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
              />
              Pin as high-visibility memory
            </label>
            <button className="forge-primary-button" type="submit" disabled={!content.trim() || saving}>
              <Plus size={16} /> Save Memory
            </button>
          </div>
        </form>
      </div>

      <div className="forge-data-card">
        {loading ? (
          <div className="forge-data-empty">Loading memory...</div>
        ) : items.length === 0 ? (
          <div className="forge-data-empty">No durable memory saved for this workspace yet.</div>
        ) : (
          <div className="forge-data-list">
            {items.map((item) => (
              <div className="forge-data-row" key={item.id}>
                <div className="forge-data-row-main">
                  <div>
                    <span className="forge-pill">{item.category}</span>
                  </div>
                  <p>{item.content}</p>
                  <small>{item.source || "Unknown source"}</small>
                </div>
                <div className="forge-row-actions">
                  <button className="forge-secondary-button" onClick={() => togglePin(item)}>
                    <Pin size={15} /> {item.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button className="forge-danger-button" onClick={() => removeMemory(item.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ForgeMemory;
