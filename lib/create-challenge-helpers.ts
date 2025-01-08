import { supabase } from './supabase';

export async function setupInitialMatches(challengeId: string) {
  // For now, we'll create empty match slots that the admin can fill in
  const rounds = [
    { round: 5, name: 'Quarter Finals', matches: 4 },
    { round: 6, name: 'Semi Finals', matches: 2 },
    { round: 7, name: 'Finals', matches: 1 }
  ];

  const matches = rounds.flatMap(round => 
    Array.from({ length: round.matches }, (_, index) => ({
      challenge_id: challengeId,
      round: round.round,
      position: index,
      player1: null,
      player2: null,
      status: 'pending'
    }))
  );

  const { error } = await supabase
    .from('tournament_matches')
    .insert(matches);

  return { error };
}