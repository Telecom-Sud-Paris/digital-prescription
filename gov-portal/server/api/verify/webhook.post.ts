// server/api/verify/webhook.post.ts
import { verificationStore } from '../../utils/verificationStore';
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const stateId = query.stateId as string;
  const result = await readBody(event);

  if (stateId && verificationStore.has(stateId)) {
    verificationStore.set(stateId, { status: 'success', data: result });
  }

  return { success: true }; 
});