import type { Approval } from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://phantom-forge-command-center-api.onrender.com/api";

export async function getApprovals() {
  const response = await fetch(`${API_URL}/approvals`);

  if (!response.ok) {
    throw new Error("Failed to load approvals.");
  }

  return (await response.json()) as Approval[];
}

export async function createApproval(clientId: string, label: string) {
  const response = await fetch(`${API_URL}/approvals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      label,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create approval.");
  }

  return (await response.json()) as Approval;
}

export async function updateApprovalStatus(id: string, status: string) {
  const response = await fetch(`${API_URL}/approvals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update approval.");
  }

  return (await response.json()) as Approval;
}

export async function deleteApproval(id: string) {
  const response = await fetch(`${API_URL}/approvals/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete approval.");
  }

  return response.json();
}