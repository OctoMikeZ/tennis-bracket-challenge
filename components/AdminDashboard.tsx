import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ challengeId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [activeRound, setActiveRound] = useState(5); // Start with Quarter Finals

  const ROUNDS = [
    { id: 5, name: 'Quarter Finals' },
    { id: 6, name: 'Semi Finals' },
    { id: 7, name: 'Finals' }
  ];

  useEffect(() => {
    loadMatches();
  }, [activeRound]);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('round', activeRound)
        .order('position');

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = async (matchId, updates) => {
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update(updates)
        .eq('id', matchId);

      if (error) throw error;
      await loadMatches();

      // If updating a winner, update next round's players
      if (updates.winner) {
        await updateNextRoundMatch(matchId, updates.winner);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match');
    }
  };

  const updateNextRoundMatch = async (currentMatchId, winner) => {
    try {
      // Find current match to get its position and round
      const currentMatch = matches.find(m => m.id === currentMatchId);
      if (!currentMatch) return;

      // Calculate next round match details
      const nextRound = currentMatch.round + 1;
      const nextPosition = Math.floor(currentMatch.position / 2);
      const isEvenPosition = currentMatch.position % 2 === 0;

      // Get next round match
      const { data: nextMatches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('round', nextRound)
        .eq('position', nextPosition)
        .single();

      if (nextMatches) {
        // Update player1 if even position, player2 if odd
        const updates = isEvenPosition
          ? { player1: winner }
          : { player2: winner };

        await supabase
          .from('tournament_matches')
          .update(updates)
          .eq('id', nextMatches.id);
      }
    } catch (error) {
      console.error('Error updating next round:', error);
    }
  };

  const EditableMatch = ({ match }) => {
    const [player1Name, setPlayer1Name] = useState(match.player1 || '');
    const [player2Name, setPlayer2Name] = useState(match.player2 || '');

    const handleSave = async () => {
      await updateMatch(match.id, {
        player1: player1Name,
        player2: player2Name
      });
      setEditing(null);
    };

    const handleSelectWinner = async (winner) => {
      await updateMatch(match.id, {
        winner,
        status: 'completed'
      });
    };

    if (editing === match.id) {
      return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Player 1</label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Player 2</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Match {match.position + 1}</span>
          <div className="space-x-2">
            <button
              onClick={() => setEditing(match.id)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { name: match.player1, isWinner: match.winner === match.player1 },
            { name: match.player2, isWinner: match.winner === match.player2 }
          ].map((player, index) => (
            <div
              key={index}
              className={`p-2 rounded flex justify-between items-center ${
                player.isWinner ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <span>{player.name || `Player ${index + 1} (TBD)`}</span>
              {player.name && !match.winner && (
                <button
                  onClick={() => handleSelectWinner(player.name)}
                  className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Select Winner
                </button>
              )}
              {player.isWinner && (
                <span className="text-green-600 text-sm">Winner</span>
              )}
            </div>
          ))}
        </div>
        {match.winner && (
          <div className="mt-2">
            <button
              onClick={() => updateMatch(match.id, { winner: null, status: 'pending' })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Reset Result
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading matches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-4">
        {ROUNDS.map((round) => (
          <button
            key={round.id}
            onClick={() => setActiveRound(round.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeRound === round.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {round.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match) => (
          <EditableMatch key={match.id} match={match} />
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No matches found for this round</p>
        </div>
      )}
    </div>
  );
}