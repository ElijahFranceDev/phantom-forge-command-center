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

export type ForgeMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | string;
  content: string;
  metadata: unknown;
  createdAt: string;
};

export type ForgeConversation = {
  id: string;
  workspaceId: string;
  title: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: ForgeMessage[];
  aiJobs?: ForgeAiJob[];
  _count?: { messages: number };
};

export type ForgeDeployment = {
  id: string;
  softwareProjectId: string;
  developerRunId: string | null;
  provider: string;
  externalId: string | null;
  environment: string;
  status: string;
  url: string | null;
  branch: string | null;
  commitSha: string | null;
  isProduction: boolean;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ForgeDeveloperFileChange = {
  id: string;
  developerRunId: string;
  path: string;
  operation: string;
  previousSha: string | null;
  newSha: string | null;
  rationale: string | null;
  createdAt: string;
};

export type ForgeDeveloperRun = {
  id: string;
  softwareProjectId: string;
  actionRequestId: string | null;
  runType: string;
  status: string;
  baseBranch: string;
  targetBranch: string | null;
  commitSha: string | null;
  pullRequestNumber: number | null;
  pullRequestUrl: string | null;
  plan: unknown;
  errorLog: string | null;
  attempts: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  softwareProject?: SoftwareProject;
  fileChanges?: ForgeDeveloperFileChange[];
  deployments?: ForgeDeployment[];
  actionRequest?: ForgeActionRequest | null;
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
  actionRequest?: ForgeActionRequest | null;
  executionDispatched?: boolean;
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
  developerRun?: ForgeDeveloperRun | null;
};

export type ForgeAiJob = {
  id: string;
  workspaceId: string;
  conversationId?: string | null;
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

export type SoftwareProject = {
  id: string;
  workspaceId: string;
  slug: string;
  name: string;
  description: string | null;
  projectType: string;
  status: string;
  repositoryProvider: string;
  repositoryFullName: string | null;
  defaultBranch: string;
  deploymentProvider: string | null;
  deploymentProjectId: string | null;
  productionUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  developerRuns?: ForgeDeveloperRun[];
};

export type ForgeAppBuild = {
  id: string;
  workspaceId: string;
  softwareProjectId: string | null;
  name: string;
  prompt: string;
  status: string;
  specification: unknown;
  repositoryName: string | null;
  createdAt: string;
  updatedAt: string;
  softwareProject?: SoftwareProject | null;
};

export type ForgeDeveloperStatus = {
  github: {
    configured: boolean;
    provider: "github";
    baseUrl: string;
    reason?: string;
  };
  vercel: {
    configured: boolean;
    provider: "vercel";
    teamId: string | null;
    reason?: string;
  };
};

export type ForgeRepositoryInspection = {
  project: SoftwareProject;
  inspection: {
    repository: {
      id?: number;
      name?: string;
      fullName: string;
      private: boolean;
      defaultBranch: string;
      url: string;
      description: string | null;
      language: string | null;
      archived: boolean;
      pushedAt: string | null;
    };
    root: Array<{
      name: string;
      path: string;
      type: string;
      size: number;
    }>;
    importantFiles: Array<{
      name: string;
      path: string;
      type: string;
      size: number;
    }>;
  };
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
