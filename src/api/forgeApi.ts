import type {
  ForgeActionRequest,
  ForgeAiJob,
  ForgeApprovalRequest,
  ForgeMemory,
  ForgeTask,
  ForgeWorkspace,
  WorkspaceSlug,
} from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://phantom-forge-command-center-api.onrender.com/api";

export type ForgeAiProviderStatus = {
  configured: boolean;
  provider: string;
  model: string | null;
  baseUrl: string | null;
  reason?: string;
};

export type ForgeHealth = {
  status: string;
  service: string;
  version: string;
  capabilities: string[];
  aiProvider: ForgeAiProviderStatus;
  timestamp: string;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Forge API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function getForgeHealth() {
  return apiFetch<ForgeHealth>("/forge/health");
}

export function getForgeWorkspaces() {
  return apiFetch<ForgeWorkspace[]>("/forge/workspaces");
}

export function getForgeMemory(workspace: WorkspaceSlug) {
  return apiFetch<ForgeMemory[]>(`/forge/memory?workspace=${workspace}`);
}

export function createForgeMemory(
  workspace: WorkspaceSlug,
  input: {
    key?: string;
    category?: string;
    content: string;
    source?: string;
    importance?: number;
    isPinned?: boolean;
  }
) {
  return apiFetch<ForgeMemory>("/forge/memory", {
    method: "POST",
    body: JSON.stringify({ workspace, ...input }),
  });
}

export function updateForgeMemory(
  id: string,
  input: Partial<
    Pick<ForgeMemory, "category" | "content" | "source" | "importance" | "isPinned">
  >
) {
  return apiFetch<ForgeMemory>(`/forge/memory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteForgeMemory(id: string) {
  return apiFetch<{ message: string }>(`/forge/memory/${id}`, {
    method: "DELETE",
  });
}

export function getForgeTasks(workspace: WorkspaceSlug) {
  return apiFetch<ForgeTask[]>(`/forge/tasks?workspace=${workspace}`);
}

export function createForgeTask(
  workspace: WorkspaceSlug,
  input: {
    title: string;
    description?: string;
    priority?: string;
    dueAt?: string;
  }
) {
  return apiFetch<ForgeTask>("/forge/tasks", {
    method: "POST",
    body: JSON.stringify({ workspace, ...input }),
  });
}

export function updateForgeTask(
  id: string,
  input: Partial<
    Pick<ForgeTask, "title" | "description" | "status" | "priority" | "dueAt">
  >
) {
  return apiFetch<ForgeTask>(`/forge/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteForgeTask(id: string) {
  return apiFetch<{ message: string }>(`/forge/tasks/${id}`, {
    method: "DELETE",
  });
}

export function getForgeAiJobs(workspace: WorkspaceSlug) {
  return apiFetch<ForgeAiJob[]>(`/forge/ai/jobs?workspace=${workspace}`);
}

export function createForgeAiJob(
  workspace: WorkspaceSlug,
  request: string,
  agent = "Forge Executive"
) {
  return apiFetch<ForgeAiJob>("/forge/ai/jobs", {
    method: "POST",
    body: JSON.stringify({ workspace, request, agent }),
  });
}

export function runForgeAiJob(id: string) {
  return apiFetch<ForgeAiJob>(`/forge/ai/jobs/${id}/run`, {
    method: "POST",
  });
}

export function getForgeActions(workspace: WorkspaceSlug) {
  return apiFetch<ForgeActionRequest[]>(`/forge/actions?workspace=${workspace}`);
}

export function getForgeApprovals(workspace: WorkspaceSlug) {
  return apiFetch<ForgeApprovalRequest[]>(
    `/forge/approvals?workspace=${workspace}`
  );
}

export function approveForgeRequest(id: string, note?: string) {
  return apiFetch<ForgeApprovalRequest>(`/forge/approvals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export function rejectForgeRequest(id: string, note?: string) {
  return apiFetch<ForgeApprovalRequest>(`/forge/approvals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}
