import React, { useState } from 'react';
import { Card } from './ui/card';

const TennisBracket = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Tournament structure
  const ROUNDS = [
    { name: 'Round of 128', matches: 64 },
    { name: 'Round of 64', matches: 32 },
    { name: 'Round of 32', matches: 16 },
    { name: 'Round of 16', matches: 8 },
    { name: 'Quarter Finals', matches: 4 },
    { name: 'Semi Finals', matches: 2 },
    { name: 'Finals', matches: 1 }
  ];

  const MatchCard = ({ matchId, player1, player2, round }) => (
    <Card 
      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedMatch === matchId ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedMatch(matchId)}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{player1.name}</span>
          <span className="text-xs text-gray-500">#{player1.seed}</span>
        </div>
        <div className="border-t border-gray-100 my-1" />
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{player2.name}</span>
          <span className="text-xs text-gray-500">#{player2.seed}</span>
        </div>
      </div>
    </Card>
  );

  // Generate matches for each round
  const generateMatches = (roundIndex, matchCount) => {
    return Array.from({ length: matchCount }, (_, matchIndex) => {
      const baseNumber = matchIndex * 2;
      return {
        id: `${roundIndex}-${matchIndex}`,
        player1: {
          name: `Player ${baseNumber + 1}`,
          seed: baseNumber + 1
        },
        player2: {
          name: `Player ${baseNumber + 2}`,
          seed: baseNumber + 2
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="overflow-x-auto">
        <div className="inline-flex space-x-8 p-4 min-w-max">
          {ROUNDS.map((round, roundIndex) => (
            <div key={round.name} className="flex-shrink-0 w-60">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {round.name}
              </h2>
              <div 
                className="flex flex-col"
                style={{
                  gap: `${Math.pow(2, roundIndex + 1)}rem`,
                  marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex)}rem` : 0
                }}
              >
                {generateMatches(roundIndex, round.matches).map((match) => (
                  <MatchCard 
                    key={match.id}
                    matchId={match.id}
                    player1={match.player1}
                    player2={match.player2}
                    round={roundIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TennisBracket;