# Modules Documentation

The Bostaty application uses a modular architecture where features can be enabled or disabled per tenant.

## 📦 Available Modules

The system currently supports the following modules:

| Module ID | Title | Description | Included by Default |
|-----------|-------|-------------|---------------------|
| `CORE` | Overview | Basic dashboard and tenant settings. | Yes |
| `HR` | Employees | Human Resources management (tracking employees). | No |
| `ECOMMERCE` | Store Front | E-commerce capabilities for the tenant. | No |
| `CRM` | Customers | Customer Relationship Management features. | No |

## 🛠️ Module Management

### Enabling Modules
Modules can be toggled by the **Owner** of the workspace in the **Plan Settings** dashboard (`/dashboard/plan`).

### Module Guard (`ModuleGuard.tsx`)
The `ModuleGuard` component is used to protect frontend routes. It checks if the current tenant has the required module enabled.

```tsx
<ModuleGuard module="HR">
  <EmployeeDashboard />
</ModuleGuard>
```

### Sidebar Integration
The sidebar automatically filters menu items based on the tenant's enabled modules.

```typescript
// Logic in Sidebar.tsx:
const isVisible = item.module === 'CORE' || enabledModules.includes(item.module);
```

### 📩 Invitation Integration

The list of enabled modules directly influences the invitation process. When inviting a new member, the UI dynamically generates the permission set based on active modules using the dynamic form system.

```typescript
// Example from invitation process:
const formFields = getInviteFormConfig(enabledModules)
```

## 🚀 Adding a New Module
1. Update `ModuleName` type in `types/nav.ts`.
2. Add the module to `DASHBOARD_MENU` in `config/menu.ts`.
3. Wrap the module's routes or components with `ModuleGuard`.
