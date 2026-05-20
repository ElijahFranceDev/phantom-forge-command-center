import type { UploadedFile } from "../types";

const API_URL = "http://localhost:4000/api";

export async function getUploadedFiles() {
  const response = await fetch(`${API_URL}/files`);

  if (!response.ok) {
    throw new Error("Failed to load uploaded files.");
  }

  return (await response.json()) as UploadedFile[];
}

export async function getClientUploadedFiles(clientId: string) {
  const response = await fetch(`${API_URL}/files/client/${clientId}`);

  if (!response.ok) {
    throw new Error("Failed to load client uploaded files.");
  }

  return (await response.json()) as UploadedFile[];
}

export async function uploadClientFiles(clientId: string, files: FileList) {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/files/${clientId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload files.");
  }

  return (await response.json()) as UploadedFile[];
}

export async function deleteUploadedFile(id: string) {
  const response = await fetch(`${API_URL}/files/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete file.");
  }

  return response.json();
}