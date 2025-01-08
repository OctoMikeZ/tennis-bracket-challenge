import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

type Challenge = {
  id: string;
  name: string;
  description: string;
  tournament: string;
  start_date: string;
  invite_code: string;
  created_by: string;
  participant_count: number;
};

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get challenges user has created or joined
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          participants (
            count
          )
        `)
        .or(`created_by.eq.${user.id},participants.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    alert('Invite code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Loading challenges...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first challenge!</p>
        <Link 
          href="/challenges/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Challenges</h2>
        <Link
          href="/challenges/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Challenge
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{challenge.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{challenge.tournament}</p>
              </div>
              <button
                onClick={() => copyInviteCode(challenge.invite_code)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Copy Invite
              </button>
            </div>
            
            {challenge.description && (
              <p className="text-gray-600 text-sm mt-2">{challenge.description}</p>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {challenge.participant_count} participants
              </span>
              <Link
                href={`/challenges/${challenge.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Bracket →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}