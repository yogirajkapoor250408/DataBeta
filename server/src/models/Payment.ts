import mongoose, { Schema, Document } from 'mongoose';
import { Invoice } from './Invoice';

export interface IPayment extends Document {
  workspaceId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentDate: { type: String, required: true },
    paymentMethod: { type: String, default: 'Direct Bank Transfer' },
    referenceNumber: { type: String },
  },
  { timestamps: true }
);

// Automatic invoice balance recalculation on payment
PaymentSchema.post('save', async function (doc: IPayment) {
  try {
    const totalPayments = await mongoose.model<IPayment>('Payment').aggregate([
      { $match: { invoiceId: doc.invoiceId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const amountPaid = totalPayments.length > 0 ? totalPayments[0].total : 0;
    const invoice = await Invoice.findById(doc.invoiceId);
    if (invoice) {
      const balanceDue = Math.max(0, invoice.amount - amountPaid);
      const status = balanceDue <= 0 ? 'paid' : amountPaid > 0 ? 'due_soon' : invoice.status;
      await Invoice.findByIdAndUpdate(doc.invoiceId, { amountPaid, balanceDue, status });
    }
  } catch (err) {
    console.error('Error recalculating invoice balance:', err);
  }
});

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
