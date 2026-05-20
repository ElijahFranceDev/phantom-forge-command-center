import type { ElementType } from "react";

export type PageName =
  | "Dashboard"
  | "Clients"
  | "Projects"
  | "Payments"
  | "Files"
  | "Requests"
  | "Approvals"
  | "Notifications"
  | "Settings";

export type ViewMode = "Admin" | "Client";

export type NavItem = {
  name: PageName;
  icon: ElementType;
};

export type Client = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  packageName: string;
  status: string;
  payment: string;
  balance: string;
  depositDue: string;
  nextStep: string;
  projectSummary: string;
  squarePaymentLink: string;
  filesNeeded: string[];
};

export type RevisionRequest = {
  id: string;
  clientId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
};

export type Approval = {
  id: string;
  clientId: string;
  label: string;
  status: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
};

export type Project = {
  id: number;
  title: string;
  type: string;
  status: string;
  priority: string;
};
export type UploadedFile = {
  id: string;
  clientId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
};