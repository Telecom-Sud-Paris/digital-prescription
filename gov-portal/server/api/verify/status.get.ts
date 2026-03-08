// server/api/verify/status.get.ts
import { verificationStore } from '../../utils/verificationStore';
export default defineEventHandler((event) => {
  const query = getQuery(event);
  const stateId = query.stateId as string;

  const record = verificationStore.get(stateId);
  if (!record) return { status: 'not_found' };
  return record;
});