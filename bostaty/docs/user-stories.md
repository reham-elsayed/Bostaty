# User Stories Documentation

This document contains all user stories and use cases handled in the Bostaty multi-tenant application.

---

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Tenant Onboarding](#tenant-onboarding)
3. [Tenant Management](#tenant-management)
4. [Workspace Management](#workspace-management)
5. [Invitation System](#invitation-system)
6. [Dashboard & Access Control](#dashboard--access-control)
7. [Middleware & Token Management](#middleware--token-management)

---

## Authentication & User Management

### US-001: User Login
**As a** user  
**I want to** log in to the application  
**So that** I can access my workspaces and tenants

**Acceptance Criteria:**
- User can enter email and password
- System validates credentials via Supabase Auth
- User is redirected to dashboard or workspace page after successful login
- Failed login displays appropriate error message

**Implementation Files:**
- `app/(auth)/login/page.tsx`
- `components/login-form.tsx`
- `lib/supabase/server.ts`

---

### US-002: User Registration
**As a** new user  
**I want to** create an account  
**So that** I can start using the multi-tenant platform

**Acceptance Criteria:**
- User can sign up with email and password
- System creates user account in Supabase
- User receives email confirmation if required
- After signup, user is directed to onboarding flow

**Implementation Files:**
- `app/(auth)/login/page.tsx` (includes signup form)
- `lib/supabase/server.ts`

---

### US-003: Password Reset
**As a** user who forgot their password  
**I want to** reset my password  
**So that** I can regain access to my account

**Acceptance Criteria:**
- User can request password reset via email
- System sends password reset link to user's email
- User can set new password via reset link
- User is redirected to login after successful reset

**Implementation Files:**
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/update-password/page.tsx`
- `components/forgot-password-form.tsx`
- `components/update-password-form.tsx`

---

### US-004: Auth Callback Handling
**As a** user completing authentication  
**I want to** be properly redirected after auth callback  
**So that** I can continue with my intended action

**Acceptance Criteria:**
- System handles Supabase auth callback
- If invitation token exists, redirect to accept-invitation page
- If no invitation, redirect to dashboard
- Handle OTP expiration errors gracefully

**Implementation Files:**
- `app/(auth)/callback/route.ts`

**Logic:**
```typescript
// If OTP expired -> /invite-expired
// If invitation token exists -> /accept-invitation?token={token}
// Default -> /dashboard
```

---

## Tenant Onboarding

### US-005: Automatic Tenant Creation for Business Emails
**As a** new user with a business email  
**I want to** automatically join or create my organization's workspace  
**So that** I can quickly get started without manual setup

**Acceptance Criteria:**
- System detects business email domain (non-public domains)
- If tenant exists for domain, add user as MEMBER
- If tenant doesn't exist, create new tenant and add user as OWNER
- Public email domains (gmail, outlook, etc.) redirect to manual setup
- User is redirected to dashboard after auto-setup

**Implementation Files:**
- `app/onboarding/page.tsx`
- `lib/services/tenant-service.ts` (`handleUserOnboarding`)
- `lib/actions/tenant-actions.ts` (`createAutoTenant`)

**Business Rules:**
- Public domains: gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com
- Tenant slug format: `@{domainname}`
- First user becomes OWNER, subsequent users become MEMBER

---

### US-006: Manual Tenant Creation
**As a** user with a personal email  
**I want to** manually create a workspace  
**So that** I can define my own organization name and settings

**Acceptance Criteria:**
- User can access tenant creation form
- User provides workspace name, slug, and subdomain
- Slug must be lowercase, alphanumeric with hyphens
- Subdomain must be unique
- User becomes OWNER of created tenant
- User is redirected to workspace selection page

**Implementation Files:**
- `app/tenants/page.tsx`
- `app/tenants/TenantForm.tsx`
- `app/tenant/create/route.ts`
- `lib/services/tenant-service.ts` (`createTenant`)

**Validation Rules:**
- Name: minimum 3 characters
- Slug: minimum 3 characters, pattern: `^[a-z0-9-]+$`
- Subdomain: minimum 3 characters, pattern: `^[a-z0-9-]+$`

---

### US-007: Onboarding Flow Detection
**As a** new user  
**I want to** be automatically routed to the correct onboarding path  
**So that** I have a smooth first-time experience

**Acceptance Criteria:**
- System checks user authentication status
- Authenticated users without tenants go to onboarding
- Business email users auto-create/join tenant
- Personal email users directed to manual creation
- Loading states shown during tenant creation

**Implementation Files:**
- `app/onboarding/page.tsx`
- `proxy.ts` (middleware routing)

---

## Tenant Management

### US-008: View Tenant Context
**As a** logged-in user  
**I want to** see my current tenant information  
**So that** I know which workspace I'm operating in

**Acceptance Criteria:**
- Dashboard displays tenant name, slug, and ID
- User's role in tenant is displayed
- Tenant information is fetched based on tenant context

**Implementation Files:**
- `app/dashboard/page.tsx`
- `lib/services/tenant-service.ts` (`getTenantContext`)

---

### US-009: List User's Tenants
**As a** user with multiple tenant memberships  
**I want to** see all my workspaces  
**So that** I can choose which one to work in

**Acceptance Criteria:**
- User can view all tenants they are a member of
- Each tenant displays name, slug, and user's role
- User can select a tenant to switch context

**Implementation Files:**
- `app/workspace/page.tsx`
- `components/tenant-list.tsx`
- `lib/services/tenant-service.ts` (`getUserTenants`)

---

### US-010: Switch Between Tenants
**As a** user with multiple tenant memberships  
**I want to** switch between different workspaces  
**So that** I can manage multiple organizations

**Acceptance Criteria:**
- User can select a tenant from workspace page
- System generates new access token for selected tenant
- Token is stored in cookies
- User is redirected to selected tenant's dashboard

**Implementation Files:**
- `app/workspace/page.tsx`
- `app/workspace/actions.ts` (`getSelectedTenant`)
- `app/(auth)/token/route.ts`
- `components/tenant-list.tsx`

**Token Flow:**
1. User selects tenant
2. POST request to `/token` with tenantId and userId
3. JWT token generated with tenant context
4. Token stored in `app_access_token` cookie
5. Redirect to `/dashboard`

---

## Workspace Management

### US-011: View Workspace Overview
**As a** user  
**I want to** see an overview of all my workspaces and invitations  
**So that** I can manage my memberships effectively

**Acceptance Criteria:**
- Page displays user's name from metadata
- Pending invitations section shown if any exist
- All tenant memberships listed
- Option to create new workspace available

**Implementation Files:**
- `app/workspace/page.tsx`
- `components/invitation-list.tsx`
- `components/tenant-list.tsx`

---

### US-012: Auto-Setup Workspace from Email
**As a** user  
**I want to** quickly create a workspace based on my email domain  
**So that** I can get started without manual configuration

**Acceptance Criteria:**
- "Auto-setup" button available on workspace page
- Clicking triggers automatic tenant creation
- Success message shown on completion
- Workspace list updates automatically
- Error shown if using public email domain

**Implementation Files:**
- `components/workspace/auto-setup-button.tsx`
- `lib/actions/tenant-actions.ts` (`createAutoTenant`)

---

## Invitation System

### US-013: Invite Team Members
**As an** OWNER or ADMIN  
**I want to** invite new members to my tenant  
**So that** I can build my team

**Acceptance Criteria:**
- Only OWNER and ADMIN roles can send invitations
- Inviter provides email and role for invitee
- System creates invitation with unique token
- Invitation email sent to invitee
- Invitation expires after 7 days
- Cannot invite existing members
- Previous pending invitations are deleted before creating new one

**Implementation Files:**
- `components/tenant/InviteMemberModal.tsx`
- `lib/actions/tenant-actions.ts` (`inviteMemberAction`)
- `lib/services/invitation-services.ts` (`createInvite`)
- `lib/email-handler/invitation-service.ts` (`sendInvitationEmail`)

**Roles Available:**
- MEMBER
- ADMIN
- OWNER

**Security:**
- Token is hashed using SHA-256 before storage
- Raw token only sent via email

---

### US-014: View Pending Invitations
**As a** user  
**I want to** see invitations I've received  
**So that** I can join teams that invited me

**Acceptance Criteria:**
- Pending invitations displayed on workspace page
- Each invitation shows tenant name and inviter details
- Only non-expired, non-accepted invitations shown
- Invitations ordered by creation date (newest first)

**Implementation Files:**
- `app/workspace/page.tsx`
- `components/invitation-list.tsx`
- `lib/services/invitation-services.ts` (`getUserInvitations`)

---

### US-015: Accept Invitation (Via Link)
**As an** invited user  
**I want to** accept an invitation via email link  
**So that** I can join the tenant

**Acceptance Criteria:**
- User clicks invitation link with token
- System validates token exists and is not expired
- If user not logged in, show login/signup prompt
- If logged in, user can accept invitation
- Email must match invitation email
- User added to tenant with specified role
- Invitation marked as accepted
- User redirected to tenant dashboard

**Implementation Files:**
- `app/accept-invitation/page.tsx`
- `app/accept-invitation/actions.ts`
- `components/AcceptInvitationForm/AcceptInvitationForm.tsx`
- `lib/services/invitation-services.ts` (`acceptInvite`, `getInvitationMetadata`)

**Validation:**
- Token must be valid (exists in DB as SHA-256 hash)
- Invitation must not be expired
- Invitation must not be previously accepted
- User's email must match invitation email

---

### US-016: Accept Invitation (When Already Logged In)
**As a** logged-in user  
**I want to** accept an invitation from the workspace page  
**So that** I can quickly join teams without clicking email links

**Acceptance Criteria:**
- User can accept invitation directly from workspace page
- System validates user's email matches invitation
- User added to tenant with invitation role
- Invitation marked as accepted
- Workspace page refreshes to show new tenant

**Implementation Files:**
- `app/workspace/actions.ts` (`acceptInviteAction`)
- `components/invitation-list.tsx`
- `lib/services/invitation-services.ts` (`acceptInviteById`)

---

### US-017: Handle Invalid Invitation Tokens
**As a** user clicking an invalid invitation link  
**I want to** see a clear error message  
**So that** I understand why I can't access the invitation

**Acceptance Criteria:**
- Invalid tokens redirect to `/invalid-token` page
- Expired invitations handled gracefully
- Appropriate error messages displayed

**Implementation Files:**
- `app/accept-invitation/page.tsx`
- `app/invalid-token/page.tsx`

---

### US-018: Resume Invitation Flow After Login
**As an** invited user who wasn't logged in  
**I want to** automatically continue the invitation acceptance after logging in  
**So that** I don't have to click the invitation link again

**Acceptance Criteria:**
- Auth callback checks for invitation token in URL
- User redirected to accept-invitation page with token
- User can complete acceptance after authentication

**Implementation Files:**
- `app/(auth)/callback/route.ts`

---

## Dashboard & Access Control

### US-019: View Tenant Dashboard
**As a** tenant member  
**I want to** access my tenant's dashboard  
**So that** I can see workspace information and metrics

**Acceptance Criteria:**
- Dashboard shows tenant name, slug, and ID
- User's role displayed
- Mock statistics shown (projects, members, storage, API calls)
- Only accessible when user has valid tenant context
- OWNER/ADMIN can access invite member modal

**Implementation Files:**
- `app/dashboard/page.tsx`

**Metrics Displayed (Mock):**
- Active Projects
- Team Members
- Storage Used
- Monthly API Calls

---

### US-020: Role-Based Access Control
**As a** tenant member  
**I want** features restricted based on my role  
**So that** appropriate permissions are enforced

**Acceptance Criteria:**
- OWNER and ADMIN can invite members
- MEMBER cannot invite members
- Role displayed in dashboard header
- Future features can check role for permissions

**Implementation Files:**
- `app/dashboard/page.tsx`
- `components/tenant/InviteMemberModal.tsx`

**Role Hierarchy:**
1. **OWNER** - Full control, can invite ADMIN/MEMBER/OWNER
2. **ADMIN** - Can invite members, manage settings
3. **MEMBER** - Read access, limited write permissions

---

### US-021: Handle Missing Tenant Context
**As a** user without tenant membership  
**I want to** be redirected to workspace page  
**So that** I can join or create a tenant

**Acceptance Criteria:**
- Users without tenant context cannot access dashboard
- Proxy middleware redirects to `/workspace`
- Dashboard explicitly checks for tenant ID in headers

**Implementation Files:**
- `proxy.ts`
- `app/dashboard/page.tsx`

---

## Middleware & Token Management

### US-022: Session Management
**As a** user  
**I want** my session to be automatically maintained  
**So that** I don't have to constantly re-login

**Acceptance Criteria:**
- Supabase session updated on each request
- Session cookies refreshed automatically
- Expired sessions redirect to login

**Implementation Files:**
- `proxy.ts`
- `lib/supabase/proxy.ts`

---

### US-023: Tenant Context Injection
**As a** logged-in user with tenant membership  
**I want** my tenant context automatically included in requests  
**So that** the application knows which workspace I'm operating in

**Acceptance Criteria:**
- Middleware checks for existing tenant token in cookies
- If valid token exists, use it to extract tenant context
- If no token, fetch user's tenant from database
- Tenant ID and app token injected into request headers
- Token cached in cookies for 1 hour

**Implementation Files:**
- `proxy.ts`
- `lib/auth/mintToken.ts`

**Headers Set:**
- `x-tenant-id`: Current tenant ID
- `x-app-token`: JWT access token with tenant context

**Token Cookie:**
- Name: `app_access_token`
- Max Age: 3600 seconds (1 hour)
- HttpOnly: true
- SameSite: lax

---

### US-024: JWT Token Generation
**As a** system  
**I want to** generate secure tenant-scoped JWT tokens  
**So that** users can access tenant-specific resources

**Acceptance Criteria:**
- Token includes user ID, tenant ID, and token version
- Token signed with JWT_SIGNING_SECRET
- Token expires after 15 minutes
- Three authentication flows supported:
  1. Credentials (deprecated for security)
  2. Supabase access token
  3. Direct userId + tenantId (server-to-server)

**Implementation Files:**
- `app/(auth)/token/route.ts`
- `lib/auth/mintToken.ts`

**Token Payload:**
```json
{
  "sub": "userId",
  "tenant_id": "tenantId",
  "token_version": 0,
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Token Expiry:** 15 minutes (900 seconds)

---

### US-025: Path-Based Access Control
**As a** system  
**I want to** skip tenant validation for certain paths  
**So that** users can access authentication and onboarding flows

**Acceptance Criteria:**
- Ignored paths bypass tenant context requirement
- No tenant member lookup for ignored paths
- Session still updated for all paths

**Implementation Files:**
- `proxy.ts`

**Ignored Paths:**
- `/invites`
- `/accept-invitation`
- `/onboarding`
- `/workspace`
- `/invalid-token`
- `/tenants`
- `/tenant/create`

---

### US-026: Handle Users Without Tenant Membership
**As a** logged-in user without any tenant membership  
**I want to** be redirected to workspace page  
**So that** I can create or join a tenant

**Acceptance Criteria:**
- Middleware detects user has no tenant membership
- User redirected to `/workspace`
- Workspace page shows options to create/join tenant

**Implementation Files:**
- `proxy.ts`

**Logic:**
```typescript
// If user logged in but mintAppToken returns null
// -> User has no tenant membership
// -> Redirect to /workspace
```

---

### US-027: Token Caching and Reuse
**As a** system  
**I want to** cache tenant tokens  
**So that** database lookups are minimized

**Acceptance Criteria:**
- Valid token from cookie reused without DB lookup
- Token decoded to extract tenant context
- New token minted if cookie missing or invalid
- Token cached for 1 hour

**Implementation Files:**
- `proxy.ts`
- `lib/auth/mintToken.ts`

**Cache Mechanism:**
- Check `app_access_token` cookie
- Decode JWT to get tenant_id
- Reuse if valid
- Otherwise query database for tenant membership

---

## Error Handling & Edge Cases

### US-028: Handle Expired OTP
**As a** user with expired OTP link  
**I want to** see appropriate error message  
**So that** I understand I need a new link

**Acceptance Criteria:**
- System detects OTP expiration error code
- User redirected to `/invite-expired` page
- Clear messaging about requesting new invitation

**Implementation Files:**
- `app/(auth)/callback/route.ts`

---

### US-029: Handle Email Mismatch on Invitation
**As a** user trying to accept invitation for different email  
**I want to** see clear error  
**So that** I know to login with correct account

**Acceptance Criteria:**
- System validates user's email matches invitation email
- Clear error message if mismatch detected
- User instructed to login with correct account

**Implementation Files:**
- `lib/services/invitation-services.ts` (`acceptInvite`, `acceptInviteById`)

**Error Message:**  
*"This invitation was sent to a different email address. Please log in with the correct account."*

---

### US-030: Handle Duplicate Invitations
**As an** admin sending invitations  
**I want** old pending invitations replaced  
**So that** users don't get confused by multiple invitation links

**Acceptance Criteria:**
- Before creating invitation, delete existing pending invitations
- Only affects invitations for same tenant and email
- Only deletes non-expired, non-accepted invitations

**Implementation Files:**
- `lib/services/invitation-services.ts` (`createInvite`)

---

### US-031: Prevent Inviting Existing Members
**As an** admin  
**I cannot** invite users who are already members  
**So that** duplicates are prevented

**Acceptance Criteria:**
- System checks if user already member before creating invitation
- Clear error message if user already exists
- Check performed by email lookup

**Implementation Files:**
- `lib/services/invitation-services.ts` (`createInvite`)

**Error Message:**  
*"User is already a member of this tenant"*

---

## Data Models

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  memberships TenantMember[]
  invitations TenantInvitation[]
}
```

### Tenant Model
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  subdomain String   @unique
  plan      String   @default("free")
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  members     TenantMember[]
  invitations TenantInvitation[]
}
```

### TenantMember Model
```prisma
model TenantMember {
  id        String     @id @default(uuid())
  tenantId  String
  userId    String
  role      TenantRole @default(MEMBER)
  createdAt DateTime   @default(now())
  
  user   User   @relation(...)
  tenant Tenant @relation(...)
  
  @@unique([tenantId, userId])
}
```

### TenantInvitation Model
```prisma
model TenantInvitation {
  id         String     @id @default(uuid())
  email      String
  token      String     @unique
  role       TenantRole @default(MEMBER)
  tenantId   String
  inviterId  String?
  expiresAt  DateTime
  createdAt  DateTime   @default(now())
  acceptedAt DateTime?
  
  tenant  Tenant @relation(...)
  inviter User?  @relation(...)
  
  @@unique([tenantId, email])
}
```

---

## User Flows

### Flow 1: New User with Business Email
1. User signs up → `/login`
2. Auth callback → `/callback`
3. Redirect to → `/onboarding`
4. System detects business email domain
5. Auto-create/join tenant
6. Redirect to → `/dashboard`

### Flow 2: New User with Personal Email
1. User signs up → `/login`
2. Auth callback → `/callback`
3. Redirect to → `/onboarding`
4. System detects personal email
5. Redirect to → `/tenants`
6. User manually creates tenant
7. Redirect to → `/workspace`
8. User selects tenant
9. Redirect to → `/dashboard`

### Flow 3: Accepting Invitation (Not Logged In)
1. User clicks email link → `/accept-invitation?token=xyz`
2. System validates token exists
3. User not authenticated → show login prompt
4. User logs in → `/login?next=/accept-invitation?token=xyz`
5. After auth → `/callback?token=xyz`
6. Callback redirects → `/accept-invitation?token=xyz`
7. User accepts invitation
8. Added to tenant as member
9. Redirect to → `/dashboard`

### Flow 4: Accepting Invitation (Already Logged In)
1. User receives invitation email
2. User already logged in
3. User clicks invitation link → `/accept-invitation?token=xyz`
4. System validates token and user email
5. User accepts invitation via form
6. Invitation accepted, user added to tenant
7. Redirect to → `/workspace` or `/dashboard`

### Flow 5: Multi-Tenant User Switching
1. User on workspace page → `/workspace`
2. User sees list of all their tenants
3. User clicks on tenant to switch
4. Server action calls `/token` endpoint
5. New JWT token generated for selected tenant
6. Token stored in `app_access_token` cookie
7. Revalidate `/workspace`
8. Redirect to → `/dashboard`
9. Dashboard shows selected tenant context

---

## Security Considerations

1. **Token Security**
   - Invitation tokens hashed before storage (SHA-256)
   - JWT tokens signed with secret
   - HttpOnly cookies prevent XSS attacks

2. **Email Validation**
   - User email must match invitation email
   - Prevents unauthorized access to invitations

3. **Role-Based Access**
   - Only OWNER/ADMIN can send invitations
   - Permissions checked server-side

4. **Token Expiration**
   - Invitation tokens expire after 7 days
   - JWT access tokens expire after 15 minutes
   - Cached tenant tokens expire after 1 hour

5. **Tenant Isolation**
   - Tenant context enforced via middleware
   - Each request includes tenant ID in headers
   - Database queries scoped to current tenant

---

## Future Considerations

### Potential User Stories (Not Yet Implemented)

1. **US-XXX: Remove Team Members**
   - OWNER/ADMIN can remove members from tenant

2. **US-XXX: Change Member Roles**
   - OWNER/ADMIN can modify member permissions

3. **US-XXX: Revoke Pending Invitations**
   - OWNER/ADMIN can cancel sent invitations

4. **US-XXX: Tenant Settings Management**
   - OWNER can update tenant name, slug, settings

5. **US-XXX: Tenant Deletion**
   - OWNER can delete entire tenant

6. **US-XXX: Leave Tenant**
   - MEMBER can leave a tenant they're part of

7. **US-XXX: Transfer Ownership**
   - OWNER can transfer ownership to another member

8. **US-XXX: Multi-Factor Authentication**
   - Users can enable 2FA for enhanced security

---

## Appendix

### Environment Variables Required
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `JWT_SIGNING_SECRET`: Secret for signing JWT tokens
- `NEXT_PUBLIC_APP_URL`: Base URL of the application

### Key Technologies
- **Next.js 14**: React framework with App Router
- **Supabase**: Authentication and database
- **Prisma**: ORM for database access
- **JWT**: Token-based authentication
- **Zod**: Schema validation
- **React Hook Form**: Form handling
- **Shadcn UI**: Component library

