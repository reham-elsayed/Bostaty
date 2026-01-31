import { TenantRole } from "@/lib/generated/prisma"
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
