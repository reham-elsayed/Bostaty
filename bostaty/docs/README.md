# Documentation Index

Welcome to the Bostaty Multi-Tenant Application documentation. This index provides an overview of all documentation files and their contents.

---

## Documentation Files

### 1. [User Stories](./user-stories.md)
**Purpose:** Complete user stories for all features  
**Audience:** Product managers, stakeholders, QA engineers

**Contents:**
- 31 detailed user stories
- Acceptance criteria for each story
- Implementation file references
- Data models and schemas
- User flow diagrams
- Future considerations

**Key Sections:**
- Authentication & User Management (US-001 to US-004)
- Tenant Onboarding (US-005 to US-007)
- Tenant Management (US-008 to US-010)
- Workspace Management (US-011 to US-012)
- Invitation System (US-013 to US-018)
- Dashboard & Access Control (US-019 to US-021)
- Middleware & Token Management (US-022 to US-027)
- Error Handling & Edge Cases (US-028 to US-031)

---

### 2. [Technical Use Cases](./technical-use-cases.md)
**Purpose:** Detailed technical implementation of all use cases  
**Audience:** Developers, technical architects

**Contents:**
- Detailed technical flows
- Database queries and transactions
- API endpoint specifications
- Security patterns
- Performance optimizations
- Edge case handling

**Key Sections:**
- Authentication Use Cases (UC-AUTH-001 to UC-AUTH-002)
- Tenant Lifecycle Use Cases (UC-TENANT-001 to UC-TENANT-005)
- Invitation System Use Cases (UC-INVITE-001 to UC-INVITE-005)
- Middleware & Token Use Cases (UC-TOKEN-001 to UC-TOKEN-004)
- Database Transactions (TX-001 to TX-002)
- API Endpoints (API-001 to API-002)

---

### 3. [Business Logic & Workflows](./business-logic.md)
**Purpose:** Business rules and decision logic  
**Audience:** Business analysts, product owners, developers

**Contents:**
- Decision trees
- Workflow diagrams
- State machines
- Business rules
- Authorization matrix
- Configuration details

**Key Sections:**
- User Onboarding Decision Tree
- Tenant Management Workflows
- Invitation Workflow
- Access Control & Authorization
- Middleware Decision Logic
- Error Handling Strategies

---

## Quick Reference

### By Feature

#### Authentication
- **User Stories:** US-001 to US-004
- **Use Cases:** UC-AUTH-001, UC-AUTH-002
- **Key Files:**
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/callback/route.ts`
  - `components/login-form.tsx`

#### Tenant Management
- **User Stories:** US-005 to US-010
- **Use Cases:** UC-TENANT-001 to UC-TENANT-005
- **Key Files:**
  - `lib/services/tenant-service.ts`
  - `app/onboarding/page.tsx`
  - `app/tenants/TenantForm.tsx`

#### Invitations
- **User Stories:** US-013 to US-018
- **Use Cases:** UC-INVITE-001 to UC-INVITE-005
- **Key Files:**
  - `lib/services/invitation-services.ts`
  - `components/tenant/InviteMemberModal.tsx`
  - `app/accept-invitation/page.tsx`

#### Middleware & Security
- **User Stories:** US-022 to US-027
- **Use Cases:** UC-TOKEN-001 to UC-TOKEN-004
- **Key Files:**
  - `proxy.ts`
  - `lib/auth/mintToken.ts`
  - `app/(auth)/token/route.ts`

---

## Key Concepts

### Multi-Tenancy Model
The application uses a **database-level multi-tenancy** approach where:
- All tenants share a single database
- Tenant isolation enforced via middleware and query scoping
- Each request includes tenant context in headers
- JWT tokens scoped to specific tenant

**Tenant Context Flow:**
```
User Request
    ↓
Middleware mints/reads tenant token
    ↓
Injects x-tenant-id and x-app-token headers
    ↓
Application reads tenant from headers
    ↓
Database queries scoped to tenant
```

---

### Authentication Architecture

**Two-Layer Authentication:**
1. **Supabase Session:** User authentication
2. **JWT Tenant Token:** Tenant-scoped authorization

**Token Flow:**
```
Supabase Auth Session (Who you are)
           ↓
    Middleware checks
           ↓
Mints JWT Token (What tenant you're in)
           ↓
    Cached in cookie
           ↓
Headers injected with tenant context
```

---

### Invitation Security

**Security Measures:**
1. **Token Hashing:** Raw token hashed with SHA-256 before storage
2. **Email Validation:** User email must match invitation email
3. **Expiration:** 7-day validity window
4. **Single Use:** Marked as accepted, cannot be reused
5. **Permission Check:** Only OWNER/ADMIN can invite

---

## Database Schema

### Core Tables

1. **users**
   - Stores user profile information
   - Synced with Supabase Auth

2. **tenants**
   - Organizations/workspaces
   - Unique slug and subdomain

3. **tenant_members**
   - Junction table for user-tenant relationships
   - Stores role (OWNER, ADMIN, MEMBER)

4. **tenant_invitations**
   - Pending and historical invitations
   - Hashed tokens for security

**Relationships:**
```
User ──< TenantMember >── Tenant
User ──< TenantInvitation (as inviter)
Tenant ──< TenantInvitation
```

---

## Common Workflows

### 1. New User Onboarding (Business Email)
```
Sign Up → Callback → Onboarding → Auto Tenant Creation → Dashboard
```
**Duration:** ~2 seconds  
**User Actions:** 1 (sign up)  
**Automatic:** Tenant detection and creation

### 2. New User Onboarding (Personal Email)
```
Sign Up → Callback → Workspace → Manual Creation → Dashboard
```
**Duration:** ~30 seconds  
**User Actions:** 2 (sign up + fill form)  
**Manual:** User provides tenant details

### 3. Accepting Invitation
```
Email Link → Accept Page → Login (if needed) → Accept → Dashboard
```
**Duration:** ~10 seconds  
**User Actions:** 1-2 (login if needed + accept)  
**Automatic:** Membership creation

### 4. Switching Tenants
```
Workspace → Select Tenant → Token Generated → Dashboard
```
**Duration:** ~1 second  
**User Actions:** 1 (click tenant)  
**Automatic:** Token minting and context switch

---

## Error Handling Guide

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid or expired invitation" | Invitation expired or already used | Request new invitation |
| "Email mismatch" | Logged in with wrong account | Login with invitation email |
| "No tenant assigned" | User has no tenant membership | Create or join a tenant |
| "User already a member" | Trying to invite existing member | Check member list |
| "Permission denied" | Non-admin trying to invite | Ask OWNER/ADMIN |

---

## Security Best Practices

### Implemented

✅ **JWT Signing:** All tokens signed with secret  
✅ **HttpOnly Cookies:** Prevents XSS access  
✅ **Token Hashing:** Invitations hashed before storage  
✅ **Email Validation:** Ensures right user accepts invitation  
✅ **Server-Side Validation:** All permissions checked server-side  
✅ **Transaction Safety:** Critical operations use DB transactions  

### Recommended Additions

🔲 **Rate Limiting:** Prevent brute force attacks  
🔲 **Token Version Validation:** Enforce token revocation  
🔲 **2FA Support:** Multi-factor authentication  
🔲 **Audit Logging:** Track sensitive operations  
🔲 **IP Whitelisting:** Optional tenant-level restriction  

---

## Performance Optimization

### Current Optimizations

1. **Token Caching**
   - 1-hour cookie cache
   - Reduces DB queries by ~95%

2. **Database Indexing**
   - Unique constraints on slug, subdomain, email
   - Fast tenant membership lookups

3. **Transaction Batching**
   - Atomic operations reduce round trips

### Future Optimizations

- **Redis Caching:** For tenant metadata
- **Connection Pooling:** Better DB connection management
- **CDN Integration:** Static asset delivery
- **Query Optimization:** Use database views for common queries

---

## API Reference

### Token Generation

**Endpoint:** `POST /token`

**Request:**
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
  "tenantId": "uuid",
  "token_version": 0
}
```

---

### Tenant Creation

**Endpoint:** `POST /tenant/create`

**Request:**
```json
{
  "name": "Acme Inc",
  "slug": "acme",
  "subdomain": "acme"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Inc",
  "slug": "@acme",
  "subdomain": "acme",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Testing Guide

### Key Test Scenarios

1. **Auto Onboarding**
   - User with business email creates tenant
   - Second user from same domain joins tenant

2. **Manual Creation**
   - User with personal email creates tenant
   - Validates slug uniqueness

3. **Invitation Flow**
   - ADMIN invites user
   - User accepts invitation
   - User added to tenant

4. **Permission Checks**
   - MEMBER cannot invite
   - OWNER can invite

5. **Edge Cases**
   - Expired invitation
   - Email mismatch
   - Duplicate member

---

## Troubleshooting

### Issue: User redirected to /workspace repeatedly

**Cause:** User has no tenant membership  
**Solution:** 
1. Check `tenant_members` table for user's ID
2. Create tenant or accept invitation
3. Clear `app_access_token` cookie

### Issue: "Invalid token" error

**Cause:** Invitation expired or token corrupted  
**Solution:**
1. Verify invitation exists in database
2. Check `expiresAt` field
3. Request new invitation if expired

### Issue: Cannot access dashboard

**Cause:** Missing tenant context  
**Solution:**
1. Ensure middleware running
2. Check `app_access_token` cookie exists
3. Verify tenant membership in database

---

## Environment Setup

### Required Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SIGNING_SECRET=your-256-bit-secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# (Optional) Seed data
pnpm prisma db seed
```

---

## Contributing Guidelines

### Adding New Features

1. **Define User Story** (in `user-stories.md`)
2. **Design Technical Flow** (in `technical-use-cases.md`)
3. **Document Business Logic** (in `business-logic.md`)
4. **Implement Feature**
5. **Update Documentation**
6. **Add Tests**

### Updating Documentation

- Keep all three documents in sync
- Update version numbers
- Add to this index
- Include code examples

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-22 | Initial documentation |

---

## Contact & Support

**Documentation Maintainer:** Development Team  
**Last Review:** 2024-01-22  
**Next Review:** TBD

---

## Quick Links

- [User Stories](./user-stories.md) - All user-facing features
- [Technical Use Cases](./technical-use-cases.md) - Implementation details
- [Business Logic](./business-logic.md) - Workflows and decision trees

---

## Glossary

**Tenant:** An organization or workspace in the multi-tenant system  
**Member:** User who belongs to a tenant  
**OWNER:** Highest permission level, can manage all aspects  
**ADMIN:** Can invite members and manage settings  
**MEMBER:** Basic access level  
**Invitation:** Request to join a tenant  
**Token:** JWT used for authentication and authorization  
**Slug:** Unique identifier for tenant (e.g., @acme)  
**Subdomain:** Custom domain for tenant (e.g., acme.yourapp.com)  

---

**Happy Building! 🚀**
