import { supabase } from './supabase';
import { 
  AO2024_QUARTERFINALISTS, 
  AO2024_SEMIFINALS, 
  AO2024_FINAL 
} from './tournament-data-2024';

export async function setupTestChallenge(userId: string) {
  try {
    // 1. Create the challenge with future dates
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert([
        {
          name: 'AO 2025 Test Challenge',
          description: 'Test challenge using previous AO results (Quarter-Finals onwards)',
          tournament: 'Australian Open 2025',
          start_date: '2025-01-14', // Future date
          end_date: '2025-01-28',
          created_by: userId
        }
      ])
      .select()
      .single();

    if (challengeError) throw challengeError;

    // 2. Add tournament matches
    const matches = [
      ...AO2024_QUARTERFINALISTS.map((match, index) => ({
        challenge_id: challenge.id,
        round: 5, // Quarter Finals
        position: index,
        player1: match.player1.name,
        player2: match.player2.name,
        status: 'pending'
      })),
      ...AO2024_SEMIFINALS.map((match, index) => ({
        challenge_id: challenge.id,
        round: 6, // Semi Finals
        position: index,
        player1: null, // Will be populated as winners advance
        player2: null,
        status: 'pending'
      })),
      {
        challenge_id: challenge.id,
        round: 7, // Final
        position: 0,
        player1: null, // Will be populated as winners advance
        player2: null,
        status: 'pending'
      }
    ];

    const { error: matchesError } = await supabase
      .from('tournament_matches')
      .insert(matches);

    if (matchesError) throw matchesError;

    // 3. Add creator as first participant
    const { error: participantError } = await supabase
      .from('participants')
      .insert([
        {
          challenge_id: challenge.id,
          user_id: userId
        }
      ]);

    if (participantError) throw participantError;

    return challenge;
  } catch (error) {
    console.error('Error setting up test challenge:', error);
    throw error;
  }
}