import React, { useState } from 'react';
import { BuildingNode } from '../types';
import { sounds } from '../services/sound';

interface SystemTelemetryScreenProps {
  buildings: BuildingNode[];
  overloadPercent: number;
  onOptimizeNode: (nodeId: string) => void;
}

export const SystemTelemetryScreen: React.FC<SystemTelemetryScreenProps> = ({
  buildings,
  overloadPercent,
  onOptimizeNode
}) => {
  const [circuitBreaker, setCircuitBreaker] = useState(true);
  const [autoScale, setAutoScale] = useState(true);
  const [rateLimiter, setRateLimiter] = useState(false);
  const [cacheBypass, setCacheBypass] = useState(false);

  return (
    <div className="flex flex-col w-full relative pb-6 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col">
          <span className="font-arcade text-base text-[#fff2d7] tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#3fe0c5] inline-block rounded-xs"></span>
            SİSTEM MİMARİSİ
          </span>
          <div className="w-28 h-1 bg-[#3fe0c5] rounded-full mt-0.5"></div>
        </div>
        <span className="font-rubik text-[10px] text-[#3fe0c5] font-bold uppercase tracking-wider">
          TELEMETRİ V4.2
        </span>
      </div>

      {/* Cluster Health Summary */}
      <div className="bg-[#14212d] border-[3px] border-[#0b1220] rounded-xl brutal-shadow-lg p-3.5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-arcade text-xs text-[#fff2d7] uppercase">
            KÜME SAĞLIK ENDEKSİ
          </span>
          <span
            className={`font-rubik text-xs font-bold px-2 py-0.5 rounded border border-[#0b1220] ${
              overloadPercent > 70
                ? 'bg-[#ff5263] text-white'
                : overloadPercent > 40
                ? 'bg-[#ffd23f] text-[#3d2f00]'
                : 'bg-[#5fe39a] text-[#00382f]'
            }`}
          >
            %{100 - Math.round(overloadPercent)} SAĞLIKLI
          </span>
        </div>

        <p className="font-rubik text-[11px] text-[#9db4c6] leading-relaxed mb-3">
          Şehir Hastanesi Kubernetes podları ve mikroservis ağ geçidi 7 ana düğümde aktif çalışıyor.
        </p>

        {/* Failover Control Switches */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e2b38]">
          <button
            onClick={() => {
              sounds.playClick();
              setCircuitBreaker(!circuitBreaker);
            }}
            className={`p-2 rounded-lg border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-between text-left cursor-pointer transition-all ${
              circuitBreaker ? 'bg-[#101d29] text-[#3fe0c5]' : 'bg-[#1e2b38] text-[#9db4c6]'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-rubik font-bold text-[11px]">Devre Kesici</span>
              <span className="text-[9px] text-[#9db4c6]">Circuit Breaker</span>
            </div>
            <span className="material-symbols-outlined text-sm">
              {circuitBreaker ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setAutoScale(!autoScale);
            }}
            className={`p-2 rounded-lg border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-between text-left cursor-pointer transition-all ${
              autoScale ? 'bg-[#101d29] text-[#3fe0c5]' : 'bg-[#1e2b38] text-[#9db4c6]'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-rubik font-bold text-[11px]">Oto-Ölçekleme</span>
              <span className="text-[9px] text-[#9db4c6]">HPA Kubernetes</span>
            </div>
            <span className="material-symbols-outlined text-sm">
              {autoScale ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setRateLimiter(!rateLimiter);
            }}
            className={`p-2 rounded-lg border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-between text-left cursor-pointer transition-all ${
              rateLimiter ? 'bg-[#101d29] text-[#ffd23f]' : 'bg-[#1e2b38] text-[#9db4c6]'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-rubik font-bold text-[11px]">Hız Sınırı (WAF)</span>
              <span className="text-[9px] text-[#9db4c6]">Rate Limiter</span>
            </div>
            <span className="material-symbols-outlined text-sm">
              {rateLimiter ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setCacheBypass(!cacheBypass);
            }}
            className={`p-2 rounded-lg border-[2px] border-[#0b1220] brutal-shadow-sm flex items-center justify-between text-left cursor-pointer transition-all ${
              cacheBypass ? 'bg-[#101d29] text-[#ff5263]' : 'bg-[#1e2b38] text-[#9db4c6]'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-rubik font-bold text-[11px]">Önbellek Bypass</span>
              <span className="text-[9px] text-[#9db4c6]">No-Cache Mode</span>
            </div>
            <span className="material-symbols-outlined text-sm">
              {cacheBypass ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>
        </div>
      </div>

      {/* Microservice Nodes List */}
      <div className="flex flex-col gap-2 mb-4">
        <span className="font-arcade text-xs text-[#fff2d7] uppercase px-1">
          MİKROSERVİS DÜĞÜM DURUMLARI
        </span>

        {buildings.map((node) => (
          <div
            key={node.id}
            className="bg-[#14212d] border-[2px] border-[#0b1220] rounded-lg p-2.5 brutal-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  node.status === 'optimal'
                    ? 'bg-[#5fe39a]'
                    : node.status === 'warning'
                    ? 'bg-[#ffd23f]'
                    : 'bg-[#ff5263] animate-pulse'
                }`}
              ></div>
              <div className="flex flex-col">
                <span className="font-rubik font-bold text-xs text-[#fff2d7]">
                  {node.displayName}
                </span>
                <span className="font-rubik text-[10px] text-[#9db4c6]">
                  Kuyruk: {node.queueCount} istek · Sağlık: %{node.healthPercent}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playSuccess();
                onOptimizeNode(node.id);
              }}
              className="px-2 py-1 bg-[#1e2b38] hover:bg-[#293643] border border-[#0b1220] text-[#3fe0c5] rounded font-rubik text-[10px] font-bold brutal-shadow-sm active:translate-y-0.5 cursor-pointer"
            >
              Optimize Et
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
