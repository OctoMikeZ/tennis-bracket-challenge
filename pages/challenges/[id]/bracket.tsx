import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import BracketPicker from '../../../components/BracketPicker';

export default function BracketPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadChallenge();
    }
  }, [id]);

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

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  const isLocked = new Date(challenge.start_date) <= new Date();

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{challenge.name}</h1>
        <p className="text-gray-600 mt-2">{challenge.description}</p>
      </div>

      <BracketPicker 
        challengeId={id as string} 
        isLocked={isLocked}
      />
      
      {isLocked && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">
            This bracket is now locked as the tournament has started.
          </p>
        </div>
      )}
    </div>
  );
}