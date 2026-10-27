import React, { useState } from 'react';
import { GameSettings } from '../types';
import { sounds } from '../services/sound';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenSettings,
  settings,
  onUpdateSettings
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'role' | 'difficulty' | 'preset' | null>(null);

  const roles: GameSettings['role'][] = [
    'Geliştirici',
    'Sistem Mimarı',
    'DevOps Nöbetçisi',
    'Güvenlik Lideri'
  ];

  const difficulties: GameSettings['difficulty'][] = [
    'Kolay',
    'Normal',
    'Kaos',
    'Gerçek Zamanlı'
  ];

  const presets: GameSettings['preset'][] = [
    'Yeni başladım',
    'Hızlı Müdahale',
    'Gece Vardiyası'
  ];

  return (
    <div className="flex flex-col relative w-full min-h-screen pt-safe pb-safe bg-[#071420] text-[#d6e4f5] select-none justify-between">
      <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-6 select-none flex-1 justify-between">
        
        {/* Top Navigation & Live Telemetry Bar */}
        <div className="flex items-center justify-between w-full pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2b38] border-[2px] border-[#0b1220] brutal-shadow">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5263] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5263]"></span>
            </span>
            <span className="font-rubik text-[11px] font-bold tracking-widest uppercase text-[#fff2d7]">
              CANLI · ŞEHİR HASTANESİ
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            aria-label="Ayarlar"
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#293643] border-[2px] border-[#0b1220] text-[#fff2d7] brutal-shadow-lg active:translate-y-1 active:shadow-[1px_1px_0px_#0b1220] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[#edc22e]">settings</span>
          </button>
        </div>

        {/* Center Branding & Logo Block */}
        <div className="flex flex-col items-center justify-center text-center my-2">
          {/* Version Tag Pill */}
          <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#93000a] text-[#fff0ef] font-rubik text-[11px] font-bold tracking-wider uppercase border-[2px] border-[#0b1220] brutal-shadow -rotate-3 mb-2">
            YZM301 · SE PRIMER
          </div>

          {/* Main Title Stack */}
          <div className="flex flex-col items-center leading-none tracking-normal">
            <h1 className="font-arcade text-[48px] text-[#fff2d7] drop-shadow-[4px_4px_0px_#0b1220] m-0">
              OVER
            </h1>
            <h1 className="font-arcade text-[48px] text-[#ff5263] drop-shadow-[4px_4px_0px_#0b1220] -mt-3 m-0">
              LOAD
            </h1>
          </div>

          {/* Cyber Subtitle Tag */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#3fe0c5]"></span>
            <span className="font-rubik text-[#3fe0c5] tracking-widest text-xs font-bold uppercase">
              KOMUTA KATMANI
            </span>
            <span className="w-2 h-2 rounded-full bg-[#3fe0c5]"></span>
          </div>
        </div>

        {/* Tactical Radar Command Visual */}
        <div className="flex flex-col items-center justify-center relative my-2">
          {/* Radar Chassis Container */}
          <div className="relative w-44 h-44 rounded-full bg-[#030f1b] border-[3px] border-[#0b1220] brutal-shadow-lg flex items-center justify-center overflow-hidden">
            {/* Radar Sweep Beam (Inline SVG animation) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none animate-spin"
              style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}
              viewBox="0 0 176 176"
            >
              <defs>
                <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3fe0c5" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#3fe0c5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 88 88 L 176 88 A 88 88 0 0 0 88 0 Z" fill="url(#radarSweep)" />
            </svg>

            {/* Grid Overlay Rings and Axis */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40 text-[#3fe0c5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 176 176"
            >
              <circle cx="88" cy="88" r="76" strokeDasharray="3 3" strokeWidth="1.5" />
              <circle cx="88" cy="88" r="50" strokeWidth="1.5" />
              <circle cx="88" cy="88" r="24" strokeWidth="1" />
              <line strokeWidth="1" x1="88" x2="88" y1="8" y2="168" />
              <line strokeWidth="1" x1="8" x2="168" y1="88" y2="88" />
            </svg>

            {/* Active Blips (Crisis Nodes) */}
            {/* Blip 1: Critical Emergency Code Red (Top Right) */}
            <div className="absolute top-8 right-11 flex items-center justify-center pointer-events-none">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#ff5263] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff5263] shadow-[0_0_8px_#ff5263]"></span>
            </div>

            {/* Blip 2: High Contagion Red (Bottom Left) */}
            <div className="absolute bottom-10 left-9 flex items-center justify-center pointer-events-none">
              <span
                className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#ff5263] opacity-80"
                style={{ animationDuration: '1.4s' }}
              ></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5263] shadow-[0_0_6px_#ff5263]"></span>
            </div>

            {/* Blip 3: Warning Tier Orange (Top Left) */}
            <div className="absolute top-12 left-10 flex items-center justify-center pointer-events-none">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#edc22e] shadow-[0_0_6px_#edc22e]"></span>
            </div>

            {/* Command Center Core Pin (Cyan Center) */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-[#3fe0c5] flex items-center justify-center shadow-[0_0_10px_#3fe0c5]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#030f1b]"></div>
            </div>
          </div>

          {/* Tactical Coordinates Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#14212d] border-[2px] border-[#0b1220] text-[#d6e4f5] font-rubik text-[10px] font-bold tracking-wider uppercase brutal-shadow">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3fe0c5]"></span>
            <span>RADAR AKTİF · SEKTÖR-7</span>
          </div>
        </div>

        {/* Bottom Interactive Parameter Selectors */}
        <div className="relative grid grid-cols-3 gap-2 w-full mt-3 mb-4">
          {/* Selector 1: Role */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveDropdown(activeDropdown === 'role' ? null : 'role');
              }}
              className="w-full flex flex-col items-start p-2 rounded-lg bg-[#14212d] border-[2px] border-[#0b1220] text-left brutal-shadow active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1220] transition-all cursor-pointer"
              type="button"
            >
              <span className="font-rubik text-[9px] text-[#3fe0c5] font-bold tracking-wider uppercase">ROL</span>
              <span className="font-rubik text-[11px] font-bold text-[#fff2d7] truncate w-full mt-0.5 flex items-center justify-between">
                {settings.role}
                <span className="material-symbols-outlined text-xs leading-none">arrow_drop_down</span>
              </span>
            </button>
            {activeDropdown === 'role' && (
              <div className="absolute bottom-full mb-1 left-0 w-36 bg-[#1e2b38] border-[2px] border-[#0b1220] rounded-lg brutal-shadow-lg z-50 py-1 overflow-hidden">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      sounds.playClick();
                      onUpdateSettings({ role: r });
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-rubik font-bold transition-colors ${
                      settings.role === r ? 'bg-[#3fe0c5] text-[#00382f]' : 'text-[#d6e4f5] hover:bg-[#293643]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector 2: Difficulty */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveDropdown(activeDropdown === 'difficulty' ? null : 'difficulty');
              }}
              className="w-full flex flex-col items-start p-2 rounded-lg bg-[#14212d] border-[2px] border-[#0b1220] text-left brutal-shadow active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1220] transition-all cursor-pointer"
              type="button"
            >
              <span className="font-rubik text-[9px] text-[#3fe0c5] font-bold tracking-wider uppercase">ZORLUK</span>
              <span className="font-rubik text-[11px] font-bold text-[#fff2d7] truncate w-full mt-0.5 flex items-center justify-between">
                {settings.difficulty}
                <span className="material-symbols-outlined text-xs leading-none">arrow_drop_down</span>
              </span>
            </button>
            {activeDropdown === 'difficulty' && (
              <div className="absolute bottom-full mb-1 left-0 w-32 bg-[#1e2b38] border-[2px] border-[#0b1220] rounded-lg brutal-shadow-lg z-50 py-1 overflow-hidden">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      sounds.playClick();
                      onUpdateSettings({ difficulty: d });
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-rubik font-bold transition-colors ${
                      settings.difficulty === d ? 'bg-[#3fe0c5] text-[#00382f]' : 'text-[#d6e4f5] hover:bg-[#293643]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector 3: Preset */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveDropdown(activeDropdown === 'preset' ? null : 'preset');
              }}
              className="w-full flex flex-col items-start p-2 rounded-lg bg-[#14212d] border-[2px] border-[#0b1220] text-left brutal-shadow active:translate-y-0.5 active:shadow-[1px_1px_0px_#0b1220] transition-all cursor-pointer"
              type="button"
            >
              <span className="font-rubik text-[9px] text-[#3fe0c5] font-bold tracking-wider uppercase">ÖN AYAR</span>
              <span className="font-rubik text-[11px] font-bold text-[#fff2d7] truncate w-full mt-0.5 flex items-center justify-between">
                {settings.preset}
                <span className="material-symbols-outlined text-xs leading-none">arrow_drop_down</span>
              </span>
            </button>
            {activeDropdown === 'preset' && (
              <div className="absolute bottom-full mb-1 right-0 w-36 bg-[#1e2b38] border-[2px] border-[#0b1220] rounded-lg brutal-shadow-lg z-50 py-1 overflow-hidden">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      sounds.playClick();
                      onUpdateSettings({ preset: p });
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-rubik font-bold transition-colors ${
                      settings.preset === p ? 'bg-[#3fe0c5] text-[#00382f]' : 'text-[#d6e4f5] hover:bg-[#293643]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Call To Action Block */}
        <div className="flex flex-col items-center w-full mt-2">
          {/* Big Chunky Dispatch Button */}
          <button
            onClick={() => {
              sounds.playDispatch();
              onStartGame();
            }}
            className="w-full py-4 rounded-xl bg-[#ffd23f] text-[#3d2f00] font-arcade text-xl tracking-wider uppercase border-[3px] border-[#0b1220] brutal-shadow-btn brutal-btn-active flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#ffe089]"
            id="launch-button"
            type="button"
          >
            <span>OYNA</span>
            <span className="material-symbols-outlined text-[#3d2f00] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </button>

          {/* How To Play Context Link */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            className="mt-3 py-1 px-3 font-rubik font-bold text-xs text-[#9db4c6] hover:text-[#fff2d7] underline underline-offset-4 tracking-wide transition-colors cursor-pointer"
            type="button"
          >
            Nasıl oynanır?
          </button>
        </div>

      </div>
    </div>
  );
};
