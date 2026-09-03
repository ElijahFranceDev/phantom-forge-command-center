import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Code2,
  ExternalLink,
  GitBranch,
  Github,
  Hammer,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  createForgeAppBuild,
  createSoftwareProject,
  getForgeAppBuilds,
  getForgeDeveloperRuns,
  getForgeDeveloperStatus,
  getSoftwareProjects,
  inspectSoftwareProject,
  prepareCodeChange,
  refreshForgeDeveloperRun,
  requestForgeProductionRelease,
} from "../api/forgeApi";
import type {
  ForgeAppBuild,
  ForgeDeveloperRun,
  ForgeDeveloperStatus,
  ForgeRepositoryInspection,
  SoftwareProject,
  WorkspaceSlug,
} from "../types";
import "./ForgeDataPages.css";
import "./ForgeDeveloper.css";

type ForgeDeveloperProps = {
  workspace: WorkspaceSlug;
};

type DeveloperTab = "projects" | "runs" | "builder";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/_/g, "-");
}

function ForgeDeveloper({ workspace }: ForgeDeveloperProps) {
  const [tab, setTab] = useState<DeveloperTab>("projects");
  const [status, setStatus] = useState<ForgeDeveloperStatus | null>(null);
  const [projects, setProjects] = useState<SoftwareProject[]>([]);
  const [runs, setRuns] = useState<ForgeDeveloperRun[]>([]);
  const [appBuilds, setAppBuilds] = useState<ForgeAppBuild[]>([]);
  const [inspection, setInspection] = useState<ForgeRepositoryInspection | null>(null);
  const [name, setName] = useState("");
  const [repositoryFullName, setRepositoryFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [changeProject, setChangeProject] = useState<SoftwareProject | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [changeInstructions, setChangeInstructions] = useState("");
  const [buildName, setBuildName] = useState("");
  const [buildPrompt, setBuildPrompt] = useState("");
  const [buildRepo, setBuildRepo] = useState("");

  const githubConfigured = status?.github.configured === true;
  const vercelConfigured = status?.vercel.configured === true;

  const activeRuns = useMemo(
    () =>
      runs.filter((run) =>
        ["PLANNING", "WRITING", "WAITING_CI", "CI_FAILED", "REPAIRING"].includes(
          run.status
        )
      ),
    [runs]
  );

  async function loadDeveloperData(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");
      const [developerStatus, loadedProjects, loadedRuns, loadedBuilds] =
        await Promise.all([
          getForgeDeveloperStatus(),
          getSoftwareProjects(workspace),
          getForgeDeveloperRuns(workspace),
          getForgeAppBuilds(workspace),
        ]);
      setStatus(developerStatus);
      setProjects(loadedProjects);
      setRuns(loadedRuns);
      setAppBuilds(loadedBuilds);
      if (!silent) {
        setInspection(null);
        setChangeProject(null);
      }
    } catch (loadError) {
      console.error(loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load Forge Developer."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadDeveloperData();
  }, [workspace]);

  useEffect(() => {
    if (activeRuns.length === 0) return;

    const timer = window.setInterval(async () => {
      const candidates = activeRuns
        .filter((run) => ["WAITING_CI", "CI_FAILED"].includes(run.status))
        .slice(0, 3);

      if (!candidates.length) return;

      await Promise.allSettled(
        candidates.map((run) => refreshForgeDeveloperRun(run.id, true))
      );
      await loadDeveloperData(true);
    }, 15000);

    return () => window.clearInterval(timer);
  }, [activeRuns.map((run) => `${run.id}:${run.status}`).join("|")]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError("");
      const project = await createSoftwareProject(workspace, {
        slug: slugify(name),
        name: name.trim(),
        repositoryFullName: repositoryFullName.trim() || undefined,
      });
      setProjects((current) => [...current, project].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setRepositoryFullName("");
      setNotice("Software project registered.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not register software project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleInspect(project: SoftwareProject) {
    try {
      setBusyId(project.id);
      setError("");
      setInspection(await inspectSoftwareProject(project.id));
    } catch (inspectError) {
      setError(inspectError instanceof Error ? inspectError.message : "Could not inspect repository.");
    } finally {
      setBusyId("");
    }
  }

  async function submitChangeRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!changeProject || !changeSummary.trim() || !changeInstructions.trim()) return;

    try {
      setSaving(true);
      setError("");
      await prepareCodeChange(changeProject.id, {
        summary: changeSummary.trim(),
        instructions: changeInstructions.trim(),
      });
      setChangeProject(null);
      setChangeSummary("");
      setChangeInstructions("");
      setNotice("Code change sent to the approval queue. Approval will launch Forge Developer.");
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "Could not prepare code change.");
    } finally {
      setSaving(false);
    }
  }

  async function submitAppBuild(event: React.FormEvent) {
    event.preventDefault();
    if (!buildName.trim() || !buildPrompt.trim()) return;

    try {
      setSaving(true);
      setError("");
      await createForgeAppBuild(workspace, {
        name: buildName.trim(),
        prompt: buildPrompt.trim(),
        repositoryName: buildRepo.trim() || undefined,
        private: true,
      });
      setBuildName("");
      setBuildPrompt("");
      setBuildRepo("");
      setNotice("New application build is in the approval queue.");
      await loadDeveloperData(true);
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : "Could not prepare app build.");
    } finally {
      setSaving(false);
    }
  }

  async function refreshRun(run: ForgeDeveloperRun) {
    try {
      setBusyId(run.id);
      setError("");
      await refreshForgeDeveloperRun(run.id, true);
      await loadDeveloperData(true);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not refresh CI status.");
    } finally {
      setBusyId("");
    }
  }

  async function requestProduction(run: ForgeDeveloperRun) {
    try {
      setBusyId(run.id);
      setError("");
      await requestForgeProductionRelease(run.id);
      setNotice("Production release sent to the protected approval queue.");
      await loadDeveloperData(true);
    } catch (releaseError) {
      setError(releaseError instanceof Error ? releaseError.message : "Could not request production release.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="forge-data-page forge-developer-page developer-v2">
      <header className="forge-data-header developer-v2-header">
        <div>
          <span className="forge-pill"><Code2 size={13} /> FORGE DEVELOPER</span>
          <h1>Software Command</h1>
          <p>Build new apps, modify existing systems, watch CI repair itself, review previews, and control production releases.</p>
        </div>

        <div className="developer-provider-stack">
          <div className={`developer-connection ${githubConfigured ? "connected" : "offline"}`}>
            <Github size={18} /><div><strong>GitHub</strong><small>{githubConfigured ? "Connected" : "Setup needed"}</small></div>
          </div>
          <div className={`developer-connection ${vercelConfigured ? "connected" : "offline"}`}>
            <Rocket size={18} /><div><strong>Vercel</strong><small>{vercelConfigured ? "Connected" : "Setup needed"}</small></div>
          </div>
        </div>
      </header>

      {notice && <div className="forge-provider-notice success"><CheckCircle2 size={17} /><span>{notice}</span></div>}
      {error && <div className="forge-data-error">{error}</div>}

      <div className="developer-tabs">
        <button className={tab === "projects" ? "active" : ""} onClick={() => setTab("projects")}><Github size={15} /> Projects</button>
        <button className={tab === "runs" ? "active" : ""} onClick={() => setTab("runs")}><GitBranch size={15} /> Build Runs <span>{runs.length}</span></button>
        <button className={tab === "builder" ? "active" : ""} onClick={() => setTab("builder")}><Sparkles size={15} /> Build New App</button>
      </div>

      {tab === "projects" && (
        <>
          <div className="forge-data-card">
            <form className="developer-register-form" onSubmit={handleRegister}>
              <div><label>Project name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="FFS Carrier Portal" /></div>
              <div><label>GitHub repository</label><input value={repositoryFullName} onChange={(e) => setRepositoryFullName(e.target.value)} placeholder="ElijahFranceDev/repository-name" /></div>
              <button className="forge-primary-button" disabled={!name.trim() || saving}><Plus size={16} /> Register</button>
            </form>
          </div>

          <div className="developer-layout">
            <div className="forge-data-card">
              <div className="developer-section-heading"><div><span className="forge-panel-kicker">Registry</span><h3>Software Projects</h3></div><Code2 size={18} /></div>
              {loading ? <div className="forge-data-empty">Loading...</div> : projects.length === 0 ? <div className="forge-data-empty">No projects registered yet.</div> : (
                <div className="forge-data-list">
                  {projects.map((project) => (
                    <div className="forge-data-row developer-project-row" key={project.id}>
                      <div className="forge-data-row-main">
                        <div><span className="forge-pill">{project.projectType}</span></div>
                        <strong>{project.name}</strong>
                        <p>{project.repositoryFullName || "No repository registered"}</p>
                        <small>{project.defaultBranch} · {project.status}{project.productionUrl ? " · LIVE" : ""}</small>
                      </div>
                      <div className="forge-row-actions">
                        <button className="forge-secondary-button" disabled={!project.repositoryFullName || !githubConfigured || busyId === project.id} onClick={() => handleInspect(project)}>{busyId === project.id ? <Loader2 className="spin" size={15} /> : <Search size={15} />} Inspect</button>
                        <button className="forge-secondary-button" disabled={!project.repositoryFullName} onClick={() => setChangeProject(project)}><GitBranch size={15} /> Change</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="forge-data-card developer-inspection-card">
              <div className="developer-section-heading"><div><span className="forge-panel-kicker">Repository</span><h3>Inspection</h3></div><Github size={18} /></div>
              {!inspection ? <div className="forge-data-empty">Select Inspect to read the current repository structure.</div> : (
                <div className="developer-inspection">
                  <div className="developer-repo-summary"><strong>{inspection.inspection.repository.fullName}</strong><span>{inspection.inspection.repository.language || "Unknown language"}</span><small>{inspection.inspection.repository.private ? "Private" : "Public"} · {inspection.inspection.repository.defaultBranch}</small></div>
                  <div className="developer-file-grid">{inspection.inspection.importantFiles.map((file) => <div key={file.path}><strong>{file.name}</strong><small>{file.type}</small></div>)}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "runs" && (
        <div className="forge-data-card developer-runs-card">
          <div className="developer-section-heading"><div><span className="forge-panel-kicker">Automation</span><h3>Developer Runs</h3></div><Hammer size={18} /></div>
          {runs.length === 0 ? <div className="forge-data-empty">No developer runs yet.</div> : (
            <div className="developer-run-list">
              {runs.map((run) => {
                const preview = run.deployments?.find((deployment) => deployment.environment === "PREVIEW" && deployment.status !== "FAILED");
                return (
                  <article className="developer-run" key={run.id}>
                    <div className="developer-run-head">
                      <div><span className={`developer-run-status ${statusClass(run.status)}`}>{run.status}</span><h3>{run.softwareProject?.name || "Software project"}</h3><p>{run.runType} · {run.targetBranch || run.baseBranch}</p></div>
                      <div className="forge-row-actions">
                        <button className="forge-secondary-button" disabled={busyId === run.id || !run.targetBranch} onClick={() => refreshRun(run)}>{busyId === run.id ? <Loader2 className="spin" size={15} /> : <RefreshCw size={15} />} Check CI</button>
                        {run.status === "READY_REVIEW" && preview && <button className="forge-primary-button" disabled={busyId === run.id} onClick={() => requestProduction(run)}><ShieldCheck size={15} /> Request Production</button>}
                      </div>
                    </div>
                    <div className="developer-run-meta">
                      <span>Attempts <strong>{run.attempts}</strong></span>
                      <span>Files <strong>{run.fileChanges?.length || 0}</strong></span>
                      <span>PR <strong>{run.pullRequestNumber ? `#${run.pullRequestNumber}` : "—"}</strong></span>
                      <span>Preview <strong>{preview ? preview.status : "—"}</strong></span>
                    </div>
                    {(run.pullRequestUrl || preview?.url) && <div className="developer-run-links">{run.pullRequestUrl && <a href={run.pullRequestUrl} target="_blank" rel="noreferrer"><Github size={14} /> Pull Request <ExternalLink size={12} /></a>}{preview?.url && <a href={preview.url} target="_blank" rel="noreferrer"><Rocket size={14} /> Preview <ExternalLink size={12} /></a>}</div>}
                    {run.errorLog && <pre className="developer-error-log">{run.errorLog}</pre>}
                    {(run.fileChanges?.length || 0) > 0 && <div className="developer-change-chips">{run.fileChanges?.slice(0, 12).map((file) => <span key={file.id}>{file.operation} · {file.path}</span>)}</div>}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "builder" && (
        <div className="developer-builder-grid">
          <form className="forge-data-card developer-builder-form" onSubmit={submitAppBuild}>
            <div className="developer-section-heading"><div><span className="forge-panel-kicker">Forge Builder</span><h3>Build a New Full-Stack App</h3></div><Bot size={19} /></div>
            <label>App name</label><input value={buildName} onChange={(e) => { setBuildName(e.target.value); if (!buildRepo) setBuildRepo(slugify(e.target.value)); }} placeholder="Forge Capital Deal Room" />
            <label>Private repository name</label><input value={buildRepo} onChange={(e) => setBuildRepo(slugify(e.target.value))} placeholder="forge-capital-deal-room" />
            <label>Tell Forge exactly what to build</label><textarea value={buildPrompt} onChange={(e) => setBuildPrompt(e.target.value)} rows={10} placeholder="Build a private acquisition management app with seller profiles, due diligence, financial review, document tracking, offer status, follow-ups..." />
            <div className="developer-builder-safety"><ShieldCheck size={16} /> Approval creates the repo/branch/PR/preview. Production still requires a second approval.</div>
            <button className="forge-primary-button" disabled={saving || !buildName.trim() || !buildPrompt.trim()}>{saving ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />} Send Build to Approval</button>
          </form>

          <div className="forge-data-card">
            <div className="developer-section-heading"><div><span className="forge-panel-kicker">Build Queue</span><h3>Generated Applications</h3></div><Rocket size={18} /></div>
            {appBuilds.length === 0 ? <div className="forge-data-empty">No generated app builds yet.</div> : <div className="forge-data-list">{appBuilds.map((build) => <div className="forge-data-row" key={build.id}><div className="forge-data-row-main"><div><span className={`developer-run-status ${statusClass(build.status)}`}>{build.status}</span></div><strong>{build.name}</strong><p>{build.prompt}</p><small>{build.repositoryName || "Repository pending"} · {formatDate(build.createdAt)}</small></div></div>)}</div>}
          </div>
        </div>
      )}

      {changeProject && (
        <div className="developer-change-overlay" onClick={() => setChangeProject(null)}>
          <form className="developer-change-modal" onSubmit={submitChangeRequest} onClick={(event) => event.stopPropagation()}>
            <div className="developer-section-heading"><div><span className="forge-panel-kicker">Approval-Gated</span><h3>Prepare Code Change</h3></div><ShieldCheck size={19} /></div>
            <p>{changeProject.name}</p>
            <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} placeholder="Short change summary" />
            <textarea value={changeInstructions} onChange={(e) => setChangeInstructions(e.target.value)} placeholder="Tell Forge Developer exactly what should change..." rows={7} />
            <div className="developer-change-actions"><button type="button" className="forge-secondary-button" onClick={() => setChangeProject(null)}>Cancel</button><button className="forge-primary-button" disabled={!changeSummary.trim() || !changeInstructions.trim() || saving}><ShieldCheck size={16} /> Send to Approval</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ForgeDeveloper;
