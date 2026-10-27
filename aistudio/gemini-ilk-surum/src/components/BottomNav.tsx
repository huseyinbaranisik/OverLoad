import React from 'react';
import { ScreenType } from '../types';
import { sounds } from '../services/sound';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unresolvedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  unresolvedCount = 0
}) => {
  const tabs: { id: ScreenType; label: string; icon: string; count?: number }[] = [
    { id: 'sector', label: 'SEKTÖR', icon: 'grid_view' },
    { id: 'crisis', label: 'KRİZLER', icon: 'crisis_alert', count: unresolvedCount },
    { id: 'agents', label: 'AJANLAR', icon: 'smart_toy' },
    { id: 'system', label: 'SİSTEM', icon: 'tune' }
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#14212d]/95 backdrop-blur-xl border-t-[3px] border-[#0b1220] shadow-[0_-4px_20px_rgba(3,15,27,0.8)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-3">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                onNavigate(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-lg transition-all cursor-pointer border-[2px] ${
                isActive
                  ? 'text-[#3fe0c5] bg-[#293643] border-[#0b1220] brutal-shadow-sm -translate-y-1'
                  : 'text-[#9db4c6] border-transparent hover:text-[#d6e4f5] hover:bg-[#1e2b38]/60 active:translate-y-0.5'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {tab.icon}
              </span>
              <span className="font-arcade text-[10px] tracking-wider uppercase leading-none">
                {tab.label}
              </span>

              {/* Red badge notification if crises exist */}
              {tab.id === 'crisis' && unresolvedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff5263] text-white border-[2px] border-[#0b1220] rounded-full text-[9px] font-bold font-arcade flex items-center justify-center animate-pulse">
                  {unresolvedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
