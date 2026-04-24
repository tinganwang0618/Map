import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  AlertTriangle, 
  Info,
  Clock,
  Orbit,
  Maximize2,
  MousePointer2,
  ShieldAlert,
  ArrowBigUpDash,
  ArrowBigDownDash,
  Layers,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { POINTS, FLOW_LINES, HEATMAP_DATA, Phase, Point, SENSITIVITY_RATINGS, GLOBAL_METRICS } from './data';

// --- Types ---
interface IntelMarkerProps {
  point: Point;
  phase: Phase;
  categoryFilter: string[];
  onSelect: (p: Point) => void;
}

// --- Main App ---

export default function App() {
  const globeEl = useRef<any>();
  const [phase, setPhase] = useState<Phase>('pre-conflict');
  const [activeTab, setActiveTab] = useState<'overview' | 'data'>('overview');
  const [categoryFilter, setCategoryFilter] = useState<string[]>(['energy', 'politics', 'helium']);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [countries, setCountries] = useState<any>({ features: [] });

  // Handle resizing
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch countries GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  // Globe initial setup
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      globeEl.current.pointOfView({ lat: 25, lng: 70, altitude: 2.5 }, 2000);
    }
  }, []);

  const toggleCategory = (cat: string) => {
    setCategoryFilter(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const currentPhaseData = useMemo(() => {
    switch (phase) {
      case 'pre-conflict': return { label: 'Pre-Conflict', sub: 'Baseline Efficiency', color: 'text-emerald-400', intensity: 0.1 };
      case 'crisis-peak': return { label: 'Crisis Peak', sub: 'Systemic Failure', color: 'text-red-500', intensity: 0.8 };
      case 'long-term': return { label: 'Long-term', sub: 'Structural Realignment', color: 'text-blue-400', intensity: 0.4 };
      default: return { label: 'Pre-Conflict', sub: 'Baseline Efficiency', color: 'text-emerald-400', intensity: 0.1 };
    }
  }, [phase]);

  // Arcs logic: Disappear or turn red in crisis
  const arcData = useMemo(() => {
    return FLOW_LINES
      .filter(f => {
        // Helium and Oil (Energy) lines are cut in Crisis Peak
        if (phase === 'crisis-peak' && (f.type === 'helium' || f.type === 'oil')) return false;
        return true;
      })
      .map(f => {
        const isOil = f.type === 'oil';
        const isHelium = f.type === 'helium';
        
        const intensity = phase === 'pre-conflict' ? 1 : 0.7;
        
        let colors;
        if (isHelium) {
          colors = ['#10b981', '#34d399']; // Green/Emerald for Helium
        } else if (isOil) {
          colors = ['#fbbf24', '#ef4444'];
        } else {
          colors = ['#60a5fa', '#c084fc'];
        }

        const dashLength = phase === 'pre-conflict' ? 0.95 : 0.4;
        const dashGap = phase === 'pre-conflict' ? 0.01 : 1;
        
        return {
          ...f,
          startLat: f.from[0],
          startLng: f.from[1],
          endLat: f.to[0],
          endLng: f.to[1],
          color: colors,
          dashLength,
          dashGap,
          opacity: intensity,
          stroke: phase === 'pre-conflict' ? 1.2 : 0.8
        };
      });
  }, [phase]);

  // Heatmap Rings: High dependency markers
  const ringsData = useMemo(() => {
    if (phase === 'pre-conflict' || showSensitivity) return [];
    return HEATMAP_DATA.map(d => ({
      ...d,
      maxR: phase === 'crisis-peak' ? d.weight * 10 : d.weight * 5,
      propagationSpeed: phase === 'crisis-peak' ? 4 : 2,
      color: phase === 'crisis-peak' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.4)'
    }));
  }, [phase, showSensitivity]);

  // Sensitivity Polygons logic
  const getSensitivityColor = useCallback((d: any) => {
    if (!showSensitivity || !d || !d.properties) return 'rgba(0,0,0,0)';
    const code = d.properties.ISO_A3;
    const rating = SENSITIVITY_RATINGS[code] || 0;
    
    // Color scale from blue/zinc to red
    const r = Math.floor(rating * 239);
    const g = Math.floor((1 - rating) * 150);
    const b = Math.floor((1 - rating) * 246);
    
    return `rgba(${r}, ${g}, ${b}, ${phase === 'crisis-peak' ? 0.6 : 0.4})`;
  }, [showSensitivity, phase]);

  // Custom Hub Dashboard Data: Simulating Tech Impact
  const hubChartData = useMemo(() => {
    if (!selectedPoint) return [];
    
    const isTechHub = selectedPoint.id === 'silicon-valley' || selectedPoint.id === 'hsinchu';
    
    if (phase === 'pre-conflict') {
      return [
        { name: 'Baseline', energy: 100, manufacturing: 100 },
        { name: '+10%', energy: 100, manufacturing: 100 },
        { name: '+20%', energy: 100, manufacturing: 100 },
      ];
    }

    // Correlation: Energy Cost -> Manufacturing Cost (Logic Circuits)
    // Silicon Valley (Design/Energy) vs Hsinchu (Fab/Direct Energy)
    const multiplier = selectedPoint.id === 'hsinchu' ? 1.5 : 1.2;
    
    return [
      { name: 'Start', energy: 100, manufacturing: 100 },
      { name: 'T+7', energy: 115, manufacturing: 108 },
      { name: 'T+14', energy: 145, manufacturing: 128 },
      { name: 'T+21', energy: 180, manufacturing: 154 },
      { name: 'T+30', energy: 200, manufacturing: 172 },
    ];
  }, [selectedPoint, phase]);

  return (
    <div className="intel-map-container overflow-hidden">
      {/* HUD Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] p-6 flex justify-between items-start pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-white/5 backdrop-blur-md">
            <div className="p-2 bg-red-600/20 rounded border border-red-500/30 flex items-center justify-center">
              {phase === 'crisis-peak' ? <ShieldAlert className="text-red-500 w-6 h-6 animate-pulse" /> : <Activity className="text-emerald-500 w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase font-mono italic leading-none flex items-center gap-2">
                Global Interactive Map <span className="px-1.5 py-0.5 bg-red-500 text-[10px] rounded text-white not-italic">LIVE</span>
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setShowSensitivity(!showSensitivity)}
            className={`flex items-center gap-2 px-3 py-1.5 glass-panel rounded text-[10px] font-bold transition-all border ${
              showSensitivity ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-white/5 opacity-60 hover:opacity-100'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span className="uppercase tracking-widest">Energy Sensitivity</span>
          </button>
          
          {['energy', 'politics', 'helium'].map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-2 px-3 py-1.5 glass-panel rounded text-[10px] font-bold transition-all border ${
                categoryFilter.includes(cat) ? 'opacity-100 border-white/20 bg-white/5 ring-1 ring-white/10' : 'opacity-20 border-white/5 grayscale'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${cat === 'energy' ? 'bg-red-500' : cat === 'politics' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
              <span className="uppercase tracking-widest">{cat}</span>
            </button>
          ))}
        </div>
      </header>

      {/* 3D Globe with Enhanced Layers */}
      <div className="w-full h-full absolute inset-0 overflow-hidden">
        <div className="w-full h-full lg:translate-x-[15vw]">
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            htmlElementsData={POINTS.filter(p => categoryFilter.includes(p.category))}
            htmlElement={(p: any) => {
              const isCritical = p.details[phase].status.includes('BLOCKADE') || p.details[phase].status.includes('EMERGENCY');
              const isTSMCAlert = p.id === 'hsinchu' && phase !== 'pre-conflict';
              
              const el = document.createElement('div');
              el.className = 'globe-marker-container';
              el.innerHTML = `
                <div class="relative">
                  ${isTSMCAlert ? `
                    <div class="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce bg-red-600 p-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)] border border-white/40 z-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                  ` : ''}
                  <div class="marker-dot ${isCritical ? 'critical-pulse' : ''}" style="background-color: ${p.category === 'energy' ? '#ef4444' : p.category === 'politics' ? '#a855f7' : '#3b82f6'}"></div>
                  <div class="marker-label uppercase tracking-widest">${p.name}</div>
                </div>
              `;
              el.onclick = () => {
                setSelectedPoint(p);
                globeEl.current.pointOfView({ lat: p.coords[0], lng: p.coords[1], altitude: 1.5 }, 1200);
              };
              return el;
            }}
          htmlLat="coords[0]"
          htmlLng="coords[1]"

          arcsData={arcData}
          arcColor="color"
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashAnimateTime={2500}
          arcStroke="stroke"
          arcAltitudeAutoScale={0.4}
          
          ringsData={ringsData}
          ringColor={(d: any) => (t: number) => d.color.replace(')', `, ${1 - t})`)}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod={800}

          polygonsData={countries.features}
          polygonCapColor={getSensitivityColor}
          polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
          polygonStrokeColor={() => 'rgba(255, 255, 255, 0.08)'}
          polygonAltitude={0.01}
          polygonLabel={({ properties: d }: any) => {
            if (!showSensitivity || !d) return null;
            return `
              <div class="p-2 glass-panel border border-white/10 rounded pointer-events-none">
                <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">${d.ADMIN || 'Unknown'}</p>
                <p class="text-xs font-mono font-bold text-red-400 mt-1">Sensitivity: ${(SENSITIVITY_RATINGS[d.ISO_A3] || 0).toFixed(2)}</p>
              </div>
            `;
          }}

          atmosphereColor={phase === 'crisis-peak' ? "#ef4444" : "#3b82f6"}
          atmosphereAltitude={0.15 * (currentPhaseData?.intensity || 0.1)}
        />
      </div>
      </div>

      {/* Interactive Detail Modal / Mini Dashboard */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="absolute top-24 right-6 bottom-32 w-80 z-[2000] glass-panel rounded-xl overflow-hidden pointer-events-auto border border-white/10 flex flex-col"
          >
            <div className={`h-1.5 w-full ${selectedPoint.category === 'energy' ? 'bg-red-500' : selectedPoint.category === 'politics' ? 'bg-purple-500' : 'bg-blue-500'}`} />
            
            <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold font-mono tracking-tight text-white mb-1">{selectedPoint.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="tech-label !opacity-100 italic text-zinc-500 font-bold">{selectedPoint.category} node</span>
                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                    <span className="text-[10px] font-mono text-zinc-400">POS: {selectedPoint.coords[0].toFixed(2)}N {selectedPoint.coords[1].toFixed(2)}E</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-600 hover:text-white"
                >
                  <Maximize2 className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center ring-1 ring-white/5 shadow-inner">
                 <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5 font-bold">
                   <Zap className="w-2.5 h-2.5" /> SEC Readiness
                 </span>
                 <span className={`text-[9px] font-bold px-2 py-1 rounded tracking-tighter uppercase ${
                   selectedPoint.details[phase].status.includes('BLOCKADE') || selectedPoint.details[phase].status.includes('EMERGENCY') 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                 }`}>
                   {selectedPoint.details[phase].status}
                 </span>
              </div>

              {/* Data Correlation Visualization */}
              {selectedPoint.category === 'economy' && (
                <div className="space-y-3">
                  <h4 className="tech-label italic flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-500" /> 
                    {selectedPoint.id === 'hsinchu' || selectedPoint.id === 'silicon-valley' ? 'Tech Cost Correlation' : 'Price Sensitivity'}
                  </h4>
                  <div className="h-32 w-full bg-zinc-950/80 rounded border border-white/5 p-2 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hubChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <Area type="monotone" dataKey="energy" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={1} name="Energy Cost" />
                        <Area type="monotone" dataKey="manufacturing" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={1} name="Logic/Fab Cost" />
                        <ReTooltip 
                          contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} 
                          itemStyle={{ padding: '0 4px' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase italic">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"/> Energy Index</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Mfg Impact (Logic)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {selectedPoint.details[phase].metrics.map((m, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                    <p className="tech-label !text-[8px] opacity-40">{m.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-bold" style={{ color: m.color }}>{m.value}</p>
                      {m.trend === 'up' && <ArrowBigUpDash className="w-3 h-3 text-red-500" />}
                      {m.trend === 'down' && <ArrowBigDownDash className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/20 rounded" />
                <p className="text-xs text-zinc-400 italic leading-relaxed pl-4 line-clamp-3 hover:line-clamp-none transition-all cursor-help">
                  "{selectedPoint.details[phase].description}"
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center text-[8px] font-mono tracking-widest text-zinc-700">
               <span>NODAL ENCRYPT: AES-256</span>
               <span>HORMUZ CALC: RECURSIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intelligence Control Tabs (When no point is selected) */}
      {!selectedPoint && (
        <aside className="absolute top-24 left-8 bottom-40 w-[33vw] min-w-[400px] max-w-[600px] z-[1000] pointer-events-none">
          <div className="glass-panel rounded-lg h-full pointer-events-auto flex flex-col p-8 overflow-hidden border border-white/10 shadow-2xl">
            {/* Legend for Sensitivity */}
            {showSensitivity && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-white/5 rounded border border-white/5 space-y-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Security Legend: Energy Sensitivity</p>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-zinc-600 to-red-500" />
                <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                  <span>INDEPENDENT</span>
                  <span>VULNERABLE</span>
                </div>
              </motion.div>
            )}

            <div className="flex gap-8 border-b border-white/5 mb-8">
              {(['overview', 'data'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[12px] font-bold uppercase tracking-widest pb-4 transition-all relative ${
                    activeTab === tab ? 'text-white' : 'text-zinc-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-1 custom-scrollbar">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Orbit className="w-6 h-6 text-red-500" />
                      <h2 className="text-lg font-bold uppercase tracking-widest text-white">System-wide Outlook</h2>
                    </div>
                    
                    <div className="space-y-8">
                      {phase === 'pre-conflict' && (
                        <div className="space-y-8">
                          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-[14px] font-extrabold text-emerald-400 uppercase mb-3">System Status: Fragile Equilibrium</p>
                            <p className="text-base text-zinc-200 leading-relaxed font-medium">
                              Global supply chains are currently highly synchronized, relying on "Just-in-Time" (JIT) logistics and stable maritime routes.
                            </p>
                          </div>
                          <ul className="space-y-6 text-[15px] text-zinc-300 list-none font-medium">
                            <li className="flex gap-4"><span className="text-emerald-500 font-black min-w-[70px]">ENERGY:</span> Strait of Hormuz maintains 20M bbl/d flow; oil base price ~$70.</li>
                            <li className="flex gap-4"><span className="text-red-500 font-black min-w-[70px]">RISK:</span> AI industry extremely dependent on Qatar helium (30%+); buffer only 45 days.</li>
                          </ul>
                        </div>
                      )}

                      {phase === 'crisis-peak' && (
                        <div className="space-y-8">
                          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-[14px] font-extrabold text-red-400 uppercase mb-3">System Status: Cascading Failure</p>
                            <p className="text-base text-zinc-200 leading-relaxed font-medium">
                              Hormuz blockade triggers systemic shock. Maritime transit effectively halted, forcing catastrophic cargo redirection failure.
                            </p>
                          </div>
                          <ul className="space-y-6 text-[15px] text-zinc-300 list-none font-medium">
                            <li className="flex gap-4"><span className="text-red-500 font-black min-w-[70px]">IMPACT:</span> Immediate supply loss of 12M bbl/d (11.5% global).</li>
                            <li className="flex gap-4"><span className="text-red-500 font-black min-w-[70px]">ECONOMY:</span> Oil price spikes $110+; KOSPI crashes 18% on energy shocks.</li>
                            <li className="flex gap-4"><span className="text-orange-500 font-black min-w-[70px]">TECH:</span> Helium supply interrupted; semiconductor fabrication faces "Hard Stop" risk.</li>
                          </ul>
                        </div>
                      )}

                      {phase === 'long-term' && (
                        <div className="space-y-8">
                          <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-[14px] font-extrabold text-blue-400 uppercase mb-3">System Status: Paradigm Shift</p>
                            <p className="text-base text-zinc-200 leading-relaxed font-medium">
                              The post-conflict era prioritizes strategic depth and regional autonomy over global efficiency models. 
                            </p>
                          </div>
                          <ul className="space-y-6 text-[15px] text-zinc-300 list-none font-medium">
                            <li className="flex gap-4"><span className="text-blue-500 font-black min-w-[70px]">TREND:</span> "Efficiency First" shifts to "Security First"; fab decentralization accelerates.</li>
                            <li className="flex gap-4"><span className="text-blue-400 font-black min-w-[70px]">FINANCE:</span> Alternative systems like CIPS (Cross-Border Interbank) see rapid expansion.</li>
                            <li className="flex gap-4"><span className="text-emerald-500 font-black min-w-[70px]">SECURITY:</span> Helium elevated to Tier-1 asset; EU reinforces "Strategic Autonomy".</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Removed Strategic Warning from here */}
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white">Historical Market Volatility</h2>
                    <div className="h-40 bg-black/60 rounded-lg border border-white/5 p-4 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { p: 'Pre', v: 72 }, { p: 'Initial', v: 85 }, { p: 'Kinetic', v: 148 }, { p: 'Supply', v: 130 }, { p: 'Adj', v: 92 }
                        ]}>
                          <Line type="stepAfter" dataKey="v" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
                          <XAxis dataKey="p" hide />
                          <YAxis hide domain={[60, 160]} />
                          <ReTooltip contentStyle={{ background: '#020617', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white border-b border-white/5 pb-2">Conflict Metric Comparison</h2>
                    <div className="overflow-x-auto -mx-1 px-1 custom-scrollbar">
                      <table className="w-full text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="text-zinc-500 border-b border-white/5">
                            <th className="text-left py-3 font-bold whitespace-nowrap pr-4">METRIC</th>
                            <th className="text-left py-3 font-bold whitespace-nowrap pr-4">PHASE I</th>
                            <th className="text-left py-3 font-bold whitespace-nowrap pr-4">PHASE II</th>
                            <th className="text-left py-3 font-bold whitespace-nowrap pr-4">PHASE III</th>
                            <th className="text-right py-3 font-bold whitespace-nowrap">VAR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {GLOBAL_METRICS.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-white/5">
                              <td className="py-4 pr-4 font-bold text-zinc-300 whitespace-nowrap">{row.metric}</td>
                              <td className="py-4 pr-4 text-zinc-500 whitespace-nowrap">{row.phase1}</td>
                              <td className="py-4 pr-4 text-red-400 whitespace-nowrap">{row.phase2}</td>
                              <td className="py-4 pr-4 text-blue-400 whitespace-nowrap">{row.phase3}</td>
                              <td className={`py-4 text-right font-bold whitespace-nowrap ${row.peakChange.startsWith('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                                {row.peakChange}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 glass-panel rounded-lg border border-white/10">
                    <p className="tech-label !text-[8px] mb-2">Global Aggregate Impact</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-mono font-bold text-red-400 leading-none">-$5.4T</p>
                      <span className="text-[8px] text-zinc-600 uppercase mb-1">GDP LOSS EST.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end items-center">
              <Clock className="w-3 h-3 text-zinc-800 animate-spin-slow" />
            </div>
          </div>
        </aside>
      )}

      {/* Enhanced Timeline Controls */}
      <footer className="absolute bottom-10 left-6 right-6 z-[1000] flex justify-center">
        <div className="glass-panel p-4 px-8 rounded-2xl w-full max-w-3xl flex items-center gap-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
          <div className="min-w-[140px]">
            <p className={`tech-label !opacity-100 font-bold ${currentPhaseData?.color || 'text-white'} transition-colors uppercase tracking-[0.2em]`}>{currentPhaseData?.label || 'PHASE'}</p>
            <p className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase italic">{currentPhaseData?.sub || ''}</p>
          </div>

          <div className="flex-1 flex gap-2 h-1 relative pointer-events-none">
            {['pre-conflict', 'crisis-peak', 'long-term'].map((p) => (
              <button 
                key={p}
                onClick={() => setPhase(p as Phase)}
                className={`flex-1 rounded-full pointer-events-auto transition-all relative ${
                  phase === p ? (p === 'crisis-peak' ? 'bg-red-500 ring-4 ring-red-500/20' : p === 'pre-conflict' ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {phase === p && (
                  <motion.div layoutId="phase-indicator" className="absolute -top-1.5 -bottom-1.5 -left-1 -right-1 border border-white/20 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-6 items-center min-w-[220px] justify-end">
             <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-mono tracking-widest italic">THREAT INDEX</p>
                <div className="flex gap-1 mt-1.5">
                   {[1,2,3,4,5,6,7,8,9,10].map(i => (
                     <div key={i} className={`w-1.5 h-3 rounded-sm transform skew-x-12 ${i <= (phase === 'pre-conflict' ? 1 : phase === 'crisis-peak' ? 10 : 4) ? (phase === 'crisis-peak' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-blue-400') : 'bg-zinc-900 border border-white/5'}`} />
                   ))}
                </div>
             </div>
             <div className="h-10 w-px bg-white/10" />
             <div className="flex flex-col items-end">
                <p className="text-[9px] text-zinc-500 font-mono">BRENT SPOT</p>
                <p className={`text-2xl font-mono font-bold leading-none ${phase === 'crisis-peak' ? 'text-red-500' : 'text-zinc-200'}`}>
                  ${phase === 'pre-conflict' ? '72.40' : phase === 'crisis-peak' ? '148.12' : '92.05'}
                </p>
             </div>
          </div>
        </div>
      </footer>

      {/* Background HUD Graphics Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1001] border-[1px] border-white/5 m-4 rounded-3xl" />
      <div className="absolute top-1/2 left-8 w-px h-64 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 right-8 w-px h-64 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
      
      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/20 pointer-events-none" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/20 pointer-events-none" />
    </div>
  );
}
