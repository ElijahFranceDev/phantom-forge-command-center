import type { ElementType } from "react";

export type WorkspaceSlug = "ffs" | "forge-capital";

export type PageName =
  | "Command"
  | "Dashboard"
  | "Clients"
  | "Projects"
  | "Payments"
  | "Files"
  | "Requests"
  | "Approvals"
  | "Operations"
  | "Developer"
  | "Tasks"
  | "Memory"
  | "Activity"
  | "Notifications"
  | "Settings";

export type ViewMode = "Admin" | "Client";

export type NavItem = {
  name: PageName;
  icon: ElementType;
};

export type ForgeWorkspace = {
  id: string;
  slug: WorkspaceSlug;
  name: string;
  description: string | null;
  kind: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ForgeMemory = {
  id: string;
  workspaceId: string;
  key: string | null;
  category: string;
  content: string;
  source: string | null;
  importance: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ForgeTask = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForgeApprovalRequest = {
  id: string;
  workspaceId: string;
  actionRequestId: string | null;
  title: string;
  summary: string;
  status: string;
  decisionNote: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForgeActionRequest = {
  id: string;
  workspaceId: string;
  aiJobId: string | null;
  actionType: string;
  summary: string;
  riskLevel: string;
  status: string;
  requiresApproval: boolean;
  payload: unknown;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
  approvalRequest?: ForgeApprovalRequest | null;
};

export type ForgeAiJob = {
  id: string;
  workspaceId: string;
  agent: string;
  request: string;
  status: string;
  result: string | null;
  metadata: unknown;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  actionRequests?: ForgeActionRequest[];
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
