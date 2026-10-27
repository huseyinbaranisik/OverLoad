import React from 'react';
import { ScreenType } from '../types';
import { sounds } from '../services/sound';

interface HeaderProps {
  currentScreen: ScreenType;
  onProfileClick: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onProfileClick,
  onOpenSettings,
  soundEnabled,
  onToggleSound
}) => {
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'sector':
        return 'Tactical Grid';
      case 'crisis':
        return 'Crisis Log';
      case 'agents':
        return 'Agent Roster';
      case 'system':
        return 'System Telemetry';
      default:
        return 'Command Deck';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#071420]/90 backdrop-blur-xl border-b-[2px] border-[#0b1220] shadow-[0_4px_16px_rgba(3,15,27,0.7)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand logo block */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenSettings();
          }}
          className="flex items-center gap-2 group text-left cursor-pointer active:scale-95 transition-transform"
          title="Ayarlar & Sistem Özeti"
        >
          <div className="w-9 h-9 rounded-lg bg-[#293643] border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-center group-hover:bg-[#1e2b38] transition-colors">
            <span className="material-symbols-outlined text-[#3fe0c5] text-[22px]">
              emergency_home
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-arcade text-[18px] tracking-wider uppercase text-[#fff2d7] leading-none">
              OVERLOAD
            </span>
            <span className="font-rubik text-[10px] text-[#3fe0c5] tracking-widest uppercase font-bold mt-0.5">
              SEKTÖR // CANLI
            </span>
          </div>
        </button>

        {/* Right side controls & screen badge */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute Quick Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            className="w-8 h-8 rounded-lg bg-[#14212d] border-[2px] border-[#0b1220] flex items-center justify-center text-[#d6e4f5] hover:text-[#ffd23f] active:scale-95 transition-all"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Active Screen Pill */}
          <div className="px-2.5 py-1 bg-[#1e2b38] border-[2px] border-[#0b1220] rounded-full flex items-center gap-1.5 shadow-[2px_2px_0_#0b1220]">
            <div className="w-2 h-2 rounded-full bg-[#3fe0c5] animate-pulse"></div>
            <h1 className="font-rubik text-[10px] font-bold uppercase text-[#d6e4f5] tracking-wider leading-none">
              {getScreenTitle()}
            </h1>
          </div>

          {/* Profile / Status button */}
          <button
            onClick={() => {
              sounds.playClick();
              onProfileClick();
            }}
            className="w-8 h-8 rounded-full bg-[#fff2d7] border-[2px] border-[#0b1220] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#0b1220] active:translate-y-0.5 transition-all"
            title="Operatör Profili"
          >
            <span className="material-symbols-outlined text-[#3d2f00] text-[18px] font-bold">
              person
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
