import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  stage: string;
  amount: number;
  currency: string;
  expectedCloseDate?: string;
  probabilityPct: number;
  source?: string;
  nextStep?: string;
  tags: string[];
  notes?: string;
  assignedUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    stage: {
      type: String,
      enum: ['lead', 'qualified', 'discovery', 'proposal_sent', 'negotiation', 'won', 'lost', 'in_touch', 'offer_sent', 'discussion', 'closed_won', 'closed_lost'],
      default: 'lead',
    },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    expectedCloseDate: { type: String },
    probabilityPct: { type: Number, default: 50 },
    source: { type: String, default: 'Direct' },
    nextStep: { type: String },
    tags: { type: [String], default: [] },
    notes: { type: String },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Deal = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
