import type {
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
  return apiFetch<{
    status: string;
    service: string;
    version: string;
    capabilities: string[];
    timestamp: string;
  }>("/forge/health");
}

export function getForgeWorkspaces() {
  return apiFetch<ForgeWorkspace[]>("/forge/workspaces");
}

export function getForgeMemory(workspace: WorkspaceSlug) {
  return apiFetch<ForgeMemory[]>(`/forge/memory?workspace=${workspace}`);
}

export function getForgeTasks(workspace: WorkspaceSlug) {
  return apiFetch<ForgeTask[]>(`/forge/tasks?workspace=${workspace}`);
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
