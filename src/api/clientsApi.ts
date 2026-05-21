import type { Client } from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://phantom-forge-command-center-api.onrender.com/api";

type ApiClient = Omit<Client, "balance" | "depositDue"> & {
  balance: number;
  depositDue: number;
};

function moneyToNumber(value: string) {
  const cleanedValue = value.replace(/[^0-9.-]+/g, "");
  const parsedValue = Number(cleanedValue);

  return Number.isNaN(parsedValue) ? 0 : parsedValue;
}

function formatMoney(value: number) {
  return `$${value}`;
}

function fromApiClient(client: ApiClient): Client {
  return {
    ...client,
    balance: formatMoney(client.balance),
    depositDue: formatMoney(client.depositDue),
  };
}

function toApiClient(client: Client) {
  return {
    ...client,
    balance: moneyToNumber(client.balance),
    depositDue: moneyToNumber(client.depositDue),
  };
}

export async function getClients() {
  const response = await fetch(`${API_URL}/clients`);

  if (!response.ok) {
    throw new Error("Failed to load clients.");
  }

  const clients = (await response.json()) as ApiClient[];

  return clients.map(fromApiClient);
}

export async function createClient(client: Client) {
  const response = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiClient(client)),
  });

  if (!response.ok) {
    throw new Error("Failed to create client.");
  }

  const savedClient = (await response.json()) as ApiClient;

  return fromApiClient(savedClient);
}

export async function updateClient(client: Client) {
  const response = await fetch(`${API_URL}/clients/${client.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiClient(client)),
  });

  if (!response.ok) {
    throw new Error("Failed to update client.");
  }

  const savedClient = (await response.json()) as ApiClient;

  return fromApiClient(savedClient);
}

export async function deleteClient(id: string) {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete client.");
  }

  return response.json();
}