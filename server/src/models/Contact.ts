import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  roleTitle?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    companyName: { type: String, trim: true },
    roleTitle: { type: String, default: 'Decision Maker' },
    tags: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
