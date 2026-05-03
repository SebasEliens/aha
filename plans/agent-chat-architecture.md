# Agent Chat Architecture

Goal: replace the standalone messages API with a proper agentic chat that can act on behalf of the user across the full project hierarchy.

## Core approach

Claude with function calling (tool use) as the agent primitive. The agent receives a scoped set of tools based on where in the hierarchy the conversation is anchored, then acts by calling the existing repositories directly.

## Agent session model

Replace/extend the current flat `messages` table with:

```sql
agent_sessions
  id, created_at, updated_at
  context_level  TEXT  -- "root" | "project" | "report" | "element"
  project_id     UUID  NULL
  report_id      UUID  NULL
  element_id     UUID  NULL

agent_messages
  id, session_id, role TEXT  -- "user" | "assistant" | "tool"
  content, tool_call_id, created_at
```

The `context_level` + IDs control which tools are offered and which IDs are injected automatically.

## Scoped toolsets

Only expose tools relevant to the current context level:

| Level     | Tools available |
|-----------|----------------|
| `root`    | `list_projects`, `create_project`, `switch_to_project` |
| `project` | root tools + `list_reports`, `create_report`, `list_data_sources`, `add_data_source`, `trigger_analytics`, `switch_to_report` |
| `report`  | project tools + `list_sections`, `add_section`, `add_element`, `switch_to_element` |
| `element` | `get_element`, `update_element`, `explain_element` |

Context-switching tools (`switch_to_project`, `switch_to_report`) update the session's `context_level` and IDs — this is how the agent navigates the hierarchy in a single conversation.

## Two-speed actions

**Sync** (CRUD): create project, add section, update element — call the repo, return result to agent, agent explains to user.

**Async** (long-running): analytics pipelines, full report generation. Pattern:

```
agent calls trigger_analytics(project_id, config)
  → creates analytics row with status=pending
  → enqueues background job
  → returns job_id to agent
  → agent responds: "I've kicked off the analysis, I'll update you when it's done"

background worker runs the pipeline
  → updates analytics row: running → completed/failed
  → notifies session via polling or SSE
```

For the job queue on Fly.io:
- **Simple now**: poll the DB on subsequent messages (`"check my pending jobs"` → agent calls `get_analytics_status(run_id)`)
- **Better later**: ARQ (Redis-backed async job queue for Python) with a dedicated Fly.io worker machine

A full durable workflow engine (Temporal, Prefect) is overkill at this stage.

## Agent endpoint design

```
POST /agent/sessions                       create session (with optional initial context)
GET  /agent/sessions/{id}                  get session + message history
POST /agent/sessions/{id}/messages         send message, get streamed response
```

Message handler loop:
1. Append user message to DB
2. Load full conversation history + current context
3. Call Claude with `tools=get_tools_for_context(session.context_level)`
4. Handle tool calls in a loop: execute → append tool result → re-call Claude
5. Stream final assistant response back, append to DB
6. If any tool changed context (e.g. `switch_to_project`), update session context

## Report/element refinement

When the agent is at `report` or `element` level:
- Read current element `data` + `config` from the repo
- Propose changes as a structured diff
- Call `update_element` only after user confirms

Add an `auto_apply: bool` flag to the session for power users who want the agent to apply changes directly.

## Implementation order

1. **Schema** — add `agent_sessions` + `agent_messages` migration
2. **Tool registry** — `tools/` module mapping tool names → repo calls + Claude tool schemas
3. **Agent router** — `POST /agent/sessions/{id}/messages` with the tool-call loop
4. **Frontend** — context-aware chat showing current scope (project name, report name), streaming responses
5. **Async jobs** — wire up `analytics.status` with a background worker before building analytics tool calls

## Notes

- The existing repository layer is the right abstraction — tool implementations just call `repo.create(...)` etc.
- Fly.io persistent machines make background workers straightforward (no separate infra needed)
- Vercel Workflow is not applicable here (Fly.io backend); ARQ is the natural fit for async jobs
