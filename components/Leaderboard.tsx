import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Participant {
  user_id: string;
  user_name: string;
  total_points: number;
  correct_picks: number;
  rank?: number;
}

interface LeaderboardProps {
  challengeId: string;
  className?: string;
}

export default function Leaderboard({ challengeId, className = '' }: LeaderboardProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
    getCurrentUser();
  }, [challengeId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // Get all participants with their total points
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id,
          user_id,
          profiles:user_id (
            name,
            email
          ),
          picks (
            points
          )
        `)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      // Calculate total points and sort participants
      const leaderboardData = data
        .map(participant => ({
          user_id: participant.user_id,
          user_name: participant.profiles?.name || 'Anonymous',
          total_points: participant.picks?.reduce((sum, pick) => sum + (pick.points || 0), 0) || 0,
          correct_picks: participant.picks?.filter(pick => pick.points > 0).length || 0
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .map((participant, index) => ({
          ...participant,
          rank: index + 1
        }));

      setParticipants(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading leaderboard...</div>;
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Leaderboard
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct Picks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => (
                <tr 
                  key={participant.user_id}
                  className={
                    participant.user_id === currentUserId 
                      ? 'bg-blue-50'
                      : undefined
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {participant.rank === 1 ? '🏆 ' : ''}
                    {participant.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {participant.user_name}
                    {participant.user_id === currentUserId && ' (You)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.total_points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.correct_picks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participants.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No participants yet
          </div>
        )}
      </div>
    </div>
  );
}