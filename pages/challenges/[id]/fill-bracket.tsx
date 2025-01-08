import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function FillBracketPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingPick, setSavingPick] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [matches, setMatches] = useState([]);
  const [userPicks, setUserPicks] = useState({});

  useEffect(() => {
    if (id && user) {
      loadChallengeAndMatches();
    }
  }, [id, user]);

  const loadChallengeAndMatches = async () => {
    try {
      // Load challenge details
      const { data: challenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (challenge) {
        setChallenge(challenge);
        
        // Check if tournament has started
        if (new Date(challenge.start_date) <= new Date()) {
          router.push(`/challenges/${id}`);
          return;
        }

        // Load tournament matches
        const { data: matches } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('challenge_id', id)
          .order('round')
          .order('position');

        // Load user's existing picks
        const { data: picks } = await supabase
          .from('picks')
          .select('*')
          .eq('challenge_id', id)
          .eq('user_id', user.id);

        setMatches(matches || []);
        setUserPicks(picks?.reduce((acc, pick) => ({
          ...acc,
          [pick.match_number]: pick.picked_player
        }), {}) || {});
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickWinner = async (matchId, winner) => {
    if (savingPick) return;
    
    setSavingPick(true);
    try {
      const { error } = await supabase
        .from('picks')
        .upsert([
          {
            challenge_id: id,
            user_id: user.id,
            match_number: matchId,
            picked_player: winner
          }
        ]);

      if (error) throw error;

      // Update local state
      setUserPicks(prev => ({
        ...prev,
        [matchId]: winner
      }));
    } catch (error) {
      console.error('Error saving pick:', error);
      alert('Failed to save pick. Please try again.');
    } finally {
      setSavingPick(false);
    }
  };

  const isPickComplete = () => {
    return matches.every(match => userPicks[match.id]);
  };

  if (loading) {
    return <div>Loading bracket...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          href={`/challenges/${id}`}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Challenge
        </Link>
        <h1 className="text-3xl font-bold mt-2">Fill Out Your Bracket</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-gray-600">
            Make your picks for each match
          </p>
          {savingPick && (
            <span className="text-sm text-blue-600">
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-lg font-medium">
              {Object.keys(userPicks).length} of {matches.length} picks made
            </p>
          </div>
          {isPickComplete() && (
            <div className="text-green-600 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Bracket Complete!
            </div>
          )}
        </div>
      </div>

      {/* Bracket interface will go here */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* We'll add the actual bracket UI here */}
          <p className="text-center text-gray-600">
            Bracket interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}