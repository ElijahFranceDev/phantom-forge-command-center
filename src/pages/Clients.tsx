import { useState } from "react";
import type { Client } from "../types";

type ClientsProps = {
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onRefreshClients: () => void;
};

type ClientFormMode = "add" | "edit";

function Clients({
  clients,
  selectedClientId,
  setSelectedClientId,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onRefreshClients,
}: ClientsProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ClientFormMode>("add");
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [packageName, setPackageName] = useState("");
  const [balance, setBalance] = useState("");
  const [depositDue, setDepositDue] = useState("");
  const [status, setStatus] = useState("New Lead");
  const [payment, setPayment] = useState("No Invoice Sent");
  const [squarePaymentLink, setSquarePaymentLink] = useState("#");
  const [nextStep, setNextStep] = useState("");
  const [projectSummary, setProjectSummary] = useState("");

  function resetForm() {
    setBusinessName("");
    setEmail("");
    setPackageName("");
    setBalance("");
    setDepositDue("");
    setStatus("New Lead");
    setPayment("No Invoice Sent");
    setSquarePaymentLink("#");
    setNextStep("");
    setProjectSummary("");
    setEditingClientId(null);
    setFormMode("add");
  }

  function openAddForm() {
    resetForm();
    setFormMode("add");
    setFormOpen(true);
  }

  function openEditForm(client: Client) {
    setFormMode("edit");
    setFormOpen(true);
    setEditingClientId(client.id);

    setBusinessName(client.businessName);
    setEmail(client.email);
    setPackageName(client.packageName);
    setBalance(client.balance.replace("$", ""));
    setDepositDue(client.depositDue.replace("$", ""));
    setStatus(client.status);
    setPayment(client.payment);
    setSquarePaymentLink(client.squarePaymentLink);
    setNextStep(client.nextStep);
    setProjectSummary(client.projectSummary);
    setSelectedClientId(client.id);
  }

  function formatMoney(value: string) {
    const cleanValue = value.trim() || "0";
    return cleanValue.startsWith("$") ? cleanValue : `$${cleanValue}`;
  }

  function buildPortalLink(clientId: string) {
    return `${window.location.origin}${window.location.pathname}?view=client&clientId=${clientId}`;
  }

  async function copyPortalLink(client: Client) {
    const portalLink = buildPortalLink(client.id);

    try {
      await navigator.clipboard.writeText(portalLink);
      setCopiedClientId(client.id);

      setTimeout(() => {
        setCopiedClientId(null);
      }, 1800);
    } catch (error) {
      console.error(error);
      window.prompt("Copy this client portal link:", portalLink);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formattedBalance = formatMoney(balance);
    const formattedDepositDue = formatMoney(depositDue || balance);

    if (formMode === "edit" && editingClientId !== null) {
      const existingClient = clients.find((client) => client.id === editingClientId);

      if (!existingClient) {
        return;
      }

      const updatedClient: Client = {
        ...existingClient,
        name: businessName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        packageName: packageName.trim() || "Website Package",
        status,
        payment,
        balance: formattedBalance,
        depositDue: formattedDepositDue,
        squarePaymentLink: squarePaymentLink.trim() || "#",
        nextStep:
          nextStep.trim() || "Review project details and confirm the next step.",
        projectSummary:
          projectSummary.trim() ||
          "A Phantom Forge client project created inside the Command Center.",
      };

      onUpdateClient(updatedClient);
    } else {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: businessName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        packageName: packageName.trim() || "Website Package",
        status,
        payment,
        balance: formattedBalance,
        depositDue: formattedDepositDue,
        nextStep:
          nextStep.trim() || "Review project details and confirm the next step.",
        projectSummary:
          projectSummary.trim() ||
          "A Phantom Forge client project created inside the Command Center.",
        squarePaymentLink: squarePaymentLink.trim() || "#",
        filesNeeded: [
          "Logo files",
          "Business photos",
          "Service list",
          "Pricing or package details",
        ],
      };

      onAddClient(newClient);
    }

    resetForm();
    setFormOpen(false);
  }

  function handleDeleteClick(client: Client) {
    const confirmed = window.confirm(
      `Delete ${client.businessName}? This will remove the client from PostgreSQL.`
    );

    if (!confirmed) {
      return;
    }

    onDeleteClient(client.id);
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Client Management</p>
          <h3>Clients</h3>
        </div>

        <div className="section-actions">
          <button className="secondary-btn" onClick={onRefreshClients}>
            Refresh Database
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              if (formOpen && formMode === "add") {
                setFormOpen(false);
                return;
              }

              openAddForm();
            }}
          >
            {formOpen && formMode === "add" ? "Close Form" : "Add Client"}
          </button>
        </div>
      </div>

      {formOpen && (
        <form className="client-form expanded" onSubmit={handleSubmit}>
          <div>
            <label>Business Name</label>
            <input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Example: Garden of Ink"
              required
            />
          </div>

          <div>
            <label>Client Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="client@email.com"
              type="email"
            />
          </div>

          <div>
            <label>Package</label>
            <input
              value={packageName}
              onChange={(event) => setPackageName(event.target.value)}
              placeholder="Website Mockup + Logo"
            />
          </div>

          <div>
            <label>Balance</label>
            <input
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
              placeholder="250"
            />
          </div>

          <div>
            <label>Deposit Due</label>
            <input
              value={depositDue}
              onChange={(event) => setDepositDue(event.target.value)}
              placeholder="250"
            />
          </div>

          <div>
            <label>Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>New Lead</option>
              <option>Lead / Outreach</option>
              <option>Awaiting Content</option>
              <option>Mockup Review</option>
              <option>Deposit Paid</option>
              <option>In Production</option>
              <option>Final Review</option>
              <option>Completed</option>
            </select>
          </div>

          <div>
            <label>Payment Status</label>
            <select
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
            >
              <option>No Invoice Sent</option>
              <option>Unpaid Deposit</option>
              <option>Unpaid Balance</option>
              <option>Deposit Paid</option>
              <option>Paid In Full</option>
              <option>Monthly Plan Active</option>
            </select>
          </div>

          <div>
            <label>Square Payment Link</label>
            <input
              value={squarePaymentLink}
              onChange={(event) => setSquarePaymentLink(event.target.value)}
              placeholder="https://square.link/..."
            />
          </div>

          <div className="span-2">
            <label>Next Step</label>
            <input
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
              placeholder="Example: Review mockup and pay deposit"
            />
          </div>

          <div className="span-3">
            <label>Project Summary</label>
            <textarea
              value={projectSummary}
              onChange={(event) => setProjectSummary(event.target.value)}
              placeholder="Short summary of the client project..."
              rows={4}
            />
          </div>

          <div className="form-actions span-3">
            <button className="primary-btn" type="submit">
              {formMode === "edit" ? "Save Changes" : "Save Client"}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-card">
        {clients.length === 0 && (
          <div className="empty-state">
            <h4>No clients in database yet.</h4>
            <p>Add your first client to test the full-stack connection.</p>
          </div>
        )}

        {clients.map((client) => (
          <div
            className={`table-row client-table-button ${
              selectedClientId === client.id ? "selected" : ""
            }`}
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
          >
            <div>
              <h4>{client.name}</h4>
              <p>{client.packageName}</p>
            </div>

            <span className="status-pill">{client.status}</span>
            <span>{client.payment}</span>
            <strong>{client.balance}</strong>

            <div className="row-actions">
              <button
                className="small-btn"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  copyPortalLink(client);
                }}
              >
                {copiedClientId === client.id ? "Copied" : "Copy Link"}
              </button>

              <button
                className="small-btn"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openEditForm(client);
                }}
              >
                Edit
              </button>

              <button
                className="danger-btn"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteClick(client);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Clients;