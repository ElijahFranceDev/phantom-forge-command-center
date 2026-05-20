import type { UploadedFile } from "../types";

const API_BASE_URL = "http://localhost:4000";

type FilesProps = {
  uploadedFiles: UploadedFile[];
  onRefreshFiles: () => void;
  onDeleteFile: (id: string) => void;
};

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Files({ uploadedFiles, onRefreshFiles, onDeleteFile }: FilesProps) {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Client Assets</p>
          <h3>Uploaded Files</h3>
        </div>

        <button className="secondary-btn" onClick={onRefreshFiles}>
          Refresh Files
        </button>
      </div>

      <div className="table-card">
        {uploadedFiles.length === 0 && (
          <div className="empty-state">
            <h4>No uploaded files yet.</h4>
            <p>Client uploads will appear here after they submit assets.</p>
          </div>
        )}

        {uploadedFiles.map((file) => (
          <div className="request-card" key={file.id}>
            <div className="request-main">
              <div>
                <p className="eyebrow">Uploaded By</p>
                <h4>{file.client?.businessName || "Unknown Client"}</h4>
              </div>

              <span className="status-pill">{formatFileSize(file.size)}</span>
            </div>

            <p className="request-message">{file.originalName}</p>

            <div className="request-footer">
              <small>{new Date(file.createdAt).toLocaleString()}</small>

              <div className="row-actions">
                <a
                  className="small-btn button-link"
                  href={`${API_BASE_URL}${file.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>

                <button
                  className="danger-btn"
                  onClick={() => {
                    const confirmed = window.confirm("Delete this uploaded file?");

                    if (confirmed) {
                      onDeleteFile(file.id);
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

export default Files;