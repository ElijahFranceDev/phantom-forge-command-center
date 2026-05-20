import {
  Bell,
  CheckCircle,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { NavItem, PageName } from "../types";

type SidebarProps = {
  activePage: PageName;
  sidebarOpen: boolean;
  setActivePage: (page: PageName) => void;
  setSidebarOpen: (open: boolean) => void;
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Clients", icon: Users },
  { name: "Projects", icon: FolderKanban },
  { name: "Payments", icon: CreditCard },
  { name: "Files", icon: FileText },
  { name: "Requests", icon: MessageSquare },
  { name: "Approvals", icon: CheckCircle },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];

function Sidebar({
  activePage,
  sidebarOpen,
  setActivePage,
  setSidebarOpen,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Phantom Forge</p>
          <h1>Command Center</h1>
        </div>

        <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => {
                setActivePage(item.name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;