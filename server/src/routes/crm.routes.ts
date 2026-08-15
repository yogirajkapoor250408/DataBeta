import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { Deal } from '../models/Deal';
import { Contact } from '../models/Contact';
import { Task } from '../models/Task';

const router = Router();
router.use(requireAuth);
router.use(requireWorkspace);

// ----------------------------------------------------------------------------
// DEALS
// ----------------------------------------------------------------------------
router.get('/deals', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deals = await Deal.find({ workspaceId: req.workspaceId }).sort({ createdAt: -1 });
    res.json(
      deals.map((d) => ({
        id: d._id.toString(),
        workspaceId: req.workspaceId,
        title: d.title,
        companyName: d.companyName,
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        stage: d.stage,
        amount: d.amount,
        currency: d.currency,
        expectedCloseDate: d.expectedCloseDate,
        probabilityPct: d.probabilityPct,
        source: d.source,
        nextStep: d.nextStep,
        tags: d.tags,
        notes: d.notes,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deals.' });
  }
});

router.post('/deals', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deal = new Deal({
      ...req.body,
      workspaceId: req.workspaceId,
    });
    await deal.save();
    res.status(201).json({
      id: deal._id.toString(),
      workspaceId: req.workspaceId,
      ...req.body,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create deal.' });
  }
});

router.put('/deals/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      req.body,
      { new: true }
    );
    if (!deal) {
      res.status(404).json({ error: 'Deal not found.' });
      return;
    }
    res.json(deal);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update deal.' });
  }
});

// ----------------------------------------------------------------------------
// CONTACTS
// ----------------------------------------------------------------------------
router.get('/contacts', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find({ workspaceId: req.workspaceId }).sort({ createdAt: -1 });
    res.json(
      contacts.map((c) => ({
        id: c._id.toString(),
        workspaceId: req.workspaceId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        companyName: c.companyName,
        roleTitle: c.roleTitle,
        tags: c.tags,
        notes: c.notes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

router.post('/contacts', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const contact = new Contact({
      ...req.body,
      workspaceId: req.workspaceId,
    });
    await contact.save();
    res.status(201).json({
      id: contact._id.toString(),
      workspaceId: req.workspaceId,
      ...req.body,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create contact.' });
  }
});

// ----------------------------------------------------------------------------
// TASKS
// ----------------------------------------------------------------------------
router.get('/tasks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ workspaceId: req.workspaceId }).sort({ dueDate: 1 });
    res.json(
      tasks.map((t) => ({
        id: t._id.toString(),
        workspaceId: req.workspaceId,
        dealId: t.dealId?.toString(),
        title: t.title,
        contactName: t.contactName,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

router.post('/tasks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const task = new Task({
      ...req.body,
      workspaceId: req.workspaceId,
    });
    await task.save();
    res.status(201).json({
      id: task._id.toString(),
      workspaceId: req.workspaceId,
      ...req.body,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

router.put('/tasks/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.workspaceId },
      req.body,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

export default router;
