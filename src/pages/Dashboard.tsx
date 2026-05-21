import type { Approval, Client } from "../types";

type DashboardProps = {
  clients: Client[];
  approvals: Approval[];
};

const priorityItems = [
  {
    title: "Prepare first client discovery meeting",
    subtitle: "Questions, scope notes, timeline, and quote prep",
    priority: "High",
  },
  {
    title: "Clean live dashboard data",
    subtitle: "Remove demo numbers and make stats fully real",
    priority: "High",
  },
  {
    title: "Connect Square invoice link after quote",
    subtitle: "Add the payment link once pricing is approved",
    priority: "Medium",
  },
  {
    title: "Add portal contract signing",
    subtitle: "Build signed agreement flow after live version is stable",
    priority: "Next",
  },
];

function parseMoney(value: string) {
  const cleanedValue = value.replace(/[^0-9.]/g, "");
  const amount = Number(cleanedValue);

  if (Number.isNaN(amount)) {
    return 0;
  }

  return amount;
}

function Dashboard({ clients, approvals }: DashboardProps) {
  const activeClients = clients.length;

  const openProjects = clients.filter(
    (client) =>
      client.status !== "Completed" &&
      client.status !== "Cancelled" &&
      client.status !== "Archived"
  ).length;

  const unpaidBalance = clients.reduce((total, client) => {
    const isPaid =
      client.payment === "Paid In Full" ||
      client.payment === "Deposit Paid" ||
      client.payment === "Monthly Plan Active";

    if (isPaid) {
      return total;
    }

    return total + parseMoney(client.balance);
  }, 0);

  const pendingApprovals = approvals.filter(
    (approval) => approval.status !== "Approved"
  ).length;

  return (
    <section className="page-section">
      <div className="dashboard-hero">
        <p className="eyebrow">Today’s Focus</p>
        <h2>Prepare Phantom Forge for discovery meetings and client onboarding.</h2>
        <p>
          Keep the portal clean, track client status, finalize scope after
          meetings, and only add payment links once the quote is approved.
        </p>
      </div>

      <div className="stats-grid">
        <StatTile label="Active Clients" value={activeClients.toString()} />
        <StatTile label="Open Projects" value={openProjects.toString()} />
        <StatTile label="Unpaid Balances" value={`$${unpaidBalance}`} />
        <StatTile label="Pending Approvals" value={pendingApprovals.toString()} />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Client Pipeline</h3>
              <p>Live overview</p>
            </div>
          </div>

          <div className="pipeline-list">
            {clients.length === 0 && (
              <div className="empty-state dashboard-empty">
                <h4>No live clients yet.</h4>
                <p>
                  Add your first client after the discovery meeting to begin
                  tracking project status, payment, agreement, and portal access.
                </p>
              </div>
            )}

            {clients.map((client) => (
              <div className="pipeline-card" key={client.id}>
                <div>
                  <h4>{client.businessName}</h4>
                  <p>{client.packageName}</p>
                </div>

                <div className="pipeline-meta">
                  <span className="status-pill">{client.status}</span>
                  <strong>{client.balance}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Priority Build List</h3>
              <p>Internal</p>
            </div>
          </div>

          <div className="priority-list">
            {priorityItems.map((item) => (
              <div className="priority-card" key={item.title}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>

                <span className="status-pill">{item.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default Dashboard;