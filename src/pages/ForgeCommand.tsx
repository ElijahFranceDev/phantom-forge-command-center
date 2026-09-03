import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  createForgeAiJob,
  getForgeAiJobs,
  getForgeApprovals,
  getForgeHealth,
  getForgeMemory,
  getForgeTasks,
  runForgeAiJob,
  type ForgeAiProviderStatus,
} from "../api/forgeApi";
import type {
  ForgeAiJob,
  ForgeApprovalRequest,
  ForgeMemory,
  ForgeTask,
  WorkspaceSlug,
} from "../types";
import "./ForgeCommand.css";

type ForgeCommandProps = {
  workspace: WorkspaceSlug;
};

const WORKSPACE_LABELS: Record<WorkspaceSlug, string> = {
  ffs: "Frontline Forge Solutions",
  "forge-capital": "Forge Capital",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ForgeCommand({ workspace }: ForgeCommandProps) {
  const [command, setCommand] = useState("");
  const [jobs, setJobs] = useState<ForgeAiJob[]>([]);
  const [tasks, setTasks] = useState<ForgeTask[]>([]);
  const [memory, setMemory] = useState<ForgeMemory[]>([]);
  const [approvals, setApprovals] = useState<ForgeApprovalRequest[]>([]);
  const [coreStatus, setCoreStatus] = useState("checking");
  const [providerStatus, setProviderStatus] = useState<ForgeAiProviderStatus | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pendingApprovals = useMemo(
    () => approvals.filter((approval) => approval.status === "PENDING"),
    [approvals]
  );

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== "DONE"),
    [tasks]
  );

  const latestCompletedJob = useMemo(
    () => jobs.find((job) => job.status === "COMPLETED" && job.result),
    [jobs]
  );

  async function loadForgeData() {
    try {
      setError("");

      const [health, loadedJobs, loadedTasks, loadedMemory, loadedApprovals] =
        await Promise.all([
          getForgeHealth(),
          getForgeAiJobs(workspace),
          getForgeTasks(workspace),
          getForgeMemory(workspace),
          getForgeApprovals(workspace),
        ]);

      setCoreStatus(health.status);
      setProviderStatus(health.aiProvider);
      setJobs(loadedJobs);
      setTasks(loadedTasks);
      setMemory(loadedMemory);
      setApprovals(loadedApprovals);
    } catch (loadError) {
      console.error(loadError);
      setCoreStatus("offline");
      setProviderStatus(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not connect to Forge Command Core."
      );
    }
  }

  useEffect(() => {
    loadForgeData();
  }, [workspace]);

  async function submitCommand(event: React.FormEvent) {
    event.preventDefault();

    const request = command.trim();

    if (!request || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const queuedJob = await createForgeAiJob(workspace, request);
      setJobs((currentJobs) => [queuedJob, ...currentJobs]);
      setCommand("");

      const completedJob = await runForgeAiJob(queuedJob.id);
      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === completedJob.id ? completedJob : job
        )
      );
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Forge Executive could not complete the request."
      );
      await loadForgeData();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="forge-command-page">
      <div className="forge-command-hero">
        <div>
          <div className="forge-command-kicker">
            <Sparkles size={16} />
            <span>Forge Executive</span>
          </div>
          <h1>What are we working on, boss?</h1>
          <p>
            {WORKSPACE_LABELS[workspace]} is active. PhantomSync loads this
            workspace's durable memory and open tasks before Forge Executive
            answers.
          </p>
        </div>

        <div className="forge-system-stack">
          <div className={`forge-core-status ${coreStatus}`}>
            <span className="status-dot" />
            <div>
              <strong>PhantomSync Core</strong>
              <small>{coreStatus === "healthy" ? "Connected" : coreStatus}</small>
            </div>
          </div>

          <div
            className={`forge-core-status ${
              providerStatus?.configured ? "healthy" : "offline"
            }`}
          >
            <Cpu size={16} />
            <div>
              <strong>AI Brain</strong>
              <small>
                {providerStatus?.configured
                  ? providerStatus.model || providerStatus.provider
                  : "Model not configured"}
              </small>
            </div>
          </div>
        </div>
      </div>

      {providerStatus && !providerStatus.configured && (
        <div className="forge-provider-notice">
          <Cpu size={17} />
          <div>
            <strong>Forge Executive is wired but needs a model connection.</strong>
            <span>{providerStatus.reason}</span>
          </div>
        </div>
      )}

      {error && <div className="forge-command-error">{error}</div>}

      <form className="forge-command-box" onSubmit={submitCommand}>
        <div className="forge-command-box-topline">
          <Bot size={18} />
          <span>Command Forge Executive</span>
        </div>

        <textarea
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder={
            workspace === "ffs"
              ? "Example: Review FFS operations and tell me what needs my attention."
              : "Example: Create a due diligence task list for the newest acquisition lead."
          }
          rows={4}
        />

        <div className="forge-command-actions">
          <div className="forge-command-safety">
            <ShieldCheck size={16} />
            <span>Production actions remain approval-gated.</span>
          </div>

          <button
            type="submit"
            disabled={!command.trim() || submitting || !providerStatus?.configured}
          >
            {submitting ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
            {submitting ? "Thinking" : "Run Command"}
          </button>
        </div>
      </form>

      {latestCompletedJob?.result && (
        <article className="forge-executive-response">
          <div className="forge-response-heading">
            <div className="forge-response-avatar">
              <Bot size={19} />
            </div>
            <div>
              <span>Forge Executive</span>
              <small>{formatDate(latestCompletedJob.updatedAt)}</small>
            </div>
          </div>
          <div className="forge-response-body">{latestCompletedJob.result}</div>
        </article>
      )}

      <div className="forge-stat-grid">
        <article>
          <div className="forge-stat-icon"><Activity size={19} /></div>
          <div>
            <span>AI Jobs</span>
            <strong>{jobs.length}</strong>
          </div>
        </article>

        <article>
          <div className="forge-stat-icon"><Clock3 size={19} /></div>
          <div>
            <span>Open Tasks</span>
            <strong>{openTasks.length}</strong>
          </div>
        </article>

        <article>
          <div className="forge-stat-icon"><Brain size={19} /></div>
          <div>
            <span>Memory Items</span>
            <strong>{memory.length}</strong>
          </div>
        </article>

        <article>
          <div className="forge-stat-icon"><CheckCircle2 size={19} /></div>
          <div>
            <span>Approvals Waiting</span>
            <strong>{pendingApprovals.length}</strong>
          </div>
        </article>
      </div>

      <div className="forge-command-columns">
        <div className="forge-panel forge-jobs-panel">
          <div className="forge-panel-heading">
            <div>
              <span className="forge-panel-kicker">Activity</span>
              <h3>Recent AI Jobs</h3>
            </div>
            <Code2 size={20} />
          </div>

          <div className="forge-list">
            {jobs.length === 0 ? (
              <div className="forge-empty-state">
                No AI jobs yet. Send the first command above.
              </div>
            ) : (
              jobs.slice(0, 8).map((job) => (
                <div className="forge-list-item" key={job.id}>
                  <div className="forge-list-main">
                    <strong>{job.agent}</strong>
                    <p>{job.request}</p>
                    {job.result && job.status === "FAILED" && (
                      <p className="forge-failed-result">{job.result}</p>
                    )}
                    <small>{formatDate(job.createdAt)}</small>
                  </div>
                  <span className={`forge-job-status ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="forge-panel">
          <div className="forge-panel-heading">
            <div>
              <span className="forge-panel-kicker">Safety</span>
              <h3>Approval Queue</h3>
            </div>
            <ShieldCheck size={20} />
          </div>

          <div className="forge-list">
            {pendingApprovals.length === 0 ? (
              <div className="forge-empty-state">
                No protected actions are waiting for approval.
              </div>
            ) : (
              pendingApprovals.slice(0, 6).map((approval) => (
                <div className="forge-list-item" key={approval.id}>
                  <div className="forge-list-main">
                    <strong>{approval.title}</strong>
                    <p>{approval.summary}</p>
                    <small>{formatDate(approval.createdAt)}</small>
                  </div>
                  <span className="forge-job-status pending">PENDING</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgeCommand;
