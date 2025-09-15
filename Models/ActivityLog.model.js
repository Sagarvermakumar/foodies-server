import { model, Schema } from "mongoose";

// models/ActivityLog.model.ts
const ActivityLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User' },
  action: String, // e.g., ITEM_UPDATE, ORDER_STATUS_CHANGE
  entity: { type: String }, // 'Item','Order','Coupon'
  entityId: { type: Schema.Types.ObjectId },
  meta: Schema.Types.Mixed
}, { timestamps: true });

const ActivityLog = model('ActivityLog', ActivityLogSchema);

export default ActivityLog