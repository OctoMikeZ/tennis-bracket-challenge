import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [adminChallenges, setAdminChallenges] = useState([]);
  
  useEffect(() => {
    if (user) {
      loadAdminChallenges();
    }
  }, [user]);

  const loadAdminChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, name')
        .eq('created_by', user?.id);
      
      if (error) throw error;
      setAdminChallenges(data || []);
    } catch (error) {
      console.error('Error loading admin challenges:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">
                Tennis Fantasy
              </span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link
                href="/challenges"
                className={`inline-flex items-center h-16 px-1 border-b-2 text-sm font-medium ${
                  router.pathname === '/challenges'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Challenges
              </Link>

              {user && adminChallenges.length > 0 && (
                <div className="relative group inline-block h-16 flex items-center">
                  <button className="inline-flex items-center px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 h-16">
                    Admin
                  </button>
                  <div className="absolute left-0 w-48 mt-2 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 top-16">
                    <div className="py-1">
                      {adminChallenges.map((challenge) => (
                        <Link
                          key={challenge.id}
                          href={`/challenges/${challenge.id}/admin`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {challenge.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!user ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Link>
            ) : (
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;