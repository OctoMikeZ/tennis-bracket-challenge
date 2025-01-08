import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { setupTestChallenge } from '../../lib/setup-test-challenge';
import { useRouter } from 'next/router';

export default function TestSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const challenge = await setupTestChallenge(user.id);
      router.push(`/challenges/${challenge.id}/admin`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in first</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Set Up Test Challenge</h1>
      <p className="mb-4 text-gray-600">
        This will create a test challenge using the 2024 Australian Open
        Quarter-Finals onwards.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleSetup}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Setting up...' : 'Create Test Challenge'}
      </button>
    </div>
  );
}