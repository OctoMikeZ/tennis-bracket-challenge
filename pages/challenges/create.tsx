import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import CreateChallenge from '../../components/CreateChallenge';

export default function CreateChallengePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protected route - redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/challenges/create');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  return <CreateChallenge />;
}