import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/dashboard/dashboard"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <Dashboard />
}
