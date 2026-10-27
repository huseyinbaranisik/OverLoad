import React from 'react';
import { sounds } from '../services/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030f1b]/85 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-2xl brutal-shadow-lg w-full max-w-sm max-h-[85vh] overflow-y-auto p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2px] border-[#0b1220] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3fe0c5] text-xl">
              help
            </span>
            <span className="font-arcade text-sm text-[#fff2d7] uppercase">
              NASIL OYNANIR?
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

        {/* Instructions Content */}
        <div className="flex flex-col gap-3 text-xs font-rubik text-[#d6e4f5]">
          <div className="bg-[#101d29] border border-[#0b1220] rounded-xl p-3 flex flex-col gap-1.5">
            <span className="font-arcade text-[11px] text-[#ffd23f]">
              1. HEDEF: SİSTEMİ AYAKTA TUT
            </span>
            <p className="text-[11px] text-[#9db4c6] leading-relaxed">
              Şehir hastanesinin 7 kritik mikroservisinde beklenmedik siber saldırılar ve kuyruk kilitlenmeleri patlak verir. Overload göstergesi %100'e ulaşmadan saat 17:00 nöbet sonuna kadar sistemi ayakta tut!
            </p>
          </div>

          <div className="bg-[#101d29] border border-[#0b1220] rounded-xl p-3 flex flex-col gap-1.5">
            <span className="font-arcade text-[11px] text-[#3fe0c5]">
              2. 5 AI OPERATÖRÜ SEVK ET
            </span>
            <p className="text-[11px] text-[#9db4c6] leading-relaxed">
              Krizin gereksinimlerine (Güvenlik, Hız, Mimari, Veritabanı) uygun ajanı seç ve "MÜDAHALE" et:
            </p>
            <ul className="list-disc pl-4 text-[10px] space-y-1 text-[#fff2d7]">
              <li><strong className="text-[#d97757]">Claude:</strong> Mimari analiz & güvenli rollback ustası</li>
              <li><strong className="text-[#8f7cf6]">Gemini:</strong> Multimodal log tarama & anlık hızlı müdahale</li>
              <li><strong className="text-[#10a37f]">GPT:</strong> Genel API entegrasyon & yama yöneticisi</li>
              <li><strong className="text-[#3b82f6]">Llama:</strong> Yerel veri izolasyonu & şifreleme kalkanı</li>
              <li><strong className="text-[#ffaf00]">Mistral:</strong> Uç sunucu filtreleme & hafif hız</li>
            </ul>
          </div>

          <div className="bg-[#101d29] border border-[#0b1220] rounded-xl p-3 flex flex-col gap-1.5">
            <span className="font-arcade text-[11px] text-[#ff5263]">
              3. MİMARİ DİLEMMALAR
            </span>
            <p className="text-[11px] text-[#9db4c6] leading-relaxed">
              Kritik uyarılar çıktığında doğru yazılım mühendisliği kararını ver. Bilinen çalışan sürüme geri dönmek (Rollback) hayat kurtarır!
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-[#ffd23f] text-[#3d2f00] font-arcade text-xs uppercase tracking-wider border-[2px] border-[#0b1220] brutal-shadow-sm active:translate-y-0.5 cursor-pointer mt-1 hover:bg-[#ffe089]"
        >
          ANLAŞILDI, GÖREVE BAŞLA!
        </button>
      </div>
    </div>
  );
};
