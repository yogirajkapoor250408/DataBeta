import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  type: string;
  country: string;
  currency: 'USD' | 'EUR' | 'INR' | 'GBP' | 'CAD';
  isDemo: boolean;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'General' },
    country: { type: String, default: 'United States' },
    currency: { type: String, enum: ['USD', 'EUR', 'INR', 'GBP', 'CAD'], default: 'USD' },
    isDemo: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
