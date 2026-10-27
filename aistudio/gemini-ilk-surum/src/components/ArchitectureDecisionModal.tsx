import React from 'react';
import { DecisionRecord } from '../types';
import { sounds } from '../services/sound';

interface ArchitectureDecisionModalProps {
  onSelectOption: (decision: DecisionRecord, overloadDelta: number) => void;
  onClose: () => void;
}

export const ArchitectureDecisionModal: React.FC<ArchitectureDecisionModalProps> = ({
  onSelectOption,
  onClose
}) => {
  const handleChoice = (
    title: string,
    type: DecisionRecord['type'],
    success: boolean,
    scoreOrDamage: string,
    description: string,
    reason: string,
    icon: string,
    overloadDelta: number
  ) => {
    if (success) {
      sounds.playSuccess();
    } else {
      sounds.playFailure();
    }

    const decision: DecisionRecord = {
      id: `dec-${Date.now()}`,
      title,
      type,
      success,
      scoreOrDamage,
      description,
      reason,
      timestamp: '14:20',
      icon
    };

    onSelectOption(decision, overloadDelta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030f1b]/85 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-2xl brutal-shadow-lg w-full max-w-sm p-4 relative overflow-hidden flex flex-col gap-3">
        {/* Urgent Header */}
        <div className="flex items-center justify-between border-b-[2px] border-[#0b1220] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffd23f] text-2xl animate-pulse">
              warning
            </span>
            <div>
              <span className="font-arcade text-sm text-[#ffd23f] uppercase block leading-tight">
                MİMARİ DİLEMMA
              </span>
              <span className="font-rubik text-[10px] text-[#9db4c6] uppercase">
                Acil Mühendislik Kararı
              </span>
            </div>
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

        {/* Incident Context */}
        <div className="bg-[#101d29] border-[2px] border-[#0b1220] rounded-xl p-3 flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1 text-[10px] text-[#ff5263] font-arcade">
            <span>⚠</span>
            <span>KRİTİK KRİZ: ÖDEME & HASTA GİRİŞİ TIKANDI</span>
          </div>
          <p className="font-rubik text-xs text-[#fff2d7] leading-relaxed">
            Banka API zaman aşımına uğruyor ve kuyrukta 142 hasta bekliyor. Veritabanı bağlantı havuzu %92 dolu.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {/* Option 1: Rollback */}
          <button
            onClick={() =>
              handleChoice(
                'KARAR · MİMARİ · Eski sürüme geri dön',
                'MİMARİ',
                true,
                'BAŞARILI · +15 Puan',
                'Sistem eski kararlı sürüme çekildi, API istekleri normale döndü.',
                'Neden: Geri almak seni bilinen, çalışan bir duruma götürür.',
                'update',
                -10
              )
            }
            className="p-2.5 rounded-xl bg-[#1e2b38] hover:bg-[#293643] border-[2px] border-[#0b1220] brutal-shadow-sm flex flex-col items-start text-left cursor-pointer transition-all active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-rubik font-bold text-xs text-[#3fe0c5]">
                [A] Eski Sürüme Geri Dön (Rollback)
              </span>
              <span className="font-rubik text-[9px] bg-[#3fe0c5] text-[#00382f] px-1.5 py-0.2 rounded font-bold">
                -10% Yük
              </span>
            </div>
            <p className="font-rubik text-[10px] text-[#9db4c6] mt-1">
              En son deploy edilen hatalı yamayı geri al. Güvenli ve test edilmiş mimariye dön.
            </p>
          </button>

          {/* Option 2: Rate Limiting & Captcha */}
          <button
            onClick={() =>
              handleChoice(
                'KARAR · GÜVENLİK · IP Bloklama & Captcha',
                'GÜVENLİK',
                true,
                'BAŞARILI · +20 Puan',
                'Botnet trafiği %98 oranında kesildi, kuyruk ferahladı.',
                'Neden: Saniyede 4000 geçersiz giriş tespit edildi.',
                'security',
                -15
              )
            }
            className="p-2.5 rounded-xl bg-[#1e2b38] hover:bg-[#293643] border-[2px] border-[#0b1220] brutal-shadow-sm flex flex-col items-start text-left cursor-pointer transition-all active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-rubik font-bold text-xs text-[#ffd23f]">
                [B] IP Bloklama & Captcha Devreye Al
              </span>
              <span className="font-rubik text-[9px] bg-[#ffd23f] text-[#3d2f00] px-1.5 py-0.2 rounded font-bold">
                -15% Yük
              </span>
            </div>
            <p className="font-rubik text-[10px] text-[#9db4c6] mt-1">
              Geçersiz girişleri uç noktada filtrele, gerçek hastaları korumaya al.
            </p>
          </button>

          {/* Option 3: Risky In-place Hotfix */}
          <button
            onClick={() =>
              handleChoice(
                'PATLADI · Canlıda Hızlı Yama Yapıldı',
                'PATLADI',
                false,
                'HASAR: %12 Aşırı Yük',
                'Canlı sunucuda yapılan düzeltme deadlock oluşturdu!',
                'Neden: Yetersiz kuyruk ölçekleme ve kontrolsüz müdahale.',
                'warning',
                12
              )
            }
            className="p-2.5 rounded-xl bg-[#1e2b38] hover:bg-[#293643] border-[2px] border-[#0b1220] brutal-shadow-sm flex flex-col items-start text-left cursor-pointer transition-all active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-rubik font-bold text-xs text-[#ff5263]">
                [C] Canlı Ortamda Hızlı Kod Yaması Yap
              </span>
              <span className="font-rubik text-[9px] bg-[#ff5263] text-white px-1.5 py-0.2 rounded font-bold">
                Yüksek Risk
              </span>
            </div>
            <p className="font-rubik text-[10px] text-[#9db4c6] mt-1">
              Doğrudan prod sunucu kodunu düzeltmeye çalış. Riskli ve kilitlenme yaratabilir.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
