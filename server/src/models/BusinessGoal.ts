import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessGoal extends Document {
  workspaceId: mongoose.Types.ObjectId;
  targetRevenue: number;
  targetProfitMarginPct: number;
  maxExpenseCap: number;
  updatedAt: Date;
}

const BusinessGoalSchema = new Schema<IBusinessGoal>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true, index: true },
    targetRevenue: { type: Number, default: 100000 },
    targetProfitMarginPct: { type: Number, default: 25.0 },
    maxExpenseCap: { type: Number, default: 50000 },
  },
  { timestamps: true }
);

export const BusinessGoal =
  mongoose.models.BusinessGoal || mongoose.model<IBusinessGoal>('BusinessGoal', BusinessGoalSchema);
