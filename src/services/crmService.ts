import { apiClient } from '../lib/apiClient';
import { Deal, Contact, Task, Activity, Invoice } from '../types';

export const crmService = {
  // --------------------------------------------------------------------------
  // DEALS
  // --------------------------------------------------------------------------
  async getDeals(workspaceId: string): Promise<Deal[]> {
    const res = await apiClient.get<Deal[]>('/crm/deals', workspaceId);
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    try {
      const local = localStorage.getItem(`databeta_deals_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async createDeal(
    workspaceId: string,
    deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ deal: Deal | null; error: Error | null }> {
    const res = await apiClient.post<Deal>('/crm/deals', deal, workspaceId);
    if (res.data) {
      return { deal: res.data, error: null };
    }

    // Local fallback
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      workspaceId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    try {
      const list = await this.getDeals(workspaceId);
      localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify([newDeal, ...list]));
    } catch {}
    return { deal: newDeal, error: null };
  },

  async updateDeal(
    workspaceId: string,
    dealId: string,
    updates: Partial<Deal>
  ): Promise<{ deal: Deal | null; error: Error | null }> {
    const res = await apiClient.put<Deal>(`/crm/deals/${dealId}`, updates, workspaceId);
    if (res.data) {
      return { deal: res.data, error: null };
    }

    try {
      const list = await this.getDeals(workspaceId);
      const updated = list.map((d) => (d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
      localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify(updated));
      const found = updated.find((d) => d.id === dealId) || null;
      return { deal: found, error: null };
    } catch {
      return { deal: null, error: res.error };
    }
  },

  async saveDeals(workspaceId: string, deals: Deal[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify(deals));
    } catch {}
  },

  // --------------------------------------------------------------------------
  // CONTACTS
  // --------------------------------------------------------------------------
  async getContacts(workspaceId: string): Promise<Contact[]> {
    const res = await apiClient.get<Contact[]>('/crm/contacts', workspaceId);
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    try {
      const local = localStorage.getItem(`databeta_contacts_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async createContact(
    workspaceId: string,
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ contact: Contact | null; error: Error | null }> {
    const res = await apiClient.post<Contact>('/crm/contacts', contact, workspaceId);
    if (res.data) {
      return { contact: res.data, error: null };
    }

    const newContact: Contact = {
      ...contact,
      id: `cont-${Date.now()}`,
      workspaceId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    try {
      const list = await this.getContacts(workspaceId);
      localStorage.setItem(`databeta_contacts_${workspaceId}`, JSON.stringify([newContact, ...list]));
    } catch {}
    return { contact: newContact, error: null };
  },

  async saveContacts(workspaceId: string, contacts: Contact[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_contacts_${workspaceId}`, JSON.stringify(contacts));
    } catch {}
  },

  // --------------------------------------------------------------------------
  // TASKS
  // --------------------------------------------------------------------------
  async getTasks(workspaceId: string): Promise<Task[]> {
    const res = await apiClient.get<Task[]>('/crm/tasks', workspaceId);
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    try {
      const local = localStorage.getItem(`databeta_tasks_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async createTask(
    workspaceId: string,
    task: Omit<Task, 'id' | 'createdAt'>
  ): Promise<{ task: Task | null; error: Error | null }> {
    const res = await apiClient.post<Task>('/crm/tasks', task, workspaceId);
    if (res.data) {
      return { task: res.data, error: null };
    }

    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      workspaceId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      const list = await this.getTasks(workspaceId);
      localStorage.setItem(`databeta_tasks_${workspaceId}`, JSON.stringify([newTask, ...list]));
    } catch {}
    return { task: newTask, error: null };
  },

  async saveTasks(workspaceId: string, tasks: Task[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_tasks_${workspaceId}`, JSON.stringify(tasks));
    } catch {}
  },

  // --------------------------------------------------------------------------
  // INVOICES & RECEIVABLES
  // --------------------------------------------------------------------------
  async getInvoices(workspaceId: string): Promise<Invoice[]> {
    const res = await apiClient.get<Invoice[]>('/finance/invoices', workspaceId);
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    try {
      const local = localStorage.getItem(`databeta_invoices_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async createInvoice(
    workspaceId: string,
    invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Invoice> {
    const res = await apiClient.post<Invoice>('/finance/invoices', invoice, workspaceId);
    if (res.data) {
      return res.data;
    }

    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      workspaceId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    try {
      const list = await this.getInvoices(workspaceId);
      localStorage.setItem(`databeta_invoices_${workspaceId}`, JSON.stringify([newInvoice, ...list]));
    } catch {}
    return newInvoice;
  },

  async saveInvoices(workspaceId: string, invoices: Invoice[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_invoices_${workspaceId}`, JSON.stringify(invoices));
    } catch {}
  },
};
