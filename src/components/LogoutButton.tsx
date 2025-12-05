'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}
