import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  User,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Camera,
  Navigation,
  Send,
  X,
  Crosshair,
  Truck,
  Ban,
  Check,
  Eye,
  Layers,
  Sparkles,
  WifiOff
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Smooth Map Pan Helper without altering zoom
function MapPanController({ targetCenter }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.panTo(targetCenter, { animate: true, duration: 0.8 });
    }
  }, [targetCenter, map]);
  return null;
}

// Initial Mock Field Reports Data in NER
const INITIAL_REPORTS = [
  {
    id: 'FR-2026-081',
    title: 'Debris Slide on NH-10 near 29th Mile',
    location: '29th Mile, Sevoke-Teesta Corridor',
    district: 'Kalimpong & East Sikkim',
    coords: [27.0250, 88.4890],
    reporter: 'Er. Rajesh Thapa',
    reporterType: 'Officer',
    department: 'PWD Highway Div. II',
    time: '25 mins ago',
    status: 'Verified',
    severity: 'Critical',
    category: 'Debris & Mudslide Flow',
    roadStatus: 'Completely Blocked',
    rainfall: 'Torrential Downpour',
    desc: 'Over 200 cubic meters of wet mud, shale fragments, and fallen pine trunks broke off the upper terrace. Traffic halted in both directions.',
    officerNotes: 'Heavy excavator deployed from Sevoke basecamp. Estimated single-lane restoration time: 2.5 hours.',
    evidenceImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'FR-2026-079',
    title: 'Longitudinal Tension Cracks along Mangan Ridge',
    location: 'Mangan Market Bypass',
    district: 'North Sikkim',
    coords: [27.5120, 88.6320],
    reporter: 'Tenzing Lepcha',
    reporterType: 'Citizen',
    department: 'Aapda Mitra Volunteer',
    time: '2 hours ago',
    status: 'Verified',
    severity: 'High',
    category: 'Road Subsidence & Tension Cracks',
    roadStatus: 'Single Lane Passable',
    rainfall: 'Heavy Continuous Rain',
    desc: '15-meter long fissure observed on the outer road shoulder after morning downpour. Downward slope settling visible by ~4 inches.',
    officerNotes: 'Inspected by SDMA Field Officer. Sandbag ballast laid, heavy multi-axle trucks diverted.',
    evidenceImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'FR-2026-074',
    title: 'Culvert Clog & Mud Overflow at Jatinga',
    location: 'Haflong - Jatinga Link Road',
    district: 'Dima Hasao, Assam',
    coords: [25.1740, 93.0230],
    reporter: 'S. Debbarma',
    reporterType: 'Officer',
    department: 'Forestry & Soil Conservation',
    time: '4 hours ago',
    status: 'Action Taken',
    severity: 'Moderate',
    category: 'Culvert Clogging & Runoff',
    roadStatus: 'Passable with Caution',
    rainfall: 'Moderate Intermittent Rain',
    desc: 'Culvert #14 choked with scree and fallen timber, forcing water to flow across the carriageway onto fragile shoulder soil.',
    officerNotes: 'Local road gang cleared inlet grate. Water diverted into concrete chute.',
    evidenceImage: null
  },
  {
    id: 'FR-2026-068',
    title: 'Boulders Rolling on Bhalukpong-Tawang Highway',
    location: 'Sela Pass Foothills, KM 42',
    district: 'West Kameng, Arunachal Pradesh',
    coords: [27.3520, 92.4210],
    reporter: 'Sunil Sharma',
    reporterType: 'Citizen',
    department: 'Commercial Taxi Operator',
    time: '6 hours ago',
    status: 'Pending Review',
    severity: 'High',
    category: 'Rockfall & Scree Collapse',
    roadStatus: 'Single Lane Passable',
    rainfall: 'Intermittent Rain & Thick Fog',
    desc: 'Small boulders and gravel rolling onto hairpin turn every 10-15 minutes. Low visibility makes sudden stops hazardous.',
    officerNotes: 'Flagged for BRO patrol squad confirmation.',
    evidenceImage: null
  },
  {
    id: 'FR-2026-062',
    title: 'Suspected Cracking near Shillong Bypass',
    location: 'Umroi Industrial Sector',
    district: 'Ri-Bhoi, Meghalaya',
    coords: [25.6820, 91.9520],
    reporter: 'P. Lyngdoh',
    reporterType: 'Citizen',
    department: 'Public Commuter',
    time: '12 hours ago',
    status: 'False Alarm',
    severity: 'Minor',
    category: 'Road Subsidence & Tension Cracks',
    roadStatus: 'Road Clear',
    rainfall: 'Clear Weather',
    desc: 'Reported visible crack in asphalt after earth tremor.',
    officerNotes: 'PWD inspection confirmed minor asphalt cold-joint seam, not deep geotechnical slope failure. Case resolved.',
    evidenceImage: null
  }
];

export default function FieldReports({ isDarkMode, t }) {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState(INITIAL_REPORTS[0]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [targetCenter, setTargetCenter] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [reporterFilter, setReporterFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      const matchesReporter =
        reporterFilter === 'All' ||
        (reporterFilter === 'Officer' && report.reporterType === 'Officer') ||
        (reporterFilter === 'Citizen' && report.reporterType === 'Citizen');
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesReporter && matchesSearch;
    });
  }, [reports, statusFilter, reporterFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: reports.length,
      verified: reports.filter((r) => r.status === 'Verified').length,
      pending: reports.filter((r) => r.status === 'Pending Review').length,
      actionTaken: reports.filter((r) => r.status === 'Action Taken').length
    };
  }, [reports]);

  // Action Handlers
  const handleVerify = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Verified',
              officerNotes: r.officerNotes || 'Verified on ground by Authorized Field Officer.'
            }
          : r
      )
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) => ({ ...prev, status: 'Verified' }));
    }
  };

  const handleDispatchCrew = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Action Taken',
              roadStatus: 'Single Lane Passable',
              officerNotes: `${r.officerNotes} | PWD Quick Reaction Team dispatched at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
            }
          : r
      )
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) => ({
        ...prev,
        status: 'Action Taken',
        roadStatus: 'Single Lane Passable'
      }));
    }
  };

  const handleReject = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'False Alarm',
              officerNotes: 'Evaluated by District Control: Classified as non-hazardous.'
            }
          : r
      )
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) => ({ ...prev, status: 'False Alarm' }));
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    if (report.coords) {
      setTargetCenter(report.coords);
    }
  };

  const handleAddNewReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    if (newReport.coords) {
      setTargetCenter(newReport.coords);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
          icon: ShieldCheck,
          label: t.statusVerified
        };
      case 'Action Taken':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
          icon: Truck,
          label: t.statusActionTaken
        };
      case 'False Alarm':
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          icon: Ban,
          label: t.statusRejected
        };
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
          icon: Clock,
          label: t.statusPending
        };
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'Critical') return 'bg-red-500/15 text-red-500 border-red-500/30';
    if (sev === 'High') return 'bg-orange-500/15 text-orange-500 border-orange-500/30';
    if (sev === 'Moderate') return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
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
              <FileText size={20} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.fieldReportsTitle}
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            {t.fieldReportsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline Sync Indicator */}
          <div
            title="Local Cache Active - Automatic sync when online"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDarkMode ? 'bg-[#0f121a] border-white/[0.08] text-emerald-400' : 'bg-white border-slate-200 text-emerald-600'
            } shadow-sm`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span>Offline-Ready (PWA)</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center text-xs cursor-pointer border border-blue-400/30"
          >
            <Plus size={16} className="mr-1.5" /> {t.newFieldReportBtn}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t.totalReports, value: stats.total, dot: 'bg-blue-400' },
          { label: t.verifiedReports, value: stats.verified, dot: 'bg-emerald-400' },
          { label: t.pendingVerification, value: stats.pending, dot: 'bg-amber-400' },
          { label: t.actionDispatchedCount, value: stats.actionTaken, dot: 'bg-indigo-400' }
        ].map((kpi, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              isDarkMode ? 'bg-[#0f121a]/85 border-white/[0.07] hover:border-white/[0.16] shadow-lg shadow-black/30' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {isDarkMode && (
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {kpi.label}
              </span>
              <div className={`h-2 w-2 rounded-full ${kpi.dot}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filter and View Bar */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07]' : 'bg-white border-slate-200'
      } backdrop-blur-xl shadow-sm`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border transition-all focus:outline-none ${
              isDarkMode
                ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border focus:outline-none cursor-pointer transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="All" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.statusAll}</option>
            <option value="Verified" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.statusVerified}</option>
            <option value="Pending Review" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.statusPending}</option>
            <option value="Action Taken" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.statusActionTaken}</option>
            <option value="False Alarm" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.statusRejected}</option>
          </select>

          {/* Reporter Filter */}
          <select
            value={reporterFilter}
            onChange={(e) => setReporterFilter(e.target.value)}
            className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border focus:outline-none cursor-pointer transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="All" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.reporterAll}</option>
            <option value="Officer" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.reporterOfficer}</option>
            <option value="Citizen" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>{t.reporterCitizen}</option>
          </select>

          {/* View Toggle (List vs Map) */}
          <div className={`flex p-1 rounded-xl text-xs font-semibold border ${
            isDarkMode ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.viewList}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.viewMap}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: List Feed or Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border text-xs ${
                  isDarkMode ? 'bg-[#0f121a]/85 border-white/[0.07] text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                  <AlertTriangle size={28} className="mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="font-semibold">{t.noAlertsFound}</p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const isCurrent = selectedReport?.id === report.id;
                  const statusObj = getStatusBadge(report.status);
                  const StatusIcon = statusObj.icon;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        isCurrent
                          ? isDarkMode
                            ? 'bg-blue-500/[0.08] border-blue-500/40 ring-1 ring-blue-500/30 shadow-lg'
                            : 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                          : isDarkMode
                          ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusObj.bg}`}>
                            <StatusIcon size={11} /> {statusObj.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{report.time}</span>
                      </div>

                      <h3 className={`text-sm font-bold leading-snug ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                        {report.title}
                      </h3>

                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {report.desc}
                      </p>

                      <div className={`flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t text-[11px] ${
                        isDarkMode ? 'border-white/[0.05]' : 'border-slate-200/50'
                      }`}>
                        <span className="text-blue-400 font-medium flex items-center gap-1">
                          <MapPin size={12} /> {report.location}
                        </span>

                        <span className={`flex items-center gap-1 font-semibold ${
                          report.reporterType === 'Officer' ? 'text-emerald-400' : 'text-zinc-400'
                        }`}>
                          <User size={12} /> {report.reporter} ({report.reporterType === 'Officer' ? 'Officer' : 'Citizen'})
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          ) : (
            /* Interactive Leaflet Map for Field Reports */
            <div className={`rounded-2xl border overflow-hidden relative ${
              isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <div className="h-[520px] sm:h-[620px] w-full relative z-0">
                <MapContainer center={[26.5000, 91.5000]} zoom={7} className="h-full w-full" zoomControl={false}>
                  <MapPanController targetCenter={targetCenter} />

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

                  {/* Render Field Report Pins on Map */}
                  {filteredReports.map((report) => {
                    const isSelected = selectedReport?.id === report.id;
                    const markerColor =
                      report.status === 'Verified'
                        ? '#10b981'
                        : report.status === 'Action Taken'
                        ? '#3b82f6'
                        : report.status === 'False Alarm'
                        ? '#64748b'
                        : '#f59e0b';

                    return (
                      <div key={report.id}>
                        <CircleMarker
                          center={report.coords}
                          radius={isSelected ? 26 : 18}
                          pathOptions={{
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: isSelected ? 0.35 : 0.2,
                            weight: isSelected ? 2.5 : 1
                          }}
                          eventHandlers={{
                            click: () => handleSelectReport(report)
                          }}
                        />

                        <CircleMarker
                          center={report.coords}
                          radius={isSelected ? 9 : 6}
                          pathOptions={{
                            color: '#ffffff',
                            fillColor: markerColor,
                            fillOpacity: 1,
                            weight: 2
                          }}
                          eventHandlers={{
                            click: () => handleSelectReport(report)
                          }}
                        >
                          <Popup>
                            <div className="p-1 min-w-[180px]">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityBadge(report.severity)}`}>
                                {report.status} • {report.severity}
                              </span>
                              <p className="font-bold text-xs text-slate-900 mt-1">{report.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{report.location}</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      </div>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Selected Report Detailed Inspector & Officer Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-5 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f121a]/95 border-white/[0.08] shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'
              } backdrop-blur-xl min-h-[550px]`}
            >
              <div>
                {/* Header Info */}
                <div className={`flex justify-between items-start gap-2 mb-3 pb-3 border-b ${
                  isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">{selectedReport.id}</span>
                    <h2 className={`text-base sm:text-lg font-bold mt-0.5 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                      {selectedReport.title}
                    </h2>
                    <p className="text-xs text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {selectedReport.location}, {selectedReport.district}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(selectedReport.severity)}`}>
                      {selectedReport.severity}
                    </span>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">{selectedReport.time}</p>
                  </div>
                </div>

                {/* Reporter & Verification Source Badge */}
                <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between ${
                  isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                      <User size={16} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                        {selectedReport.reporter}
                      </p>
                      <p className="text-[11px] text-zinc-400">{selectedReport.department}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(selectedReport.status).bg}`}>
                    {getStatusBadge(selectedReport.status).label}
                  </span>
                </div>

                {/* Ground Truth Breakdown Attributes */}
                <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] font-medium text-zinc-400 block">{t.hazardType}</span>
                    <span className={`font-semibold mt-0.5 block ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {selectedReport.category}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] font-medium text-zinc-400 block">{t.roadStatus}</span>
                    <span className="font-semibold text-amber-400 mt-0.5 block">
                      {selectedReport.roadStatus}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    {t.reportDetails}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                    {selectedReport.desc}
                  </p>
                </div>

                {/* Evidence Photo Preview */}
                {selectedReport.evidenceImage && (
                  <div className="mb-4">
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      <Camera size={13} /> {t.photosEvidence}
                    </h4>
                    <div className="h-36 w-full rounded-xl overflow-hidden border border-white/[0.08] relative shadow-sm">
                      <img
                        src={selectedReport.evidenceImage}
                        alt="Landslide Site Evidence"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 text-[9px] bg-black/80 text-white px-2 py-0.5 rounded font-mono border border-white/10">
                        Geo-Tagged • ISO 2026
                      </span>
                    </div>
                  </div>
                )}

                {/* Official Officer Notes */}
                {selectedReport.officerNotes && (
                  <div className={`p-3 rounded-xl border mb-4 text-xs ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06] text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5 text-blue-400 mb-1">
                      <ShieldCheck size={14} /> {t.officerNotes}
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-90">{selectedReport.officerNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Field Officers & Authorities */}
              <div className={`pt-3 border-t flex flex-col gap-2 ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
              }`}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVerify(selectedReport.id)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/30"
                  >
                    <CheckCircle2 size={15} /> {t.verifyAction}
                  </button>

                  <button
                    onClick={() => handleDispatchCrew(selectedReport.id)}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-400/30"
                  >
                    <Truck size={15} /> {t.dispatchPwbAction}
                  </button>
                </div>

                <button
                  onClick={() => handleReject(selectedReport.id)}
                  className={`py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isDarkMode
                      ? 'border-white/[0.08] text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10'
                      : 'border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  <Ban size={13} /> {t.rejectAction}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className={`p-10 rounded-2xl border text-center text-xs ${
              isDarkMode ? 'bg-[#0f121a]/85 border-white/[0.07] text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <p>Select any field report to view ground verification details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit New Field Observation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <SubmitReportModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddNewReport}
            isDarkMode={isDarkMode}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Modal Component to Submit a New Field Report
function SubmitReportModal({ isOpen, onClose, onSubmit, isDarkMode, t }) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('East Sikkim');
  const [coords, setCoords] = useState([27.0250, 88.4890]);
  const [reporter, setReporter] = useState('');
  const [reporterType, setReporterType] = useState('Officer');
  const [severity, setSeverity] = useState('Critical');
  const [category, setCategory] = useState('Debris & Mudslide Flow');
  const [roadStatus, setRoadStatus] = useState('Completely Blocked');
  const [desc, setDesc] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords([parseFloat(pos.coords.latitude.toFixed(4)), parseFloat(pos.coords.longitude.toFixed(4))]);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      id: `FR-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      location: locationName.trim() || 'Reported Field Corridor',
      district,
      coords,
      reporter: reporter.trim() || (reporterType === 'Officer' ? 'Field Inspection Team' : 'Local Commuter'),
      reporterType,
      department: reporterType === 'Officer' ? 'SDMA Disaster Response Cell' : 'Citizen Ground Network',
      time: 'Just now',
      status: reporterType === 'Officer' ? 'Verified' : 'Pending Review',
      severity,
      category,
      roadStatus,
      rainfall: 'Active Rainfall Zone',
      desc: desc.trim() || 'Visual ground confirmation of slope deformation.',
      officerNotes: officerNotes.trim(),
      evidenceImage: null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 relative ${
          isDarkMode ? 'bg-[#0c0e14] border-white/[0.09] text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`flex justify-between items-center mb-4 pb-3 border-b ${isDarkMode ? 'border-white/[0.08]' : 'border-slate-200/60'}`}>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={18} />
            </div>
            <h3 className="font-bold text-base tracking-tight">{t.submitModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Offline Support Notice */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] font-mono ${
            isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <WifiOff size={14} className="shrink-0" />
            <span>{t.offlineNotice}</span>
          </div>

          {/* Reporter Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.reporterTypeLabel}</label>
              <select
                value={reporterType}
                onChange={(e) => setReporterType(e.target.value)}
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="Officer" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.reporterOfficer}</option>
                <option value="Citizen" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.reporterCitizen}</option>
              </select>
            </div>
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.reporterName}</label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="e.g. Officer Name or Citizen ID"
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.incidentTitle} *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rockfall breach near KM-18"
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Location & GPS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.locationName}</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. NH-10 Teesta Sector"
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>State / District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="East Sikkim" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>East Sikkim</option>
                <option value="North Sikkim" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>North Sikkim</option>
                <option value="Dima Hasao (Assam)" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Dima Hasao (Assam)</option>
                <option value="West Kameng (Arunachal)" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>West Kameng (Arunachal)</option>
                <option value="Kohima (Nagaland)" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Kohima (Nagaland)</option>
                <option value="Ri-Bhoi (Meghalaya)" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Ri-Bhoi (Meghalaya)</option>
              </select>
            </div>
          </div>

          {/* GPS Autofill */}
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
              GPS: {coords[0]}° N, {coords[1]}° E
            </span>
            <button
              type="button"
              onClick={handleUseGps}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Crosshair size={12} /> {t.useCurrentCoords}
            </button>
          </div>

          {/* Hazard Type, Severity & Road Blockage */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.severity}</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={`w-full p-2 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="Critical" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Critical</option>
                <option value="High" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>High</option>
                <option value="Moderate" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Moderate</option>
                <option value="Minor" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Minor</option>
              </select>
            </div>
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.hazardType}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="Debris & Mudslide Flow" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.hazardMudslide}</option>
                <option value="Rockfall & Scree Collapse" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.hazardRockfall}</option>
                <option value="Road Subsidence & Tension Cracks" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.hazardCrack}</option>
                <option value="Culvert Clogging & Runoff" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.hazardWater}</option>
              </select>
            </div>
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.roadStatus}</label>
              <select
                value={roadStatus}
                onChange={(e) => setRoadStatus(e.target.value)}
                className={`w-full p-2 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="Completely Blocked" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.roadBlocked}</option>
                <option value="Single Lane Passable" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.roadPartial}</option>
                <option value="Passable with Caution" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.roadCaution}</option>
                <option value="Road Clear" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>{t.roadClear}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.description} *</label>
            <textarea
              required
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe physical volume, boulder sizes, slope movement speed..."
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Officer Action / Notes */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.officerNotes}</label>
            <input
              type="text"
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="e.g. Police checkpoint alerted; excavator mobilized."
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          <div className={`flex justify-end space-x-3 pt-3 border-t ${isDarkMode ? 'border-white/[0.08]' : 'border-slate-200/60'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                isDarkMode ? 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 border border-blue-400/30 cursor-pointer active:scale-95 transition-all"
            >
              {t.submitReport}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
