import { TenantRole } from "@prisma/client"
export { TenantRole }

export type TenantData = {
  name: string
  slug: string
  subdomain: string
  userId: string
  role: TenantRole
  settings: {
    theme: string
  }
}
