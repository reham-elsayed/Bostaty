# Technical Use Cases Documentation

This document provides detailed technical use cases for all logic flows in the Bostaty multi-tenant application.

---

## Table of Contents

1. [Authentication Use Cases](#authentication-use-cases)
2. [Tenant Lifecycle Use Cases](#tenant-lifecycle-use-cases)
3. [Invitation System Use Cases](#invitation-system-use-cases)
4. [Middleware & Token Use Cases](#middleware--token-use-cases)
5. [Database Transactions](#database-transactions)
6. [API Endpoints](#api-endpoints)

---

## Authentication Use Cases

### UC-AUTH-001: User Login Flow

**Actor:** Unauthenticated User  
**Preconditions:** User has valid credentials  
**Flow:**

1. User navigates to `/login`
2. System renders `LoginForm` component
3. User enters email and password
4. Client form validation (Zod schema)
5. Form submits to Supabase Auth API
6. Supabase validates credentials
7. On success: Supabase creates session
8. System updates session cookies
9. Redirect to auth callback `/callback`
10. Callback middleware processes session
11. User redirected to `/dashboard`

**Postconditions:** User authenticated with active session

**Error Scenarios:**
- Invalid credentials → Display error message
- Network error → Display network error
- Account not confirmed → Redirect to confirmation page

**Files:**
- `app/(auth)/login/page.tsx`
- `components/login-form.tsx`
- `app/(auth)/callback/route.ts`

---

### UC-AUTH-002: Session Update Middleware

**Actor:** System  
**Preconditions:** User makes any request  
**Flow:**

1. User request intercepted by proxy middleware
2. Call `updateSession(request)` from Supabase
3. Supabase validates session token from cookies
4. If expired: Attempt to refresh using refresh token
5. If refresh succeeds: Update session cookies
6. If refresh fails: Clear session, redirect to `/login`
7. If valid: Continue with request

**Postconditions:** Session refreshed or invalidated

**Implementation:**
```typescript
// proxy.ts
const response = await updateSession(request);
if (response.headers.get("location")) return response; // Redirect if session invalid
```

**Files:**
- `proxy.ts`
- `lib/supabase/proxy.ts`

---

## Tenant Lifecycle Use Cases

### UC-TENANT-001: Auto Tenant Onboarding (Business Email)

**Actor:** Newly registered user with business email  
**Preconditions:** 
- User authenticated
- User has no tenant membership
- Email domain not in PUBLIC_DOMAINS list

**Flow:**

1. User redirected to `/onboarding`
2. System calls `TenantService.handleUserOnboarding(userId, email)`
3. Extract domain from email: `email.split('@')[1]`
4. Check if domain in PUBLIC_DOMAINS list
5. If public domain → Return `PERSONAL_FLOW`, redirect to `/tenants`
6. If business domain:
   - Extract domain name: `domain.split('.')[0]`
   - Generate slug: `@${domainName}`
   - Start database transaction
7. Query for existing tenant with slug
8. **Case A: Tenant exists** (Joining existing organization)
   - Upsert into `TenantMember` table
   - Set role = `MEMBER`
   - Return `JOINED_EXISTING`
9. **Case B: Tenant doesn't exist** (First employee from organization)
   - Create new `Tenant` record
   - Name = Capitalized domain name
   - Subdomain = domain name
   - Create `TenantMember` record
   - Set role = `OWNER`
   - Return `CREATED_NEW`
10. Commit transaction
11. Redirect to `/dashboard`

**Postconditions:** 
- User is member of a tenant
- Tenant exists in database

**Business Logic:**
```typescript
// PUBLIC_DOMAINS check
const PUBLIC_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

// Example: user@acme.com
// domain = 'acme.com'
// domainName = 'acme'
// slug = '@acme'
// name = 'Acme'
```

**Database Operations:**
```sql
-- Check for existing tenant
SELECT * FROM tenants WHERE slug = '@acme';

-- If exists: Add user as member
INSERT INTO tenant_members (tenantId, userId, role) 
VALUES (existing_tenant_id, user_id, 'MEMBER')
ON CONFLICT (tenantId, userId) DO NOTHING;

-- If not exists: Create tenant and add as owner
INSERT INTO tenants (name, slug, subdomain, settings) 
VALUES ('Acme', '@acme', 'acme', '{"theme": "light"}');

INSERT INTO tenant_members (tenantId, userId, role) 
VALUES (new_tenant_id, user_id, 'OWNER');
```

**Files:**
- `app/onboarding/page.tsx`
- `lib/services/tenant-service.ts`
- `lib/actions/tenant-actions.ts`

---

### UC-TENANT-002: Manual Tenant Creation

**Actor:** User with personal email or choosing manual setup  
**Preconditions:** User authenticated

**Flow:**

1. User navigates to `/tenants`
2. System renders `CreateTenantForm`
3. User fills form:
   - Workspace Name (min 3 chars)
   - Slug (lowercase, alphanumeric, hyphens)
   - Subdomain (lowercase, alphanumeric, hyphens)
4. Client-side validation (Zod schema)
5. Form submits POST to `/tenant/create`
6. Server validates authentication
7. Server validates input schema
8. Call `TenantService.createTenant()`
9. Start database transaction
10. Create `Tenant` record with provided data
11. Prefix slug with `@`: `@${data.slug}`
12. Create `TenantMember` record with role = `OWNER`
13. Commit transaction
14. Return tenant object as JSON
15. Client redirects to `/workspace`

**Postconditions:** 
- New tenant created
- User is OWNER of tenant

**Validation Rules:**
```typescript
const createTenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  subdomain: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Invalid subdomain format"),
});
```

**Uniqueness Constraints:**
- Slug must be unique
- Subdomain must be unique

**Files:**
- `app/tenants/page.tsx`
- `app/tenants/TenantForm.tsx`
- `app/tenant/create/route.ts`
- `lib/services/tenant-service.ts`

---

### UC-TENANT-003: Retrieve User's Tenants

**Actor:** Authenticated user  
**Preconditions:** User has at least one tenant membership

**Flow:**

1. User navigates to `/workspace`
2. System fetches user from Supabase
3. Call `TenantService.getUserTenants(userId)`
4. Query database:
   ```sql
   SELECT t.*, tm.role 
   FROM tenants t
   INNER JOIN tenant_members tm ON t.id = tm.tenantId
   WHERE tm.userId = user_id
   ```
5. Return array of tenants with user's role in each
6. Render `TenantList` component with data

**Postconditions:** User sees list of all their tenants

**Response Structure:**
```typescript
[
  {
    id: "uuid",
    name: "Acme Inc",
    slug: "@acme",
    subdomain: "acme",
    members: [
      { role: "OWNER" }
    ]
  }
]
```

**Files:**
- `app/workspace/page.tsx`
- `lib/services/tenant-service.ts`

---

### UC-TENANT-004: Switch Tenant Context

**Actor:** User with multiple tenant memberships  
**Preconditions:** User authenticated, has multiple tenants

**Flow:**

1. User on `/workspace` page
2. User clicks on tenant card
3. Client calls `getSelectedTenant(tenant)` server action
4. Server action:
   - Fetches current user from Supabase
   - Prepares headers with cookies for forwarding
   - POSTs to `/token` endpoint with:
     ```json
     {
       "tenantId": "selected-tenant-id",
       "userId": "user-id"
     }
     ```
5. Token endpoint (`/token` route):
   - Validates userId exists
   - Fetches user metadata from Supabase Admin API
   - Retrieves token_version from user metadata
   - Queries `tenant_members` for membership verification
   - Generates JWT token:
     ```typescript
     const payload = {
       sub: userId,
       tenant_id: tenantId,
       token_version: tokenVersion,
       iat: now,
     };
     const token = jwt.sign(payload, JWT_SIGNING_SECRET, { expiresIn: 900 });
     ```
6. Sets cookie `app_access_token` with token
7. Returns token and tenantId to server action
8. Server action sets cookie on response
9. Revalidates `/workspace` path
10. Redirects to `/dashboard`
11. Dashboard reads tenant context from headers

**Postconditions:** 
- User switched to selected tenant
- New JWT token in cookies
- Dashboard shows selected tenant

**Token Payload:**
```json
{
  "sub": "user-id",
  "tenant_id": "tenant-id",
  "token_version": 0,
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Files:**
- `app/workspace/actions.ts`
- `app/(auth)/token/route.ts`
- `components/tenant-list.tsx`

---

### UC-TENANT-005: Get Tenant Context for Dashboard

**Actor:** Authenticated user viewing dashboard  
**Preconditions:** 
- User authenticated
- User has tenant membership
- Tenant ID in request headers

**Flow:**

1. User navigates to `/dashboard`
2. `DashboardHeader` component extracts tenantId from headers
3. If no tenantId → Redirect to `/workspace`
4. Fetch current user from Supabase
5. Call `TenantService.getTenantContext(tenantId, userId)`
6. Query database:
   ```sql
   SELECT t.*, tm.role, tm.createdAt
   FROM tenants t
   INNER JOIN tenant_members tm ON t.id = tm.tenantId
   WHERE t.id = tenant_id 
     AND tm.userId = user_id
   ```
7. Return tenant with user's specific membership data
8. Render dashboard with tenant information

**Postconditions:** Dashboard displays tenant context

**Response Structure:**
```typescript
{
  id: "tenant-id",
  name: "Acme Inc",
  slug: "@acme",
  subdomain: "acme",
  members: [
    {
      role: "OWNER",
      createdAt: "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Files:**
- `app/dashboard/page.tsx`
- `lib/services/tenant-service.ts`

---

## Invitation System Use Cases

### UC-INVITE-001: Create and Send Invitation

**Actor:** OWNER or ADMIN of tenant  
**Preconditions:** 
- User authenticated
- User is OWNER or ADMIN
- Invitee email not already a member

**Flow:**

1. User clicks "Send Invite" button on dashboard
2. Modal opens with `InviteMemberModal`
3. User enters:
   - Email address
   - Role (MEMBER, ADMIN, OWNER)
4. Client validates form (Zod schema)
5. Form submits to `inviteMemberAction(tenantId, inviterId, data)`
6. Server validates input
7. Call `InvitationService.createInvite(tenantId, inviterId, data)`
8. **Permission Check:**
   ```sql
   SELECT * FROM tenant_members 
   WHERE tenantId = tenant_id 
     AND userId = inviter_id 
     AND role IN ('OWNER', 'ADMIN')
   ```
   - If no match → Throw error: "You don't have permission to invite members"
9. **Delete Existing Invitations:**
   ```sql
   DELETE FROM tenant_invitations 
   WHERE tenantId = tenant_id 
     AND email = invitee_email 
     AND acceptedAt IS NULL 
     AND expiresAt > NOW()
   ```
10. **Check for Existing Member:**
    ```sql
    SELECT tm.* FROM tenant_members tm
    INNER JOIN users u ON tm.userId = u.id
    WHERE tm.tenantId = tenant_id AND u.email = invitee_email
    ```
    - If exists → Throw error: "User is already a member of this tenant"
11. Generate secure token:
    ```typescript
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    ```
12. Create invitation record:
    ```sql
    INSERT INTO tenant_invitations 
    (email, token, role, tenantId, inviterId, expiresAt) 
    VALUES (email, tokenHash, role, tenantId, inviterId, NOW() + INTERVAL '7 days')
    ```
13. Fetch tenant and inviter details for email
14. Generate invitation link: `${baseUrl}/accept-invitation?token=${rawToken}`
15. Call `sendInvitationEmail()` with:
    - recipientEmail
    - inviterName
    - tenantName
    - inviteLink
16. Send email via email service
17. Revalidate `/dashboard`
18. Return success

**Postconditions:** 
- Invitation created in database
- Email sent to invitee
- Modal closes with success message

**Security Notes:**
- Raw token only sent via email, never stored
- Hashed token (SHA-256) stored in database
- Token expires in 7 days

**Files:**
- `components/tenant/InviteMemberModal.tsx`
- `lib/actions/tenant-actions.ts`
- `lib/services/invitation-services.ts`
- `lib/email-handler/invitation-service.ts`

---

### UC-INVITE-002: Accept Invitation via Link (Authenticated)

**Actor:** User with invitation (already logged in)  
**Preconditions:** 
- User authenticated
- Valid invitation token in URL

**Flow:**

1. User clicks invitation link: `/accept-invitation?token=xyz`
2. Page extracts token from searchParams
3. If no token → Redirect to `/404`
4. Call `acceptInvitationAction(token)` to fetch metadata
5. Hash token for database lookup:
   ```typescript
   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
   ```
6. Query invitation:
   ```sql
   SELECT ti.*, t.name as tenantName, u.name as inviterName 
   FROM tenant_invitations ti
   INNER JOIN tenants t ON ti.tenantId = t.id
   LEFT JOIN users u ON ti.inviterId = u.id
   WHERE ti.token = tokenHash
   ```
7. If no invitation found → Redirect to `/invalid-token`
8. Render `AcceptInvitationForm` with token
9. User clicks "Accept Invitation"
10. Form calls server action with token
11. Server re-hashes token
12. Start database transaction
13. Fetch invitation (validate not expired, not accepted)
14. Fetch current user from Supabase
15. **Validate Email Match:**
    - If user.email ≠ invitation.email → Throw error
16. Create tenant membership:
    ```sql
    INSERT INTO tenant_members (tenantId, userId, role) 
    VALUES (invitation_tenantId, user_id, invitation_role)
    ```
17. Mark invitation as accepted:
    ```sql
    UPDATE tenant_invitations 
    SET acceptedAt = NOW() 
    WHERE token = tokenHash
    ```
18. Commit transaction
19. Return success
20. Redirect to `/workspace` or `/dashboard`

**Postconditions:** 
- User added to tenant
- Invitation marked as accepted
- User can access tenant

**Error Scenarios:**
- Token expired → "Invalid or expired invitation"
- Email mismatch → "This invitation was sent to a different email address"
- Already accepted → "Invalid or expired invitation"

**Files:**
- `app/accept-invitation/page.tsx`
- `app/accept-invitation/actions.ts`
- `components/AcceptInvitationForm/AcceptInvitationForm.tsx`
- `lib/services/invitation-services.ts`

---

### UC-INVITE-003: Accept Invitation from Workspace Page

**Actor:** Logged-in user viewing pending invitations  
**Preconditions:** 
- User authenticated
- User has pending invitations

**Flow:**

1. User navigates to `/workspace`
2. System calls `InvitationService.getUserInvitations(userEmail)`
3. Query invitations:
   ```sql
   SELECT ti.*, t.name, t.slug, u.name as inviterName 
   FROM tenant_invitations ti
   INNER JOIN tenants t ON ti.tenantId = t.id
   LEFT JOIN users u ON ti.inviterId = u.id
   WHERE ti.email = user_email 
     AND ti.acceptedAt IS NULL 
     AND ti.expiresAt > NOW()
   ORDER BY ti.createdAt DESC
   ```
4. Render `InvitationList` with invitations
5. User clicks "Accept" on an invitation
6. Client calls `acceptInviteAction(inviteId, userEmail)`
7. Server action:
   - Fetches current user
   - Calls `InvitationService.acceptInviteById(inviteId, userEmail, userId)`
8. Start database transaction
9. Fetch invitation by ID:
   ```sql
   SELECT * FROM tenant_invitations 
   WHERE id = invite_id 
     AND acceptedAt IS NULL 
     AND expiresAt > NOW()
   ```
10. Validate user email matches invitation email
11. Create tenant membership
12. Mark invitation as accepted
13. Commit transaction
14. Revalidate `/workspace`
15. Page refreshes showing new tenant in tenant list

**Postconditions:** 
- User added to tenant
- Invitation removed from pending list
- Tenant appears in user's tenant list

**Files:**
- `app/workspace/page.tsx`
- `app/workspace/actions.ts`
- `components/invitation-list.tsx`
- `lib/services/invitation-services.ts`

---

### UC-INVITE-004: Retrieve Pending Invitations

**Actor:** Authenticated user  
**Preconditions:** User has email address

**Flow:**

1. System calls `InvitationService.getUserInvitations(email)`
2. Query database:
   ```sql
   SELECT 
     ti.id, ti.email, ti.role, ti.createdAt,
     t.id as tenantId, t.name as tenantName, t.slug,
     u.id as inviterId, u.email as inviterEmail, u.name as inviterName
   FROM tenant_invitations ti
   INNER JOIN tenants t ON ti.tenantId = t.id
   LEFT JOIN users u ON ti.inviterId = u.id
   WHERE ti.email = user_email
     AND ti.acceptedAt IS NULL
     AND ti.expiresAt > NOW()
   ORDER BY ti.createdAt DESC
   ```
3. Return array of invitations with tenant and inviter details

**Postconditions:** List of active invitations returned

**Files:**
- `lib/services/invitation-services.ts`

---

### UC-INVITE-005: Get Invitation Metadata (Public)

**Actor:** Unauthenticated or authenticated user  
**Preconditions:** Valid invitation token

**Flow:**

1. User visits `/accept-invitation?token=xyz`
2. System calls `InvitationService.getInvitationMetadata(rawToken)`
3. Hash token: 
   ```typescript
   const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
   ```
4. Query database:
   ```sql
   SELECT ti.*, t.name as tenantName, u.name as inviterName, u.email as inviterEmail
   FROM tenant_invitations ti
   INNER JOIN tenants t ON ti.tenantId = t.id
   LEFT JOIN users u ON ti.inviterId = u.id
   WHERE ti.token = tokenHash
   ```
5. Return invitation metadata (does not validate expiry or acceptance)
6. Page uses metadata to display invitation details

**Postconditions:** Invitation metadata retrieved

**Note:** This is a read-only operation that doesn't validate business rules. Actual acceptance logic validates expiry and acceptance status.

**Files:**
- `lib/services/invitation-services.ts`

---

## Middleware & Token Use Cases

### UC-TOKEN-001: Mint Tenant Access Token

**Actor:** System (proxy middleware)  
**Preconditions:** User authenticated, request not on ignored path

**Flow:**

1. Proxy middleware intercepts request
2. User already authenticated (session updated)
3. Extract userId from session
4. Check for `app_access_token` cookie
5. **Case A: Token in cookie**
   - Decode JWT token (no verification, just decode)
   - Extract `tenant_id` from payload
   - Return `{ token: cookie, tenantId: tenant_id }`
6. **Case B: No token in cookie**
   - Call `mintAppToken(userId)`
   - Query database:
     ```sql
     SELECT "tenantId" FROM tenant_members 
     WHERE "userId" = user_id 
     LIMIT 1
     ```
   - Use `maybeSingle()` to handle zero results gracefully
   - If no tenant found → Return `null`
   - If tenant found:
     - Fetch user metadata from Supabase Admin
     - Extract `token_version` (default 0)
     - Generate JWT:
       ```typescript
       const token = jwt.sign({
         sub: userId,
         tenant_id: tenantId,
         token_version: tokenVersion,
         iat: now,
       }, JWT_SIGNING_SECRET, { expiresIn: 900 });
       ```
     - Return `{ token, tenantId }`
7. If token is `null`:
   - Redirect to `/workspace`
8. If token exists:
   - Inject headers:
     - `x-tenant-id`: tenantId
     - `x-app-token`: token
   - Set cookie `app_access_token`:
     - Value: token
     - MaxAge: 3600 (1 hour)
     - HttpOnly: true
     - SameSite: lax
     - Secure: production only
   - Continue request with modified headers

**Postconditions:** 
- Request has tenant context
- Token cached in cookies

**Token Expiry:**
- JWT token: 15 minutes
- Cookie cache: 1 hour

**Files:**
- `proxy.ts`
- `lib/auth/mintToken.ts`

---

### UC-TOKEN-002: JWT Token Generation (Direct)

**Actor:** Server action or API route  
**Preconditions:** userId and tenantId known

**Flow:**

1. Endpoint receives POST with:
   ```json
   {
     "userId": "user-id",
     "tenantId": "tenant-id"
   }
   ```
2. Validate both fields present
3. Fetch user from Supabase Admin:
   ```typescript
   const { data: adminUserResp } = await supabaseAdmin.auth.admin.getUserById(userId);
   ```
4. If error or no user → Return 400 error
5. Extract `token_version` from `user_metadata` (default 0)
6. Verify tenant membership:
   ```sql
   SELECT tenantId FROM tenant_members 
   WHERE userId = user_id AND tenantId = tenant_id
   ```
7. If no membership → Return 403 error
8. Create JWT payload:
   ```typescript
   const payload = {
     sub: userId,
     tenant_id: tenantId,
     token_version: tokenVersion,
     iat: Math.floor(Date.now() / 1000),
   };
   ```
9. Sign token:
   ```typescript
   const accessToken = jwt.sign(payload, JWT_SIGNING_SECRET, {
     algorithm: 'HS256',
     expiresIn: 900, // 15 minutes
   });
   ```
10. Set `app_access_token` cookie
11. Return JSON:
    ```json
    {
      "accessToken": "jwt-token",
      "expiresIn": 900,
      "user": { "id": "user-id" },
      "tenantId": "tenant-id",
      "token_version": 0
    }
    ```

**Postconditions:** JWT token generated and returned

**Token Signing Algorithm:** HS256  
**Token Expiry:** 900 seconds (15 minutes)

**Files:**
- `app/(auth)/token/route.ts`

---

### UC-TOKEN-003: Path-Based Access Control

**Actor:** System (proxy middleware)  
**Preconditions:** Any user request

**Flow:**

1. Request intercepted by proxy middleware
2. Extract pathname from request URL
3. Check if path starts with any ignored path:
   ```typescript
   const isIgnoredPath = [
     "/invites",
     "/accept-invitation",
     "/onboarding",
     "/workspace",
     "/invalid-token",
     "/tenants",
     "/tenant/create"
   ].some(path => request.nextUrl.pathname.startsWith(path));
   ```
4. If `isIgnoredPath`:
   - Log: "Ignored path {pathname}, passing through"
   - Return response immediately (skip tenant checks)
5. If not ignored:
   - Continue to tenant context injection
   - Attempt to mint tenant token
   - If no tenant → Redirect to `/workspace`
   - If tenant exists → Inject headers and continue

**Postconditions:** 
- Ignored paths bypass tenant requirements
- Non-ignored paths enforce tenant context

**Ignored Paths:**
- `/invites` - Invitation endpoints
- `/accept-invitation` - Invitation acceptance page
- `/onboarding` - User onboarding flow
- `/workspace` - Workspace selection page
- `/invalid-token` - Error page
- `/tenants` - Tenant creation page
- `/tenant/create` - Tenant creation API

**Files:**
- `proxy.ts`

---

### UC-TOKEN-004: Handle User Without Tenant

**Actor:** Authenticated user without tenant membership  
**Preconditions:** 
- User authenticated
- User has no tenant memberships

**Flow:**

1. User makes request to non-ignored path (e.g., `/dashboard`)
2. Proxy middleware runs
3. Session updated successfully
4. User authenticated
5. Attempt to mint app token
6. `mintAppToken()` queries `tenant_members`
7. No records found for userId
8. `maybeSingle()` returns `null`
9. `mintAppToken()` returns `null`
10. Middleware detects `null` result
11. Log: "User {userId} has no tenant token, redirecting to /workspace from {pathname}"
12. Return redirect to `/workspace`
13. User lands on workspace page
14. Page shows options to:
    - Create new tenant (auto or manual)
    - Accept pending invitations

**Postconditions:** User redirected to workspace management page

**Files:**
- `proxy.ts`
- `lib/auth/mintToken.ts`
- `app/workspace/page.tsx`

---

## Database Transactions

### TX-001: Auto Tenant Creation

**Type:** Read-Modify-Write Transaction  
**Isolation Level:** Default (Read Committed)

**Steps:**

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Check if tenant exists
  let tenant = await tx.tenant.findUnique({
    where: { slug: '@acme' }
  });

  if (tenant) {
    // 2a. Tenant exists - Add user as member
    await tx.tenantMember.upsert({
      where: {
        tenantId_userId: { userId, tenantId: tenant.id }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: userId,
        role: 'MEMBER',
      }
    });
    return { type: 'JOINED_EXISTING', tenant };
  } else {
    // 2b. Tenant doesn't exist - Create tenant and add as owner
    tenant = await tx.tenant.create({
      data: {
        name: 'Acme',
        slug: '@acme',
        subdomain: 'acme',
        settings: { theme: "light" },
      },
    });

    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: userId,
        role: 'OWNER',
      },
    });
    return { type: 'CREATED_NEW', tenant };
  }
});
```

**Why Transaction:**
- Prevents race condition where two employees from same company create duplicate tenants
- Ensures atomic tenant creation + membership creation
- UPSERT prevents duplicate member records

**Files:**
- `lib/services/tenant-service.ts`

---

### TX-002: Accept Invitation

**Type:** Multi-Step Write Transaction  
**Isolation Level:** Default (Read Committed)

**Steps:**

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Fetch and validate invitation
  const invite = await tx.tenantInvitation.findFirst({
    where: {
      id: inviteId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!invite) throw new Error('Invalid or expired invitation');

  // 2. Validate user email
  const user = await tx.user.findUnique({
    where: { email: userEmail },
    select: { email: true }
  });

  if (!user || user.email !== invite.email) {
    throw new Error('Email mismatch');
  }

  // 3. Create membership
  await tx.tenantMember.create({
    data: { 
      tenantId: invite.tenantId, 
      userId, 
      role: invite.role 
    }
  });

  // 4. Mark invitation as accepted
  const inviteAccepted = await tx.tenantInvitation.update({
    where: { id: inviteId },
    data: { acceptedAt: new Date() }
  });

  return inviteAccepted;
});
```

**Why Transaction:**
- Ensures membership created only if invitation valid
- Prevents accepting same invitation twice
- Atomic: Either both membership + acceptance update succeed, or neither

**Files:**
- `lib/services/invitation-services.ts`

---

## API Endpoints

### API-001: POST /token

**Purpose:** Generate tenant-scoped JWT access token

**Authentication:** Required (validates userId exists)

**Request Body:**
```json
{
  "userId": "uuid",
  "tenantId": "uuid"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": { "id": "uuid" },
  "tenantId": "uuid",
  "token_version": 0
}
```

**Cookies Set:**
- `app_access_token`: JWT token, HttpOnly, 900s expiry

**Error Responses:**
- 400: Missing userId or tenantId
- 403: User not member of tenant
- 500: Internal server error

**Files:**
- `app/(auth)/token/route.ts`

---

### API-002: POST /tenant/create

**Purpose:** Create new tenant manually

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Acme Inc",
  "slug": "acme-inc",
  "subdomain": "acme"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Inc",
  "slug": "@acme-inc",
  "subdomain": "acme",
  "plan": "free",
  "settings": { "theme": "light" },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- 401: Not authenticated
- 400: Validation error (invalid slug format, etc.)
- 500: Database error (duplicate slug/subdomain)

**Side Effects:**
- Creates `Tenant` record
- Creates `TenantMember` record with role OWNER

**Files:**
- `app/tenant/create/route.ts`

---

## Security Patterns

### Pattern: Token Hashing for Invitations

**Problem:** Invitation tokens must be secure and single-use

**Solution:**
1. Generate random token: `crypto.randomBytes(32).toString("hex")`
2. Hash before storage: `crypto.createHash("sha256").update(token).digest("hex")`
3. Store hash in database
4. Send raw token in email
5. On acceptance, hash incoming token to compare

**Why:**
- If database compromised, tokens cannot be used
- One-way hashing prevents token recovery
- SHA-256 chosen for performance and security balance

**Files:**
- `lib/services/invitation-services.ts`

---

### Pattern: JWT Token Versioning

**Problem:** Need ability to revoke all user tokens

**Solution:**
1. Store `token_version` in user metadata
2. Include in JWT payload
3. When revoking tokens, increment `token_version` in user metadata
4. Token validation compares payload version with current user version
5. Mismatch → Token invalid

**Current Implementation:**
- `token_version` included in JWT
- Fetched from Supabase user metadata
- Defaults to 0 if not set

**Note:** Full validation logic not yet implemented in middleware

**Files:**
- `app/(auth)/token/route.ts`
- `lib/auth/mintToken.ts`

---

### Pattern: Email-Based Invitation Matching

**Problem:** Ensure only invited user can accept invitation

**Solution:**
1. Invitation record includes email address
2. On acceptance, fetch current user's email
3. Compare with invitation email
4. Mismatch → Rejection with clear error

**Why:**
- Prevents users from accepting invitations meant for others
- Ensures right person joins tenant
- Works even if invitation token leaked

**Error Message:**
*"This invitation was sent to a different email address. Please log in with the correct account."*

**Files:**
- `lib/services/invitation-services.ts`

---

## Edge Cases Handled

### Edge-001: Race Condition - Duplicate Auto-Tenant

**Scenario:** Two employees from same company sign up simultaneously

**Handling:**
- Use database transaction
- UPSERT for tenant member creation
- First transaction creates tenant
- Second transaction finds existing tenant and adds member

**Result:** Only one tenant created, both users added as members

---

### Edge-002: Expired Invitation

**Scenario:** User clicks old invitation link

**Handling:**
- Query includes: `expiresAt: { gt: new Date() }`
- Expired invitations not returned
- User sees "Invalid or expired invitation" error

**Files:**
- `lib/services/invitation-services.ts`

---

### Edge-003: Duplicate Invitation

**Scenario:** Admin invites same email twice

**Handling:**
- Before creating new invitation, delete existing pending invitations
- Only one active invitation per (tenant, email) pair
- User always gets most recent invitation link

**Files:**
- `lib/services/invitation-services.ts`

---

### Edge-004: Already Member of Tenant

**Scenario:** Admin tries to invite existing member

**Handling:**
- Check for existing membership before creating invitation
- Query: User with email already in `tenant_members` for this tenant
- Throw error: "User is already a member of this tenant"

**Files:**
- `lib/services/invitation-services.ts`

---

### Edge-005: No Tenant Membership

**Scenario:** Authenticated user has no tenants

**Handling:**
- Middleware detects `mintAppToken()` returns `null`
- Redirect to `/workspace`
- Workspace page shows:
  - Auto-setup button (if business email)
  - Manual tenant creation
  - Pending invitations (if any)

**Files:**
- `proxy.ts`
- `app/workspace/page.tsx`

---

### Edge-006: Invalid Tenant Context

**Scenario:** User tries to access dashboard without tenant ID

**Handling:**
- Dashboard checks for `x-tenant-id` header
- If missing → Redirect to `/workspace`
- Forces user to select/create tenant

**Files:**
- `app/dashboard/page.tsx`

---

## System Flow Diagrams

### Flow: Complete Onboarding (Business Email)

```
User Signs Up
     ↓
Auth Callback (/callback)
     ↓
Redirect to /onboarding
     ↓
Check Email Domain
     ↓
Extract domain: acme.com
     ↓
Check if @acme tenant exists
     ↓
┌─────────────────┬─────────────────┐
│ Exists          │ Doesn't Exist   │
├─────────────────┼─────────────────┤
│ Add as MEMBER   │ Create Tenant   │
│                 │ Add as OWNER    │
└─────────────────┴─────────────────┘
     ↓
Commit Transaction
     ↓
Redirect to /dashboard
     ↓
Middleware mints token
     ↓
Inject x-tenant-id header
     ↓
Dashboard renders with tenant context
```

---

### Flow: Invitation Acceptance

```
User Receives Email
     ↓
Clicks Link: /accept-invitation?token=xyz
     ↓
Hash token for lookup
     ↓
Query database for invitation
     ↓
Invitation found?
     ↓
┌──────────┬───────────┐
│ Yes      │ No        │
├──────────┼───────────┤
│ Continue │ → /invalid│
└──────────┴───────────┘
     ↓
User logged in?
     ↓
┌──────────┬───────────────────┐
│ Yes      │ No                │
├──────────┼───────────────────┤
│ Show     │ Show login prompt │
│ Accept   │                   │
│ Button   │                   │
└──────────┴───────────────────┘
     ↓
User Accepts
     ↓
Validate email matches
     ↓
Start Transaction
     ↓
Create TenantMember
     ↓
Mark invitation as accepted
     ↓
Commit
     ↓
Redirect to /dashboard
```

---

## Performance Considerations

### Optimization: Token Caching

**Strategy:** Cache tenant token in cookie to avoid DB lookups

**Implementation:**
- First request: Query DB for tenant membership
- Generate JWT, store in `app_access_token` cookie
- Subsequent requests: Decode cookie to get tenant context
- Skip DB query if valid token in cookie

**Benefit:** Reduces database load significantly

**Trade-off:** Token remains valid for 1 hour even if membership revoked

**Files:**
- `proxy.ts`
- `lib/auth/mintToken.ts`

---

### Optimization: Prisma Generated Client Location

**Configuration:**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}
```

**Benefit:** Centralized prisma client location

**Files:**
- `prisma/schema.prisma`

---

## Appendix: Database Queries Reference

### Query: Get User's Tenants
```sql
SELECT 
  t.id, t.name, t.slug, t.subdomain, t.plan, t.settings,
  t.createdAt, t.updatedAt,
  tm.role
FROM tenants t
INNER JOIN tenant_members tm ON t.id = tm.tenantId
WHERE tm.userId = ?
```

### Query: Get Tenant Context
```sql
SELECT 
  t.*,
  tm.role, tm.createdAt as memberSince
FROM tenants t
INNER JOIN tenant_members tm ON t.id = tm.tenantId
WHERE t.id = ? AND tm.userId = ?
```

### Query: Get Pending Invitations
```sql
SELECT 
  ti.*,
  t.id as tenantId, t.name as tenantName, t.slug,
  u.name as inviterName, u.email as inviterEmail
FROM tenant_invitations ti
INNER JOIN tenants t ON ti.tenantId = t.id
LEFT JOIN users u ON ti.inviterId = u.id
WHERE ti.email = ?
  AND ti.acceptedAt IS NULL
  AND ti.expiresAt > NOW()
ORDER BY ti.createdAt DESC
```

### Query: Validate Admin Permission
```sql
SELECT *
FROM tenant_members
WHERE tenantId = ?
  AND userId = ?
  AND role IN ('OWNER', 'ADMIN')
```

---

**Document Version:** 1.0  
**Last Updated:** Based on codebase analysis  
**Coverage:** All major use cases and technical flows
