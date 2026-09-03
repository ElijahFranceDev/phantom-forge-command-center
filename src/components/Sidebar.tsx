import {
  Activity,
  Bell,
  Brain,
  CalendarClock,
  CheckCircle,
  Code2,
  Command,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
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
  { name: "Command", icon: Command },
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Operations", icon: CalendarClock },
  { name: "Clients", icon: Users },
  { name: "Projects", icon: FolderKanban },
  { name: "Developer", icon: Code2 },
  { name: "Tasks", icon: ListTodo },
  { name: "Approvals", icon: CheckCircle },
  { name: "Memory", icon: Brain },
  { name: "Activity", icon: Activity },
  { name: "Payments", icon: CreditCard },
  { name: "Files", icon: FileText },
  { name: "Requests", icon: MessageSquare },
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
          <p className="eyebrow">Forge Command</p>
          <h1>Business AI</h1>
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
          <span>Lock Console</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
