/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  ScreenType,
  Agent,
  BuildingNode,
  Incident,
  DecisionRecord,
  GameSettings
} from './types';
import {
  initialAgents,
  initialBuildingNodes,
  initialIncidents,
  initialDecisionRecords,
  defaultSettings
} from './data/initialData';
import { sounds } from './services/sound';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { StartScreen } from './components/StartScreen';
import { TacticalGrid } from './components/TacticalGrid';
import { CrisisLogScreen } from './components/CrisisLogScreen';
import { AgentRosterScreen } from './components/AgentRosterScreen';
import { SystemTelemetryScreen } from './components/SystemTelemetryScreen';
import { DispatchModal } from './components/DispatchModal';
import { ArchitectureDecisionModal } from './components/ArchitectureDecisionModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('start');

  // Game telemetry & state
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [overloadPercent, setOverloadPercent] = useState<number>(42);
  const [shiftHour, setShiftHour] = useState<number>(11);
  const [shiftMinute, setShiftMinute] = useState<number>(32);
  const [solvedCount, setSolvedCount] = useState<number>(4);
  const [failedCount, setFailedCount] = useState<number>(1);
  const [mainTasksCompleted, setMainTasksCompleted] = useState<number>(1);

  // Entities
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [buildings, setBuildings] = useState<BuildingNode[]>(initialBuildingNodes);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(initialDecisionRecords);

  // Active selections & Modals
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showDecisionModal, setShowDecisionModal] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Format clock
  const formattedShiftTime = `${shiftHour.toString().padStart(2, '0')}:${shiftMinute
    .toString()
    .padStart(2, '0')}`;

  // Active incident
  const activeIncident = incidents[0] || null;

  // Real-time Game Loop
  useEffect(() => {
    if (currentScreen === 'start') return;

    const interval = setInterval(() => {
      // 1. Advance clock
      setShiftMinute((prevMin) => {
        if (prevMin >= 59) {
          setShiftHour((prevHour) => (prevHour >= 17 ? 17 : prevHour + 1));
          return 0;
        }
        return prevMin + 1;
      });

      // 2. Reduce agent cooldowns
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.status === 'SOĞUMADA') {
            const nextCd = agent.cooldownSeconds - 1;
            if (nextCd <= 0) {
              return {
                ...agent,
                status: 'HAZIR',
                cooldownSeconds: 0,
                energyPercent: 100
              };
            }
            return {
              ...agent,
              cooldownSeconds: nextCd,
              energyPercent: Math.min(100, Math.round(((agent.maxCooldown - nextCd) / agent.maxCooldown) * 100))
            };
          }
          return agent;
        })
      );

      // 3. Process active incidents
      setIncidents((prevIncidents) => {
        if (prevIncidents.length === 0) return prevIncidents;

        const current = prevIncidents[0];
        const hasAgent = !!current.assignedAgentId;

        // If an agent is assigned and working on it
        if (hasAgent) {
          const newProgress = (current.progressPercent || 0) + 20;

          if (newProgress >= 100) {
            // Incident resolved!
            sounds.playSuccess();
            setSolvedCount((c) => c + 1);
            setOverloadPercent((p) => Math.max(10, p - 8));
            if (current.isMainObjective) {
              setMainTasksCompleted((m) => Math.min(3, m + 1));
            }

            // Put agent on cooldown
            setAgents((agList) =>
              agList.map((ag) =>
                ag.id === current.assignedAgentId
                  ? {
                      ...ag,
                      status: 'SOĞUMADA',
                      cooldownSeconds: 8,
                      maxCooldown: 8,
                      energyPercent: 30,
                      assignedIncidentId: null
                    }
                  : ag
              )
            );

            // Record successful resolution
            setDecisions((d) => [
              {
                id: `dec-${Date.now()}`,
                title: `BAŞARILI · ${current.title} Çözüldü`,
                type: 'GÜVENLİK',
                success: true,
                scoreOrDamage: `+${current.pointsReward} Puan`,
                description: `${current.nodeName} mikroservisi normal akışına döndürüldü.`,
                reason: 'Hızlı ve hedefe uygun AI ajan müdahalesi.',
                timestamp: formattedShiftTime,
                icon: 'verified'
              },
              ...d
            ]);

            return prevIncidents.slice(1);
          }

          return [
            {
              ...current,
              progressPercent: newProgress,
              remainingTime: Math.max(1, current.remainingTime - 1)
            },
            ...prevIncidents.slice(1)
          ];
        }

        // No agent assigned: time ticks down
        const newRemaining = current.remainingTime - 1;
        if (newRemaining <= 0) {
          // Incident blew up!
          sounds.playFailure();
          setFailedCount((f) => f + 1);
          setOverloadPercent((p) => Math.min(100, p + current.damagePercent));

          // Log failure
          setDecisions((d) => [
            {
              id: `dec-${Date.now()}`,
              title: `PATLADI · ${current.title}`,
              type: 'PATLADI',
              success: false,
              scoreOrDamage: `HASAR: %${current.damagePercent} Aşırı Yük`,
              description: `${current.nodeName} zaman aşımına uğradı, servis yanıt veremedi.`,
              reason: 'Zamanında müdahale edilmedi.',
              timestamp: formattedShiftTime,
              icon: 'warning'
            },
            ...d
          ]);

          return prevIncidents.slice(1);
        }

        return [
          {
            ...current,
            remainingTime: newRemaining
          },
          ...prevIncidents.slice(1)
        ];
      });

      // 4. Slight natural load fluctuation
      setOverloadPercent((p) => Math.min(99, Math.max(15, p + (Math.random() > 0.6 ? 0.3 : -0.2))));
    }, 1000 / settings.gameSpeed);

    return () => clearInterval(interval);
  }, [currentScreen, settings.gameSpeed, formattedShiftTime]);

  // Dispatch an agent to an incident
  const handleDispatchAgent = (agentId: string, incidentId: string) => {
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === agentId
          ? {
              ...ag,
              status: 'YOLDA',
              assignedIncidentId: incidentId,
              targetNodeId: activeIncident?.nodeId
            }
          : ag
      )
    );

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedAgentId: agentId,
              assignedAgentName: agents.find((a) => a.id === agentId)?.name,
              progressPercent: 25,
              activePath: true
            }
          : inc
      )
    );

    setSelectedAgentId(null);
  };

  // Cooldown boost
  const handleBoostAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === agentId
          ? { ...ag, status: 'HAZIR', cooldownSeconds: 0, energyPercent: 100 }
          : ag
      )
    );
  };

  // Optimize a building node from Telemetry screen
  const handleOptimizeNode = (nodeId: string) => {
    setBuildings((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              healthPercent: Math.min(100, node.healthPercent + 15),
              queueCount: Math.max(5, Math.round(node.queueCount * 0.7)),
              status: 'optimal'
            }
          : node
      )
    );
    setOverloadPercent((p) => Math.max(10, p - 4));
  };

  // Record a dilemma decision
  const handleSelectDilemma = (decision: DecisionRecord, overloadDelta: number) => {
    setDecisions((prev) => [decision, ...prev]);
    setOverloadPercent((p) => Math.min(100, Math.max(10, p + overloadDelta)));
  };

  // Reset shift state
  const handleResetShift = () => {
    setOverloadPercent(38);
    setShiftHour(8);
    setShiftMinute(0);
    setSolvedCount(0);
    setFailedCount(0);
    setMainTasksCompleted(0);
    setAgents(initialAgents);
    setBuildings(initialBuildingNodes);
    setIncidents(initialIncidents);
    setDecisions(initialDecisionRecords);
  };

  return (
    <div className="bg-[#071420] text-[#d6e4f5] min-h-screen flex flex-col relative select-none">
      {/* CRT Scanline & Vignette Effect Overlays */}
      {settings.crtEnabled && (
        <div className="fixed inset-0 pointer-events-none z-[100] crt-scanlines crt-vignette" />
      )}

      {/* Screen 1: Start Screen (Full viewport) */}
      {currentScreen === 'start' ? (
        <StartScreen
          onStartGame={() => {
            setCurrentScreen('sector');
          }}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
          settings={settings}
          onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
        />
      ) : (
        /* Game Viewport Container */
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <Header
            currentScreen={currentScreen}
            onProfileClick={() => setShowSettings(true)}
            onOpenSettings={() => setShowSettings(true)}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              const next = !settings.soundEnabled;
              sounds.enabled = next;
              setSettings((s) => ({ ...s, soundEnabled: next }));
            }}
          />

          {/* Main Active Screen Content */}
          <main className="flex-1 w-full max-w-md mx-auto px-3 pt-20 pb-24 z-10 flex flex-col">
            {currentScreen === 'sector' && (
              <TacticalGrid
                overloadPercent={overloadPercent}
                shiftTime={formattedShiftTime}
                mainTasksCompleted={mainTasksCompleted}
                solvedCount={solvedCount}
                failedCount={failedCount}
                agents={agents}
                buildings={buildings}
                activeIncident={activeIncident}
                onDispatchAgent={handleDispatchAgent}
                onOpenDispatchModal={() => setShowDispatchModal(true)}
                onTriggerDecisionDilemma={() => setShowDecisionModal(true)}
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />
            )}

            {currentScreen === 'crisis' && (
              <CrisisLogScreen
                onGoToMainMenu={() => setCurrentScreen('start')}
                solvedCount={solvedCount}
                failedCount={failedCount}
                overloadPercent={overloadPercent}
                decisions={decisions}
                isAlternativeFailure={overloadPercent >= 80}
              />
            )}

            {currentScreen === 'agents' && (
              <AgentRosterScreen
                agents={agents}
                onBoostAgent={handleBoostAgent}
              />
            )}

            {currentScreen === 'system' && (
              <SystemTelemetryScreen
                buildings={buildings}
                overloadPercent={overloadPercent}
                onOptimizeNode={handleOptimizeNode}
              />
            )}
          </main>

          {/* Bottom Fixed Navigation */}
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            unresolvedCount={incidents.length}
          />
        </div>
      )}

      {/* MODALS */}
      {showDispatchModal && activeIncident && (
        <DispatchModal
          incident={activeIncident}
          agents={agents}
          onDispatch={handleDispatchAgent}
          onClose={() => setShowDispatchModal(false)}
        />
      )}

      {showDecisionModal && (
        <ArchitectureDecisionModal
          onSelectOption={handleSelectDilemma}
          onClose={() => setShowDecisionModal(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
          onResetShift={handleResetShift}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
