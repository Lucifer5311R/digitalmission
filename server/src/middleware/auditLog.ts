import { AuditLog } from '../models';

export async function createAuditLog(params: {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      old_value: params.old_value || null,
      new_value: params.new_value || null,
      ip_address: params.ip_address || null,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}
