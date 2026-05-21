import type { RevisionRequest } from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://phantom-forge-command-center-api.onrender.com/api";

export async function getRevisionRequests() {
  const response = await fetch(`${API_URL}/revision-requests`);

  if (!response.ok) {
    throw new Error("Failed to load revision requests.");
  }

  return (await response.json()) as RevisionRequest[];
}

export async function createRevisionRequest(clientId: string, message: string) {
  const response = await fetch(`${API_URL}/revision-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create revision request.");
  }

  return (await response.json()) as RevisionRequest;
}

export async function updateRevisionRequestStatus(id: string, status: string) {
  const response = await fetch(`${API_URL}/revision-requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update revision request.");
  }

  return (await response.json()) as RevisionRequest;
}

export async function deleteRevisionRequest(id: string) {
  const response = await fetch(`${API_URL}/revision-requests/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete revision request.");
  }

  return response.json();
}