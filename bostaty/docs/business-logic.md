# Business Logic & Workflows Documentation

This document provides detailed explanations of the business logic, workflows, and decision trees implemented in the Bostaty multi-tenant application.

---

## Table of Contents

1. [User Onboarding Decision Tree](#user-onboarding-decision-tree)
2. [Tenant Management Workflows](#tenant-management-workflows)
3. [Invitation Workflow](#invitation-workflow)
4. [Access Control & Authorization](#access-control--authorization)
5. [Middleware Decision Logic](#middleware-decision-logic)
6. [Error Handling Strategies](#error-handling-strategies)

---

## User Onboarding Decision Tree

### Entry Point: New User Registration

When a new user completes registration, the system determines their onboarding path based on their email domain.

```
┌─────────────────────────────────────┐
│   User Completes Registration       │
│                                     │
│   Supabase creates auth account     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Auth Callback (/callback)         │
│                                     │
│   - Validates session               │
│   - Checks for invitation token     │
└───────────────┬─────────────────────┘
                │
                ▼
          Has invitation?
                │
        ┌───────┴────────┐
        │                │
       YES              NO
        │                │
        ▼                ▼
  /accept-invitation  /workspace
                          │
                          ▼
                  Middleware checks
                  for tenant membership
                          │
                          ▼
                    Always redirect to
                      /workspace
                          │
                          ▼
              ┌───────────────────────┐
              │  Workspace Page       │
              │  Shows:               │
              │  - Tenant list        │
              │  - Pending invitations│
              │  - Create options     │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        Has tenants?            No tenants?
              │                       │
              ▼                       ▼
      Display tenant list     Show only creation options
              │                       │
              │                       ▼
              │               Check for invitations
              │                       │
              │           ┌───────────┴──────────┐
              │           │                      │
              │    Has invitations?        No invitations?
              │           │                      │
              │           ▼                      ▼
              │   Show invitations      Prompt to create tenant
              │                                  │
              │                       ┌──────────┴─────────┐
              │                       │                    │
              │                  Auto setup          Manual setup
              │                       │                    │
              └───────────────────────┴────────────────────┘
                          │
                          ▼
                  User selects/creates tenant
                          │
                          ▼
                  Token generated for tenant
                    (via getSelectedTenant)
                          │
                          ▼
                  Redirect to /dashboard
                          │
                          ▼
                  Dashboard displays
                  tenant context
```

---

### Auto Tenant Creation Logic

**Function:** `TenantService.handleUserOnboarding(userId, email)`

**Decision Tree:**

```
Extract domain from email
         │
         ▼
domain in PUBLIC_DOMAINS?
         │
    ┌────┴────┐
   YES       NO (Business email)
    │         │
    ▼         ▼
Return     Extract domain name
PERSONAL_     │
FLOW          ▼
         Generate slug (@domain)
              │
              ▼
         START TRANSACTION
              │
              ▼
    Query: Tenant with slug exists?
              │
         ┌────┴────┐
        YES       NO
         │         │
         ▼         ▼
    UPSERT     CREATE TENANT
    Member      - name: Domain
    - role:     - slug: @domain
      MEMBER    - subdomain: domain
                     │
                     ▼
                 CREATE MEMBER
                 - role: OWNER
                     │
         ┌───────────┴──────────┐
         │                      │
         ▼                      ▼
    Return                 Return
    JOINED_EXISTING        CREATED_NEW
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
             COMMIT TRANSACTION
                    │
                    ▼
            Redirect to /dashboard
```

**Business Rules:**

1. **Public Domains List:**
   - gmail.com
   - outlook.com
   - hotmail.com
   - yahoo.com
   - icloud.com

2. **Tenant Naming Convention:**
   - Slug: `@` + first part of domain (e.g., `acme.com` → `@acme`)
   - Name: Capitalized domain name (e.g., `acme.com` → `Acme`)
   - Subdomain: First part of domain (e.g., `acme.com` → `acme`)

3. **Role Assignment:**
   - First employee creates tenant → Becomes OWNER
   - Subsequent employees join existing tenant → Become MEMBER

---

## Tenant Management Workflows

### Workflow 1: Manual Tenant Creation

**Trigger:** User clicks "Create manually" on workspace page OR user with personal email completes onboarding

**Steps:**

1. **Navigate to Tenant Creation Form**
   - Route: `/tenants`
   - Component: `CreateTenantForm`

2. **User Input**
   - Workspace Name (text, min 3 chars)
   - Slug (alphanumeric + hyphens, min 3 chars)
   - Subdomain (alphanumeric + hyphens, min 3 chars)

3. **Client Validation**
   - Zod schema validation
   - Regex patterns enforced:
     - Slug: `^[a-z0-9-]+$`
     - Subdomain: `^[a-z0-9-]+$`

4. **Submit to API**
   - POST `/tenant/create`
   - Body: `{ name, slug, subdomain }`

5. **Server Processing**
   - Authenticate user
   - Validate input schema
   - Prefix slug with `@`
   - Start transaction:
     - Create tenant record
     - Create tenant member (user as OWNER)
   - Commit transaction

6. **Response Handling**
   - Success: Return tenant object
   - Error: Return error message

7. **Client Redirect**
   - Success → `/workspace`
   - Show newly created tenant in list

**Validation Rules:**

```typescript
{
  name: {
    minLength: 3,
    message: "Name must be at least 3 characters"
  },
  slug: {
    minLength: 3,
    pattern: /^[a-z0-9-]+$/,
    message: "Slug can only contain lowercase letters, numbers, and hyphens"
  },
  subdomain: {
    minLength: 3,
    pattern: /^[a-z0-9-]+$/,
    unique: true, // Database constraint
    message: "Invalid subdomain format"
  }
}
```

---

### Workflow 2: Tenant Selection & Context Switch

**Trigger:** User clicks on tenant from workspace page

**Visual Flow:**

```
User on /workspace page
        │
        ▼
Sees list of tenants
        │
        ▼
Clicks on tenant card
        │
        ▼
Client calls getSelectedTenant(tenant)
        │
        ▼
Server Action executes:
  1. Get current user
  2. Extract cookie header
  3. POST to /token endpoint
     - Body: { tenantId, userId }
        │
        ▼
Token endpoint:
  1. Validate user exists
  2. Fetch token_version
  3. Verify tenant membership
  4. Generate JWT token
  5. Set cookie
  6. Return token + tenantId
        │
        ▼
Server action receives response
        │
        ▼
Set cookie on server response
        │
        ▼
Revalidate /workspace path
        │
        ▼
Redirect to /dashboard
        │
        ▼
Middleware runs on /dashboard request:
  1. Read app_access_token cookie
  2. Decode to get tenant_id
  3. Inject x-tenant-id header
  4. Inject x-app-token header
        │
        ▼
Dashboard page loads:
  1. Read x-tenant-id from headers
  2. Fetch tenant context
  3. Display tenant information
```

**Token Flow Details:**

```
Request to /token
        │
        ▼
┌───────────────────────────┐
│ Validate userId exists    │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Get user metadata         │
│ - token_version (default 0)│
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Query tenant_members      │
│ - Verify membership       │
└───────────┬───────────────┘
            │
     ┌──────┴──────┐
     │             │
  Member?      Not member?
     │             │
     ▼             ▼
  Continue    403 Error
     │
     ▼
┌───────────────────────────┐
│ Create JWT payload:       │
│ - sub: userId             │
│ - tenant_id: tenantId     │
│ - token_version: version  │
│ - iat: timestamp          │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Sign with HS256           │
│ - Secret: JWT_SIGNING_SECRET│
│ - Expiry: 900s (15 min)   │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Set cookie:               │
│ - Name: app_access_token  │
│ - Value: JWT              │
│ - MaxAge: 900s            │
│ - HttpOnly: true          │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Return JSON:              │
│ - accessToken             │
│ - expiresIn               │
│ - tenantId                │
│ - token_version           │
└───────────────────────────┘
```

---

## Invitation Workflow

### Complete Invitation Lifecycle

```
┌─────────────────────────────────────────────┐
│         ADMIN/OWNER INVITES USER            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 1. Permission Check                         │
│    - Query: User is ADMIN or OWNER?         │
│    - If NO → Error                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. Delete Existing Pending Invitations      │
│    - Same tenant + email                    │
│    - Not accepted                           │
│    - Not expired                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. Check for Existing Member                │
│    - Query: Email already in members?       │
│    - If YES → Error                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. Generate Secure Token                    │
│    - Raw: crypto.randomBytes(32).hex()      │
│    - Hash: SHA-256(raw)                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. Create Invitation Record                 │
│    - email                                  │
│    - token: hash                            │
│    - role                                   │
│    - tenantId                               │
│    - inviterId                              │
│    - expiresAt: now + 7 days                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. Send Email                               │
│    - To: invitee email                      │
│    - Link: /accept-invitation?token=raw     │
│    - Include: tenant name, inviter name     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         INVITEE RECEIVES EMAIL              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        User clicks link
                  │
    ┌─────────────┴─────────────┐
    │                           │
User NOT logged in       User logged in
    │                           │
    ▼                           ▼
Show login         Navigate to accept page
prompt                         │
    │                          ▼
    ▼                    Hash token
Login/signup                   │
    │                          ▼
    ▼                    Query invitation
Auth callback                  │
    │                    ┌─────┴──────┐
    ▼                    │            │
Redirect with token    Found?     Not found?
    │                    │            │
    └────────────────────┤            ▼
                         │      /invalid-token
                         ▼
              Display invitation details
                         │
                         ▼
              User clicks "Accept"
                         │
                         ▼
           ┌─────────────────────────┐
           │ Acceptance Flow Begins  │
           └─────────┬───────────────┘
                     │
                     ▼
           Hash token for lookup
                     │
                     ▼
           START TRANSACTION
                     │
                     ▼
           Fetch invitation:
           - Not expired?
           - Not accepted?
                     │
              ┌──────┴──────┐
              │             │
            Valid?      Invalid?
              │             │
              │             ▼
              │        Rollback
              │        Error message
              │
              ▼
        Validate email match:
        user.email == invite.email?
              │
        ┌─────┴─────┐
        │           │
     Match?     Mismatch?
        │           │
        │           ▼
        │      Rollback
        │      Error: "Different email"
        │
        ▼
    Create TenantMember:
    - tenantId: from invitation
    - userId: current user
    - role: from invitation
        │
        ▼
    Update invitation:
    - acceptedAt = NOW()
        │
        ▼
    COMMIT TRANSACTION
        │
        ▼
    Revalidate /workspace
        │
        ▼
    Redirect to /dashboard
        │
        ▼
    User now member of tenant
```

---

### Invitation State Machine

**States:**

1. **PENDING**
   - Created but not accepted
   - Not expired
   - Can be accepted

2. **ACCEPTED**
   - acceptedAt IS NOT NULL
   - Cannot be accepted again
   - Historical record

3. **EXPIRED**
   - expiresAt < NOW()
   - Cannot be accepted
   - Can be deleted and recreated

4. **SUPERSEDED**
   - Newer invitation created for same (tenant, email)
   - Old invitation deleted
   - Never reached accepted state

**Transitions:**

```
       CREATE
         │
         ▼
    [ PENDING ]
         │
    ┌────┴────┐
    │         │
  ACCEPT   EXPIRES
    │         │
    ▼         ▼
[ACCEPTED] [EXPIRED]
```

**Business Rules:**

1. Only one PENDING invitation per (tenant, email) pair
2. ACCEPTED invitations never deleted (audit trail)
3. EXPIRED invitations can be queried but not accepted
4. Creating new invitation deletes old PENDING ones

---

## Access Control & Authorization

### Role-Based Permission Matrix

| Action                  | MEMBER | ADMIN | OWNER |
|-------------------------|--------|-------|-------|
| View dashboard          | ✓      | ✓     | ✓     |
| View tenant info        | ✓      | ✓     | ✓     |
| Invite members          | ✗      | ✓     | ✓     |
| Remove members          | ✗      | ✗     | ✓*    |
| Change member roles     | ✗      | ✗     | ✓*    |
| Update tenant settings  | ✗      | ✗     | ✓*    |
| Delete tenant           | ✗      | ✗     | ✓*    |
| Transfer ownership      | ✗      | ✗     | ✓*    |

*Not yet implemented but structure supports it

---

### Permission Check Flow

**Example: Inviting a Member**

```
User clicks "Send Invite"
        │
        ▼
Modal opens (rendered)
        │
        ▼
Check: Is user OWNER or ADMIN?
        │
  ┌─────┴─────┐
  │           │
 YES         NO
  │           │
  ▼           ▼
Show     Hide button
button   (or disable)
  │
  ▼
User fills form
  │
  ▼
Submit to server action
  │
  ▼
Server-side permission check:
Query tenant_members
WHERE tenantId = X
  AND userId = Y
  AND role IN ('OWNER', 'ADMIN')
  │
┌─┴──┐
│    │
Found? Not found?
│      │
│      ▼
│   Error: "You don't have permission"
│
▼
Proceed with invitation creation
```

**Key Principle:** Never trust client-side checks. Always validate permissions server-side.

---

## Middleware Decision Logic

### Complete Middleware Flow

```
┌─────────────────────────────────────┐
│     Request Intercepted             │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   Update Supabase Session           │
│   - Check session cookie            │
│   - Refresh if needed               │
│   - Return response with location?  │
└─────────────────┬───────────────────┘
                  │
            ┌─────┴──────┐
            │            │
      Redirect?         No
            │            │
            ▼            │
      Return response   │
       (to login)        │
                         │
                         ▼
           ┌─────────────────────────────┐
           │ Get authenticated user      │
           └─────────────┬───────────────┘
                         │
                   ┌─────┴──────┐
                   │            │
              User exists?   No user
                   │            │
                   │            ▼
                   │     Return response
                   │     (Let page handle)
                   │
                   ▼
         Check request pathname
                   │
                   ▼
         Is ignored path?
         (/workspace, /onboarding, etc)
                   │
            ┌──────┴──────┐
            │             │
          YES            NO
            │             │
            ▼             │
      Log & return        │
      response            │
      (no tenant check)   │
                          │
                          ▼
            Check for app_access_token cookie
                          │
                    ┌─────┴─────┐
                    │           │
              Cookie exists?   No cookie
                    │           │
                    ▼           │
            Decode JWT          │
            Extract tenant_id   │
            Return cached       │
            token info          │
                    │           │
                    └─────┬─────┘
                          │
                          ▼
                    No cookie path:
                    mintAppToken(userId)
                          │
                          ▼
              Query tenant_members
              for user's tenant
                          │
                    ┌─────┴──────┐
                    │            │
              Found tenant?   No tenant
                    │            │
                    │            ▼
                    │       Log & redirect
                    │       to /workspace
                    │
                    ▼
            Fetch token_version
            from user metadata
                    │
                    ▼
            Generate JWT token:
            - sub: userId
            - tenant_id
            - token_version
            - iat
                    │
                    ▼
            Return token + tenantId
                    │
                    ▼
      ┌─────────────────────────┐
      │ Token obtained          │
      │ (cached or fresh)       │
      └─────────┬───────────────┘
                │
                ▼
      Create new request headers:
      - x-tenant-id: tenantId
      - x-app-token: token
                │
                ▼
      Create response with:
      - Modified headers
      - Set cookie: app_access_token
        * Value: token
        * MaxAge: 3600s
        * HttpOnly: true
                │
                ▼
      Sync all cookies from
      updateSession response
                │
                ▼
      Return final response
```

---

### Path Classification Logic

**Ignored Paths** (No tenant validation):
- `/invites` - Invitation endpoints
- `/accept-invitation` - Accepting invitations
- `/onboarding` - Auto tenant creation
- `/workspace` - Tenant selection
- `/invalid-token` - Error pages
- `/tenants` - Manual tenant creation
- `/tenant/create` - Tenant creation API

**Rationale:**
These paths are part of the tenant onboarding flow or don't require existing tenant membership.

**Protected Paths** (Tenant required):
- `/dashboard` - Main application
- Any other route not in ignored list

---

## Error Handling Strategies

### Strategy 1: Graceful Degradation

**Scenario:** Email service fails during invitation

**Handling:**
```typescript
try {
  await sendInvitationEmail({ ... });
} catch (emailError) {
  console.error("Failed to send invitation email:", emailError);
  // Continue - invitation created, just email failed
  // Admin can manually share link or resend
}
```

**Rationale:**
- Invitation record already created
- User can still be invited via other means
- Don't fail entire operation for non-critical failure

---

### Strategy 2: Transaction Rollback

**Scenario:** Error during invitation acceptance

**Handling:**
```typescript
await prisma.$transaction(async (tx) => {
  const invite = await tx.tenantInvitation.findFirst({ ... });
  if (!invite) throw new Error('Invalid invitation');
  
  await tx.tenantMember.create({ ... });
  await tx.tenantInvitation.update({ ... });
  
  // If any step fails, entire transaction rolls back
});
```

**Rationale:**
- Critical operation must be atomic
- Either user fully added to tenant or not at all
- Prevents partial state (member created but invitation not marked accepted)

---

### Strategy 3: Redirect on Missing Context

**Scenario:** User tries to access dashboard without tenant

**Handling:**
```typescript
// In middleware
if (!result) {
  console.log(`User ${userId} has no tenant, redirecting to /workspace`);
  return NextResponse.redirect(new URL("/workspace", request.url));
}

// In dashboard page
if (!tenantId) {
  redirect("/workspace");
}
```

**Rationale:**
- Don't show error page
- Guide user to correct flow
- Workspace page has options to create/join tenant

---

### Strategy 4: Validation at Multiple Layers

**Layers:**

1. **Client-Side (Zod + React Hook Form)**
   - Immediate feedback
   - Better UX
   - Prevents unnecessary server requests

2. **Server-Side (Zod)**
   - Security (never trust client)
   - Consistent validation logic
   - Catches bypassed client validation

3. **Database Constraints**
   - Data integrity
   - Catches race conditions
   - Prevents invalid state at lowest level

**Example: Tenant Creation**

```typescript
// 1. Client validation
const createTenantSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/)
});

// 2. Server validation
const validated = createTenantSchema.safeParse(data);
if (!validated.success) return { error: ... };

// 3. Database constraint
// @@unique([slug]) in Prisma schema
```

---

## Business Workflows Summary

### Workflow: First-Time User Journey

1. **Registration** → User signs up with email
2. **Email Verification** → Supabase sends confirmation (if enabled)
3. **Auth Callback** → Session established
4. **Tenant Check** → Middleware checks for membership
5. **No Tenant** → Redirect to workspace
6. **Domain Check** → System evaluates email domain
   - Business domain → Auto onboarding
   - Personal domain → Manual setup
7. **Tenant Created/Joined** → User now has tenant membership
8. **Token Minted** → JWT token with tenant context
9. **Dashboard Access** → User can view dashboard

---

### Workflow: Existing User Adding New Tenant

1. **User logged in** → Already has one or more tenants
2. **Navigate to workspace** → `/workspace`
3. **Click "Create manually"** or **"Auto-setup"**
4. **Create tenant** → Via form or auto detection
5. **New tenant appears** → In workspace tenant list
6. **Switch to new tenant** → Click on tenant card
7. **Token updated** → New JWT with new tenant context
8. **Dashboard loads** → Shows new tenant

---

### Workflow: Team Growth via Invitations

1. **Admin sends invite** → Via dashboard modal
2. **Invitation created** → Database record + email sent
3. **Invitee receives email** → Clicks link
4. **Invitee accepts** → Logs in if needed, accepts invitation
5. **Added to team** → TenantMember record created
6. **Access granted** → Can now switch to this tenant
7. **Repeat** → Admin can invite more members

---

## Advanced Logic Patterns

### Pattern: Optimistic Tenant Token Caching

**Problem:** Every request requires DB lookup for tenant membership

**Solution:**
1. After first lookup, mint JWT token
2. Store token in HttpOnly cookie (1 hour expiry)
3. On subsequent requests:
   - Check cookie first
   - If valid, decode and use tenant_id
   - Skip DB query
4. If cookie missing or invalid:
   - Perform DB lookup
   - Mint new token
   - Update cookie

**Benefits:**
- Reduced database load
- Faster request processing
- Session-like behavior for tenant context

**Trade-offs:**
- If user removed from tenant, token valid until expiry
- Mitigation: Short cookie expiry (1 hour)

---

### Pattern: Upsert for Idempotency

**Problem:** Two employees from same company sign up simultaneously

**Solution:**
```typescript
await tx.tenantMember.upsert({
  where: {
    tenantId_userId: { userId, tenantId: tenant.id }
  },
  update: {}, // No-op if exists
  create: {
    tenantId: tenant.id,
    userId: userId,
    role: TenantRole.MEMBER,
  }
});
```

**Benefits:**
- Idempotent operation
- Safe for concurrent requests
- Prevents duplicate member records

---

### Pattern: Token Versioning for Revocation

**Problem:** Need to invalidate all user tokens immediately

**Solution:**
1. Store `token_version` in user metadata
2. Include in every JWT payload
3. To revoke all tokens:
   - Increment `token_version` in user metadata
4. Token validation:
   - Compare JWT `token_version` with current user `token_version`
   - Mismatch → Token invalid

**Current Implementation Status:**
- ✓ token_version stored in JWT
- ✓ token_version fetched from user metadata
- ✗ Validation not yet implemented (future enhancement)

---

## Configuration & Constants

### Public Email Domains

```typescript
const PUBLIC_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com'
];
```

**Usage:** Determines if user gets auto tenant or manual creation flow

---

### Token Expiry Times

| Token Type          | Expiry   | Reason                              |
|---------------------|----------|-------------------------------------|
| JWT Access Token    | 15 min   | Short-lived for security            |
| Cookie Cache        | 1 hour   | Balance between perf & security     |
| Invitation Token    | 7 days   | Reasonable time to accept invite    |
| Supabase Session    | Variable | Managed by Supabase                 |

---

### Route Patterns

**Auth Routes:**
- `/login` - Login page
- `/callback` - Auth callback handler
- `/confirm` - Email confirmation
- `/update-password` - Password reset

**Tenant Routes:**
- `/dashboard` - Main app (requires tenant)
- `/workspace` - Tenant selection
- `/tenants` - Manual tenant creation
- `/tenant/create` - Tenant creation API

**Invitation Routes:**
- `/accept-invitation` - Accept invitation page
- `/invalid-token` - Invalid invitation error

**API Routes:**
- `/token` - JWT token generation
- `/send` - Email sending endpoint

---

## Appendix: Decision Trees

### Decision Tree: Where to Redirect After Login

```
User authenticated
      │
      ▼
Has invitation token in URL?
      │
  ┌───┴───┐
 YES     NO
  │       │
  ▼       ▼
/accept   Check tenant membership
-invitation    │
          ┌────┴─────┐
          │          │
      Has tenant? No tenant?
          │          │
          ▼          ▼
     /dashboard  /workspace
```

---

### Decision Tree: Invitation Acceptance

```
User on /accept-invitation?token=xyz
           │
           ▼
     Hash token
           │
           ▼
   Query invitation
           │
     ┌─────┴──────┐
     │            │
  Found?      Not found?
     │            │
     │            ▼
     │      /invalid-token
     │
     ▼
Check expiry
     │
  ┌──┴───┐
  │      │
Valid? Expired?
  │      │
  │      ▼
  │  Error message
  │
  ▼
User logged in?
  │
┌─┴──┐
│    │
YES  NO
│    │
│    ▼
│  Show login
│  prompt
│
▼
Check email match
│
┌──┴───┐
│      │
Match? Different?
│      │
│      ▼
│  Error: "Different email"
│
▼
Accept invitation
│
▼
Add to tenant
│
▼
Mark as accepted
│
▼
Redirect to /dashboard
```

---

**Document Version:** 1.0  
**Last Updated:** Based on codebase analysis  
**Coverage:** Complete business logic and workflows
