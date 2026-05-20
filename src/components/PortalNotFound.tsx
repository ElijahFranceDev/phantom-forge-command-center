function PortalNotFound() {
  return (
    <section className="page-section">
      <div className="portal-not-found">
        <p className="eyebrow">Portal Access</p>
        <h3>Project portal not found.</h3>
        <p>
          This portal link may be incorrect, expired, or not connected to an
          active Phantom Forge project. Please contact Phantom Forge for access.
        </p>

        <div className="portal-help-card">
          <strong>Need help?</strong>
          <span>Send a message to Phantom Forge with the link you were given.</span>
        </div>
      </div>
    </section>
  );
}

export default PortalNotFound;