import { auth } from '@/lib/auth';
import { MessageInterface } from '@/components/messages/MessageInterface';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

export default async function CashierMessagePage() {
  const session = await auth();

  // Protect the route on the server
  if (!session || session.user.role !== 'cashier') {
    redirect('/auth');
  }

  return <MessageInterface session={session as Session} />;
}