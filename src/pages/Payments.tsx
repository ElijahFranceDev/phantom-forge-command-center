import type { Client } from "../types";

type PaymentsProps = {
  clients: Client[];
};

function Payments({ clients }: PaymentsProps) {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Money Flow</p>
          <h3>Payments</h3>
        </div>

        <button className="primary-btn">Create Invoice</button>
      </div>

      <div className="hero-card">
        <p className="eyebrow">Square First</p>
        <h3>Use Square payment links for deposits, balances, and monthly options.</h3>
        <p>
          The portal will show payment status manually first. Later, we can
          connect real payment webhooks so Square updates this dashboard
          automatically.
        </p>
      </div>

      <div className="table-card">
        {clients.map((client) => (
          <div className="table-row" key={client.id}>
            <div>
              <h4>{client.name}</h4>
              <p>{client.packageName}</p>
            </div>

            <span>{client.payment}</span>
            <strong>{client.balance}</strong>
            <a className="small-btn button-link" href={client.squarePaymentLink}>
              Payment Link
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Payments;