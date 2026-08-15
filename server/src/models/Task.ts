import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  workspaceId: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  title: string;
  contactName?: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'completed';
  assignedUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    title: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    dueDate: { type: String, required: true },
    priority: { type: String, enum: ['urgent', 'high', 'normal'], default: 'high' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
