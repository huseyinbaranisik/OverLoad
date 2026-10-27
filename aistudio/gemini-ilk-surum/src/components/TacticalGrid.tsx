import React, { useState } from 'react';
import { Agent, BuildingNode, Incident, BuildingNodeId } from '../types';
import { sounds } from '../services/sound';

interface TacticalGridProps {
  overloadPercent: number;
  shiftTime: string;
  mainTasksCompleted: number;
  solvedCount: number;
  failedCount: number;
  agents: Agent[];
  buildings: BuildingNode[];
  activeIncident: Incident | null;
  onDispatchAgent: (agentId: string, incidentId: string) => void;
  onOpenDispatchModal: () => void;
  onTriggerDecisionDilemma: () => void;
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

export const TacticalGrid: React.FC<TacticalGridProps> = ({
  overloadPercent,
  shiftTime,
  mainTasksCompleted,
  solvedCount,
  agents,
  buildings,
  activeIncident,
  onDispatchAgent,
  onOpenDispatchModal,
  onTriggerDecisionDilemma,
  selectedAgentId,
  onSelectAgent
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<BuildingNodeId | null>(null);

  // Selected node info
  const selectedNode = buildings.find((b) => b.id === selectedNodeId);

  // Agent target paths mapping for dynamic SVG rendering
  // Hastane center is at (188, 168)
  const getNodeCoordinates = (id: BuildingNodeId): { x: number; y: number } => {
    switch (id) {
      case 'randevu':
        return { x: 68, y: 84 };
      case 'odeme':
        return { x: 184, y: 84 };
      case 'bildirim':
        return { x: 288, y: 84 };
      case 'laboratuvar':
        return { x: 68, y: 172 };
      case 'hastane':
        return { x: 188, y: 168 };
      case 'hasta_kayit':
        return { x: 288, y: 172 };
      case 'veritabani':
        return { x: 68, y: 260 };
      default:
        return { x: 188, y: 168 };
    }
  };

  const activePathDestination = activeIncident
    ? getNodeCoordinates(activeIncident.nodeId)
    : getNodeCoordinates('randevu');

  return (
    <div className="flex flex-col w-full pb-4 select-none">
      {/* TOP TELEMETRY HUD */}
      <section className="w-full bg-[#1a3247] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg p-2.5 mb-3 flex flex-col gap-2">
        {/* Row 1: Overload Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-[#3fe0c5] text-[20px] animate-pulse">
              bolt
            </span>
            <span className="font-arcade text-[#3fe0c5] text-sm tracking-wide leading-none">
              OVERLOAD
            </span>
          </div>

          {/* Thick Segmented / Caution Striped Progress Bar */}
          <div className="flex-1 h-5 bg-[#0b1220] border-[2px] border-[#0b1220] rounded-md overflow-hidden relative flex items-center p-0.5">
            <div
              className={`h-full rounded-sm relative overflow-hidden transition-all duration-300 ${
                overloadPercent > 80 ? 'bg-[#ff5263]' : overloadPercent > 60 ? 'bg-[#ff8a3d]' : 'bg-[#edc22e]'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, overloadPercent))}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2) 6px, transparent 6px, transparent 12px)'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
              <span className="font-rubik font-extrabold text-[11px] text-[#fff2d7] drop-shadow-[0_1px_2px_#0b1220]">
                %{Math.round(overloadPercent)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playAlert();
              onTriggerDecisionDilemma();
            }}
            className="cursor-pointer active:scale-95 transition-transform"
            title="Mimari Kriz Dilemması Başlat"
          >
            <span className="material-symbols-outlined text-[#ff5263] text-[20px] shrink-0 animate-bounce">
              warning
            </span>
          </button>
        </div>

        {/* Row 2: Clock & Live Task Telemetry */}
        <div className="flex items-center justify-between">
          <div className="bg-[#ffd23f] text-[#3d2f00] border-[2px] border-[#0b1220] brutal-shadow-sm px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">alarm</span>
            <span className="font-rubik font-extrabold text-xs tracking-wider">
              {shiftTime}
            </span>
          </div>

          <div className="flex items-center gap-2 font-rubik text-xs font-semibold text-[#fff2d7]">
            <span className="bg-[#14212d] border-[2px] border-[#0b1220] px-2 py-0.5 rounded text-[#3fe0c5]">
              Ana görev {mainTasksCompleted}/3
            </span>
            <span className="text-[#9db4c6] text-[11px]">·</span>
            <span className="text-[#5fe39a] font-bold">Çözülen {solvedCount}</span>
          </div>
        </div>
      </section>

      {/* MAIN OBLIQUE TACTICAL CITY MAP */}
      <section className="relative w-full h-[330px] bg-[#0f2a24] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg overflow-hidden mb-3">
        {/* CRT Grid Scanline / Mesh Underlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundSize: '24px 24px',
            backgroundImage:
              'linear-gradient(to right, #3fe0c5 1px, transparent 1px), linear-gradient(to bottom, #3fe0c5 1px, transparent 1px)'
          }}
        ></div>

        {/* Asphalt Road System */}
        {/* Horizontal Roads */}
        <div className="absolute left-0 top-[102px] w-full h-7 bg-[#081412] border-y-[2px] border-[#0b1220]/60 flex items-center">
          <div className="w-full border-t border-dashed border-[#5fe39a]/30 h-0"></div>
        </div>
        <div className="absolute left-0 top-[214px] w-full h-7 bg-[#081412] border-y-[2px] border-[#0b1220]/60 flex items-center">
          <div className="w-full border-t border-dashed border-[#5fe39a]/30 h-0"></div>
        </div>

        {/* Vertical Roads */}
        <div className="absolute top-0 left-[110px] h-full w-7 bg-[#081412] border-x-[2px] border-[#0b1220]/60 flex justify-center">
          <div className="h-full border-l border-dashed border-[#5fe39a]/30 w-0"></div>
        </div>
        <div className="absolute top-0 left-[236px] h-full w-7 bg-[#081412] border-x-[2px] border-[#0b1220]/60 flex justify-center">
          <div className="h-full border-l border-dashed border-[#5fe39a]/30 w-0"></div>
        </div>

        {/* AGENT DISPATCH GLOW PATH (Hastane -> Target Incident Node) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
          <path
            className="animate-pulse"
            d={`M 188 168 L 188 116 L ${activePathDestination.x} 116 L ${activePathDestination.x} ${activePathDestination.y}`}
            fill="none"
            stroke="#8f7cf6"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle
            cx={activePathDestination.x}
            cy={activePathDestination.y}
            fill="#8f7cf6"
            r="5"
            stroke="#0b1220"
            strokeWidth="2"
          />
        </svg>

        {/* ISOMETRIC/OBLIQUE BUILDINGS */}
        {/* 1. Node: Randevu (Active Critical Incident) */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'randevu' ? null : 'randevu');
          }}
          className={`absolute left-3 top-4 w-[88px] h-[72px] cursor-pointer transition-transform ${
            selectedNodeId === 'randevu' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="absolute -bottom-1 left-2 w-full h-4 bg-[#0b1220]/50 rounded-md"></div>
          <div className="relative w-full h-full">
            <div className="w-full h-9 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center shadow-inner relative z-10">
              <span className="font-arcade text-[9px] text-[#0b1220] tracking-tighter uppercase px-1 truncate">
                Randevu
              </span>
            </div>
            <div className="w-[68%] h-7 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left flex items-center justify-around px-1">
              <div className="w-2.5 h-3 bg-[#081412] rounded-xs border border-[#0b1220]"></div>
              <div className="w-2.5 h-3 bg-[#081412] rounded-xs border border-[#0b1220]"></div>
            </div>
            <div className="w-[32%] h-7 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
          </div>

          {/* Critical Outbreak Indicator (URGENT PULSING BLINK) */}
          <div className="absolute -top-3 -right-2 z-20 flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full bg-[#ff5263]/40 animate-ping"></div>
            <div className="relative w-9 h-9 rounded-full bg-[#0b1220] border-[2px] border-[#ffd23f] flex items-center justify-center brutal-shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#ff5263] border-[2px] border-[#0b1220] flex items-center justify-center animate-bounce">
                <span className="font-arcade text-xs text-white leading-none">!!</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Node: Ödeme */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'odeme' ? null : 'odeme');
          }}
          className={`absolute left-[142px] top-4 w-[84px] h-[72px] cursor-pointer transition-transform ${
            selectedNodeId === 'odeme' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="w-full h-9 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center">
            <span className="font-arcade text-[9px] text-[#0b1220] tracking-tighter uppercase">Ödeme</span>
          </div>
          <div className="w-[70%] h-7 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left flex items-center justify-center">
            <div className="w-4 h-3 bg-[#081412]"></div>
          </div>
          <div className="w-[30%] h-7 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
        </div>

        {/* 3. Node: Bildirim (Orange Incident: Agent on site) */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'bildirim' ? null : 'bildirim');
          }}
          className={`absolute right-3 top-4 w-[84px] h-[72px] cursor-pointer transition-transform ${
            selectedNodeId === 'bildirim' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="w-full h-9 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center">
            <span className="font-arcade text-[9px] text-[#0b1220] tracking-tighter uppercase">Bildirim</span>
          </div>
          <div className="w-[70%] h-7 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left"></div>
          <div className="w-[30%] h-7 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
          {/* Orange Decision Waiting Marker */}
          <div className="absolute -top-2 -left-2 z-20">
            <div className="w-8 h-8 rounded-full bg-[#ff8a3d] border-[3px] border-[#0b1220] brutal-shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">engineering</span>
            </div>
          </div>
        </div>

        {/* 4. Node: Laboratuvar */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'laboratuvar' ? null : 'laboratuvar');
          }}
          className={`absolute left-3 top-[138px] w-[88px] h-[68px] cursor-pointer transition-transform ${
            selectedNodeId === 'laboratuvar' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="w-full h-9 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center">
            <span className="font-arcade text-[8px] text-[#0b1220] tracking-tighter uppercase">Laboratuvar</span>
          </div>
          <div className="w-[70%] h-6 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left"></div>
          <div className="w-[30%] h-6 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
        </div>

        {/* 5. Node: HASTANE (Central Command Complex - Larger) */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'hastane' ? null : 'hastane');
          }}
          className={`absolute left-[134px] top-[130px] w-[98px] h-[82px] z-10 cursor-pointer transition-transform ${
            selectedNodeId === 'hastane' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg' : ''
          }`}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff5263] border-[2px] border-[#0b1220] w-6 h-6 rounded-md flex items-center justify-center brutal-shadow-sm z-20">
            <span className="material-symbols-outlined text-white text-[16px] leading-none">
              local_hospital
            </span>
          </div>
          <div className="w-full h-11 bg-[#6ee7b7] border-[3px] border-[#0b1220] rounded-t-md flex items-end justify-center pb-1">
            <span className="font-arcade text-[10px] text-[#0b1220] tracking-wider uppercase font-black">
              HASTANE
            </span>
          </div>
          <div className="w-[68%] h-8 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left flex items-center justify-around px-1">
            <div className="w-3 h-4 bg-[#ffd23f] border border-[#0b1220]"></div>
            <div className="w-3 h-4 bg-[#ffd23f] border border-[#0b1220]"></div>
          </div>
          <div className="w-[32%] h-8 bg-[#047857] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
        </div>

        {/* 6. Node: Hasta Kayıt (Secondary Crisis) */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'hasta_kayit' ? null : 'hasta_kayit');
          }}
          className={`absolute right-3 top-[138px] w-[84px] h-[68px] cursor-pointer transition-transform ${
            selectedNodeId === 'hasta_kayit' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="w-full h-9 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center">
            <span className="font-arcade text-[8px] text-[#0b1220] tracking-tighter uppercase px-0.5">
              Hasta Kayıt
            </span>
          </div>
          <div className="w-[70%] h-6 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left"></div>
          <div className="w-[30%] h-6 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
          <div className="absolute -top-2.5 -right-1 z-20">
            <div className="w-6 h-6 rounded-full bg-[#ff5263] border-[2px] border-[#0b1220] flex items-center justify-center brutal-shadow-sm">
              <span className="font-arcade text-[9px] text-white">!</span>
            </div>
          </div>
        </div>

        {/* 7. Node: Veritabanı */}
        <div
          onClick={() => {
            sounds.playClick();
            setSelectedNodeId(selectedNodeId === 'veritabani' ? null : 'veritabani');
          }}
          className={`absolute left-3 bottom-5 w-[88px] h-[64px] cursor-pointer transition-transform ${
            selectedNodeId === 'veritabani' ? 'scale-105 ring-2 ring-[#ffd23f] rounded-lg z-30' : ''
          }`}
        >
          <div className="w-full h-8 bg-[#34d399] border-[3px] border-[#0b1220] rounded-t-sm flex items-center justify-center">
            <span className="font-arcade text-[8px] text-[#0b1220] tracking-tighter uppercase">
              Veritabanı
            </span>
          </div>
          <div className="w-[70%] h-6 bg-[#10b981] border-x-[3px] border-b-[3px] border-[#0b1220] float-left"></div>
          <div className="w-[30%] h-6 bg-[#059669] border-r-[3px] border-b-[3px] border-[#0b1220] float-right"></div>
        </div>

        {/* Dynamic Tactical Toast Speech-Bubble */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[92%] z-30">
          <div className="relative bg-[#f5ecd7] border-[3px] border-[#0b1220] rounded-lg brutal-shadow px-3 py-1.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff5263] text-[18px] shrink-0 animate-pulse">
              crisis_alert
            </span>
            <span className="font-rubik font-bold text-xs text-[#0b1220] truncate">
              {activeIncident
                ? `⚠ Siber saldırı: ${activeIncident.title}`
                : 'Tüm sektörler stabil. Telemetri izleniyor.'}
            </span>
            {/* Comic pointer */}
            <div className="absolute -top-2 left-6 w-0 h-0 border-x-4 border-x-transparent border-b-[8px] border-b-[#0b1220]"></div>
            <div className="absolute -top-1 left-6 w-0 h-0 border-x-4 border-x-transparent border-b-[7px] border-b-[#f5ecd7]"></div>
          </div>
        </div>
      </section>

      {/* Selected Node Details Bar (if tapped) */}
      {selectedNode && (
        <div className="w-full bg-[#1e2b38] border-[2px] border-[#0b1220] rounded-lg p-2.5 mb-3 brutal-shadow flex items-center justify-between animate-fadeIn">
          <div className="flex flex-col">
            <span className="font-arcade text-xs text-[#ffd23f] uppercase">
              {selectedNode.displayName}
            </span>
            <span className="font-rubik text-[11px] text-[#d6e4f5]">
              {selectedNode.description}
            </span>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="w-6 h-6 rounded bg-[#293643] border border-[#0b1220] text-xs font-bold text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* INCIDENT STRIP BELOW MAP */}
      {activeIncident && (
        <section className="w-full bg-[#1a3247] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg p-2.5 mb-3 flex flex-col gap-2">
          {/* Header with Severity & Time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="bg-[#ff5263] text-white font-arcade text-[10px] px-2 py-0.5 rounded-full border-[2px] border-[#0b1220] shrink-0">
                {activeIncident.severity}
              </span>
              <span className="font-rubik font-extrabold text-sm text-[#ff5263] truncate">
                {activeIncident.title}
              </span>
              <span className="text-[#fff2d7]/70 text-xs shrink-0">· {activeIncident.nodeName}</span>
            </div>
            <div className="bg-[#ffd23f] text-[#3d2f00] border-[2px] border-[#0b1220] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <span className="text-xs">⏱</span>
              <span className="font-rubik font-black text-xs">{activeIncident.remainingTime} sn</span>
            </div>
          </div>

          {/* Requirements & Fast Intervention CTA */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-rubik text-[11px] font-bold text-[#fff2d7]">İhtiyaç:</span>
              <span className="bg-[#101d29] border-[2px] border-[#0b1220] text-[#3fe0c5] font-rubik font-bold text-[10px] px-2 py-0.5 rounded-md">
                {activeIncident.requirements.label1} {activeIncident.requirements.value1}
              </span>
              <span className="bg-[#101d29] border-[2px] border-[#0b1220] text-[#ffd23f] font-rubik font-bold text-[10px] px-2 py-0.5 rounded-md">
                {activeIncident.requirements.label2} {activeIncident.requirements.value2}
              </span>
            </div>

            {/* Quick Action Trigger */}
            <button
              onClick={() => {
                sounds.playDispatch();
                if (selectedAgentId) {
                  onDispatchAgent(selectedAgentId, activeIncident.id);
                } else {
                  onOpenDispatchModal();
                }
              }}
              className="bg-[#ffd23f] active:translate-y-0.5 text-[#3d2f00] font-arcade text-[11px] px-3 py-1 rounded-md border-[2px] border-[#0b1220] brutal-shadow-sm tracking-wide shrink-0 cursor-pointer hover:bg-[#ffe089]"
            >
              MÜDAHALE
            </button>
          </div>
        </section>
      )}

      {/* AGENT DISPATCH DECK (Comic Trading-Card Style) */}
      <section className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-arcade text-xs text-[#fff2d7] tracking-wider uppercase">
            AJAN SEVK HAVUZU
          </span>
          <span className="font-rubik text-[10px] text-[#3fe0c5] font-bold tracking-widest uppercase">
            {agents.filter((a) => a.status === 'HAZIR').length} / {agents.length} OPERATÖR
          </span>
        </div>

        {/* Horizontal Scrollable / Compact Deck */}
        <div className="w-full overflow-x-auto pb-1 flex gap-2 scrollbar-none">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            const isAvailable = agent.status === 'HAZIR';

            return (
              <div
                key={agent.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectAgent(isSelected ? null : agent.id);
                }}
                className={`min-w-[68px] flex-1 bg-[#22405a] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg flex flex-col overflow-hidden transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-[#3fe0c5] -translate-y-1' : 'active:translate-y-0.5'
                } ${!isAvailable && agent.status === 'MEŞGUL' ? 'opacity-60 bg-[#14212d]' : ''}`}
              >
                {/* Top color band */}
                <div
                  className="h-4 border-b-[2px] border-[#0b1220] flex items-center justify-center"
                  style={{ backgroundColor: agent.color }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                </div>

                {/* Card Body */}
                <div className="p-1.5 flex flex-col items-center gap-1">
                  {/* Cream Circle Avatar */}
                  <div
                    className="w-9 h-9 rounded-full bg-[#f5ecd7] border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-center font-arcade text-sm font-bold"
                    style={{ color: agent.color }}
                  >
                    {agent.avatarChar ? (
                      agent.avatarChar
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">
                        {agent.materialIcon}
                      </span>
                    )}
                  </div>

                  <span className="font-rubik font-bold text-[11px] text-[#fff2d7] leading-tight">
                    {agent.name}
                  </span>

                  {/* Status Pill */}
                  <span
                    className={`border border-[#0b1220] font-rubik font-extrabold text-[8px] px-1.5 py-0.2 rounded-full uppercase ${
                      agent.status === 'HAZIR'
                        ? 'bg-[#5fe39a] text-[#0b1220]'
                        : agent.status === 'YOLDA'
                        ? 'bg-[#3fe0c5] text-[#0b1220]'
                        : agent.status === 'SOĞUMADA'
                        ? 'bg-[#293643] text-[#d6e4f5]'
                        : 'bg-[#293643] text-[#9db4c6]'
                    }`}
                  >
                    {agent.status === 'SOĞUMADA' ? `${agent.cooldownSeconds} sn` : agent.status}
                  </span>

                  {/* Energy / Cooldown Bar */}
                  <div className="w-full h-1.5 bg-[#0b1220] rounded-full overflow-hidden mt-0.5 p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        agent.energyPercent < 30 ? 'bg-[#ff5263]' : 'bg-[#ffd23f]'
                      }`}
                      style={{ width: `${agent.energyPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
