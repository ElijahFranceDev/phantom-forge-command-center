import StatCard from "../components/StatCard";
import type { Client } from "../types";

type DashboardProps = {
  clients: Client[];
};

function Dashboard({ clients }: DashboardProps) {
  const unpaidTotal = clients.reduce((total, client) => {
    const numberOnly = Number(client.balance.replace(/[^0-9.-]+/g, ""));
    return total + (Number.isNaN(numberOnly) ? 0 : numberOnly);
  }, 0);

  return (
    <section className="page-section">
      <div className="hero-card">
        <p className="eyebrow">Today’s Focus</p>
        <h3>Get the Client Portal ready for real payments.</h3>
        <p>
          Start with project status, invoice/payment status, file requests,
          revisions, and approvals. Square payment buttons can be added next.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Clients" value={String(clients.length)} />
        <StatCard label="Open Projects" value="4" />
        <StatCard label="Unpaid Balances" value={`$${unpaidTotal}`} />
        <StatCard label="Pending Approvals" value="2" />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Client Pipeline</h3>
            <span>Live overview</span>
          </div>

          <div className="client-list">
            {clients.map((client) => (
              <div className="client-row" key={client.id}>
                <div>
                  <h4>{client.name}</h4>
                  <p>{client.packageName}</p>
                </div>

                <div className="client-meta">
                  <span className="status-pill">{client.status}</span>
                  <strong>{client.balance}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Priority Build List</h3>
            <span>Internal</span>
          </div>

          <div className="task-list">
            <TaskItem title="Build Client Portal MVP" tag="Urgent" />
            <TaskItem title="Connect Square payment links" tag="High" />
            <TaskItem title="Create invoice/payment status system" tag="High" />
            <TaskItem title="Add client approval buttons" tag="Next" />
          </div>
        </div>
      </div>
    </section>
  );
}

type TaskItemProps = {
  title: string;
  tag: string;
};

function TaskItem({ title, tag }: TaskItemProps) {
  return (
    <div className="task-item">
      <div>
        <h4>{title}</h4>
        <p>Phantom Forge internal build</p>
      </div>

      <span>{tag}</span>
    </div>
  );
}

export default Dashboard;