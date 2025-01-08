import React from 'react';
import Navbar from '../components/Navbar'
import TennisBracket from '../components/TennisBracket';

export default function BracketsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tournament Bracket</h1>
        <TennisBracket />
      </div>
    </div>
  );
}