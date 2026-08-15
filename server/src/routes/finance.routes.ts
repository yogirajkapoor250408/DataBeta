import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { Invoice } from '../models/Invoice';
import { Payment } from '../models/Payment';
import { Transaction } from '../models/Transaction';
import { BusinessGoal } from '../models/BusinessGoal';

const router = Router();
router.use(requireAuth);
router.use(requireWorkspace);

// ----------------------------------------------------------------------------
// INVOICES
// ----------------------------------------------------------------------------
router.get('/invoices', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find({ workspaceId: req.workspaceId }).sort({ issueDate: -1 });
    res.json(
      invoices.map((inv) => ({
        id: inv._id.toString(),
        workspaceId: req.workspaceId,
        dealId: inv.dealId?.toString(),
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        status: inv.status,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        amount: inv.amount,
        currency: inv.currency,
        amountPaid: inv.amountPaid,
        balanceDue: inv.balanceDue,
        notes: inv.notes,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
});

router.post('/invoices', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoice = new Invoice({
      ...req.body,
      workspaceId: req.workspaceId,
      amountPaid: 0,
      balanceDue: req.body.amount || 0,
    });
    await invoice.save();
    res.status(201).json({
      id: invoice._id.toString(),
      workspaceId: req.workspaceId,
      ...req.body,
      amountPaid: 0,
      balanceDue: req.body.amount || 0,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
});

// ----------------------------------------------------------------------------
// PAYMENTS
// ----------------------------------------------------------------------------
router.get('/payments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({ workspaceId: req.workspaceId }).sort({ paymentDate: -1 });
    res.json(
      payments.map((p) => ({
        id: p._id.toString(),
        workspaceId: req.workspaceId,
        invoiceId: p.invoiceId.toString(),
        amount: p.amount,
        currency: p.currency,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        createdAt: p.createdAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

router.post('/payments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payment = new Payment({
      ...req.body,
      workspaceId: req.workspaceId,
    });
    await payment.save();
    res.status(201).json({
      id: payment._id.toString(),
      workspaceId: req.workspaceId,
      ...req.body,
      createdAt: payment.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

// ----------------------------------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------------------------------
router.get('/transactions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ workspaceId: req.workspaceId }).sort({ date: -1 });
    res.json(
      transactions.map((t) => ({
        id: t._id.toString(),
        workspaceId: req.workspaceId,
        date: t.date,
        type: t.type,
        revenue: t.revenue,
        expense: t.expense,
        profit: t.profit,
        category: t.category,
        customerName: t.customerName,
        productName: t.productName,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        notes: t.notes,
        source: t.source,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

router.post('/transactions/bulk', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'Invalid or empty records payload.' });
      return;
    }

    const docs = records.map((r: any) => ({
      ...r,
      workspaceId: req.workspaceId,
    }));

    await Transaction.insertMany(docs);
    res.status(201).json({ count: docs.length, message: `Successfully imported ${docs.length} transactions.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to bulk import transactions.' });
  }
});

// ----------------------------------------------------------------------------
// GOALS
// ----------------------------------------------------------------------------
router.get('/goals', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let goal = await BusinessGoal.findOne({ workspaceId: req.workspaceId });
    if (!goal) {
      goal = new BusinessGoal({ workspaceId: req.workspaceId });
      await goal.save();
    }
    res.json(goal);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
});

router.put('/goals', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const goal = await BusinessGoal.findOneAndUpdate(
      { workspaceId: req.workspaceId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(goal);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update goals.' });
  }
});

export default router;
