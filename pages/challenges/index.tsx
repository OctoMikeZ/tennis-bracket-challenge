import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import JoinChallengeInput from '../../components/JoinChallengeInput';

type Challenge = {
  id: string;
  name: string;
  description: string;
  tournament: string;
  start_date: string;
  created_by: string;
  participant_count: number;
};

export default function ChallengesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
    } else {
      router.push('/login');
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      // Get all challenges where user is either creator or participant
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          participants (count)
        `)
        .or(`created_by.eq.${user?.id},participants.user_id.eq.${user?.id}`);

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Join Challenge Section */}
      <JoinChallengeInput />

      {/* Challenges List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Challenges</h2>
          <Link
            href="/challenges/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Challenge
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
            <p className="text-gray-500 mb-4">Create a challenge or join one using an invite code!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium mb-2">{challenge.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{challenge.tournament}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {challenge.participant_count} participants
                  </span>
                  {challenge.created_by === user?.id ? (
                    <Link
                      href={`/challenges/${challenge.id}/admin`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage →
                    </Link>
                  ) : (
                    <Link
                      href={`/challenges/${challenge.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Bracket →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}