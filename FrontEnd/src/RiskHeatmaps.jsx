import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  CloudRain,
  Activity,
  Mountain,
  Satellite,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Info,
  CheckCircle2,
  Navigation,
  Send,
  Eye,
  Sliders,
  Radio,
  Check,
  Building,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Smooth Map Pan Helper - preserves user's current zoom without altering it
function MapFlyer({ targetCenter }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.panTo(targetCenter, { animate: true, duration: 0.8 });
    }
  }, [targetCenter, map]);
  return null;
}

// Master Landslide Heatmap Zones Dataset in NER
const HEATMAP_ZONES = [
  {
    id: 'zone-nh10',
    name: 'NH-10 Teesta Gorge (Sevoke - Singtam)',
    district: 'East Sikkim & Kalimpong',
    coords: [27.0850, 88.5120],
    baseRisk: 92,
    factors: {
      rainfall: { value: '145mm / 24h', weight: 42, note: 'Extreme orographic rainfall' },
      soilMoisture: { value: '92% Saturation', weight: 28, note: 'Critical pore water pressure' },
      slope: { value: '54° Scree Slope', weight: 18, note: 'Highly weathered mica schist' },
      satellite: { value: '+14mm / week', weight: 12, note: 'Active surface creeping (InSAR)' }
    },
    assets: ['NH-10 Lifeline Highway', 'Teesta Low Dam Stage III', 'Singtam Outskirts (~3,100 people)'],
    actionSop: 'Issue Phase-4 Red Warning to Sikkim SDMA. Enforce immediate road closure & pre-position heavy clearing machinery.'
  },
  {
    id: 'zone-mangan',
    name: 'Mangan - Chungthang Axis',
    district: 'North Sikkim',
    coords: [27.5100, 88.6300],
    baseRisk: 86,
    factors: {
      rainfall: { value: '128mm / 24h', weight: 38, note: 'Severe downpour & glacial discharge' },
      soilMoisture: { value: '88% Saturation', weight: 26, note: 'Saturated slope mantle' },
      slope: { value: '49° Rocky Ridge', weight: 22, note: 'Fragile fractured gneiss' },
      satellite: { value: '+9mm / week', weight: 14, note: 'Slope toe subsidence detected' }
    },
    assets: ['Strategic Border Highway', 'Lachen/Lachung Access Bridge', '4 Indigenous Tribal Hamlets'],
    actionSop: 'Alert BRO Taskforce Swastik & pre-deploy NDRF teams at Mangan base.'
  },
  {
    id: 'zone-haflong',
    name: 'Haflong - Jatinga Hill Corridor',
    district: 'Dima Hasao, Assam',
    coords: [25.1700, 93.0200],
    baseRisk: 76,
    factors: {
      rainfall: { value: '110mm / 24h', weight: 35, note: 'Persistent monsoon convective showers' },
      soilMoisture: { value: '85% Saturation', weight: 30, note: 'Clay-rich slippery strata' },
      slope: { value: '42° Terraced Slope', weight: 20, note: 'Unplanned hill cut excavations' },
      satellite: { value: '+7mm / week', weight: 15, note: 'Track embankment displacement' }
    },
    assets: ['Lumding-Badarpur Mountain Railway', 'Haflong Hill Bypass', 'Jatinga Water Supply Main'],
    actionSop: 'Restrict night rail traffic; activate track sensor automatic braking protocol.'
  },
  {
    id: 'zone-tawang',
    name: 'Bhalukpong - Tawang Axis',
    district: 'West Kameng, Arunachal Pradesh',
    coords: [27.3500, 92.4200],
    baseRisk: 68,
    factors: {
      rainfall: { value: '88mm / 24h', weight: 34, note: 'Heavy cloud band crossing Sela' },
      soilMoisture: { value: '76% Saturation', weight: 26, note: 'High seasonal moisture' },
      slope: { value: '47° Alpine Slope', weight: 24, note: 'Freeze-thaw weathered scree' },
      satellite: { value: '+4mm / week', weight: 16, note: 'Slow tectonic displacement' }
    },
    assets: ['Tawang Defense Corridor', '2 Suspension Bridges', 'Dirang Valley Access'],
    actionSop: 'Broadcast SMS warning to tourist cabs & station patrol squads at Bhalukpong checkpost.'
  },
  {
    id: 'zone-kohima',
    name: 'Kohima - Dimapur NH-29 Corridor',
    district: 'Kohima, Nagaland',
    coords: [25.7500, 93.9500],
    baseRisk: 72,
    factors: {
      rainfall: { value: '94mm / 24h', weight: 36, note: 'Sub-surface aquifer seepage' },
      soilMoisture: { value: '81% Saturation', weight: 28, note: 'Unstable sedimentary shale' },
      slope: { value: '38° Road Cutting', weight: 20, note: 'Fragile overburden slope' },
      satellite: { value: '+11mm / week', weight: 16, note: 'Pagla Pahar active sliding' }
    },
    assets: ['NH-29 Commercial Freight Route', 'Sechu Zubza Supply Line', 'Local Settlements'],
    actionSop: 'Divert heavy freight via alternative bypass; trigger slope sensor telemetry alerts.'
  },
  {
    id: 'zone-shillong',
    name: 'Shillong Bypass - Umroi Corridor',
    district: 'Ri-Bhoi, Meghalaya',
    coords: [25.6800, 91.9500],
    baseRisk: 46,
    factors: {
      rainfall: { value: '52mm / 24h', weight: 28, note: 'Moderate intermittent rainfall' },
      soilMoisture: { value: '64% Saturation', weight: 26, note: 'Stable sandstone bedrock' },
      slope: { value: '31° Gentle Ridge', weight: 24, note: 'Densely vegetated slope' },
      satellite: { value: '+1mm / week', weight: 22, note: 'Minimal slope movement' }
    },
    assets: ['Umroi Airport Link Road', 'Agricultural Terraces'],
    actionSop: 'Routine clearing of drainage culverts; maintain standard surveillance.'
  }
];

// Dynamic Timeline Model Generator
function getDynamicHorizonFactors(zone, timeHorizon) {
  const baseRain = parseInt(zone.factors.rainfall.value) || 100;
  const baseSoil = parseInt(zone.factors.soilMoisture.value) || 80;
  const baseSat = parseInt(zone.factors.satellite.value) || 8;

  switch (timeHorizon) {
    case '6h':
      return {
        riskDelta: +6,
        trendName: 'Incoming Storm Front (+6h)',
        rainfall: {
          value: `${baseRain + 32}mm (+32mm expected)`,
          weight: 44,
          note: 'Advancing convective cloudburst band approaching ridge'
        },
        soilMoisture: {
          value: `${Math.min(baseSoil + 5, 99)}% Saturation`,
          weight: 30,
          note: 'Infiltration surge; pore water pressure approaching critical limit'
        },
        slope: {
          value: zone.factors.slope.value,
          weight: 16,
          note: 'Elevated gravitational shear stress along bedding plane'
        },
        satellite: {
          value: `+${baseSat + 4}mm / week`,
          weight: 10,
          note: 'Accelerated creeping velocity detected by SAR interferogram'
        },
        sop: 'Pre-position emergency road clearing bulldozers & alert SDMA downstream village nodes.'
      };
    case '12h':
      return {
        riskDelta: +10,
        trendName: 'Peak Monsoonal Surge (+12h)',
        rainfall: {
          value: `${baseRain + 68}mm (Peak Torrential Surge)`,
          weight: 48,
          note: 'Intense orographic precipitation across upper catchment'
        },
        soilMoisture: {
          value: `${Math.min(baseSoil + 8, 99)}% Near Liquefaction`,
          weight: 32,
          note: 'Total ground saturation; hydrostatic failure threshold breached'
        },
        slope: {
          value: zone.factors.slope.value,
          weight: 12,
          note: 'Active micro-ruptures; tension cracks visibly widening'
        },
        satellite: {
          value: `+${baseSat + 9}mm / week`,
          weight: 8,
          note: 'Severe slope toe displacement; high interferogram decorrelation'
        },
        sop: 'RED ALERT FULL MOBILIZATION: Immediate complete corridor closure. Deploy NDRF & SDRF search teams to high ground.'
      };
    case '24h':
      return {
        riskDelta: -6,
        trendName: 'De-escalation & Passage (+24h)',
        rainfall: {
          value: `38mm / 24h (Lightening Showers)`,
          weight: 30,
          note: 'Monsoon front shifting eastward; rain intensity tapering'
        },
        soilMoisture: {
          value: `${Math.max(baseSoil - 8, 48)}% Slow Drainage`,
          weight: 26,
          note: 'Residual moisture high but groundwater beginning steady drainage'
        },
        slope: {
          value: zone.factors.slope.value,
          weight: 24,
          note: 'Overburden settling; small scree accumulations on road'
        },
        satellite: {
          value: `+${Math.max(baseSat - 3, 2)}mm / week`,
          weight: 20,
          note: 'Slope deformation rate moderating towards baseline'
        },
        sop: 'Initiate PWD geotechnical drone inspection. Open single lane for emergency convoys only.'
      };
    case '48h':
      return {
        riskDelta: -14,
        trendName: 'Stabilized & Recovery (+48h)',
        rainfall: {
          value: `12mm / 24h (Scattered Drizzle)`,
          weight: 18,
          note: 'Weather cleared; minimal scattered precipitation forecasted'
        },
        soilMoisture: {
          value: `${Math.max(baseSoil - 18, 38)}% Normal Baseline`,
          weight: 24,
          note: 'Pore pressure normalized below hazardous landslide trigger thresholds'
        },
        slope: {
          value: zone.factors.slope.value,
          weight: 32,
          note: 'Slope stable under clear conditions; no active toe movement'
        },
        satellite: {
          value: `+2mm / week (Normal Background)`,
          weight: 26,
          note: 'Stable background tectonic activity'
        },
        sop: 'Road clearance operations complete. Authorize two-way civilian transit under monitored convoy supervision.'
      };
    default: // 'now'
      return {
        riskDelta: 0,
        trendName: 'Live Sensor Baseline (Now)',
        rainfall: zone.factors.rainfall,
        soilMoisture: zone.factors.soilMoisture,
        slope: zone.factors.slope,
        satellite: zone.factors.satellite,
        sop: zone.actionSop
      };
  }
}

export default function RiskHeatmaps({ isDarkMode, t }) {
  // Selected Zone for AI Inspector
  const [selectedZone, setSelectedZone] = useState(HEATMAP_ZONES[0]);
  const [targetCenter, setTargetCenter] = useState(null);
  const [actionDispatched, setActionDispatched] = useState(false);

  // Time forecast scrubber (+0, +6h, +12h, +24h, +48h)
  const [timeHorizon, setTimeHorizon] = useState('now');

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    rainfall: true,
    soil: true,
    slope: true,
    satellite: true,
    infrastructure: true
  });

  // Calculate dynamic factors based on time forecast
  const dynamicFactors = useMemo(() => {
    return getDynamicHorizonFactors(selectedZone, timeHorizon);
  }, [selectedZone, timeHorizon]);

  // Active layers count
  const activeLayersCount = useMemo(() => {
    return [layers.rainfall, layers.soil, layers.slope, layers.satellite].filter(Boolean).length;
  }, [layers]);

  // Dynamic Risk Score calculation incorporating BOTH time horizon and active layers
  const activeRiskScore = useMemo(() => {
    let base = selectedZone.baseRisk + dynamicFactors.riskDelta;

    // Adjust weighting if certain layers are muted/disabled by the user
    let activeWeightSum = 0;
    let totalPossibleWeight = 0;

    if (layers.rainfall) {
      activeWeightSum += dynamicFactors.rainfall.weight;
    }
    totalPossibleWeight += dynamicFactors.rainfall.weight;

    if (layers.soil) {
      activeWeightSum += dynamicFactors.soilMoisture.weight;
    }
    totalPossibleWeight += dynamicFactors.soilMoisture.weight;

    if (layers.slope) {
      activeWeightSum += dynamicFactors.slope.weight;
    }
    totalPossibleWeight += dynamicFactors.slope.weight;

    if (layers.satellite) {
      activeWeightSum += dynamicFactors.satellite.weight;
    }
    totalPossibleWeight += dynamicFactors.satellite.weight;

    const layerMultiplier = totalPossibleWeight > 0 ? activeWeightSum / totalPossibleWeight : 1;
    const finalScore = Math.round(base * (0.4 + 0.6 * layerMultiplier));
    return Math.min(Math.max(finalScore, 12), 98);
  }, [selectedZone, dynamicFactors, layers]);

  const getRiskColor = (score) => {
    if (score >= 80) return { hex: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' };
    if (score >= 65) return { hex: '#f97316', text: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' };
    if (score >= 50) return { hex: '#eab308', text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { hex: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setTargetCenter(zone.coords);
    setActionDispatched(false);
  };

  const handleDispatchAction = () => {
    setActionDispatched(true);
    setTimeout(() => {
      setActionDispatched(false);
    }, 4000);
  };

  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <Activity size={20} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.heatmapTitle}
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            {t.heatmapSubtitle}
          </p>
        </div>

        {/* Forecast Timeline Horizon Scrubber */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-semibold ${
          isDarkMode ? 'bg-[#0c0e14] border-white/[0.08] shadow-lg shadow-black/30' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <Clock size={14} className="ml-2 mr-1 text-blue-400" />
          {[
            { id: 'now', label: t.timeNow },
            { id: '6h', label: t.time6h },
            { id: '12h', label: t.time12h },
            { id: '24h', label: t.time24h },
            { id: '48h', label: t.time48h }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeHorizon(item.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                timeHorizon === item.id
                  ? isDarkMode
                    ? 'bg-white/[0.12] text-white border border-white/[0.1] font-bold shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm font-bold'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Heatmap GIS Map & Explainability Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive GIS Map Container */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`rounded-2xl border overflow-hidden relative ${
            isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            {/* Map Top Floating Layer Controls */}
            <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-medium ${
              isDarkMode ? 'border-white/[0.06] bg-[#0c0e14]/80' : 'border-slate-100 bg-white/80'
            } backdrop-blur-md`}>
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-blue-400" />
                <span className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{t.layersTitle}:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => toggleLayer('rainfall')}
                  className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    layers.rainfall
                      ? isDarkMode ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold' : 'bg-blue-600/20 text-blue-500 border-blue-500/40 font-bold'
                      : isDarkMode ? 'border-white/[0.05] text-zinc-500 opacity-60' : 'border-slate-300 text-slate-400 opacity-60'
                  }`}
                >
                  <CloudRain size={12} /> {t.layerRainfall} {layers.rainfall ? '✓' : '○'}
                </button>
                <button
                  onClick={() => toggleLayer('soil')}
                  className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    layers.soil
                      ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold' : 'bg-emerald-600/20 text-emerald-600 border-emerald-500/40 font-bold'
                      : isDarkMode ? 'border-white/[0.05] text-zinc-500 opacity-60' : 'border-slate-300 text-slate-400 opacity-60'
                  }`}
                >
                  <Activity size={12} /> {t.layerSoil} {layers.soil ? '✓' : '○'}
                </button>
                <button
                  onClick={() => toggleLayer('slope')}
                  className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    layers.slope
                      ? isDarkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold' : 'bg-amber-600/20 text-amber-600 border-amber-500/40 font-bold'
                      : isDarkMode ? 'border-white/[0.05] text-zinc-500 opacity-60' : 'border-slate-300 text-slate-400 opacity-60'
                  }`}
                >
                  <Mountain size={12} /> {t.layerSlope} {layers.slope ? '✓' : '○'}
                </button>
                <button
                  onClick={() => toggleLayer('satellite')}
                  className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    layers.satellite
                      ? isDarkMode ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold' : 'bg-purple-600/20 text-purple-600 border-purple-500/40 font-bold'
                      : isDarkMode ? 'border-white/[0.05] text-zinc-500 opacity-60' : 'border-slate-300 text-slate-400 opacity-60'
                  }`}
                >
                  <Satellite size={12} /> {t.layerSatellite} {layers.satellite ? '✓' : '○'}
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[520px] sm:h-[620px] w-full relative z-0">
              <MapContainer center={[26.5000, 91.5000]} zoom={7} className="h-full w-full" zoomControl={false}>
                <MapFlyer targetCenter={targetCenter} />

                {/* Basemap Tiles */}
                {isDarkMode ? (
                  <>
                    <TileLayer
                      key="esri-dark-base"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri'
                    />
                    <TileLayer
                      key="esri-dark-ref"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    />
                  </>
                ) : (
                  <TileLayer
                    key="esri-street-english"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                  />
                )}

                {/* Render Landslide Risk Heatmap Zones */}
                {HEATMAP_ZONES.map((zone) => {
                  const isCurrent = selectedZone.id === zone.id;
                  const zoneFactors = getDynamicHorizonFactors(zone, timeHorizon);
                  const zoneRisk = Math.min(Math.max(zone.baseRisk + zoneFactors.riskDelta, 15), 98);
                  const colorObj = getRiskColor(zoneRisk);

                  return (
                    <div key={zone.id}>
                      {/* Outer Heatmap Gradient Halo - Active if Rainfall or Soil layers on */}
                      {(layers.rainfall || layers.soil) && (
                        <Circle
                          center={zone.coords}
                          radius={isCurrent ? 35000 : 25000}
                          pathOptions={{
                            color: 'transparent',
                            fillColor: colorObj.hex,
                            fillOpacity: isCurrent ? 0.42 : 0.25
                          }}
                          eventHandlers={{
                            click: () => handleSelectZone(zone)
                          }}
                        />
                      )}

                      {/* Concentric High-Intensity Core Marker */}
                      <CircleMarker
                        center={zone.coords}
                        radius={isCurrent ? 24 : 16}
                        pathOptions={{
                          color: isCurrent ? '#ffffff' : colorObj.hex,
                          fillColor: colorObj.hex,
                          fillOpacity: 0.85,
                          weight: isCurrent ? 3 : 1.5
                        }}
                        eventHandlers={{
                          click: () => handleSelectZone(zone)
                        }}
                      >
                        <Popup>
                          <div className="p-1 min-w-[200px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${colorObj.bg} ${colorObj.text}`}>
                                {zoneRisk}% RISK • {timeHorizon.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{zone.district}</span>
                            </div>
                            <p className="font-bold text-xs text-slate-800">{zone.name}</p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              🌧️ {zoneFactors.rainfall.value} • 💧 {zoneFactors.soilMoisture.value}
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </div>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Quick Zone Selector Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HEATMAP_ZONES.map((zone) => {
              const isCurrent = selectedZone.id === zone.id;
              const zoneFactors = getDynamicHorizonFactors(zone, timeHorizon);
              const zoneRisk = Math.min(Math.max(zone.baseRisk + zoneFactors.riskDelta, 15), 98);
              const colorObj = getRiskColor(zoneRisk);

              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-blue-500/[0.08] border-blue-500/40 ring-1 ring-blue-500/30 shadow-md'
                        : 'bg-blue-50/70 border-blue-500 shadow-md'
                      : isDarkMode
                      ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                      {zone.district}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${colorObj.bg} ${colorObj.text}`}>
                      {zoneRisk}%
                    </span>
                  </div>
                  <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                    {zone.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Explainability & Risk Inspector Drawer */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <motion.div
            key={`${selectedZone.id}-${timeHorizon}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border p-5 flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f121a]/95 border-white/[0.08] shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'
            } backdrop-blur-xl min-h-[580px]`}
          >
            {/* Inspector Header */}
            <div>
              <div className={`flex justify-between items-start gap-2 mb-3 pb-3 border-b ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                    <ShieldAlert size={15} />
                    <span>{t.zoneInspector}</span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold mt-1 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {selectedZone.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedZone.district}</p>
                </div>

                <div className="text-right">
                  <div className={`text-2xl sm:text-3xl font-black ${getRiskColor(activeRiskScore).text}`}>
                    {activeRiskScore}%
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getRiskColor(activeRiskScore).bg} ${getRiskColor(activeRiskScore).text}`}>
                    {activeRiskScore >= 80
                      ? t.riskLevelCritical
                      : activeRiskScore >= 65
                      ? t.riskLevelHigh
                      : activeRiskScore >= 50
                      ? t.riskLevelModerate
                      : t.riskLevelLow}
                  </span>
                </div>
              </div>

              {/* Dynamic Status Pill: Forecast Horizon & Layers Applied */}
              <div className={`p-2.5 rounded-xl border mb-4 flex items-center justify-between text-[11px] font-semibold ${
                isDarkMode ? 'bg-white/[0.03] border-white/[0.06] text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Calendar size={13} /> {dynamicFactors.trendName}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {activeLayersCount}/4 Layers Active
                </span>
              </div>

              {/* AI Explainability Contributing Factors (Synced with Time Horizon and Layers) */}
              <div className="mb-5">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  <span>{t.contributingFactors}</span>
                  <Info size={13} className="text-zinc-400" />
                </h4>

                <div className="space-y-2.5 text-xs">
                  {/* 1. Rainfall Factor */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    layers.rainfall
                      ? isDarkMode
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-slate-50 border-slate-200'
                      : 'opacity-40 border-dashed border-zinc-700'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CloudRain size={13} className={layers.rainfall ? 'text-blue-400' : 'text-zinc-400'} /> {t.rainfallFactor}
                        {!layers.rainfall && <span className="text-[9px] text-zinc-500 font-normal">(Muted)</span>}
                      </span>
                      <span className={`font-mono font-bold ${layers.rainfall ? 'text-blue-400' : 'text-zinc-400'}`}>
                        {dynamicFactors.rainfall.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden mb-1 ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${layers.rainfall ? 'bg-blue-500' : 'bg-zinc-600'}`}
                        style={{ width: `${layers.rainfall ? dynamicFactors.rainfall.weight * 2 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">{dynamicFactors.rainfall.note}</p>
                  </div>

                  {/* 2. Soil Moisture Factor */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    layers.soil
                      ? isDarkMode
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-slate-50 border-slate-200'
                      : 'opacity-40 border-dashed border-zinc-700'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Activity size={13} className={layers.soil ? 'text-emerald-400' : 'text-zinc-400'} /> {t.soilMoistureFactor}
                        {!layers.soil && <span className="text-[9px] text-zinc-500 font-normal">(Muted)</span>}
                      </span>
                      <span className={`font-mono font-bold ${layers.soil ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {dynamicFactors.soilMoisture.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden mb-1 ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${layers.soil ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                        style={{ width: `${layers.soil ? dynamicFactors.soilMoisture.weight * 2 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">{dynamicFactors.soilMoisture.note}</p>
                  </div>

                  {/* 3. Slope Steepness */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    layers.slope
                      ? isDarkMode
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-slate-50 border-slate-200'
                      : 'opacity-40 border-dashed border-zinc-700'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Mountain size={13} className={layers.slope ? 'text-amber-400' : 'text-zinc-400'} /> {t.slopeFactor}
                        {!layers.slope && <span className="text-[9px] text-zinc-500 font-normal">(Muted)</span>}
                      </span>
                      <span className={`font-mono font-bold ${layers.slope ? 'text-amber-400' : 'text-zinc-400'}`}>
                        {dynamicFactors.slope.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden mb-1 ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${layers.slope ? 'bg-amber-500' : 'bg-zinc-600'}`}
                        style={{ width: `${layers.slope ? dynamicFactors.slope.weight * 2 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">{dynamicFactors.slope.note}</p>
                  </div>

                  {/* 4. Satellite InSAR Ground Deformation */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    layers.satellite
                      ? isDarkMode
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-slate-50 border-slate-200'
                      : 'opacity-40 border-dashed border-zinc-700'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Satellite size={13} className={layers.satellite ? 'text-purple-400' : 'text-zinc-400'} /> {t.satelliteFactor}
                        {!layers.satellite && <span className="text-[9px] text-zinc-500 font-normal">(Muted)</span>}
                      </span>
                      <span className={`font-mono font-bold ${layers.satellite ? 'text-purple-400' : 'text-zinc-400'}`}>
                        {dynamicFactors.satellite.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden mb-1 ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${layers.satellite ? 'bg-purple-500' : 'bg-zinc-600'}`}
                        style={{ width: `${layers.satellite ? dynamicFactors.satellite.weight * 2 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">{dynamicFactors.satellite.note}</p>
                  </div>
                </div>
              </div>

              {/* Assets at Risk */}
              <div className="mb-4">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {t.assetsAtRisk}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedZone.assets.map((asset, i) => (
                    <span
                      key={i}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                        isDarkMode
                          ? 'bg-white/[0.04] text-zinc-300 border-white/[0.06]'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      • {asset}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action SOP (Dynamically updated according to time forecast) */}
              <div className={`p-3 rounded-xl border mb-4 ${
                activeRiskScore >= 80
                  ? isDarkMode ? 'bg-rose-500/10 border-rose-500/25 text-rose-300' : 'bg-red-500/10 border-red-500/25 text-red-600'
                  : isDarkMode ? 'bg-blue-500/10 border-blue-500/25 text-blue-300' : 'bg-blue-500/10 border-blue-500/25 text-blue-600'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <AlertTriangle size={14} />
                  <span>{t.recommendedAction}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-95">{dynamicFactors.sop}</p>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div>
              <button
                onClick={handleDispatchAction}
                disabled={actionDispatched}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-blue-400/30"
              >
                {actionDispatched ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Dispatched to State Emergency Operation Center!</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>{t.dispatchWarning}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
