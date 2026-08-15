import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  workspaceId: mongoose.Types.ObjectId;
  date: string;
  type: string;
  revenue: number;
  expense: number;
  profit: number;
  category?: string;
  customerName?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  paymentMethod?: string;
  notes?: string;
  externalId?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    revenue: { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    customerName: { type: String },
    productName: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String },
    notes: { type: String },
    externalId: { type: String },
    source: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
