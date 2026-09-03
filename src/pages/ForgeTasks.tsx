import { useEffect, useState } from "react";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  createForgeTask,
  deleteForgeTask,
  getForgeTasks,
  updateForgeTask,
} from "../api/forgeApi";
import type { ForgeTask, WorkspaceSlug } from "../types";
import "./ForgeDataPages.css";

type ForgeTasksProps = {
  workspace: WorkspaceSlug;
};

function ForgeTasks({ workspace }: ForgeTasksProps) {
  const [tasks, setTasks] = useState<ForgeTask[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");
      setTasks(await getForgeTasks(workspace));
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [workspace]);

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const task = await createForgeTask(workspace, {
        title: title.trim(),
        priority,
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
      setPriority("NORMAL");
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Could not create task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: ForgeTask) {
    try {
      const updated = await updateForgeTask(task.id, {
        status: task.status === "DONE" ? "OPEN" : "DONE",
      });
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (updateError) {
      console.error(updateError);
      setError(updateError instanceof Error ? updateError.message : "Could not update task.");
    }
  }

  async function removeTask(id: string) {
    try {
      await deleteForgeTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete task.");
    }
  }

  return (
    <section className="forge-data-page">
      <header className="forge-data-header">
        <div>
          <span className="forge-pill">{workspace === "ffs" ? "FFS" : "FORGE CAPITAL"}</span>
          <h1>AI Tasks</h1>
          <p>Track work that Forge Executive, Forge Developer, and business agents need to complete.</p>
        </div>
      </header>

      {error && <div className="forge-data-error">{error}</div>}

      <div className="forge-data-card">
        <form className="forge-data-form three" onSubmit={handleCreateTask}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task for this workspace..."
          />
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <button className="forge-primary-button" type="submit" disabled={!title.trim() || saving}>
            <Plus size={16} /> Add Task
          </button>
        </form>
      </div>

      <div className="forge-data-card">
        {loading ? (
          <div className="forge-data-empty">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="forge-data-empty">No Forge tasks yet.</div>
        ) : (
          <div className="forge-data-list">
            {tasks.map((task) => (
              <div className="forge-data-row" key={task.id}>
                <div className="forge-data-row-main">
                  <div>
                    <span className="forge-pill">{task.priority}</span>
                  </div>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <small>{task.status}</small>
                </div>
                <div className="forge-row-actions">
                  <button className="forge-secondary-button" onClick={() => toggleTask(task)}>
                    {task.status === "DONE" ? <RotateCcw size={15} /> : <Check size={15} />}
                    {task.status === "DONE" ? "Reopen" : "Done"}
                  </button>
                  <button className="forge-danger-button" onClick={() => removeTask(task.id)}>
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

export default ForgeTasks;
