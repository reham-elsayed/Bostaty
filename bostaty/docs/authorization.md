# Authorization & Roles Documentation

Bostaty uses a Role-Based Access Control (RBAC) system within each tenant.

## 👤 Available Roles

| Role | Description |
|------|-------------|
| `OWNER` | The creator of the tenant. Has full control over settings, members, and **module subscription (Plan Settings)**. |
| `ADMIN` | Can manage team members and invitations. |
| `MEMBER` | Standard user with view-only access to most administrative features. |

## 🔐 Permission Matrix

| Action | `MEMBER` | `ADMIN` | `OWNER` |
|--------|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| Change Appearance | ❌ | ✅ | ✅ |
| Invite Team Members | ❌ | ✅ | ✅ |
| Remove Members | ❌ | ❌ | ✅ |
| Transfer Ownership | ❌ | ❌ | ✅ |
| Delete Tenant | ❌ | ❌ | ✅ |

### 🧩 Granular Permissions (Module-Based)

In addition to static roles, the system supports granular permissions stored in the user's `metadata` field. These permissions are typically module-specific (e.g., `hr.employees.view`, `crm.customers.edit`).

* **Storage**: Permissions are stored as a string array inside the `metadata` JSON object on the `TenantMember` model.
* **Flow**: Permissions are defined during the invitation process and persisted to the member's profile upon invitation acceptance.

### 🛠️ Managing Member Permissions

Admins and Owners can modify granular permissions for existing members directly from the HR Dashboard:

1.  **Navigate** to the Employee Directory.
2.  **Click** the "Manage Permissions" option in the actions menu for a specific user.
3.  **Update** the permissions via the dialog (e.g., toggle `hr.employees.view` or `hr.employees.manage`).
4.  **Save** changes.

> **Note:** Updates are applied immediately to the `tenant_members` metadata. The `updatePermissions` service ensures that new permissions are merged with existing ones, preserving user access continuity.

## 🛡️ Implementation

### Server-Side Protection
The `TenantService` provides helper methods to check permissions on the server:

```typescript
// Example: Check if user has permission to invite
const role = await TenantService.getMemberRole(tenantId, userId);
if (role !== 'OWNER' && role !== 'ADMIN') {
    throw new Error("Unauthorized");
}
```

### Client-Side Visibility
Components can use the `useTenant` hook to show or hide UI elements based on the user's role:

```tsx
const { role } = useTenant();

{role === 'OWNER' && (
  <Button onClick={handleDelete}>Delete Tenant</Button>
)}
```

## 🔄 Role Transitions
- **Onboarding**: The first user to create a tenant is automatically assigned the `OWNER` role.
- **Invitations**: Invites can specify the target role (`ADMIN` or `MEMBER`).
