import { cookies } from 'next/headers';
import { getSessionUser } from './auth';

export const GUEST_COOKIE_NAME = 'study_guest_id';

export async function getEffectiveUserId(): Promise<{ userId: string; isGuest: boolean; username?: string }> {
  const user = await getSessionUser();
  if (user) {
    return { userId: user.userId, isGuest: false, username: user.username };
  }

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (guestId && guestId.startsWith('gst_')) {
    return { userId: guestId, isGuest: true };
  }

  // Novo ID de convidado
  const newGuestId = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return { userId: newGuestId, isGuest: true };
}
