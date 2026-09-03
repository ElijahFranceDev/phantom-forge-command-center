import PortalNotFound from "./components/PortalNotFound";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Placeholder from "./components/Placeholder";
import ForgeCommand from "./pages/ForgeCommand";
import ForgeTasks from "./pages/ForgeTasks";
import ForgeMemory from "./pages/ForgeMemory";
import ForgeApprovals from "./pages/ForgeApprovals";
import ForgeActivity from "./pages/ForgeActivity";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Payments from "./pages/Payments";
import ClientPortal from "./pages/ClientPortal";
import Requests from "./pages/Requests";
import Files from "./pages/Files";
import { clients as startingClients } from "./data/mockData";
import Operations from "./pages/Operations";

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
  getApprovals,
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
  WorkspaceSlug,
} from "./types";

import "./App.css";

const SELECTED_CLIENT_STORAGE_KEY = "phantom-forge-selected-client-id";
const FORGE_WORKSPACE_STORAGE_KEY = "forge-command-workspace";

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

function loadWorkspace(): WorkspaceSlug {
  const savedWorkspace = localStorage.getItem(FORGE_WORKSPACE_STORAGE_KEY);
  return savedWorkspace === "forge-capital" ? "forge-capital" : "ffs";
}

function getInitialViewMode(): ViewMode {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  return view === "client" ? "Client" : "Admin";
}

function App() {
  const [activePage, setActivePage] = useState<PageName>("Command");
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSlug>(loadWorkspace);
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
      setApiError("Could not connect to the legacy portal API. Using demo data.");
      setClients(startingClients);
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function loadRevisionRequestsFromApi() {
    try {
      setRevisionRequests(await getRevisionRequests());
    } catch (error) {
      console.error(error);
    }
  }

  async function loadApprovalsFromApi() {
    try {
      setApprovals(await getApprovals());
    } catch (error) {
      console.error(error);
    }
  }

  async function loadUploadedFilesFromApi() {
    try {
      setUploadedFiles(await getUploadedFiles());
    } catch (error) {
      console.error(error);
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

  useEffect(() => {
    localStorage.setItem(FORGE_WORKSPACE_STORAGE_KEY, activeWorkspace);
  }, [activeWorkspace]);

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
      setRevisionRequests((currentRequests) => [savedRequest, ...currentRequests]);
      return savedRequest;
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteRevisionRequest(id: string) {
    try {
      await deleteRevisionRequest(id);
      setRevisionRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateApproval(clientId: string, label: string) {
    try {
      const savedApproval = await createApproval(clientId, label);
      setApprovals((currentApprovals) => [savedApproval, ...currentApprovals]);
      return savedApproval;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function handleDeleteUploadedFile(id: string) {
    try {
      await deleteUploadedFile(id);
      setUploadedFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== id)
      );
    } catch (error) {
      console.error(error);
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
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          isClientOnlyMode={isClientOnlyMode}
        />

        {viewMode === "Client" && apiError && (
          <div className="api-alert">{apiError}</div>
        )}

        {viewMode === "Client" && isLoadingClients && (
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
            {activePage === "Command" && <ForgeCommand workspace={activeWorkspace} />}

            {activePage === "Dashboard" && (
              <Dashboard clients={clients} approvals={approvals} />
            )}

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

            {activePage === "Approvals" && <ForgeApprovals workspace={activeWorkspace} />}
            {activePage === "Operations" && <Operations />}
            {activePage === "Tasks" && <ForgeTasks workspace={activeWorkspace} />}
            {activePage === "Memory" && <ForgeMemory workspace={activeWorkspace} />}
            {activePage === "Activity" && <ForgeActivity workspace={activeWorkspace} />}

            {activePage === "Developer" && (
              <Placeholder title="Forge Developer — GitHub + build pipeline next" />
            )}
            {activePage === "Notifications" && (
              <Placeholder title="Notifications" />
            )}
            {activePage === "Settings" && <Placeholder title="Forge Command Settings" />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
