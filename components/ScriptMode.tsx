"use client";

import React, { useState, useRef, useEffect } from 'react';
import { scriptData } from '@/lib/script';
import { motion, AnimatePresence } from 'motion/react';
import { Turtle, Play, Pause, Rabbit, X, Music } from 'lucide-react';

export default function ScriptMode() {
  const selectableLines = scriptData.filter(l => l.type !== 'action');
  const [activeId, setActiveId] = useState(selectableLines[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [showControls, setShowControls] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Scroll into view when activeId changes programmatically
  useEffect(() => {
    if (isProgrammaticScroll.current) {
      const activeElement = document.getElementById(`line-${activeId}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      const timeout = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 800);
      
      return () => clearTimeout(timeout);
    }
  }, [activeId]);

  // Scroll spy
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const elements = selectableLines.map(line => ({
          id: line.id,
          el: document.getElementById(`line-${line.id}`)
        }));
        
        let closestId = activeId;
        let minDistance = Infinity;
        const centerY = window.innerHeight / 2;

        elements.forEach(({id, el}) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const elCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(centerY - elCenterY);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = id;
          }
        });

        if (closestId !== activeId) {
          setActiveId(closestId);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [activeId, selectableLines]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveId(current => {
          const currentIndex = selectableLines.findIndex(l => l.id === current);
          if (currentIndex < selectableLines.length - 1) {
            isProgrammaticScroll.current = true;
            return selectableLines[currentIndex + 1].id;
          }
          return current;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveId(current => {
          const currentIndex = selectableLines.findIndex(l => l.id === current);
          if (currentIndex > 0) {
            isProgrammaticScroll.current = true;
            return selectableLines[currentIndex - 1].id;
          }
          return current;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectableLines]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    // Speed 0 = 8000ms, Speed 100 = 1000ms
    const intervalTime = 8000 - (speed * 70);
    const timer = setInterval(() => {
      setActiveId(current => {
        const currentIndex = selectableLines.findIndex(l => l.id === current);
        if (currentIndex < selectableLines.length - 1) {
          isProgrammaticScroll.current = true;
          return selectableLines[currentIndex + 1].id;
        }
        setIsPlaying(false);
        return current;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, speed, selectableLines]);

  return (
    <div className="flex flex-col gap-12 py-32" ref={containerRef}>
      <AnimatePresence>
        {!showControls ? (
          <motion.button
            key="turtle-btn"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            onClick={() => setShowControls(true)}
            className="fixed bottom-8 left-8 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-4 rounded-full flex items-center justify-center z-40 shadow-2xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-emerald-500"
          >
            <Turtle size={24} />
          </motion.button>
        ) : (
          <motion.div 
            key="controls"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-3 rounded-full flex items-center gap-4 z-40 shadow-2xl"
          >
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <div className="flex items-center gap-3 text-zinc-400 pr-4">
              <Turtle size={20} />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32 md:w-48 accent-emerald-500"
              />
              <Rabbit size={20} />
            </div>
            <button 
              onClick={() => {
                setShowControls(false);
                setIsPlaying(false);
              }}
              className="pr-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {scriptData.map((line, index) => {
        const showSceneSeparator = index === 0 || scriptData[index - 1].scene !== line.scene;
        
        return (
          <React.Fragment key={line.id}>
            {showSceneSeparator && (
              <div className="my-8 flex items-center gap-4 opacity-50">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest px-4 py-1 border border-zinc-800 rounded-full">
                  {line.scene}
                </span>
                <div className="h-px bg-zinc-800 flex-1"></div>
              </div>
            )}
            
            {line.type === 'action' ? (
              <div className="py-4 opacity-40 italic text-zinc-400 text-lg md:text-xl text-center max-w-3xl mx-auto">
                {line.text}
              </div>
            ) : (
              <motion.div
                id={`line-${line.id}`}
                onClick={() => {
                  isProgrammaticScroll.current = true;
                  setActiveId(line.id);
                }}
                className={`cursor-pointer transition-all duration-500 ${
                  activeId === line.id ? 'opacity-100 scale-105' : 'opacity-30 hover:opacity-50'
                }`}
              >
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                  {line.type === 'music' && <Music size={14} />}
                  {line.speaker}
                </span>
                <p className={`text-3xl md:text-5xl font-bold leading-tight tracking-tight ${line.type === 'music' ? 'text-emerald-400/80 italic' : ''}`}>
                  {line.text}
                </p>
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
