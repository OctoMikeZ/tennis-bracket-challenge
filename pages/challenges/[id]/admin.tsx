import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import AdminDashboard from '../../../components/AdminDashboard';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (id && user) {
      checkAdminAccess();
    }
  }, [id, user]);

  const checkAdminAccess = async () => {
    try {
      const { data: challenge, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (challenge.created_by === user?.id) {
        setIsAdmin(true);
        setChallenge(challenge);
      } else {
        router.push(`/challenges/${id}`);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (challenge?.invite_code) {
      await navigator.clipboard.writeText(challenge.invite_code);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin || !challenge) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/challenges"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Challenges
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href={`/challenges/${id}`}
            className="text-gray-600 hover:text-gray-700"
          >
            View Bracket
          </Link>
        </div>
      </div>

      {/* Header with Invite Code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{challenge.name}</h1>
            <p className="mt-2 text-gray-600">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-end">
              <div className="text-sm text-gray-500 mb-2">Challenge Invite Code:</div>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono">
                  {challenge.invite_code}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {copySuccess || 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div className="inline-flex flex-col items-end">
            <div className="text-sm text-gray-500 mb-2">Share Challenge:</div>
                <div className="flex items-center space-x-2">
                <button
                    onClick={() => {
                        const link = `${window.location.origin}/join/${challenge.invite_code}`;
                        navigator.clipboard.writeText(link);
                        setCopySuccess('Link copied!');
                        setTimeout(() => setCopySuccess(''), 2000);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                     >
                    Copy Join Link
                </button>
            </div>
  {copySuccess && (
    <div className="text-sm text-green-600 mt-1">{copySuccess}</div>
  )}
</div>
        </div>
      </div>

      {/* Admin Dashboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <AdminDashboard challengeId={id as string} />
        </div>
      </div>
    </div>
  );
}