// Mock storage for checklists - replace with database integration
import type { Checklist, ChecklistItem, ChecklistResult } from "./types"

class ChecklistStorage {
  private checklists: Map<number, Checklist> = new Map()
  private checklistItems: Map<number, ChecklistItem[]> = new Map()
  private results: ChecklistResult[] = []
  private nextId = 1

  // Initialize with sample data
  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    // Sample checklists
    const sampleChecklists: Checklist[] = [
      {
        id: 1,
        user_id: 1,
        name: "Value Investing Checklist",
        description: "Focus on undervalued stocks with strong fundamentals",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      },
      {
        id: 2,
        user_id: 1,
        name: "Growth Stock Screener",
        description: "High-growth companies with strong momentum",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      },
      {
        id: 3,
        user_id: 2,
        name: "Dividend Aristocrats",
        description: "Stable dividend-paying companies",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      },
    ]

    // Sample checklist items
    const sampleItems: ChecklistItem[] = [
      // Value investing criteria
      {
        id: 1,
        checklist_id: 1,
        left_operand: "pe_ratio",
        operator: "<",
        right_operand: "20",
        enabled: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        checklist_id: 1,
        left_operand: "market_cap",
        operator: ">",
        right_operand: "1000000000",
        enabled: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        checklist_id: 1,
        left_operand: "dividend_yield",
        operator: ">",
        right_operand: "0.01",
        enabled: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
      },

      // Growth stock criteria
      {
        id: 4,
        checklist_id: 2,
        left_operand: "pe_ratio",
        operator: "<",
        right_operand: "40",
        enabled: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        checklist_id: 2,
        left_operand: "market_cap",
        operator: ">",
        right_operand: "5000000000",
        enabled: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 6,
        checklist_id: 2,
        left_operand: "earnings_growth",
        operator: ">",
        right_operand: "0.15",
        enabled: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
      },

      // Dividend aristocrats criteria
      {
        id: 7,
        checklist_id: 3,
        left_operand: "dividend_yield",
        operator: ">",
        right_operand: "0.02",
        enabled: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 8,
        checklist_id: 3,
        left_operand: "pe_ratio",
        operator: "<",
        right_operand: "25",
        enabled: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 9,
        checklist_id: 3,
        left_operand: "market_cap",
        operator: ">",
        right_operand: "10000000000",
        enabled: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
      },
    ]

    // Store sample data
    sampleChecklists.forEach((checklist) => {
      this.checklists.set(checklist.id, checklist)
    })

    sampleItems.forEach((item) => {
      const checklistId = item.checklist_id
      if (!this.checklistItems.has(checklistId)) {
        this.checklistItems.set(checklistId, [])
      }
      this.checklistItems.get(checklistId)!.push(item)
    })

    this.nextId = Math.max(...sampleChecklists.map((c) => c.id), ...sampleItems.map((i) => i.id)) + 1
  }

  // Checklist CRUD operations
  async getChecklistsByUser(userId: number): Promise<Checklist[]> {
    return Array.from(this.checklists.values()).filter((checklist) => checklist.user_id === userId && checklist.active)
  }

  async getChecklistById(id: number): Promise<Checklist | null> {
    return this.checklists.get(id) || null
  }

  async createChecklist(checklist: Omit<Checklist, "id" | "created_at" | "updated_at">): Promise<Checklist> {
    const newChecklist: Checklist = {
      ...checklist,
      id: this.nextId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.checklists.set(newChecklist.id, newChecklist)
    this.checklistItems.set(newChecklist.id, [])

    return newChecklist
  }

  async updateChecklist(id: number, updates: Partial<Checklist>): Promise<Checklist | null> {
    const existing = this.checklists.get(id)
    if (!existing) return null

    const updated: Checklist = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    }

    this.checklists.set(id, updated)
    return updated
  }

  async deleteChecklist(id: number): Promise<boolean> {
    const deleted = this.checklists.delete(id)
    this.checklistItems.delete(id)
    return deleted
  }

  // Checklist items CRUD operations
  async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    return this.checklistItems.get(checklistId) || []
  }

  async createChecklistItem(item: Omit<ChecklistItem, "id" | "created_at">): Promise<ChecklistItem> {
    const newItem: ChecklistItem = {
      ...item,
      id: this.nextId++,
      created_at: new Date().toISOString(),
    }

    const checklistId = item.checklist_id
    if (!this.checklistItems.has(checklistId)) {
      this.checklistItems.set(checklistId, [])
    }

    this.checklistItems.get(checklistId)!.push(newItem)
    return newItem
  }

  async updateChecklistItem(id: number, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    for (const items of this.checklistItems.values()) {
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) {
        const updated = { ...items[index], ...updates, id }
        items[index] = updated
        return updated
      }
    }
    return null
  }

  async deleteChecklistItem(id: number): Promise<boolean> {
    for (const items of this.checklistItems.values()) {
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) {
        items.splice(index, 1)
        return true
      }
    }
    return false
  }

  // Results storage
  async saveResult(result: Omit<ChecklistResult, "id">): Promise<ChecklistResult> {
    const newResult: ChecklistResult = {
      ...result,
      id: this.nextId++,
    }

    this.results.push(newResult)
    return newResult
  }

  async getResultsByChecklist(checklistId: number, limit = 50): Promise<ChecklistResult[]> {
    return this.results
      .filter((result) => result.checklist_id === checklistId)
      .sort((a, b) => new Date(b.result_date).getTime() - new Date(a.result_date).getTime())
      .slice(0, limit)
  }
}

export const checklistStorage = new ChecklistStorage()
