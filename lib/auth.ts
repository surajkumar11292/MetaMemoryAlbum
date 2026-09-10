import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { User } from '@/lib/types';

export async function getSessionUser(): Promise<User | null> {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  // Look up user in MongoDB
  let user = await db.getUser(userId);

  if (!user) {
    // Get profile details from Clerk if available
    let email = 'user@metamemory.app';
    let name = 'Archivist';
    let avatar_url: string | undefined = undefined;

    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        email =
          clerkUser.emailAddresses?.[0]?.emailAddress ||
          clerkUser.primaryEmailAddressId ||
          email;
        name =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          clerkUser.username ||
          email.split('@')[0];
        avatar_url = clerkUser.imageUrl || undefined;
      }
    } catch (e) {
      console.warn('Could not fetch Clerk user details in getSessionUser:', e);
    }

    user = await db.createUser({
      id: userId,
      email,
      name,
      avatar_url,
      storage_used_bytes: 0,
    });
  }

  return user;
}
