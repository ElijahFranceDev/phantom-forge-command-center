import { Bell, Menu } from "lucide-react";
import type { PageName, ViewMode, WorkspaceSlug } from "../types";
import "./Topbar.css";

type TopbarProps = {
  activePage: PageName;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  activeWorkspace: WorkspaceSlug;
  setActiveWorkspace: (workspace: WorkspaceSlug) => void;
  isClientOnlyMode?: boolean;
};

function Topbar({
  activePage,
  viewMode,
  setViewMode,
  setSidebarOpen,
  activeWorkspace,
  setActiveWorkspace,
  isClientOnlyMode = false,
}: TopbarProps) {
  return (
    <header className="topbar">
      {!isClientOnlyMode && (
        <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <div>
        <p className="eyebrow">
          {viewMode === "Admin"
            ? activeWorkspace === "ffs"
              ? "Frontline Forge Solutions"
              : "Forge Capital"
            : "Client Portal"}
        </p>
        <h2>{viewMode === "Admin" ? activePage : "Project Portal"}</h2>
      </div>

      <div className="topbar-actions">
        {!isClientOnlyMode && viewMode === "Admin" && (
          <div className="forge-workspace-switch" aria-label="Active workspace">
            <button
              className={activeWorkspace === "ffs" ? "active" : ""}
              onClick={() => setActiveWorkspace("ffs")}
              title="Frontline Forge Solutions"
            >
              FFS
            </button>
            <button
              className={activeWorkspace === "forge-capital" ? "active" : ""}
              onClick={() => setActiveWorkspace("forge-capital")}
              title="Forge Capital"
            >
              Forge Capital
            </button>
          </div>
        )}

        {!isClientOnlyMode && (
          <div className="view-switch">
            <button
              className={viewMode === "Admin" ? "active" : ""}
              onClick={() => setViewMode("Admin")}
            >
              Admin
            </button>

            <button
              className={viewMode === "Client" ? "active" : ""}
              onClick={() => setViewMode("Client")}
            >
              Client
            </button>
          </div>
        )}

        {!isClientOnlyMode && (
          <button className="notification-btn">
            <Bell size={20} />
          </button>
        )}

        <div className="profile-pill">
          {viewMode === "Client"
            ? "PF"
            : activeWorkspace === "ffs"
              ? "FFS"
              : "FC"}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
