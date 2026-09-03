# Forge Command V1 Architecture

## Purpose

Forge Command is the private AI operating environment for Frontline Forge Solutions (FFS) and Forge Capital (FC).

It combines the strongest parts of the existing PhantomOS and PhantomSync work without turning them into one monolithic application.

The system must remain capable of acting as a normal assistant while also becoming an operator that can research, read company data, prepare actions, build software, test software, create previews, and deploy approved changes.

## Architecture Decision

### PhantomSync = Intelligence Core

PhantomSync becomes the shared AI/orchestration layer responsible for:

- model routing
- long-term memory
- business/project context
- agent coordination
- tool selection
- task planning
- action logging
- permission checks
- approval routing

### PhantomOS = Private Personal Interface

PhantomOS remains the private/personal assistant environment.

It can use PhantomSync, but personal memories, permissions, and tools must remain isolated from business users and business workspaces.

### Forge Command = Business AI Interface

Forge Command becomes the dedicated business AI environment for:

- Frontline Forge Solutions
- Forge Capital

The dedicated monitor should run Forge Command, not the personal PhantomOS interface.

## Existing Assets We Are Reusing

### 1. PhantomOS / PhantomSync Prototype

The original prototype already established useful concepts:

- command interface
- assistant modes
- tasks
- quick capture
- memory commands
- command history
- daily brief
- focus warnings
- project view
- Device Bridge concept
- Memory Core concept
- PhantomSync as the AI intelligence layer

The old browser implementation is a prototype only. Its localStorage-based state should not become the production data layer.

### 2. Phantom Forge Command Center Frontend

Current stack:

- React
- TypeScript
- Vite

Current reusable capabilities include:

- dashboard shell
- sidebar/navigation
- Admin and Client views
- clients
- projects
- payments
- files
- revision requests
- approvals
- operations page
- API integration

This repository becomes the starting frontend shell for Forge Command V1.

### 3. Phantom Forge Command Center API

Current stack:

- Express
- TypeScript
- Prisma
- PostgreSQL
- Render-hosted API

Current database/API concepts include:

- Client
- Project
- Payment
- RevisionRequest
- Approval
- UploadedFile

This API becomes the seed for Forge Core / PhantomSync business services instead of being discarded.

## Target System

```text
                         USER
                           |
                     FORGE COMMAND
                  Dedicated AI Console
                           |
                    PHANTOMSYNC CORE
                           |
        +------------------+------------------+
        |                  |                  |
   FFS Workspace      FC Workspace      Personal Boundary
        |                  |                  |
  FFS Agents          FC Agents          PhantomOS
        |                  |
        +---------+--------+
                  |
             Tool / Action Layer
                  |
   +--------------+---------------+----------------+
   |              |               |                |
 GitHub         Vercel        Business Data      Research
 Code/Repos     Deployments    PostgreSQL/APIs    Web/APIs
```

## V1 Specialist Agents

Forge Command V1 should expose one assistant to the user while routing work internally to specialist agents.

### Forge Executive

The default assistant and router.

Responsibilities:

- understand the request
- identify the correct workspace
- decide which agent/tool is needed
- gather context
- prepare an execution plan
- request approval when required

### Forge Developer

Responsibilities:

- inspect repositories
- create/edit files
- create branches
- run builds/tests
- diagnose build failures
- prepare database migrations
- create previews
- prepare deployments
- deploy only when authorized

### FFS Operations

Responsibilities:

- carriers
- dispatch operations
- load activity
- documents
- broker information
- driver operations
- invoices/fees
- operational alerts

### Forge Capital

Responsibilities:

- acquisition leads
- seller information
- due diligence
- financial review
- seller-financing structures
- FCAA analysis
- offer preparation
- follow-up tracking

### Forge Documents

Responsibilities:

- agreements
- proposals
- reports
- PDFs
- Forge Sign workflows
- completed-document storage

## Workspace Separation

Every AI run, memory, project, integration, and action must belong to a workspace.

Initial workspaces:

- `FFS`
- `FORGE_CAPITAL`
- `PERSONAL` (PhantomOS only; not exposed to normal Forge Command users)

Business data must not automatically leak between FFS and FC simply because both are controlled by the same owner.

## Permission Levels

### Level 1 — READ

Allowed without separate approval once the integration is authorized.

Examples:

- read dashboards
- inspect repositories
- analyze financial data
- search business records
- summarize documents

### Level 2 — PREPARE

The AI may create a proposed change but cannot execute the final external action.

Examples:

- prepare code changes
- create preview builds
- draft emails
- prepare offers
- prepare contracts
- prepare database migrations

### Level 3 — EXECUTE

Execution requires either an explicit per-action approval or a previously defined automation rule.

Always-protected actions include:

- production deployment
- sending money
- signing agreements
- sending acquisition offers
- deleting production data
- changing critical credentials/permissions

## Production Data Model Additions

The existing API schema should be extended with the following core models before the AI is given write authority:

- Workspace
- User
- WorkspaceMembership
- Agent
- Conversation
- Message
- Memory
- Task
- ProjectRegistry
- RepositoryConnection
- AIJob
- AIJobStep
- ToolCallLog
- ActionRequest
- ApprovalRequest
- Integration
- Notification

Existing Client/Project/Payment/File models can remain while they are gradually adapted to workspace ownership.

## AI Job Lifecycle

Every meaningful AI operation should follow this lifecycle:

```text
REQUEST
  -> ROUTE
  -> LOAD CONTEXT
  -> PLAN
  -> RUN TOOLS
  -> VALIDATE RESULT
  -> PREPARE ACTION
  -> APPROVAL (when required)
  -> EXECUTE
  -> LOG
  -> WRITE MEMORY
```

This lifecycle is required for the future site/app builder.

## Developer / App Builder Lifecycle

The same assistant must eventually support:

> "Build me a new application."

Flow:

```text
Prompt
 -> Requirements extraction
 -> App plan
 -> Repository/project creation
 -> Frontend generation
 -> Backend/API generation
 -> Database schema/migrations
 -> Authentication/permissions
 -> Integrations
 -> Build
 -> Automated error repair
 -> Tests
 -> Preview
 -> User approval
 -> Production deployment
 -> Register project in Forge Command
 -> Long-term project memory
```

It must also support editing existing applications rather than regenerating them from scratch.

## Dedicated Monitor V1 UI

The initial Forge Command screen should contain:

### Left navigation

- Command
- FFS
- Forge Capital
- Developer
- Projects
- Tasks
- Approvals
- Memory
- Activity
- Settings

### Main command panel

A conversational assistant input capable of normal questions and executable commands.

Example:

> What needs my attention today?

or

> Add settlement reporting to Peach Synergy's dashboard.

### Right intelligence rail

- system health
- active jobs
- approvals waiting
- urgent alerts
- recent deployments
- upcoming follow-ups

## What We Keep vs Replace

### Keep / Refactor

- PhantomOS command-center visual concept
- PhantomSync naming and intelligence role
- command history idea
- task and memory concepts
- daily brief concept
- React shell/navigation
- existing API client pattern
- Express API
- Prisma/PostgreSQL
- approval concepts
- file/project concepts

### Replace / Upgrade

- browser localStorage as primary memory
- hard-coded smart responses
- Phantom Forge-specific business branding in the business console
- demo-data fallbacks in production AI functions
- direct unlogged AI actions
- single-company assumptions
- unsecured action execution

## First Build Order

### Foundation 1 — Core Identity

1. Rename the working UI layer to Forge Command in the new branch.
2. Add FFS and Forge Capital workspace switching.
3. Add Command / Developer / Tasks / Approvals / Memory navigation.

### Foundation 2 — PhantomSync Backend

1. Add Workspace and AIJob models.
2. Add Memory, Task, ActionRequest, and ApprovalRequest models.
3. Add `/api/forge/health`.
4. Add `/api/workspaces`.
5. Add `/api/ai/jobs`.
6. Add `/api/memory`.
7. Add `/api/actions` and approval endpoints.

### Foundation 3 — Real Assistant

1. Add model-provider abstraction.
2. Add Forge Executive router.
3. Persist conversations and messages.
4. Load workspace memory/context for each request.
5. Return structured tool/action plans.

### Foundation 4 — Developer Agent

1. Project registry.
2. GitHub connection.
3. Repository inspection.
4. Branch/file operations.
5. build/test job execution.
6. preview tracking.
7. deployment approval gate.

## V1 Definition of Done

Forge Command V1 is ready when the dedicated monitor can:

1. Open one private business command center.
2. Switch between FFS and Forge Capital without mixing their data.
3. Chat naturally with Forge Executive.
4. Remember durable workspace facts in PostgreSQL.
5. Create and manage tasks.
6. Show an approval queue.
7. Register existing software projects.
8. Inspect a GitHub project through Forge Developer.
9. Prepare a code change in a branch.
10. Show the user what would change before execution.
11. Log every AI job and action.

Full autonomous app generation comes after this foundation is reliable.

## Current Decision

Do not build a third unrelated AI system.

Use:

- PhantomSync as the intelligence/orchestration core
- PhantomOS as the isolated personal AI environment
- Forge Command as the FFS + Forge Capital business AI interface

The existing React Command Center and Express/Prisma/PostgreSQL API are the production starting point.
