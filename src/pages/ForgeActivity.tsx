import { useEffect, useMemo, useState } from "react";
import { Activity, Bot, ShieldCheck } from "lucide-react";
import { getForgeActions, getForgeAiJobs } from "../api/forgeApi";
import type { ForgeActionRequest, ForgeAiJob, WorkspaceSlug } from "../types";
import "./ForgeDataPages.css";

type ForgeActivityProps = {
  workspace: WorkspaceSlug;
};

type ActivityItem = {
  id: string;
  kind: "JOB" | "ACTION";
  title: string;
  detail: string;
  status: string;
  createdAt: string;
};

function ForgeActivity({ workspace }: ForgeActivityProps) {
  const [jobs, setJobs] = useState<ForgeAiJob[]>([]);
  const [actions, setActions] = useState<ForgeActionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    try {
      setLoading(true);
      setError("");
      const [loadedJobs, loadedActions] = await Promise.all([
        getForgeAiJobs(workspace),
        getForgeActions(workspace),
      ]);
      setJobs(loadedJobs);
      setActions(loadedActions);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Could not load activity.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
  }, [workspace]);

  const activity = useMemo<ActivityItem[]>(() => {
    const jobItems = jobs.map((job) => ({
      id: `job-${job.id}`,
      kind: "JOB" as const,
      title: job.agent,
      detail: job.request,
      status: job.status,
      createdAt: job.createdAt,
    }));

    const actionItems = actions.map((action) => ({
      id: `action-${action.id}`,
      kind: "ACTION" as const,
      title: action.actionType,
      detail: action.summary,
      status: action.status,
      createdAt: action.createdAt,
    }));

    return [...jobItems, ...actionItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jobs, actions]);

  return (
    <section className="forge-data-page">
      <header className="forge-data-header">
        <div>
          <span className="forge-pill"><Activity size={13} /> AUDIT TRAIL</span>
          <h1>Forge AI Activity</h1>
          <p>Every queued AI job and protected action is visible here for the active workspace.</p>
        </div>
      </header>

      {error && <div className="forge-data-error">{error}</div>}

      <div className="forge-data-card">
        {loading ? (
          <div className="forge-data-empty">Loading Forge activity...</div>
        ) : activity.length === 0 ? (
          <div className="forge-data-empty">No activity recorded yet.</div>
        ) : (
          <div className="forge-data-list">
            {activity.map((item) => (
              <div className="forge-data-row" key={item.id}>
                <div className="forge-data-row-main">
                  <div>
                    <span className="forge-pill">
                      {item.kind === "JOB" ? <Bot size={12} /> : <ShieldCheck size={12} />}
                      {item.kind}
                    </span>
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
                <div className="forge-row-actions">
                  <span className="forge-pill">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ForgeActivity;
