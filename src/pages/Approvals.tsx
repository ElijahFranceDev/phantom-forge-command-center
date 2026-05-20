import type { Approval } from "../types";

type ApprovalsProps = {
  approvals: Approval[];
  onRefreshApprovals: () => void;
  onUpdateApprovalStatus: (id: string, status: string) => void;
  onDeleteApproval: (id: string) => void;
};

function Approvals({
  approvals,
  onRefreshApprovals,
  onUpdateApprovalStatus,
  onDeleteApproval,
}: ApprovalsProps) {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Client Sign-Offs</p>
          <h3>Approvals</h3>
        </div>

        <button className="secondary-btn" onClick={onRefreshApprovals}>
          Refresh Approvals
        </button>
      </div>

      <div className="table-card">
        {approvals.length === 0 && (
          <div className="empty-state">
            <h4>No approvals yet.</h4>
            <p>Client approvals will appear here after they approve a direction.</p>
          </div>
        )}

        {approvals.map((approval) => (
          <div className="request-card" key={approval.id}>
            <div className="request-main">
              <div>
                <p className="eyebrow">Approved By</p>
                <h4>{approval.client?.businessName || "Unknown Client"}</h4>
              </div>

              <span className="status-pill">{approval.status}</span>
            </div>

            <p className="request-message">{approval.label}</p>

            <div className="request-footer">
              <small>
                {approval.approvedAt
                  ? `Approved: ${new Date(approval.approvedAt).toLocaleString()}`
                  : `Created: ${new Date(approval.createdAt).toLocaleString()}`}
              </small>

              <div className="row-actions">
                <button
                  className="small-btn"
                  onClick={() => onUpdateApprovalStatus(approval.id, "Pending")}
                >
                  Mark Pending
                </button>

                <button
                  className="small-btn"
                  onClick={() => onUpdateApprovalStatus(approval.id, "Approved")}
                >
                  Mark Approved
                </button>

                <button
                  className="danger-btn"
                  onClick={() => {
                    const confirmed = window.confirm("Delete this approval?");

                    if (confirmed) {
                      onDeleteApproval(approval.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Approvals;