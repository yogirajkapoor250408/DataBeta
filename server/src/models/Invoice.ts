import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  workspaceId: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerName: string;
  status: 'draft' | 'sent' | 'due_soon' | 'overdue' | 'paid' | 'disputed';
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    invoiceNumber: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'due_soon', 'overdue', 'paid', 'disputed'],
      default: 'due_soon',
    },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ workspaceId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
