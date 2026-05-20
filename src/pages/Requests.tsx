import type { RevisionRequest } from "../types";

type RequestsProps = {
  revisionRequests: RevisionRequest[];
  onRefreshRequests: () => void;
  onUpdateRequestStatus: (id: string, status: string) => void;
  onDeleteRequest: (id: string) => void;
};

function Requests({
  revisionRequests,
  onRefreshRequests,
  onUpdateRequestStatus,
  onDeleteRequest,
}: RequestsProps) {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Client Workflow</p>
          <h3>Revision Requests</h3>
        </div>

        <button className="secondary-btn" onClick={onRefreshRequests}>
          Refresh Requests
        </button>
      </div>

      <div className="table-card">
        {revisionRequests.length === 0 && (
          <div className="empty-state">
            <h4>No revision requests yet.</h4>
            <p>Client requests will show up here after they submit them.</p>
          </div>
        )}

        {revisionRequests.map((request) => (
          <div className="request-card" key={request.id}>
            <div className="request-main">
              <div>
                <p className="eyebrow">From Client</p>
                <h4>{request.client?.businessName || "Unknown Client"}</h4>
              </div>

              <span className="status-pill">{request.status}</span>
            </div>

            <p className="request-message">{request.message}</p>

            <div className="request-footer">
              <small>{new Date(request.createdAt).toLocaleString()}</small>

              <div className="row-actions">
                <button
                  className="small-btn"
                  onClick={() => onUpdateRequestStatus(request.id, "In Progress")}
                >
                  In Progress
                </button>

                <button
                  className="small-btn"
                  onClick={() => onUpdateRequestStatus(request.id, "Completed")}
                >
                  Complete
                </button>

                <button
                  className="danger-btn"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Delete this revision request?"
                    );

                    if (confirmed) {
                      onDeleteRequest(request.id);
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

export default Requests;