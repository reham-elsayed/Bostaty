# Authorization & Permissions Test Cases

This document outlines the test cases required to verify the authorization logic across the Bostaty application. These cases cover both static Role-Based Access Control (RBAC) and dynamic granular permissions.

---

## 🔑 1. Role-Based Access Control (RBAC)

Verify that actions restricted to specific roles are enforced on both the server and client.

| Scenario | Actor | Expected Result |
|----------|-------|-----------------|
| Manage Modules / Plan Settings | `OWNER` | **SUCCESS**: Access granted to toggle modules. |
| Manage Modules / Plan Settings | `ADMIN` / `MEMBER` | **DENIED**: "Only the workspace owner can manage plan settings." |
| Change Appearance (Theme/Branding) | `OWNER` / `ADMIN` | **SUCCESS**: Access granted to update theme metadata. |
| Change Appearance (Theme/Branding) | `MEMBER` | **DENIED**: Action button hidden; Server Action returns error. |
| Invite New Team Members | `OWNER` / `ADMIN` | **SUCCESS**: Can open modal and send invite. |
| Invite New Team Members | `MEMBER` | **DENIED**: Modal button hidden; `createInvite` fails. |
| Transfer Workspace Ownership | `OWNER` | **SUCCESS**: Can select a new owner and downgrade own role. |
| Delete Workspace | `OWNER` | **SUCCESS**: Can trigger permanent deletion. |

---

## 🧩 2. Granular Permissions (Module-Level)

Verify that permissions stored in the user's `metadata.permissions` array are correctly evaluated.

| Scenario | Metadata Condition | Expected Result |
|----------|-------------------|-----------------|
| View HR Employee List | `["hr.employees.view", ...]` | **SUCCESS**: Sidebar link visible; Data rendered. |
| View HR Employee List | `[]` (Permission missing) | **DENIED**: Sidebar link hidden; API returns 403. |
| Edit Customer CRM data | `["crm.customers.edit"]` | **SUCCESS**: Edit buttons visible in CRM module. |
| Permission Revoke Flow | Permission removed from metadata | **DENIED**: Immediate loss of access on next server-side check. |
| Permission Inherit Flow | Received via invitation metadata | **SUCCESS**: Permissions correctly populated upon acceptance. |

---

## 🎨 3. UI Rendering & Conditional Display

Verify that the UI adapts dynamically to the user's current context and permissions.

| Scenario | Condition | UI Behavior |
|----------|-----------|-------------|
| **Invite Modal** | Role is `MEMBER` | `InviteMemberModal` component is NOT rendered. |
| **Theme Button** | Role is `MEMBER` | "Update Theme" button is NOT rendered. |
| **Module Sidebar** | Module "HR" is Disabled | HR-related sidebar items are hidden for ALL roles. |
| **Module Sidebar** | Module "HR" Enabled + No Perm | HR-related items hidden for `MEMBER` without perm. |
| **Dashboard Stats**| Role is `OWNER` | Full visibility of financial/usage metrics. |

---

## 🛡️ 4. Server-Side Protection (Negative Testing)

Verify that direct attempts to bypass the UI are blocked.

| Scenario | Action | Expected Result |
|----------|--------|-----------------|
| Bypassing Headers | Send request with manual `x-tenant-id` | **DENIED**: Middleware validates ID against JWT membership. |
| Bypassing Roles | Direct call to `updateTenantModules` as `ADMIN` | **DENIED**: Server Action throws "Only owner can manage plan". |
| Bypassing Invitation| Attempt to accept an invite for a different email | **DENIED**: "This invitation was sent to a different email address." |
| Resource Leakage | User in Tenant A requests resource from Tenant B | **DENIED**: Prisma scoping returns `null` or 404. |

---

## 🔄 5. Multi-Tenant Isolation

| Scenario | Description | Expected Result |
|----------|-------------|-----------------|
| Tenant Switching | Switch from Tenant A to Tenant B | `app_access_token` cookie updated; `x-tenant-id` header updated. |
| Permission Leaking | Permissions for Tenant A applied to Tenant B | **FAILED**: Permissions must be re-fetched from database per tenant. |
| Workspace List | User is member of 3 tenants | `/workspace` shows exactly 3 cards with correct roles. |

---

## 🧪 Verification Checklist
- [ ] Role checks in Server Actions (`actions.ts`).
- [ ] Permission check helpers in `TenantService`.
- [ ] Conditional rendering in `layout.tsx` and `Dashboard`.
- [ ] Middleware `proxy.ts` header injection logic.
