import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Challenge = {
  id: string;
  name: string;
  tournament: string;
  description: string;
  start_date: string;
};

export default function JoinChallengePage() {
  const router = useRouter();
  const { code } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (code) {
      loadChallenge();
    }
  }, [code]);

  const loadChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('invite_code', code)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (err: any) {
      setError('Challenge not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !challenge) return;
    
    setJoining(true);
    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from('participants')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        router.push(`/challenges/${challenge.id}`);
        return;
      }

      // Join the challenge
      const { error } = await supabase
        .from('participants')
        .insert([
          {
            challenge_id: challenge.id,
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      // Redirect to the challenge page
      router.push(`/challenges`);
    } catch (err: any) {
      setError('Failed to join challenge');
    } finally {
      setJoining(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-4">{challenge.name}</h1>
        <p className="text-gray-600 mb-4">{challenge.description}</p>
        
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-500">
            Tournament: {challenge.tournament}
          </p>
          <p className="text-sm text-gray-500">
            Starts: {new Date(challenge.start_date).toLocaleDateString()}
          </p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please sign in to join this challenge
            </p>
            <button
              onClick={() => router.push(`/login?returnUrl=/join/${code}`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign In to Join
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
              joining ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {joining ? 'Joining...' : 'Join Challenge'}
          </button>
        )}
      </div>
    </div>
  );
}