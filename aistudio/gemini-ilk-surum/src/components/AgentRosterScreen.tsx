import React from 'react';
import { Agent } from '../types';
import { sounds } from '../services/sound';

interface AgentRosterScreenProps {
  agents: Agent[];
  onBoostAgent: (agentId: string) => void;
}

export const AgentRosterScreen: React.FC<AgentRosterScreenProps> = ({
  agents,
  onBoostAgent
}) => {
  return (
    <div className="flex flex-col w-full relative pb-6 select-none">
      {/* Roster Title */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col">
          <span className="font-arcade text-base text-[#fff2d7] tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#3fe0c5] inline-block rounded-xs"></span>
            AJAN KADROSU
          </span>
          <div className="w-28 h-1 bg-[#3fe0c5] rounded-full mt-0.5"></div>
        </div>
        <span className="font-rubik text-[10px] text-[#3fe0c5] font-bold uppercase tracking-wider">
          5 / 5 OPERATÖR AKTİF
        </span>
      </div>

      {/* Agents Card List */}
      <div className="flex flex-col gap-3 mb-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg p-3.5 relative overflow-hidden flex flex-col gap-2.5"
          >
            {/* Top Agent Identity Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Agent Avatar Circle */}
                <div
                  className="w-10 h-10 rounded-full bg-[#f5ecd7] border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-center font-arcade text-base font-bold shrink-0"
                  style={{ color: agent.color }}
                >
                  {agent.avatarChar ? (
                    agent.avatarChar
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">
                      {agent.materialIcon}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-rubik font-bold text-sm text-[#fff2d7]">
                      {agent.name}
                    </span>
                    <span className="font-rubik text-[9px] text-[#9db4c6] font-mono tracking-wider">
                      {agent.codename}
                    </span>
                  </div>
                  <span className="font-rubik text-[11px] text-[#3fe0c5] font-semibold">
                    {agent.roleDescription}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`border border-[#0b1220] font-rubik font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase brutal-shadow-sm ${
                    agent.status === 'HAZIR'
                      ? 'bg-[#5fe39a] text-[#0b1220]'
                      : agent.status === 'YOLDA'
                      ? 'bg-[#3fe0c5] text-[#0b1220]'
                      : agent.status === 'SOĞUMADA'
                      ? 'bg-[#ffd23f] text-[#3d2f00]'
                      : 'bg-[#ff8a3d] text-[#0b1220]'
                  }`}
                >
                  {agent.status === 'SOĞUMADA' ? `${agent.cooldownSeconds} sn Kaldı` : agent.status}
                </span>

                {agent.status === 'SOĞUMADA' && (
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      onBoostAgent(agent.id);
                    }}
                    className="text-[9px] font-rubik font-bold text-[#ffd23f] underline hover:text-white cursor-pointer"
                  >
                    Hızlı Soğut
                  </button>
                )}
              </div>
            </div>

            {/* Special Ability Pill */}
            <div className="bg-[#101d29] border border-[#0b1220] rounded-lg p-2 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[#ffd23f] text-[16px]">
                bolt
              </span>
              <span className="font-rubik text-[11px] text-[#fff2d7]">
                <strong className="text-[#ffd23f]">Yetenek:</strong> {agent.specialAbility}
              </span>
            </div>

            {/* Stats Bars (Güvenlik, Hız, Mimari, Veritabanı) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[10px] font-rubik text-[#9db4c6] font-bold mb-0.5">
                  <span>Güvenlik</span>
                  <span className="text-[#fff2d7]">{agent.stats.security}/5</span>
                </div>
                <div className="h-1.5 bg-[#0b1220] rounded-full overflow-hidden p-[1px]">
                  <div
                    className="h-full bg-[#5fe39a] rounded-full"
                    style={{ width: `${(agent.stats.security / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-rubik text-[#9db4c6] font-bold mb-0.5">
                  <span>Hız</span>
                  <span className="text-[#fff2d7]">{agent.stats.speed}/5</span>
                </div>
                <div className="h-1.5 bg-[#0b1220] rounded-full overflow-hidden p-[1px]">
                  <div
                    className="h-full bg-[#3fe0c5] rounded-full"
                    style={{ width: `${(agent.stats.speed / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-rubik text-[#9db4c6] font-bold mb-0.5">
                  <span>Mimari</span>
                  <span className="text-[#fff2d7]">{agent.stats.architecture}/5</span>
                </div>
                <div className="h-1.5 bg-[#0b1220] rounded-full overflow-hidden p-[1px]">
                  <div
                    className="h-full bg-[#ffd23f] rounded-full"
                    style={{ width: `${(agent.stats.architecture / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-rubik text-[#9db4c6] font-bold mb-0.5">
                  <span>Veritabanı</span>
                  <span className="text-[#fff2d7]">{agent.stats.database}/5</span>
                </div>
                <div className="h-1.5 bg-[#0b1220] rounded-full overflow-hidden p-[1px]">
                  <div
                    className="h-full bg-[#8f7cf6] rounded-full"
                    style={{ width: `${(agent.stats.database / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <p className="font-rubik text-[11px] text-[#9db4c6] italic border-t border-[#1e2b38] pt-1.5">
              "{agent.quote}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
