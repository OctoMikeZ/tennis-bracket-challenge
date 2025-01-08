import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

type Challenge = {
  id: string;
  name: string;
  description: string;
  tournament: string;
  start_date: string;
  created_by: string;
};

export default function ChallengePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasExistingPicks, setHasExistingPicks] = useState(false);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadChallenge();
    }
  }, [id, user]);

  useEffect(() => {
    if (challenge) {
      checkExistingPicks();
      checkTournamentStatus();
    }
  }, [challenge]);

  const loadChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingPicks = async () => {
    if (!user || !challenge) return;
    
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .single();

    if (participant) {
      const { data } = await supabase
        .from('picks')
        .select('id')
        .eq('participant_id', participant.id);

      setHasExistingPicks(data && data.length > 0);
    }
  };

  const checkTournamentStatus = () => {
    if (challenge) {
      const tournamentStart = new Date(challenge.start_date);
      setIsTournamentStarted(new Date() >= tournamentStart);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link 
            href="/challenges" 
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Challenges
          </Link>
          <h1 className="text-3xl font-bold mt-2">{challenge.name}</h1>
          <p className="text-gray-600 mt-2">{challenge.description}</p>
        </div>
        
        {challenge.created_by === user.id && (
          <Link
            href={`/challenges/${challenge.id}/admin`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tournament Details</h2>
          <p className="text-gray-600">{challenge.tournament}</p>
          <p className="text-gray-600">
            Starts: {new Date(challenge.start_date).toLocaleDateString()}
          </p>
        </div>

        <div className="text-center p-8">
          {isTournamentStarted ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tournament In Progress
              </h3>
              <p className="text-gray-600">
                The tournament has started. Your picks are locked.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasExistingPicks ? 'Continue Your Bracket' : 'Start Your Bracket'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasExistingPicks 
                  ? 'Continue making your picks for the tournament.'
                  : 'Make your predictions for the tournament.'}
              </p>
              <Link
                href={`/challenges/${challenge.id}/fill-bracket`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                {hasExistingPicks ? 'Continue Bracket' : 'Fill Out Bracket'}
              </Link>
              {hasExistingPicks && (
                <p className="mt-2 text-sm text-gray-500">
                  You can modify your picks until the tournament starts
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}