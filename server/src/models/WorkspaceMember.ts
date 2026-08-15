import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'sales_manager' | 'salesperson' | 'finance_viewer';
  invitedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'sales_manager', 'salesperson', 'finance_viewer'],
      default: 'owner',
    },
    invitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMember =
  mongoose.models.WorkspaceMember ||
  mongoose.model<IWorkspaceMember>('WorkspaceMember', WorkspaceMemberSchema);
