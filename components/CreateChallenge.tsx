import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';



async function setupInitialMatches(challengeId: string) {
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

export default function CreateChallenge() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tournament: 'Australian Open 2024',
    startDate: '2024-01-14', // AO 2024 start date
    endDate: '2024-01-28',   // AO 2024 end date
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Must be logged in to create a challenge');
  
      // Insert the challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            tournament: formData.tournament,
            start_date: formData.startDate,
            end_date: formData.endDate,
            created_by: user.id,
          }
        ])
        .select()
        .single();
  
      if (challengeError) throw challengeError;
  
      // Set up initial match structure
      const { error: matchError } = await setupInitialMatches(challenge.id);
      if (matchError) throw matchError;
  
      // Add creator as first participant
      await supabase
        .from('participants')
        .insert([
          {
            challenge_id: challenge.id,
            user_id: user.id,
          }
        ]);
  
      // Redirect to the challenge page
      router.push(`/challenges/${challenge.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Bracket Challenge</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Challenge Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Friend Group Australian Open Pool"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add any special rules or notes for participants..."
          />
        </div>

        <div>
          <label htmlFor="tournament" className="block text-sm font-medium text-gray-700">
            Tournament
          </label>
          <input
            type="text"
            name="tournament"
            id="tournament"
            value={formData.tournament}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
}