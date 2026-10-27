import React from 'react';
import { GameSettings } from '../types';
import { sounds } from '../services/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetShift: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetShift,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030f1b]/85 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-2xl brutal-shadow-lg w-full max-w-sm p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2px] border-[#0b1220] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffd23f] text-xl">
              settings
            </span>
            <span className="font-arcade text-sm text-[#fff2d7] uppercase">
              KOMUTA AYARLARI
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-[#293643] border border-[#0b1220] text-xs font-bold text-white flex items-center justify-center cursor-pointer hover:bg-[#1e2b38]"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#101d29] border border-[#0b1220]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3fe0c5] text-lg">
                volume_up
              </span>
              <span className="font-rubik text-xs font-bold text-[#fff2d7]">
                Arcade Ses Efektleri
              </span>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                sounds.enabled = next;
                if (next) sounds.playClick();
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`px-3 py-1 rounded-md font-rubik text-xs font-bold border border-[#0b1220] cursor-pointer transition-colors ${
                settings.soundEnabled
                  ? 'bg-[#3fe0c5] text-[#00382f]'
                  : 'bg-[#293643] text-[#9db4c6]'
              }`}
            >
              {settings.soundEnabled ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>

          {/* CRT Scanlines Toggle */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#101d29] border border-[#0b1220]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3fe0c5] text-lg">
                tv
              </span>
              <span className="font-rubik text-xs font-bold text-[#fff2d7]">
                CRT Retro Filtre
              </span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ crtEnabled: !settings.crtEnabled });
              }}
              className={`px-3 py-1 rounded-md font-rubik text-xs font-bold border border-[#0b1220] cursor-pointer transition-colors ${
                settings.crtEnabled
                  ? 'bg-[#3fe0c5] text-[#00382f]'
                  : 'bg-[#293643] text-[#9db4c6]'
              }`}
            >
              {settings.crtEnabled ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>

          {/* Game Speed */}
          <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#101d29] border border-[#0b1220]">
            <span className="font-rubik text-[11px] font-bold text-[#9db4c6]">
              Simülasyon Hızı:
            </span>
            <div className="flex gap-2">
              {[1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    sounds.playClick();
                    onUpdateSettings({ gameSpeed: speed });
                  }}
                  className={`flex-1 py-1 rounded-md font-rubik text-xs font-bold border border-[#0b1220] cursor-pointer transition-colors ${
                    settings.gameSpeed === speed
                      ? 'bg-[#ffd23f] text-[#3d2f00]'
                      : 'bg-[#1e2b38] text-[#d6e4f5]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Role info */}
          <div className="p-2.5 rounded-xl bg-[#1e2b38] border border-[#0b1220]">
            <span className="font-rubik text-[10px] text-[#3fe0c5] font-bold block uppercase">
              Aktif Profil: {settings.role}
            </span>
            <span className="font-rubik text-[11px] text-[#9db4c6]">
              Zorluk: {settings.difficulty} · Ön Ayar: {settings.preset}
            </span>
          </div>

          {/* Reset Shift Button */}
          <button
            onClick={() => {
              sounds.playAlert();
              onResetShift();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#ff5263] text-white font-arcade text-xs uppercase tracking-wider border-[2px] border-[#0b1220] brutal-shadow-sm active:translate-y-0.5 cursor-pointer hover:bg-[#e04052]"
          >
            NÖBETİ SIFIRLA VE YENİDEN BAŞLAT
          </button>
        </div>
      </div>
    </div>
  );
};
