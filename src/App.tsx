import PortalNotFound from "./components/PortalNotFound";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Placeholder from "./components/Placeholder";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Payments from "./pages/Payments";
import ClientPortal from "./pages/ClientPortal";
import Requests from "./pages/Requests";
import Approvals from "./pages/Approvals";
import Files from "./pages/Files";
import { clients as startingClients } from "./data/mockData";

import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "./api/clientsApi";

import {
  createRevisionRequest,
  deleteRevisionRequest,
  getRevisionRequests,
  updateRevisionRequestStatus,
} from "./api/revisionRequestsApi";

import {
  createApproval,
  deleteApproval,
  getApprovals,
  updateApprovalStatus,
} from "./api/approvalsApi";

import {
  deleteUploadedFile,
  getUploadedFiles,
} from "./api/filesApi";

import type {
  Approval,
  Client,
  PageName,
  RevisionRequest,
  UploadedFile,
  ViewMode,
} from "./types";

import "./App.css";

const SELECTED_CLIENT_STORAGE_KEY = "phantom-forge-selected-client-id";

function getUrlClientId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("clientId");
}

function loadSelectedClientId() {
  const urlClientId = getUrlClientId();

  if (urlClientId) {
    return urlClientId;
  }

  return localStorage.getItem(SELECTED_CLIENT_STORAGE_KEY) || "1";
}

function getInitialViewMode(): ViewMode {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  return view === "client" ? "Client" : "Admin";
}

function App() {
  const [activePage, setActivePage] = useState<PageName>("Dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>(startingClients);
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [selectedClientId, setSelectedClientId] = useState<string>(
    loadSelectedClientId
  );

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [apiError, setApiError] = useState("");

  const isClientOnlyMode =
    viewMode === "Client" && getInitialViewMode() === "Client";

  const urlClientId = getUrlClientId();

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );

  const shouldShowPortalNotFound =
    isClientOnlyMode && !isLoadingClients && !selectedClient;

  async function loadClientsFromApi() {
    try {
      setIsLoadingClients(true);
      setApiError("");

      const apiClients = await getClients();

      setClients(apiClients);

      if (apiClients.length > 0) {
        if (urlClientId) {
          const urlClientExists = apiClients.some(
            (client) => client.id === urlClientId
          );

          if (urlClientExists) {
            setSelectedClientId(urlClientId);
            setApiError("");
          } else {
            setApiError("");
            setSelectedClientId(urlClientId);
          }

          return;
        }

        const selectedStillExists = apiClients.some(
          (client) => client.id === selectedClientId
        );

        if (!selectedStillExists) {
          setSelectedClientId(apiClients[0].id);
        }
      }
    } catch (error) {
      console.error(error);
      setApiError("Could not connect to Phantom Forge API. Using demo data.");
      setClients(startingClients);
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function loadRevisionRequestsFromApi() {
    try {
      const apiRevisionRequests = await getRevisionRequests();
      setRevisionRequests(apiRevisionRequests);
      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not load revision requests from database.");
    }
  }

  async function loadApprovalsFromApi() {
    try {
      const apiApprovals = await getApprovals();
      setApprovals(apiApprovals);
      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not load approvals from database.");
    }
  }

  async function loadUploadedFilesFromApi() {
    try {
      const apiFiles = await getUploadedFiles();
      setUploadedFiles(apiFiles);
      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not load uploaded files from database.");
    }
  }

  useEffect(() => {
    loadClientsFromApi();
    loadRevisionRequestsFromApi();
    loadApprovalsFromApi();
    loadUploadedFilesFromApi();
  }, []);

  useEffect(() => {
    localStorage.setItem(SELECTED_CLIENT_STORAGE_KEY, selectedClientId);
  }, [selectedClientId]);

  async function handleAddClient(newClient: Client) {
    try {
      const savedClient = await createClient(newClient);

      setClients((currentClients) => [savedClient, ...currentClients]);
      setSelectedClientId(savedClient.id);
      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not save client to database.");
    }
  }

  async function handleUpdateClient(updatedClient: Client) {
    try {
      const savedClient = await updateClient(updatedClient);

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === savedClient.id ? savedClient : client
        )
      );

      setSelectedClientId(savedClient.id);
      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not update client in database.");
    }
  }

  async function handleDeleteClient(id: string) {
    try {
      await deleteClient(id);

      setClients((currentClients) => {
        const remainingClients = currentClients.filter(
          (client) => client.id !== id
        );

        if (selectedClientId === id && remainingClients.length > 0) {
          setSelectedClientId(remainingClients[0].id);
        }

        return remainingClients;
      });

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not delete client from database.");
    }
  }

  async function handleCreateRevisionRequest(clientId: string, message: string) {
    try {
      const savedRequest = await createRevisionRequest(clientId, message);

      setRevisionRequests((currentRequests) => [
        savedRequest,
        ...currentRequests,
      ]);

      setApiError("");

      return savedRequest;
    } catch (error) {
      console.error(error);
      setApiError("Could not save revision request to database.");
      throw error;
    }
  }

  async function handleUpdateRevisionRequestStatus(id: string, status: string) {
    try {
      const updatedRequest = await updateRevisionRequestStatus(id, status);

      setRevisionRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request
        )
      );

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not update revision request.");
    }
  }

  async function handleDeleteRevisionRequest(id: string) {
    try {
      await deleteRevisionRequest(id);

      setRevisionRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== id)
      );

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not delete revision request.");
    }
  }

  async function handleCreateApproval(clientId: string, label: string) {
    try {
      const savedApproval = await createApproval(clientId, label);

      setApprovals((currentApprovals) => [
        savedApproval,
        ...currentApprovals,
      ]);

      setApiError("");

      return savedApproval;
    } catch (error) {
      console.error(error);
      setApiError("Could not save approval to database.");
      throw error;
    }
  }

  async function handleUpdateApprovalStatus(id: string, status: string) {
    try {
      const updatedApproval = await updateApprovalStatus(id, status);

      setApprovals((currentApprovals) =>
        currentApprovals.map((approval) =>
          approval.id === updatedApproval.id ? updatedApproval : approval
        )
      );

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not update approval.");
    }
  }

  async function handleDeleteApproval(id: string) {
    try {
      await deleteApproval(id);

      setApprovals((currentApprovals) =>
        currentApprovals.filter((approval) => approval.id !== id)
      );

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not delete approval.");
    }
  }

  async function handleDeleteUploadedFile(id: string) {
    try {
      await deleteUploadedFile(id);

      setUploadedFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== id)
      );

      setApiError("");
    } catch (error) {
      console.error(error);
      setApiError("Could not delete uploaded file.");
    }
  }

  return (
    <div className={`command-center ${isClientOnlyMode ? "client-safe-shell" : ""}`}>
      {viewMode === "Admin" && !isClientOnlyMode && (
        <Sidebar
          activePage={activePage}
          sidebarOpen={sidebarOpen}
          setActivePage={setActivePage}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <main className={`main-content ${viewMode === "Client" ? "client-mode" : ""}`}>
        <Topbar
          activePage={activePage}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSidebarOpen={setSidebarOpen}
          isClientOnlyMode={isClientOnlyMode}
        />

        {apiError && <div className="api-alert">{apiError}</div>}

        {isLoadingClients && (
          <div className="api-alert">Loading project portal...</div>
        )}

        {shouldShowPortalNotFound && <PortalNotFound />}

        {viewMode === "Client" && selectedClient && !shouldShowPortalNotFound && (
          <ClientPortal
            selectedClient={selectedClient}
            onCreateRevisionRequest={handleCreateRevisionRequest}
            onCreateApproval={handleCreateApproval}
          />
        )}

        {viewMode === "Admin" && !isClientOnlyMode && (
          <>
            {activePage === "Dashboard" && <Dashboard clients={clients} />}

            {activePage === "Clients" && (
              <Clients
                clients={clients}
                selectedClientId={selectedClientId}
                setSelectedClientId={setSelectedClientId}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onRefreshClients={loadClientsFromApi}
              />
            )}

            {activePage === "Projects" && <Projects />}

            {activePage === "Payments" && <Payments clients={clients} />}

            {activePage === "Files" && (
              <Files
                uploadedFiles={uploadedFiles}
                onRefreshFiles={loadUploadedFilesFromApi}
                onDeleteFile={handleDeleteUploadedFile}
              />
            )}

            {activePage === "Requests" && (
              <Requests
                revisionRequests={revisionRequests}
                onRefreshRequests={loadRevisionRequestsFromApi}
                onUpdateRequestStatus={handleUpdateRevisionRequestStatus}
                onDeleteRequest={handleDeleteRevisionRequest}
              />
            )}

            {activePage === "Approvals" && (
              <Approvals
                approvals={approvals}
                onRefreshApprovals={loadApprovalsFromApi}
                onUpdateApprovalStatus={handleUpdateApprovalStatus}
                onDeleteApproval={handleDeleteApproval}
              />
            )}

            {activePage === "Notifications" && (
              <Placeholder title="Notifications" />
            )}

            {activePage === "Settings" && <Placeholder title="Settings" />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;