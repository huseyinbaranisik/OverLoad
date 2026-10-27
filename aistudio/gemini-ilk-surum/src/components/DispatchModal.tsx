import React, { useState } from 'react';
import { Agent, Incident } from '../types';
import { sounds } from '../services/sound';

interface DispatchModalProps {
  incident: Incident;
  agents: Agent[];
  onDispatch: (agentId: string, incidentId: string) => void;
  onClose: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  incident,
  agents,
  onDispatch,
  onClose
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    agents.find((a) => a.status === 'HAZIR')?.id || agents[0]?.id || ''
  );

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  const handleConfirm = () => {
    if (!selectedAgent) return;
    sounds.playDispatch();
    onDispatch(selectedAgent.id, incident.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030f1b]/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-2xl brutal-shadow-lg w-full max-w-sm p-4 relative overflow-hidden flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-[2px] border-[#0b1220] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff5263] text-xl">
              crisis_alert
            </span>
            <span className="font-arcade text-sm text-[#fff2d7] uppercase">
              AJAN SEVK EMRİ
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

        {/* Incident Summary Card */}
        <div className="bg-[#101d29] border-[2px] border-[#0b1220] rounded-xl p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="bg-[#ff5263] text-white font-arcade text-[9px] px-2 py-0.5 rounded-full border border-[#0b1220]">
              {incident.severity}
            </span>
            <span className="font-rubik text-xs font-bold text-[#ffd23f]">
              ⏱ {incident.remainingTime} sn Kaldı
            </span>
          </div>
          <span className="font-rubik font-bold text-sm text-[#fff2d7]">
            {incident.title}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-rubik text-[#9db4c6]">
            <span>Hedef: <strong className="text-[#3fe0c5]">{incident.nodeName}</strong></span>
            <span>·</span>
            <span>Gerekli: <strong className="text-[#3fe0c5]">{incident.requirements.label1} {incident.requirements.value1}</strong>, <strong className="text-[#ffd23f]">{incident.requirements.label2} {incident.requirements.value2}</strong></span>
          </div>
        </div>

        {/* Agent Picker List */}
        <div className="flex flex-col gap-2">
          <span className="font-rubik text-xs font-bold text-[#d6e4f5]">
            Müdahale Edecek Ajanı Seç:
          </span>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {agents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              const isAvailable = agent.status === 'HAZIR';

              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedAgentId(agent.id);
                  }}
                  className={`p-2 rounded-xl border-[2px] flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1e2b38] border-[#3fe0c5] brutal-shadow-sm'
                      : 'bg-[#101d29] border-[#0b1220] hover:bg-[#14212d]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full bg-[#f5ecd7] border border-[#0b1220] flex items-center justify-center font-arcade text-xs font-bold shrink-0"
                      style={{ color: agent.color }}
                    >
                      {agent.avatarChar ? (
                        agent.avatarChar
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          {agent.materialIcon}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-rubik font-bold text-xs text-[#fff2d7]">
                        {agent.name}
                      </span>
                      <span className="font-rubik text-[9px] text-[#9db4c6]">
                        {agent.roleDescription}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-rubik text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#0b1220] ${
                      agent.status === 'HAZIR'
                        ? 'bg-[#5fe39a] text-[#00382f]'
                        : 'bg-[#293643] text-[#9db4c6]'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#293643] border-[2px] border-[#0b1220] text-[#d6e4f5] font-rubik text-xs font-bold hover:bg-[#1e2b38] cursor-pointer"
          >
            İptal
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#ffd23f] border-[2px] border-[#0b1220] text-[#3d2f00] font-arcade text-xs uppercase tracking-wider brutal-shadow-sm active:translate-y-0.5 cursor-pointer hover:bg-[#ffe089]"
          >
            SEVK ET
          </button>
        </div>
      </div>
    </div>
  );
};
