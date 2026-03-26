"use client";

import { useState, useEffect } from 'react';
import { scriptData } from '@/lib/script';
import { calculateSM2, getInitialReviewItem, ReviewItem } from '@/lib/sm2';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function TrainingMode() {
  const characters = Array.from(new Set(scriptData.map(l => l.speaker).filter(Boolean))).sort() as string[];
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<number, ReviewItem>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('script-reviews');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse reviews from localStorage", e);
        }
      }
    }
    return {};
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Save reviews to localStorage
  useEffect(() => {
    if (isLoaded && Object.keys(reviews).length > 0) {
      localStorage.setItem('script-reviews', JSON.stringify(reviews));
    }
  }, [reviews, isLoaded]);

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return <div className="py-20 text-center text-zinc-500">Carregando...</div>;
  }

  if (!selectedChar) {
    return (
      <div className="py-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Modo Treino: Selecione seu Personagem</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {characters.map(char => (
            <button
              key={char}
              onClick={() => {
                setSelectedChar(char);
                setCurrentLineIndex(0);
                setIsRevealed(false);
              }}
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
  
  // Find lines due for review today
  const dueLines = charLines.filter(line => {
    const review = reviews[line.id];
    if (!review) return true; // Never reviewed
    return review.nextReviewDate <= now;
  });

  if (dueLines.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <CheckCircle2 size={64} className="text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
        <p className="text-zinc-400 mb-8">Você revisou todas as suas falas para agora.</p>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedChar(null)}
            className="px-8 py-4 bg-zinc-800 text-zinc-50 rounded-full font-bold hover:bg-zinc-700 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              setReviews(prev => {
                const next = { ...prev };
                charLines.forEach(line => {
                  if (next[line.id]) {
                    next[line.id].nextReviewDate = 0;
                  }
                });
                return next;
              });
              setCurrentLineIndex(0);
            }}
            className="px-8 py-4 bg-emerald-500 text-zinc-950 rounded-full font-bold hover:bg-emerald-400 transition-colors"
          >
            Treinar Novamente
          </button>
        </div>
      </div>
    );
  }

  const currentLine = dueLines[currentLineIndex % dueLines.length];
  const globalIndex = scriptData.findIndex(l => l.id === currentLine.id);
  const prevLine = scriptData[globalIndex - 1];

  const handleRate = (quality: number) => {
    const currentReview = reviews[currentLine.id] || getInitialReviewItem(currentLine.id);
    const nextReview = calculateSM2(quality, currentReview);
    
    setReviews(prev => ({
      ...prev,
      [currentLine.id]: nextReview
    }));

    setIsRevealed(false);
    // If it's the last line in the due list, it will naturally re-filter on next render
    // But we can just move to the next index to be safe
    setCurrentLineIndex(prev => prev + 1);
  };

  return (
    <div className="py-20 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => setSelectedChar(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className="text-sm font-medium text-zinc-500 bg-zinc-900 px-4 py-1.5 rounded-full">
          {dueLines.length} falas restantes
        </div>
      </div>

      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 min-h-[400px] flex flex-col justify-center">
        {prevLine && (
          <div className="opacity-50 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">
              Deixa ({prevLine.speaker})
            </span>
            <p className="text-xl italic">&quot;{prevLine.text}&quot;</p>
          </div>
        )}

        <div className="text-center">
          <span className="text-sm text-emerald-500 uppercase font-bold tracking-widest block mb-4">
            Sua vez ({currentLine.speaker})
          </span>
          
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.button
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRevealed(true)}
                className="w-full py-12 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl text-zinc-400 font-medium text-lg transition-colors border border-zinc-700/50 border-dashed"
              >
                Clique para revelar sua fala
              </motion.button>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl md:text-4xl font-bold leading-tight"
              >
                {currentLine.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-4 gap-4"
        >
          <button onClick={() => handleRate(1)} className="py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl font-bold transition-colors">
            Errei
          </button>
          <button onClick={() => handleRate(3)} className="py-4 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-2xl font-bold transition-colors">
            Difícil
          </button>
          <button onClick={() => handleRate(4)} className="py-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-2xl font-bold transition-colors">
            Bom
          </button>
          <button onClick={() => handleRate(5)} className="py-4 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-2xl font-bold transition-colors">
            Fácil
          </button>
        </motion.div>
      )}
    </div>
  );
}
