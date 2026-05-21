import { useState } from "react";
import type { Client } from "../types";

type ClientPortalProps = {
  selectedClient: Client;
  onCreateRevisionRequest: (clientId: string, message: string) => Promise<unknown>;
  onCreateApproval: (clientId: string, label: string) => Promise<unknown>;
};

function ClientPortal({
  selectedClient,
  onCreateRevisionRequest,
  onCreateApproval,
}: ClientPortalProps) {
  const [revisionFormOpen, setRevisionFormOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [revisionStatus, setRevisionStatus] = useState("");

  const [approvalStatus, setApprovalStatus] = useState("");
  const [agreementStatus, setAgreementStatus] = useState("");

  const hasPaymentLink =
    selectedClient.squarePaymentLink &&
    selectedClient.squarePaymentLink !== "#";

  const isQuotePending =
    selectedClient.payment === "Pending Quote" ||
    selectedClient.balance === "$0" ||
    selectedClient.depositDue === "$0";

  async function handleRevisionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!revisionMessage.trim()) {
      setRevisionStatus("Please type a revision request first.");
      return;
    }

    try {
      setRevisionStatus("Submitting revision request...");

      await onCreateRevisionRequest(selectedClient.id, revisionMessage);

      setRevisionMessage("");
      setRevisionFormOpen(false);
      setRevisionStatus("Revision request submitted.");
    } catch (error) {
      console.error(error);
      setRevisionStatus("Revision request failed. Please contact Phantom Forge.");
    }
  }

  async function handleApproveDirection() {
    const confirmed = window.confirm(
      "Approve this project direction? This tells Phantom Forge you are ready to move forward."
    );

    if (!confirmed) {
      return;
    }

    try {
      setApprovalStatus("Submitting approval...");

      await onCreateApproval(
        selectedClient.id,
        `${selectedClient.packageName} direction approved`
      );

      setApprovalStatus("Direction approved. Phantom Forge has been notified.");
    } catch (error) {
      console.error(error);
      setApprovalStatus("Approval failed. Please try again or contact Phantom Forge.");
    }
  }

  async function handleAcceptAgreement() {
    const confirmed = window.confirm(
      "Accept this project agreement status? Final agreement details will be confirmed after discovery and quote approval."
    );

    if (!confirmed) {
      return;
    }

    try {
      setAgreementStatus("Accepting agreement...");

      await onCreateApproval(
        selectedClient.id,
        `${selectedClient.packageName} agreement accepted`
      );

      setAgreementStatus("Agreement accepted. Phantom Forge has been notified.");
    } catch (error) {
      console.error(error);
      setAgreementStatus("Agreement acceptance failed. Please contact Phantom Forge.");
    }
  }

  return (
    <section className="page-section">
      <div className="client-portal-hero">
        <div>
          <p className="eyebrow">Client View</p>
          <h3>Welcome, {selectedClient.businessName}.</h3>
          <p>
            This private portal keeps your project organized. You’ll be able to
            review next steps, track status, access agreement details, request
            revisions, and approve project direction as the work moves forward.
          </p>
        </div>

        <div className="portal-status-card">
          <span>Project Status</span>
          <strong>{selectedClient.status}</strong>
        </div>
      </div>

      <div className="portal-grid">
        <div className="portal-card large">
          <p className="eyebrow">Current Project</p>
          <h3>{selectedClient.packageName}</h3>
          <p>{selectedClient.projectSummary}</p>

          <div className="client-info-grid">
            <InfoItem label="Business" value={selectedClient.businessName} />
            <InfoItem label="Payment" value={selectedClient.payment} />
            <InfoItem
              label="Balance"
              value={isQuotePending ? "Pending quote" : selectedClient.balance}
            />
            <InfoItem label="Next Step" value={selectedClient.nextStep} />
          </div>

          <div className="timeline">
            <TimelineItem title="Discovery Meeting" status="Next" />
            <TimelineItem title="Scope + Quote Finalized" status="Pending" />
            <TimelineItem title="Agreement + Deposit" status="Pending" />
            <TimelineItem title="Design Direction" status="Upcoming" />
          </div>
        </div>

        <div className="portal-card discovery-card">
          <p className="eyebrow">Discovery Meeting</p>
          <h3>Before We Begin</h3>
          <p>
            During the discovery meeting, Phantom Forge will confirm your goals,
            pages, features, timeline, content needs, and final project scope.
          </p>

          <div className="mini-checklist">
            <span>Website goals</span>
            <span>Pages and features</span>
            <span>Brand direction</span>
            <span>Timeline and budget</span>
          </div>
        </div>

        <div className="portal-card">
          <p className="eyebrow">Payment</p>
          <h3>{isQuotePending ? "Pending Quote" : `${selectedClient.depositDue} Due`}</h3>
          <p>
            {isQuotePending
              ? "Your invoice/payment link will appear here after the discovery meeting, final scope, and quote are approved."
              : `Current payment status: ${selectedClient.payment}. Payment must be completed before the next production stage begins.`}
          </p>

          {hasPaymentLink && !isQuotePending ? (
            <a
              className="primary-btn full-width button-link"
              href={selectedClient.squarePaymentLink}
              target="_blank"
              rel="noreferrer"
            >
              Pay Deposit
            </a>
          ) : (
            <button className="disabled-btn full-width" disabled>
              Invoice Pending
            </button>
          )}
        </div>

        <div className="portal-card agreement-card">
          <p className="eyebrow">Agreement Center</p>
          <h3>Project Agreement</h3>
          <p>
            Your project agreement will include final scope, pricing, deposit,
            timeline, revision terms, and payment expectations after discovery.
          </p>

          <div className="agreement-details">
            <div>
              <span>Status</span>
              <strong>Pending Meeting</strong>
            </div>

            <div>
              <span>Document</span>
              <strong>Not Uploaded Yet</strong>
            </div>

            <div>
              <span>Next Step</span>
              <strong>Finalize scope and quote</strong>
            </div>
          </div>

          <button className="secondary-btn full-width" onClick={handleAcceptAgreement}>
            Accept Agreement
          </button>

          {agreementStatus && <p className="form-status">{agreementStatus}</p>}
        </div>

        <div className="portal-card intake-card">
          <p className="eyebrow">Project Intake</p>
          <h3>What Phantom Forge Needs</h3>
          <p>
            These items help us understand your business, design direction, and
            project goals before production begins.
          </p>

          <div className="intake-checklist">
            {selectedClient.filesNeeded.map((item) => (
              <div className="intake-item" key={item}>
                <div className="intake-check">✓</div>
                <span>{item}</span>
              </div>
            ))}

            <div className="intake-item">
              <div className="intake-check">✓</div>
              <span>Business contact information</span>
            </div>

            <div className="intake-item">
              <div className="intake-check">✓</div>
              <span>Website examples or inspiration</span>
            </div>

            <div className="intake-item">
              <div className="intake-check">✓</div>
              <span>Main goal for the website</span>
            </div>
          </div>

          <p className="form-status">
            Bring these details to the discovery meeting or send them directly
            to Phantom Forge when ready.
          </p>
        </div>

        <div className="portal-card">
          <p className="eyebrow">File Uploads</p>
          <h3>Coming Soon</h3>
          <p>
            Secure portal uploads are being prepared. For now, please send your
            logo, photos, services, prices, and business assets directly to
            Phantom Forge.
          </p>

          <button className="disabled-btn full-width" disabled>
            Uploads Coming Soon
          </button>
        </div>

        <div className="portal-card revision-card">
          <p className="eyebrow">Revisions</p>
          <h3>Request Changes</h3>
          <p>
            After design work begins, you can send design notes, copy changes,
            photo swaps, or layout updates for review.
          </p>

          <button
            className="secondary-btn full-width"
            onClick={() => setRevisionFormOpen(!revisionFormOpen)}
          >
            {revisionFormOpen ? "Close Request" : "Request Revision"}
          </button>

          {revisionFormOpen && (
            <form className="revision-form premium" onSubmit={handleRevisionSubmit}>
              <div className="revision-form-header">
                <p className="eyebrow">Revision Details</p>
                <h4>What would you like changed?</h4>
                <span>
                  Be as specific as possible. Mention the section, wording,
                  color, photo, or layout you want adjusted.
                </span>
              </div>

              <label>Revision Notes</label>

              <textarea
                value={revisionMessage}
                onChange={(event) => setRevisionMessage(event.target.value)}
                placeholder="Example: Can we change the hero image and make the contact button more visible?"
                rows={6}
                required
              />

              <button className="primary-btn full-width" type="submit">
                Submit Request
              </button>

              {revisionStatus && <p className="form-status">{revisionStatus}</p>}
            </form>
          )}
        </div>

        <div className="portal-card">
          <p className="eyebrow">Approval</p>
          <h3>Ready to Approve?</h3>
          <p>
            Once a direction is ready and everything looks good, approve the
            project direction so Phantom Forge can move forward.
          </p>

          <button className="primary-btn full-width" onClick={handleApproveDirection}>
            Approve Direction
          </button>

          {approvalStatus && <p className="form-status">{approvalStatus}</p>}
        </div>
      </div>
    </section>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type TimelineItemProps = {
  title: string;
  status: string;
};

function TimelineItem({ title, status }: TimelineItemProps) {
  return (
    <div className="timeline-item">
      <div className="timeline-dot"></div>
      <div>
        <h4>{title}</h4>
        <span>{status}</span>
      </div>
    </div>
  );
}

export default ClientPortal;