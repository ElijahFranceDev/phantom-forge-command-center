type PlaceholderProps = {
  title: string;
};

function Placeholder({ title }: PlaceholderProps) {
  return (
    <section className="page-section">
      <div className="hero-card">
        <p className="eyebrow">Coming Next</p>
        <h3>{title}</h3>
        <p>
          This section is reserved for the next Phantom Forge Command Center
          module. We’ll build it after the dashboard, clients, projects, and
          payments foundation is stable.
        </p>
      </div>
    </section>
  );
}

export default Placeholder;