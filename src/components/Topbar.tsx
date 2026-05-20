import { Bell, Menu } from "lucide-react";
import type { PageName, ViewMode } from "../types";

type TopbarProps = {
  activePage: PageName;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  isClientOnlyMode?: boolean;
};

function Topbar({
  activePage,
  viewMode,
  setViewMode,
  setSidebarOpen,
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
          {viewMode === "Admin" ? "Private Agency OS" : "Client Portal"}
        </p>
        <h2>{viewMode === "Admin" ? activePage : "Project Portal"}</h2>
      </div>

      <div className="topbar-actions">
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
          {viewMode === "Client" ? "PF" : "EF"}
        </div>
      </div>
    </header>
  );
}

export default Topbar;