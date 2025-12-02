export const USER_ROLES = {
  ADMIN: 'super_admin',
  OWNER: 'pg_owner',
  TENANT: 'tenant'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue'
};

export const NOTICE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'revoked'
};

export const ROOM_STATUS = {
  EMPTY: 'empty',
  PARTIAL: 'partial',
  FULL: 'full'
};

export const TENANT_STATUS = {
  PROFILE_INCOMPLETE: 'profile_incomplete',
  PROFILE_COMPLETED: 'profile_completed',
  ACTIVE: 'active',
  NOTICE: 'notice',
  MOVED_OUT: 'moved_out'
};