"use client";

import { useState } from 'react';
import { scriptData } from '@/lib/script';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function PersonMode() {
  const characters = Array.from(new Set(scriptData.map(l => l.speaker).filter(Boolean))).sort() as string[];
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const toggleReveal = (id: number) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!selectedChar) {
    return (
      <div className="py-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Selecione seu Personagem</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {characters.map(char => (
            <button
              key={char}
              onClick={() => setSelectedChar(char)}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-full text-lg font-medium transition-colors border border-zinc-800 hover:border-zinc-700"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const charLines = scriptData.filter(l => l.speaker === selectedChar);

  return (
    <div className="py-20">
      <button
        onClick={() => setSelectedChar(null)}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 mb-12 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="space-y-16">
        {charLines.map(line => {
          const index = scriptData.findIndex(l => l.id === line.id);
          const prevLine = scriptData[index - 1];
          const nextLine = scriptData[index + 1];

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={line.id}
              className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50"
            >
              {prevLine && (
                <div className="opacity-40 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                    {prevLine.speaker}
                  </span>
                  <p className="text-xl">{prevLine.text}</p>
                </div>
              )}
              
              <div className="opacity-100 my-8">
                <span className="text-sm text-emerald-500 uppercase font-bold tracking-widest block mb-4">
                  {line.speaker}
                </span>
                {!revealed[line.id] ? (
                  <button 
                    onClick={() => toggleReveal(line.id)}
                    className="w-full py-8 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl text-zinc-400 font-medium text-lg transition-colors border border-zinc-700/50 border-dashed"
                  >
                    Clique para revelar sua fala
                  </button>
                ) : (
                  <p 
                    className="text-3xl md:text-4xl font-bold leading-tight cursor-pointer"
                    onClick={() => toggleReveal(line.id)}
                  >
                    {line.text}
                  </p>
                )}
              </div>

              {nextLine && nextLine.speaker !== selectedChar && (
                <div className="opacity-40 mt-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                    {nextLine.speaker}
                  </span>
                  <p className="text-xl">{nextLine.text}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
