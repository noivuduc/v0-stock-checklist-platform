"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, CheckSquare, BarChart3, Search, Database } from "lucide-react"
import { ChecklistBuilder } from "@/components/checklist/checklist-builder"
import { StockEvaluator } from "@/components/dashboard/stock-evaluator"
import { StockDataViewer } from "@/components/dashboard/stock-data-viewer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Checklist {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  active: boolean
  checklist_items?: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  checklist_id: string
  left_operand: string
  operator: string
  right_operand: string
  enabled: boolean
  sort_order: number
}

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  subscription_tier: string
}

export function Dashboard() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserAndChecklists()
  }, [])

  const loadUserAndChecklists = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const userResponse = await fetch("/api/auth/user")
      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error("Failed to load user data")
      }
      const userData = await userResponse.json()
      setUser(userData.user)

      const checklistsResponse = await fetch("/api/checklists")
      if (!checklistsResponse.ok) {
        throw new Error("Failed to load checklists")
      }
      const checklistsData = await checklistsResponse.json()
      setChecklists(checklistsData.checklists || [])
    } catch (error) {
      console.error("Failed to load data:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChecklist = () => {
    setEditingChecklist(null)
    setShowBuilder(true)
  }

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist)
    setShowBuilder(true)
  }

  const handleSaveChecklist = async (
    checklistData: { name: string; description: string },
    itemsData: Array<{
      leftOperand: string
      operator: string
      rightOperand: string
      enabled: boolean
    }>,
  ) => {
    try {
      setError(null)

      const url = editingChecklist ? `/api/checklists/${editingChecklist.id}` : "/api/checklists"

      const method = editingChecklist ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: checklistData.name,
          description: checklistData.description,
          items: itemsData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save checklist")
      }

      setShowBuilder(false)
      setEditingChecklist(null)
      await loadUserAndChecklists()
    } catch (error) {
      console.error("Failed to save checklist:", error)
      setError(error instanceof Error ? error.message : "Failed to save checklist")
    }
  }

  const handleSelectChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist)
    setActiveTab("evaluate")
  }

  const handleDeleteChecklist = async (checklist: Checklist) => {
    if (!confirm(`Are you sure you want to delete "${checklist.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/checklists/${checklist.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete checklist")
      }

      await loadUserAndChecklists()
      if (selectedChecklist?.id === checklist.id) {
        setSelectedChecklist(null)
      }
    } catch (error) {
      console.error("Failed to delete checklist:", error)
      setError(error instanceof Error ? error.message : "Failed to delete checklist")
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (showBuilder) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ChecklistBuilder
          checklist={editingChecklist || undefined}
          onSave={handleSaveChecklist}
          onCancel={() => {
            setShowBuilder(false)
            setEditingChecklist(null)
          }}
        />
      </div>
    )
  }

  const subscriptionLimits = {
    free: 3,
    pro: 25,
    enterprise: 100,
  }

  const userLimit =
    subscriptionLimits[user?.subscription_tier as keyof typeof subscriptionLimits] || subscriptionLimits.free

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Stock Screening Dashboard</h1>
            <p className="text-muted-foreground text-pretty">
              Welcome back, {user?.first_name || user?.email}! Create custom checklists and evaluate stocks with
              comprehensive financial data.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="capitalize">
              {user?.subscription_tier || "free"} Plan
            </Badge>
            <Button onClick={handleCreateChecklist} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Checklist
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Checklists</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold financial-number">{checklists.length}</div>
              <p className="text-xs text-muted-foreground">
                {checklists.length >= userLimit
                  ? `${user?.subscription_tier || "Free"} tier limit reached`
                  : `${userLimit - checklists.length} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stocks Evaluated</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold financial-number">0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold financial-number">--</div>
              <p className="text-xs text-muted-foreground">Average pass rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">My Checklists</TabsTrigger>
            <TabsTrigger value="evaluate" disabled={!selectedChecklist}>
              Evaluate Stocks
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="h-4 w-4 mr-2" />
              Stock Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {checklists.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Checklists Yet</h3>
                  <p className="text-muted-foreground mb-6 text-pretty">
                    Create your first checklist to start screening stocks based on comprehensive financial criteria.
                  </p>
                  <Button onClick={handleCreateChecklist}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Checklist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {checklists.map((checklist) => (
                  <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{checklist.name}</CardTitle>
                          <CardDescription className="text-pretty">{checklist.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{checklist.active ? "Active" : "Inactive"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Created {new Date(checklist.created_at).toLocaleDateString()}
                          {checklist.checklist_items && (
                            <span className="ml-4">{checklist.checklist_items.length} criteria</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleSelectChecklist(checklist)}>
                            <Search className="h-4 w-4 mr-2" />
                            Evaluate
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditChecklist(checklist)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChecklist(checklist)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="evaluate" className="space-y-6">
            {selectedChecklist && <StockEvaluator checklist={selectedChecklist} />}
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <StockDataViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
