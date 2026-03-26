"use client";

import { useState } from 'react';
import ScriptMode from '@/components/ScriptMode';
import PersonMode from '@/components/PersonMode';
import TrainingMode from '@/components/TrainingMode';
import { BookOpen, User, BrainCircuit } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const [mode, setMode] = useState<'script' | 'person' | 'training'>('script');

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-transparent pt-4 pb-12 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-center pointer-events-auto">
          <div className="bg-zinc-900 p-1 rounded-full flex gap-1 shadow-lg border border-zinc-800/50">
            <button
              onClick={() => setMode('script')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === 'script' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen size={16} />
              <span className="hidden sm:inline">Roteiro Completo</span>
            </button>
            <button
              onClick={() => setMode('person')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === 'person' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">Modo Personagem</span>
            </button>
            <button
              onClick={() => setMode('training')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === 'training' ? 'bg-zinc-800 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BrainCircuit size={16} />
              <span className="hidden sm:inline">Modo Treino</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-3xl mx-auto px-6">
        <ErrorBoundary>
          {mode === 'script' && <ScriptMode />}
          {mode === 'person' && <PersonMode />}
          {mode === 'training' && <TrainingMode />}
        </ErrorBoundary>
      </div>
    </main>
  );
}
