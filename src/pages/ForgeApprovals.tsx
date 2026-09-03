import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import {
  approveForgeRequest,
  getForgeApprovals,
  rejectForgeRequest,
} from "../api/forgeApi";
import type { ForgeApprovalRequest, WorkspaceSlug } from "../types";
import "./ForgeDataPages.css";

type ForgeApprovalsProps = {
  workspace: WorkspaceSlug;
};

function ForgeApprovals({ workspace }: ForgeApprovalsProps) {
  const [approvals, setApprovals] = useState<ForgeApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function loadApprovals() {
    try {
      setLoading(true);
      setError("");
      setApprovals(await getForgeApprovals(workspace));
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Could not load approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, [workspace]);

  async function decide(id: string, decision: "approve" | "reject") {
    try {
      setBusyId(id);
      const updated =
        decision === "approve"
          ? await approveForgeRequest(id)
          : await rejectForgeRequest(id);

      setApprovals((current) =>
        current.map((approval) => (approval.id === updated.id ? updated : approval))
      );
    } catch (decisionError) {
      console.error(decisionError);
      setError(
        decisionError instanceof Error
          ? decisionError.message
          : "Could not update approval."
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="forge-data-page">
      <header className="forge-data-header">
        <div>
          <span className="forge-pill"><ShieldCheck size={13} /> PROTECTED ACTIONS</span>
          <h1>Approval Queue</h1>
          <p>Deployments, destructive changes, offers, payments, and other protected actions stop here for human approval.</p>
        </div>
      </header>

      {error && <div className="forge-data-error">{error}</div>}

      <div className="forge-data-card">
        {loading ? (
          <div className="forge-data-empty">Loading approval queue...</div>
        ) : approvals.length === 0 ? (
          <div className="forge-data-empty">No protected actions have been submitted.</div>
        ) : (
          <div className="forge-data-list">
            {approvals.map((approval) => (
              <div className="forge-data-row" key={approval.id}>
                <div className="forge-data-row-main">
                  <div><span className="forge-pill">{approval.status}</span></div>
                  <strong>{approval.title}</strong>
                  <p>{approval.summary}</p>
                  <small>{new Date(approval.createdAt).toLocaleString()}</small>
                </div>

                {approval.status === "PENDING" && (
                  <div className="forge-row-actions">
                    <button
                      className="forge-primary-button"
                      disabled={busyId === approval.id}
                      onClick={() => decide(approval.id, "approve")}
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      className="forge-danger-button"
                      disabled={busyId === approval.id}
                      onClick={() => decide(approval.id, "reject")}
                    >
                      <X size={15} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ForgeApprovals;
