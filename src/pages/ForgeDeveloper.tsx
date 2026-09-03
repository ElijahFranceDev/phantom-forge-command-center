import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  GitBranch,
  Github,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  createSoftwareProject,
  getForgeDeveloperStatus,
  getSoftwareProjects,
  inspectSoftwareProject,
  prepareCodeChange,
} from "../api/forgeApi";
import type {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function ForgeDeveloper({ workspace }: ForgeDeveloperProps) {
  const [status, setStatus] = useState<ForgeDeveloperStatus | null>(null);
  const [projects, setProjects] = useState<SoftwareProject[]>([]);
  const [inspection, setInspection] = useState<ForgeRepositoryInspection | null>(null);
  const [name, setName] = useState("");
  const [repositoryFullName, setRepositoryFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyProjectId, setBusyProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changeProject, setChangeProject] = useState<SoftwareProject | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [changeInstructions, setChangeInstructions] = useState("");

  const githubConfigured = status?.github.configured === true;

  const activeProject = useMemo(
    () => projects.find((project) => project.id === inspection?.project.id),
    [projects, inspection]
  );

  async function loadDeveloperData() {
    try {
      setLoading(true);
      setError("");
      const [developerStatus, loadedProjects] = await Promise.all([
        getForgeDeveloperStatus(),
        getSoftwareProjects(workspace),
      ]);
      setStatus(developerStatus);
      setProjects(loadedProjects);
      setInspection(null);
      setChangeProject(null);
    } catch (loadError) {
      console.error(loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load Forge Developer."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeveloperData();
  }, [workspace]);

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
    } catch (saveError) {
      console.error(saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not register software project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleInspect(project: SoftwareProject) {
    try {
      setBusyProjectId(project.id);
      setError("");
      const result = await inspectSoftwareProject(project.id);
      setInspection(result);
    } catch (inspectError) {
      console.error(inspectError);
      setError(
        inspectError instanceof Error
          ? inspectError.message
          : "Could not inspect repository."
      );
    } finally {
      setBusyProjectId("");
    }
  }

  async function submitChangeRequest(event: React.FormEvent) {
    event.preventDefault();

    if (!changeProject || !changeSummary.trim() || !changeInstructions.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      await prepareCodeChange(changeProject.id, {
        summary: changeSummary.trim(),
        instructions: changeInstructions.trim(),
        targetBranch: `forge/${slugify(changeSummary)}`,
      });
      setChangeProject(null);
      setChangeSummary("");
      setChangeInstructions("");
    } catch (changeError) {
      console.error(changeError);
      setError(
        changeError instanceof Error
          ? changeError.message
          : "Could not prepare code change."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="forge-data-page forge-developer-page">
      <header className="forge-data-header">
        <div>
          <span className="forge-pill"><Code2 size={13} /> FORGE DEVELOPER</span>
          <h1>Software Command</h1>
          <p>
            Register the apps Forge should know about, inspect connected GitHub
            repositories, and prepare protected code changes for approval.
          </p>
        </div>

        <div className={`developer-connection ${githubConfigured ? "connected" : "offline"}`}>
          <Github size={19} />
          <div>
            <strong>GitHub</strong>
            <small>{githubConfigured ? "Connected" : "Not connected"}</small>
          </div>
        </div>
      </header>

      {!githubConfigured && status?.github.reason && (
        <div className="forge-provider-notice">
          <Github size={17} />
          <div>
            <strong>Repository inspection is wired but not authenticated.</strong>
            <span>{status.github.reason}</span>
          </div>
        </div>
      )}

      {error && <div className="forge-data-error">{error}</div>}

      <div className="forge-data-card">
        <form className="developer-register-form" onSubmit={handleRegister}>
          <div>
            <label>Project name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: FFS Carrier Portal"
            />
          </div>
          <div>
            <label>GitHub repository</label>
            <input
              value={repositoryFullName}
              onChange={(event) => setRepositoryFullName(event.target.value)}
              placeholder="ElijahFranceDev/frontline-forge-carrier-portal"
            />
          </div>
          <button className="forge-primary-button" disabled={!name.trim() || saving}>
            <Plus size={16} /> Register Project
          </button>
        </form>
      </div>

      <div className="developer-layout">
        <div className="forge-data-card">
          <div className="developer-section-heading">
            <div>
              <span className="forge-panel-kicker">Registry</span>
              <h3>Software Projects</h3>
            </div>
            <Code2 size={18} />
          </div>

          {loading ? (
            <div className="forge-data-empty">Loading software registry...</div>
          ) : projects.length === 0 ? (
            <div className="forge-data-empty">No projects registered in this workspace yet.</div>
          ) : (
            <div className="forge-data-list">
              {projects.map((project) => (
                <div className="forge-data-row developer-project-row" key={project.id}>
                  <div className="forge-data-row-main">
                    <div><span className="forge-pill">{project.projectType}</span></div>
                    <strong>{project.name}</strong>
                    <p>{project.repositoryFullName || "No repository registered"}</p>
                    <small>{project.defaultBranch} · {project.status}</small>
                  </div>
                  <div className="forge-row-actions">
                    <button
                      className="forge-secondary-button"
                      disabled={!project.repositoryFullName || !githubConfigured || busyProjectId === project.id}
                      onClick={() => handleInspect(project)}
                    >
                      {busyProjectId === project.id ? (
                        <Loader2 className="spin" size={15} />
                      ) : (
                        <Search size={15} />
                      )}
                      Inspect
                    </button>
                    <button
                      className="forge-secondary-button"
                      disabled={!project.repositoryFullName}
                      onClick={() => setChangeProject(project)}
                    >
                      <GitBranch size={15} /> Prepare Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="forge-data-card developer-inspection-card">
          <div className="developer-section-heading">
            <div>
              <span className="forge-panel-kicker">Read Only</span>
              <h3>Repository Inspection</h3>
            </div>
            <Github size={18} />
          </div>

          {!inspection ? (
            <div className="forge-data-empty">
              Inspect a connected repository to see its current structure.
            </div>
          ) : (
            <div className="developer-inspection">
              <div className="developer-repo-summary">
                <strong>{inspection.inspection.repository.fullName}</strong>
                <span>{inspection.inspection.repository.language || "Unknown language"}</span>
                <small>
                  {inspection.inspection.repository.private ? "Private" : "Public"} · default {inspection.inspection.repository.defaultBranch}
                </small>
              </div>

              <div className="developer-file-grid">
                {inspection.inspection.importantFiles.length === 0 ? (
                  <span>No common app entry files detected at repository root.</span>
                ) : (
                  inspection.inspection.importantFiles.map((file) => (
                    <div key={file.path}>
                      <strong>{file.name}</strong>
                      <small>{file.type}</small>
                    </div>
                  ))
                )}
              </div>

              {activeProject?.productionUrl && (
                <div className="developer-production-line">
                  Production: {activeProject.productionUrl}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {changeProject && (
        <div className="developer-change-overlay" onClick={() => setChangeProject(null)}>
          <form
            className="developer-change-modal"
            onSubmit={submitChangeRequest}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="developer-section-heading">
              <div>
                <span className="forge-panel-kicker">Approval-Gated</span>
                <h3>Prepare Code Change</h3>
              </div>
              <ShieldCheck size={19} />
            </div>
            <p>{changeProject.name}</p>
            <input
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              placeholder="Short change summary"
            />
            <textarea
              value={changeInstructions}
              onChange={(event) => setChangeInstructions(event.target.value)}
              placeholder="Tell Forge Developer exactly what should change..."
              rows={6}
            />
            <div className="developer-change-actions">
              <button
                type="button"
                className="forge-secondary-button"
                onClick={() => setChangeProject(null)}
              >
                Cancel
              </button>
              <button
                className="forge-primary-button"
                disabled={!changeSummary.trim() || !changeInstructions.trim() || saving}
              >
                <ShieldCheck size={16} /> Send to Approval Queue
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ForgeDeveloper;
