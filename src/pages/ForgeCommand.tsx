import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import {
  createForgeConversation,
  getForgeApprovals,
  getForgeConversation,
  getForgeConversations,
  getForgeHealth,
  getForgeMemory,
  getForgeTasks,
  sendForgeConversationMessage,
} from "../api/forgeApi";
import type { ForgeHealth } from "../api/forgeApi";
import type {
  ForgeApprovalRequest,
  ForgeConversation,
  ForgeMemory,
  ForgeTask,
  WorkspaceSlug,
} from "../types";
import "./ForgeCommand.css";

type ForgeCommandProps = {
  workspace: WorkspaceSlug;
};

const WORKSPACE_LABELS: Record<WorkspaceSlug, string> = {
  ffs: "Frontline Forge Solutions",
  "forge-capital": "Forge Capital",
};

const QUICK_COMMANDS: Record<WorkspaceSlug, string[]> = {
  ffs: [
    "What needs my attention at FFS right now?",
    "Review my open tasks and give me the best next move.",
    "Show me what you remember about our current operations.",
  ],
  "forge-capital": [
    "What needs my attention at Forge Capital right now?",
    "Review my open acquisition tasks and prioritize them.",
    "What do you remember about our current acquisition strategy?",
  ],
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ForgeCommand({ workspace }: ForgeCommandProps) {
  const [health, setHealth] = useState<ForgeHealth | null>(null);
  const [conversations, setConversations] = useState<ForgeConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ForgeConversation | null>(null);
  const [tasks, setTasks] = useState<ForgeTask[]>([]);
  const [memory, setMemory] = useState<ForgeMemory[]>([]);
  const [approvals, setApprovals] = useState<ForgeApprovalRequest[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== "DONE"),
    [tasks]
  );
  const pendingApprovals = useMemo(
    () => approvals.filter((approval) => approval.status === "PENDING"),
    [approvals]
  );

  async function refreshSidebarData(selectFirst = false) {
    const [forgeHealth, loadedConversations, loadedTasks, loadedMemory, loadedApprovals] =
      await Promise.all([
        getForgeHealth(),
        getForgeConversations(workspace),
        getForgeTasks(workspace),
        getForgeMemory(workspace),
        getForgeApprovals(workspace),
      ]);

    setHealth(forgeHealth);
    setConversations(loadedConversations);
    setTasks(loadedTasks);
    setMemory(loadedMemory);
    setApprovals(loadedApprovals);

    if (selectFirst && loadedConversations.length > 0) {
      const detail = await getForgeConversation(loadedConversations[0].id);
      setActiveConversation(detail);
    }
  }

  async function loadWorkspace() {
    try {
      setLoading(true);
      setError("");
      setActiveConversation(null);
      await refreshSidebarData(true);
    } catch (loadError) {
      console.error(loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not connect to Forge Command Core."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, [workspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length, sending]);

  async function openConversation(id: string) {
    try {
      setError("");
      setActiveConversation(await getForgeConversation(id));
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "Could not open conversation."
      );
    }
  }

  async function newConversation() {
    try {
      setError("");
      const created = await createForgeConversation(workspace);
      setActiveConversation({ ...created, messages: [], aiJobs: [] });
      setConversations((current) => [created, ...current]);
      setInput("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create conversation."
      );
    }
  }

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      setError("");

      let conversation = activeConversation;
      if (!conversation) {
        const created = await createForgeConversation(workspace);
        conversation = { ...created, messages: [], aiJobs: [] };
        setActiveConversation(conversation);
      }

      const optimisticId = `local-${Date.now()}`;
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              messages: [
                ...(current.messages || []),
                {
                  id: optimisticId,
                  conversationId: current.id,
                  role: "user",
                  content,
                  metadata: null,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : current
      );
      setInput("");

      await sendForgeConversationMessage(conversation.id, content);
      const detail = await getForgeConversation(conversation.id);
      setActiveConversation(detail);
      await refreshSidebarData(false);
    } catch (sendError) {
      console.error(sendError);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Forge Executive could not complete that command."
      );
      if (activeConversation) {
        setActiveConversation(await getForgeConversation(activeConversation.id).catch(() => activeConversation));
      }
    } finally {
      setSending(false);
    }
  }

  const providerConfigured = health?.aiProvider.configured === true;
  const messages = activeConversation?.messages || [];

  return (
    <section className="forge-command-v2">
      <header className="forge-command-v2-header">
        <div>
          <span className="forge-command-brand">
            <Sparkles size={15} /> FORGE EXECUTIVE
          </span>
          <h1>What are we working on, boss?</h1>
          <p>{WORKSPACE_LABELS[workspace]} is the active isolated workspace.</p>
        </div>

        <div className="forge-system-pills">
          <div className={health?.status === "healthy" ? "online" : "offline"}>
            <span /> PhantomSync
          </div>
          <div className={providerConfigured ? "online" : "offline"}>
            <span /> {providerConfigured ? health?.aiProvider.model || "AI Online" : "AI Setup Needed"}
          </div>
        </div>
      </header>

      {!providerConfigured && health?.aiProvider.reason && (
        <div className="forge-command-notice">
          <Bot size={18} />
          <div>
            <strong>The Forge Core is online, but its model endpoint is not configured yet.</strong>
            <span>{health.aiProvider.reason}</span>
          </div>
        </div>
      )}

      {error && <div className="forge-command-error">{error}</div>}

      <div className="forge-command-stats">
        <article><TerminalSquare size={18} /><div><span>Threads</span><strong>{conversations.length}</strong></div></article>
        <article><Brain size={18} /><div><span>Memory</span><strong>{memory.length}</strong></div></article>
        <article><CheckCircle2 size={18} /><div><span>Open Tasks</span><strong>{openTasks.length}</strong></div></article>
        <article><ShieldCheck size={18} /><div><span>Approvals</span><strong>{pendingApprovals.length}</strong></div></article>
      </div>

      <div className="forge-chat-layout">
        <aside className="forge-chat-sidebar">
          <button className="forge-new-thread" onClick={newConversation}>
            <MessageSquarePlus size={17} /> New Conversation
          </button>

          <div className="forge-thread-list">
            {loading ? (
              <div className="forge-thread-empty">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="forge-thread-empty">No conversations yet.</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={activeConversation?.id === conversation.id ? "active" : ""}
                  onClick={() => openConversation(conversation.id)}
                >
                  <strong>{conversation.title}</strong>
                  <span>{conversation._count?.messages || conversation.messages?.length || 0} messages</span>
                  <small>{formatTime(conversation.lastMessageAt)}</small>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="forge-chat-panel">
          <div className="forge-chat-titlebar">
            <div>
              <span>Private business assistant</span>
              <strong>{activeConversation?.title || "New Forge Conversation"}</strong>
            </div>
            <ShieldCheck size={18} />
          </div>

          <div className="forge-chat-messages">
            {messages.length === 0 ? (
              <div className="forge-chat-welcome">
                <div className="forge-orb"><Bot size={26} /></div>
                <h2>Forge is ready.</h2>
                <p>
                  Ask a normal question, save business memory, create a task,
                  change an existing app, or tell Forge to build a brand-new one.
                </p>
                <div className="forge-quick-commands">
                  {QUICK_COMMANDS[workspace].map((command) => (
                    <button key={command} onClick={() => setInput(command)}>{command}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`forge-message ${message.role}`}>
                  <div className="forge-message-avatar">
                    {message.role === "assistant" ? <Bot size={16} /> : "EF"}
                  </div>
                  <div className="forge-message-body">
                    <div className="forge-message-meta">
                      <strong>{message.role === "assistant" ? "Forge Executive" : "Boss"}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {sending && (
              <div className="forge-message assistant thinking">
                <div className="forge-message-avatar"><Bot size={16} /></div>
                <div className="forge-message-body">
                  <div className="forge-message-meta"><strong>Forge Executive</strong></div>
                  <p><Loader2 className="spin" size={16} /> Working through the request...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="forge-chat-composer" onSubmit={sendMessage}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                workspace === "ffs"
                  ? "Ask Forge about FFS, or tell it what to build..."
                  : "Ask Forge about Capital, a deal, or a system to build..."
              }
              rows={3}
            />
            <div className="forge-composer-footer">
              <span><ShieldCheck size={14} /> Protected production actions require approval.</span>
              <button disabled={!input.trim() || sending || !providerConfigured}>
                {sending ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ForgeCommand;