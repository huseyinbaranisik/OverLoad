import React, { useState } from 'react';
import { DecisionRecord } from '../types';
import { sounds } from '../services/sound';

interface CrisisLogScreenProps {
  onGoToMainMenu: () => void;
  solvedCount: number;
  failedCount: number;
  overloadPercent: number;
  decisions: DecisionRecord[];
  isAlternativeFailure?: boolean;
}

export const CrisisLogScreen: React.FC<CrisisLogScreenProps> = ({
  onGoToMainMenu,
  solvedCount,
  failedCount,
  overloadPercent,
  decisions,
  isAlternativeFailure = false
}) => {
  const [showFailureMode, setShowFailureMode] = useState(isAlternativeFailure);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    sounds.playSuccess();
    const summary = `🏥 OVERLOAD ŞEHİR HASTANESİ NÖBET RAPORU\nDurum: ${
      showFailureMode ? 'SİSTEM AŞIRI YÜKLENDİ' : 'İYİ NÖBET!'
    }\nÇözülen: ${solvedCount} | Patlayan: ${failedCount} | Yük: %${Math.round(overloadPercent)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="flex flex-col w-full relative pb-6 select-none">
      {/* Top Victory & Status Card */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        {/* Shift Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd23f] text-[#3d2f00] border-[2px] border-[#0b1220] rounded-full brutal-shadow-sm mb-3">
          <span className="material-symbols-outlined text-[16px] text-[#3d2f00] font-bold">
            timer
          </span>
          <span className="font-rubik text-[10px] uppercase tracking-wider font-extrabold">
            NÖBET BİTTİ · 17:00
          </span>
        </div>

        {/* Big Arcade Title */}
        <div className="relative mb-1">
          <h2
            className={`font-arcade text-[34px] leading-tight tracking-wider drop-shadow-[3px_3px_0_#030f1b] ${
              showFailureMode ? 'text-[#ff5263]' : 'text-[#3fe0c5]'
            }`}
          >
            {showFailureMode ? 'AŞIRI YÜKLENDİ!' : 'İYİ NÖBET!'}
          </h2>
        </div>

        {/* Subtitle / Alternative Preview Tag (interactive toggle) */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowFailureMode(!showFailureMode);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1e2b38] border-[2px] border-[#0b1220] brutal-shadow-sm mb-3 cursor-pointer hover:bg-[#293643] transition-colors"
          title="Durumlar arasında geçiş yap"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              showFailureMode ? 'bg-[#3fe0c5]' : 'bg-[#ff5263] animate-ping'
            }`}
          ></span>
          <span
            className={`font-rubik text-[10px] font-bold tracking-tight ${
              showFailureMode ? 'text-[#3fe0c5]' : 'text-[#ff5263]'
            }`}
          >
            {showFailureMode
              ? '(Alternatif Durum: BAŞARILI NÖBET)'
              : '(Alternatif Durum: SİSTEM AŞIRI YÜKLENDİ)'}
          </span>
        </button>

        {/* Debrief Narrative */}
        <p className="font-rubik text-xs text-[#fff2d7] max-w-[310px] text-center leading-snug">
          {showFailureMode
            ? 'Kuyruklar taşma eşiğini aştı, acil servis ağ geçidi zaman aşımına uğradı. Nöbet kurtarılamadı.'
            : 'Vardiya bitti. Üç ana çağrı da kapandı, sistem ayakta, hasta verisi güvende.'}
        </p>
      </div>

      {/* Telemetry Bar / Mini Stats Ticker */}
      <div className="bg-[#101d29] border-[2px] border-[#0b1220] p-2.5 rounded-xl brutal-shadow flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#3fe0c5] text-[18px]">verified</span>
          <span className="font-rubik text-[10px] font-bold text-[#d6e4f5]">Çözülen:</span>
          <span className="px-1.5 py-0.5 bg-[#3fe0c5] text-[#00382f] rounded font-arcade text-[10px] border border-[#0b1220]">
            {solvedCount}
          </span>
        </div>
        <div className="w-px h-4 bg-[#293643]"></div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#ff5263] text-[18px]">dangerous</span>
          <span className="font-rubik text-[10px] font-bold text-[#d6e4f5]">Patlayan:</span>
          <span className="px-1.5 py-0.5 bg-[#ff5263] text-white rounded font-arcade text-[10px] border border-[#0b1220]">
            {failedCount}
          </span>
        </div>
        <div className="w-px h-4 bg-[#293643]"></div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#ffd23f] text-[18px]">speed</span>
          <span className="font-rubik text-[10px] font-bold text-[#d6e4f5]">Yük:</span>
          <span className="px-1.5 py-0.5 bg-[#ffd23f] text-[#3d2f00] rounded font-arcade text-[10px] border border-[#0b1220]">
            %{Math.round(overloadPercent)}
          </span>
        </div>
      </div>

      {/* Primary Mission Objective Container */}
      <div className="bg-[#1e2b38] border-[3px] border-[#0b1220] rounded-xl p-3 brutal-shadow-lg flex items-center justify-between mb-5 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#030f1b] border-[2px] border-[#0b1220] flex items-center justify-center shrink-0 brutal-shadow-sm">
            <span className="material-symbols-outlined text-[#3fe0c5] text-[20px]">flag</span>
          </div>
          <div className="flex flex-col">
            <span className="font-rubik text-[10px] font-bold uppercase text-[#3fe0c5] tracking-wider">
              GÖREV ANALİZİ
            </span>
            <span className="font-rubik text-sm text-[#fff2d7] font-bold">
              {showFailureMode ? 'Hedef: Başarısız - Kritik Eşik Aşıldı' : 'Hedefin: Sistemi ayakta tutmak'}
            </span>
          </div>
        </div>
        <span
          className={`font-arcade text-[24px] drop-shadow-[2px_2px_0_#030f1b] ${
            showFailureMode ? 'text-[#ff5263]' : 'text-[#3fe0c5]'
          }`}
        >
          {showFailureMode ? '✖' : '✔'}
        </span>
      </div>

      {/* Decisions History Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col">
          <span className="font-arcade text-base text-[#fff2d7] tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#3fe0c5] inline-block rounded-xs"></span>
            KARARLARIN
          </span>
          <div className="w-24 h-1 bg-[#3fe0c5] rounded-full mt-0.5"></div>
        </div>
        <span className="font-rubik text-[10px] text-[#9db4c6] font-bold uppercase">
          {decisions.length} Kayıt / 1 Gün
        </span>
      </div>

      {/* Decision Log Stack */}
      <div className="flex flex-col gap-3 mb-6">
        {decisions.map((item) => (
          <div
            key={item.id}
            className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg p-3.5 relative overflow-hidden flex flex-col gap-2"
          >
            {/* Left Accent Bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-2 ${
                item.success ? 'bg-[#3fe0c5]' : 'bg-[#ff5263]'
              }`}
            ></div>

            <div className="flex items-start justify-between gap-2 pl-2">
              <span
                className={`font-rubik text-xs font-bold leading-tight ${
                  item.success ? 'text-[#fff2d7]' : 'text-[#ff5263]'
                }`}
              >
                {item.title}
              </span>
              <span
                className={`shrink-0 px-2 py-0.5 rounded font-rubik text-[10px] font-bold border border-[#0b1220] brutal-shadow-sm ${
                  item.success
                    ? 'bg-[#3fe0c5] text-[#00382f]'
                    : 'bg-[#ff5263] text-white'
                }`}
              >
                {item.scoreOrDamage}
              </span>
            </div>

            <div className="pl-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#d6e4f5] font-rubik text-xs">
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    item.success ? 'text-[#3fe0c5]' : 'text-[#ff5263]'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.description}</span>
              </div>
              <p className="font-rubik text-[11px] text-[#9db4c6] italic pl-5">
                {item.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chunky Action Button & Footer Sublinks */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => {
            sounds.playClick();
            onGoToMainMenu();
          }}
          className="w-full h-14 bg-[#ffd23f] text-[#3d2f00] rounded-xl border-[3px] border-[#0b1220] font-arcade text-base tracking-wider uppercase flex items-center justify-center gap-2 brutal-shadow-btn brutal-btn-active transition-all cursor-pointer hover:bg-[#ffe089]"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          ANA MENÜ
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-[#9db4c6] hover:text-[#fff2d7] active:scale-95 transition-all py-1 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span className="font-rubik text-xs font-bold underline tracking-wide">
            Nöbet Raporunu Paylaş
          </span>
        </button>

        {shareToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#3fe0c5] text-[#00382f] px-4 py-2 rounded-lg border-[2px] border-[#0b1220] brutal-shadow font-rubik text-xs font-bold z-50 animate-bounce">
            ✔ Rapor panoya kopyalandı!
          </div>
        )}
      </div>
    </div>
  );
};
