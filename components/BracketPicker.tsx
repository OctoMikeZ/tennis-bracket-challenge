import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface Player {
  name: string;
  seed: number;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  nextMatchId?: string;
}

const ROUNDS = [
  { name: 'Round of 128', matches: 64 },
  { name: 'Round of 64', matches: 32 },
  { name: 'Round of 32', matches: 16 },
  { name: 'Round of 16', matches: 8 },
  { name: 'Quarter Finals', matches: 4 },
  { name: 'Semi Finals', matches: 2 },
  { name: 'Finals', matches: 1 }
];

export default function BracketPicker({ challengeId, isLocked = false }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [userPicks, setUserPicks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize bracket structure
  useEffect(() => {
    const initialMatches: Match[] = [];
    let matchCounter = 0;

    // Create matches for each round
    ROUNDS.forEach((round, roundIndex) => {
      for (let i = 0; i < round.matches; i++) {
        const match: Match = {
          id: `R${roundIndex + 1}-${i}`,
          round: roundIndex + 1,
          position: i,
          player1: roundIndex === 0 ? { name: `Seed ${i * 2 + 1}`, seed: i * 2 + 1 } : null,
          player2: roundIndex === 0 ? { name: `Seed ${i * 2 + 2}`, seed: i * 2 + 2 } : null,
          nextMatchId: roundIndex < ROUNDS.length - 1 ? `R${roundIndex + 2}-${Math.floor(i / 2)}` : undefined
        };
        initialMatches.push(match);
        matchCounter++;
      }
    });

    setMatches(initialMatches);
    loadUserPicks();
  }, [challengeId]);

  // Load existing picks
  const loadUserPicks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participant } = await supabase
        .from('participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (!participant) return;

      const { data: picks } = await supabase
        .from('picks')
        .select('match_number, picked_player')
        .eq('participant_id', participant.id);

      if (picks) {
        const picksMap = picks.reduce((acc, pick) => ({
          ...acc,
          [pick.match_number]: pick.picked_player
        }), {});
        setUserPicks(picksMap);
        updateBracketWithPicks(picksMap);
      }
    } catch (error) {
      console.error('Error loading picks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update bracket with picks
  const updateBracketWithPicks = (picks: Record<string, string>) => {
    setMatches(currentMatches => {
      const newMatches = [...currentMatches];
      
      // First, apply picks to first round matches
      newMatches.forEach(match => {
        if (match.round === 1) {
          const winner = picks[match.id];
          if (winner) {
            // Advance winner to next round
            if (match.nextMatchId) {
              const nextMatch = newMatches.find(m => m.id === match.nextMatchId);
              if (nextMatch) {
                const winningPlayer = winner === match.player1?.name ? match.player1 : match.player2;
                if (match.position % 2 === 0) {
                  nextMatch.player1 = winningPlayer;
                } else {
                  nextMatch.player2 = winningPlayer;
                }
              }
            }
          }
        }
      });

      // Then propagate through later rounds
      ROUNDS.slice(1).forEach((round, roundIndex) => {
        const roundNumber = roundIndex + 2;
        const roundMatches = newMatches.filter(m => m.round === roundNumber);
        
        roundMatches.forEach(match => {
          const winner = picks[match.id];
          if (winner && match.nextMatchId) {
            const nextMatch = newMatches.find(m => m.id === match.nextMatchId);
            if (nextMatch) {
              const winningPlayer = winner === match.player1?.name ? match.player1 : match.player2;
              if (match.position % 2 === 0) {
                nextMatch.player1 = winningPlayer;
              } else {
                nextMatch.player2 = winningPlayer;
              }
            }
          }
        });
      });

      return newMatches;
    });
  };

  // Handle picking a winner
  const handlePickWinner = async (matchId: string, winner: Player) => {
    if (isLocked) return;
    
    setSaving(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      // Update local state
      const newPicks = {
        ...userPicks,
        [matchId]: winner.name
      };
      setUserPicks(newPicks);
      
      // Update bracket display
      updateBracketWithPicks(newPicks);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participant } = await supabase
        .from('participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (!participant) return;

      await supabase
        .from('picks')
        .upsert([
          {
            participant_id: participant.id,
            match_number: matchId,
            picked_player: winner.name,
            round: match.round
          }
        ]);

    } catch (error) {
      console.error('Error saving pick:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderMatch = (match: Match) => {
    if (!match.player1 && !match.player2) return null;

    const getPlayerStyle = (player: Player | null) => {
      if (!player) return 'opacity-50';
      return userPicks[match.id] === player.name 
        ? 'bg-blue-100 border-blue-500' 
        : 'hover:bg-gray-50';
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-64">
        {match.player1 && (
          <div 
            onClick={() => match.player1 && handlePickWinner(match.id, match.player1)}
            className={`p-2 rounded cursor-pointer ${getPlayerStyle(match.player1)}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{match.player1.name}</span>
              <span className="text-sm text-gray-500">#{match.player1.seed}</span>
            </div>
          </div>
        )}
        
        <div className="my-2 border-t border-gray-100" />
        
        {match.player2 && (
          <div 
            onClick={() => match.player2 && handlePickWinner(match.id, match.player2)}
            className={`p-2 rounded cursor-pointer ${getPlayerStyle(match.player2)}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{match.player2.name}</span>
              <span className="text-sm text-gray-500">#{match.player2.seed}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading bracket...</div>;
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md">
          Saving...
        </div>
      )}
      
      <div className="flex space-x-8 overflow-x-auto p-4">
        {ROUNDS.map((round, roundIndex) => (
          <div key={round.name} className="flex-shrink-0">
            <h3 className="text-lg font-medium mb-4">{round.name}</h3>
            <div 
              className="space-y-4"
              style={{
                marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 2}rem` : '0',
              }}
            >
              {matches
                .filter(m => m.round === roundIndex + 1)
                .map(match => (
                  <div key={match.id} className="relative">
                    {renderMatch(match)}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}