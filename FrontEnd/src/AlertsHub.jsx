import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Radio,
  Volume2,
  Smartphone,
  CheckCircle2,
  Clock,
  Send,
  Users,
  ShieldAlert,
  Search,
  Plus,
  X,
  MapPin,
  Check,
  Building,
  Flame,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  PhoneCall
} from 'lucide-react';

const INITIAL_ALERTS = [
  {
    id: 'ALT-2026-RED-01',
    tier: 'Red',
    title: 'CRITICAL: Immediate Road Closure & Evacuation on NH-10 Teesta Corridor',
    corridor: 'NH-10 (Sevoke - Singtam, Sikkim Border)',
    trigger: 'Cumulative 24h Rain: 148mm + Soil Saturation: 92% + InSAR Creep: >12mm/week',
    authorizer: 'Sikkim SDMA & Kalimpong District Administration',
    time: '18 mins ago',
    channels: ['SMS', 'Sirens', 'Push', 'Agency', 'Radio'],
    reach: 16400,
    deliveredRate: 98.4,
    status: 'Active',
    coords: [27.0850, 88.5120],
    smsEnglish: 'EMERGENCY WARNING: Imminent landslide risk on NH-10 Teesta Gorge between Sevoke and Singtam. Road closed by SDMA. Evacuate roadside slopes immediately to Singtam Community Shelter.',
    smsHindi: 'आपातकालीन चेतावनी: सेवक और सिंगताम के बीच NH-10 तीस्ता घाटी पर गंभीर भूस्खलन का खतरा। सड़क बंद की गई। तुरंत सुरक्षित आश्रय स्थल पर जाएं।'
  },
  {
    id: 'ALT-2026-ORG-04',
    tier: 'Orange',
    title: 'WATCH: Heavy Slope Saturation along Mangan - Chungthang Axis',
    corridor: 'North Sikkim Strategic Route',
    trigger: 'Severe rainfall + Glacial runoff telemetry alert #3',
    authorizer: 'North Sikkim District Control & BRO Taskforce Swastik',
    time: '1 hour ago',
    channels: ['SMS', 'Push', 'Agency'],
    reach: 7800,
    deliveredRate: 96.2,
    status: 'Active',
    coords: [27.5100, 88.6300],
    smsEnglish: 'LANDSLIDE WATCH: Mangan-Chungthang corridor saturated. Restrict non-essential travel. Emergency rescue squads pre-positioned.',
    smsHindi: 'भूस्खलन निगरानी: मंगन-चुंगथांग मार्ग पर भारी ढलान संतृप्ति। अनावश्यक यात्रा न करें। बचाव दल तैनात।'
  },
  {
    id: 'ALT-2026-ORG-07',
    tier: 'Orange',
    title: 'WATCH: Track Telemetry Threshold Exceeded - Lumding-Badarpur Railway',
    corridor: 'Haflong Hill Section, Dima Hasao, Assam',
    trigger: 'Rainfall 115mm + Continuous Inclinometer Movement >4mm',
    authorizer: 'Northeast Frontier Railway (NFR) & Dima Hasao DDMA',
    time: '3 hours ago',
    channels: ['Agency', 'SMS'],
    reach: 4200,
    deliveredRate: 99.1,
    status: 'Active',
    coords: [25.1700, 93.0200],
    smsEnglish: 'RAIL SAFETY WATCH: Automatic speed restrictions enforced on Lumding-Badarpur hill segment. Track inspection squads active.',
    smsHindi: 'रेल सुरक्षा निगरानी: लुमडिंग-बदरपुर पहाड़ी खंड पर गति सीमा लागू। ट्रैक निरीक्षण दल सक्रिय।'
  },
  {
    id: 'ALT-2026-YEL-11',
    tier: 'Yellow',
    title: 'ADVISORY: Wet Weather & Falling Scree Warning on Bhalukpong-Tawang Route',
    corridor: 'West Kameng, Arunachal Pradesh',
    trigger: 'Dense monsoon fog + Rolling gravel at KM-42',
    authorizer: 'Arunachal Police Highway Patrol & Tourism Dept',
    time: '5 hours ago',
    channels: ['Push', 'SMS'],
    reach: 12800,
    deliveredRate: 94.6,
    status: 'Active',
    coords: [27.3500, 92.4200],
    smsEnglish: 'TRAVEL ADVISORY: Reduced visibility and sporadic rockfalls near Sela foothills. Maintain low speed; night travel discouraged.',
    smsHindi: 'यात्रा सलाह: सेला तलहटी के पास दृश्यता कम और पत्थर गिरने का खतरा। रात में यात्रा करने से बचें।'
  },
  {
    id: 'ALT-2026-GRN-02',
    tier: 'Green',
    title: 'ALL CLEAR: Shillong Bypass Restored & Declared Safe by PWD',
    corridor: 'Shillong Bypass - Umroi Corridor, Meghalaya',
    trigger: 'Roadway completely cleared; slope sensors report stabilized drainage',
    authorizer: 'Meghalaya PWD Highway Division',
    time: '8 hours ago',
    channels: ['Push', 'SMS', 'Agency'],
    reach: 9400,
    deliveredRate: 97.8,
    status: 'Resolved',
    coords: [25.6800, 91.9500],
    smsEnglish: 'ALL CLEAR: Shillong Bypass slope debris cleared. Two-way vehicular movement officially resumed.',
    smsHindi: 'सामान्य स्थिति: शिलांग बाईपास पर मलबा साफ किया गया। यातायात दोनों दिशाओं में पुनः शुरू।'
  }
];

export default function AlertsHub({ isDarkMode, t }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [tierFilter, setTierFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(INITIAL_ALERTS[0]);

  // Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Test SMS Simulator State
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState(null);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesTier =
        tierFilter === 'All' ||
        (tierFilter === 'Red' && alert.tier === 'Red') ||
        (tierFilter === 'Orange' && alert.tier === 'Orange') ||
        (tierFilter === 'Yellow' && alert.tier === 'Yellow') ||
        (tierFilter === 'Resolved' && alert.status === 'Resolved');
      const matchesSearch =
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.corridor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.trigger.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [alerts, tierFilter, searchQuery]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'Active');
    const totalReach = alerts.reduce((acc, curr) => acc + curr.reach, 0);
    const redCount = alerts.filter((a) => a.tier === 'Red' && a.status === 'Active').length;
    return {
      activeWarnings: active.length,
      smsDelivered: '50,600',
      sirensArmed: redCount * 6 + 6,
      populationCovered: totalReach.toLocaleString()
    };
  }, [alerts]);

  // Escalate Alert
  const handleEscalate = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              tier: 'Red',
              title: `CRITICAL ESCALATION: ${a.title.replace(/WATCH:|ADVISORY:/g, '').trim()}`,
              time: 'Just now',
              channels: ['SMS', 'Sirens', 'Push', 'Agency', 'Radio']
            }
          : a
      )
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) => ({
        ...prev,
        tier: 'Red',
        title: `CRITICAL ESCALATION: ${prev.title.replace(/WATCH:|ADVISORY:/g, '').trim()}`,
        time: 'Just now',
        channels: ['SMS', 'Sirens', 'Push', 'Agency', 'Radio']
      }));
    }
  };

  // Issue All Clear
  const handleIssueAllClear = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              tier: 'Green',
              status: 'Resolved',
              title: `RESOLVED: ${a.title.replace(/CRITICAL:|WATCH:|ADVISORY:/g, '').trim()}`,
              time: 'Just now'
            }
          : a
      )
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) => ({
        ...prev,
        tier: 'Green',
        status: 'Resolved',
        title: `RESOLVED: ${prev.title.replace(/CRITICAL:|WATCH:|ADVISORY:/g, '').trim()}`,
        time: 'Just now'
      }));
    }
  };

  // Broadcast New Alert
  const handleBroadcastNewAlert = (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
    setSelectedAlert(newAlert);
    setIsBroadcastModalOpen(false);
  };

  // Test SMS Simulator Handler
  const handleSendTestSms = (e) => {
    e.preventDefault();
    if (!testPhoneNumber.trim()) return;
    setTestSmsStatus('sending');
    setTimeout(() => {
      setTestSmsStatus('sent');
      setTimeout(() => setTestSmsStatus(null), 5000);
    }, 1200);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Red':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
          border: 'border-l-rose-500',
          indicator: 'bg-rose-500',
          label: t.tierRed
        };
      case 'Orange':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
          border: 'border-l-amber-500',
          indicator: 'bg-amber-500',
          label: t.tierOrange
        };
      case 'Yellow':
        return {
          badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
          border: 'border-l-yellow-400',
          indicator: 'bg-yellow-400',
          label: t.tierYellow
        };
      default:
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
          border: 'border-l-emerald-500',
          indicator: 'bg-emerald-500',
          label: t.tierGreen
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <Radio size={20} className="animate-pulse" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.alertsHubTitle}
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            {t.alertsHubSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-600/25 border border-rose-400/30 transition-all active:scale-95 flex items-center text-xs cursor-pointer"
        >
          <Radio size={15} className="mr-2 animate-pulse" /> {t.broadcastNewAlert}
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t.activeAlertsCount, value: stats.activeWarnings, dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]' },
          { label: t.deliveredSms, value: stats.smsDelivered, dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
          { label: t.sirensTriggered, value: stats.sirensArmed, dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' },
          { label: t.populationWarned, value: stats.populationCovered, dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' }
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

      {/* Filter and Search Bar */}
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

        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'All', label: t.filterAll },
            { id: 'Red', label: t.tierRed },
            { id: 'Orange', label: t.tierOrange },
            { id: 'Yellow', label: t.tierYellow },
            { id: 'Resolved', label: t.tierGreen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTierFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                tierFilter === tab.id
                  ? isDarkMode
                    ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'bg-white/[0.02] text-zinc-400 border border-white/[0.04] hover:text-white hover:bg-white/[0.06]'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Alerts Stream & Alert Operations Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Alerts Feed */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {filteredAlerts.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border text-xs ${
              isDarkMode ? 'bg-[#0f121a]/85 border-white/[0.07] text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <AlertTriangle size={28} className="mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="font-semibold">{t.noAlertsFound}</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCurrent = selectedAlert?.id === alert.id;
              const tierInfo = getTierColor(alert.tier);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border border-l-4 transition-all cursor-pointer relative group ${
                    tierInfo.border
                  } ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-[#0f121a] border-white/[0.18] shadow-xl shadow-black/40 ring-1 ring-white/[0.15]'
                        : 'bg-blue-50/70 ring-2 ring-blue-500/30 shadow-lg'
                      : isDarkMode
                      ? 'bg-[#0f121a]/70 border-white/[0.06] hover:border-white/[0.14] hover:bg-[#0f121a]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierInfo.badge}`}>
                        {tierInfo.label}
                      </span>
                      <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{alert.id}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{alert.time}</span>
                  </div>

                  <h3 className={`text-sm font-semibold leading-snug ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {alert.title}
                  </h3>

                  <p className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1.5">
                    <MapPin size={12} /> {alert.corridor}
                  </p>

                  <p className={`text-[11px] mt-1 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    ⚡ {alert.trigger}
                  </p>

                  {/* Active Channels & Reach Footer */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t text-[11px] ${
                    isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {alert.channels.includes('SMS') && (
                        <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="SMS Enabled">
                          <Smartphone size={13} />
                        </span>
                      )}
                      {alert.channels.includes('Sirens') && (
                        <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20" title="Sirens Armed">
                          <Volume2 size={13} />
                        </span>
                      )}
                      {alert.channels.includes('Push') && (
                        <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20" title="App Push Active">
                          <Bell size={13} />
                        </span>
                      )}
                      {alert.channels.includes('Radio') && (
                        <span className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Radio Broadcast">
                          <Radio size={13} />
                        </span>
                      )}
                    </div>

                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-700'}`}>
                      👥 {alert.reach.toLocaleString()} reached ({alert.deliveredRate}%)
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right Section: Alert Operations Center & SMS Simulator */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedAlert && (
            <motion.div
              key={selectedAlert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border shadow-xl p-5 flex flex-col justify-between relative overflow-hidden ${
                isDarkMode ? 'bg-[#0f121a]/95 border-white/[0.08] shadow-black/50' : 'bg-white border-slate-200'
              } backdrop-blur-xl`}
            >
              {isDarkMode && (
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              )}
              <div>
                <div className={`flex justify-between items-start gap-2 mb-3 pb-3 border-b ${
                  isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
                }`}>
                  <div>
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{selectedAlert.id}</span>
                    <h3 className={`text-base font-bold mt-0.5 tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                      {selectedAlert.title}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {selectedAlert.corridor}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getTierColor(selectedAlert.tier).badge}`}>
                    {selectedAlert.tier}
                  </span>
                </div>

                {/* Authorizer & Threshold Details */}
                <div className="space-y-3 mb-4 text-xs">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                      {t.authorizer}
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                      🏛️ {selectedAlert.authorizer}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                      {t.triggerThreshold}
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                      📊 {selectedAlert.trigger}
                    </span>
                  </div>
                </div>

                {/* Multilingual Broadcast Preview Cards */}
                <div className="space-y-2.5 mb-5">
                  <h4 className={`text-xs font-mono uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Broadcast Message Payloads
                  </h4>

                  {/* English Payload */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1 uppercase tracking-wide">English (SMS & Audio)</span>
                    <p className={`leading-relaxed text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>
                      {selectedAlert.smsEnglish}
                    </p>
                  </div>

                  {/* Hindi Payload */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1 uppercase tracking-wide">हिंदी (एसएमएस एवं प्रसारण)</span>
                    <p className={`leading-relaxed text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>
                      {selectedAlert.smsHindi}
                    </p>
                  </div>
                </div>

                {/* Delivery Analytics */}
                <div className={`p-3 rounded-xl border mb-5 ${
                  isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className={`font-mono text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>{t.deliveryStats}</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedAlert.deliveredRate}% Delivered</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedAlert.deliveredRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Operations */}
              <div className={`pt-3 border-t flex flex-col gap-2 ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
              }`}>
                {selectedAlert.tier !== 'Red' && selectedAlert.status === 'Active' && (
                  <button
                    onClick={() => handleEscalate(selectedAlert.id)}
                    className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 border border-rose-400/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight size={15} /> {t.escalateAlert}
                  </button>
                )}

                {selectedAlert.status === 'Active' && (
                  <button
                    onClick={() => handleIssueAllClear(selectedAlert.id)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 border border-emerald-400/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} /> {t.issueAllClear}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Test SMS Simulator Widget */}
          <div className={`rounded-2xl border p-4 relative overflow-hidden ${
            isDarkMode ? 'bg-[#0f121a]/85 border-white/[0.07] shadow-lg shadow-black/30' : 'bg-white border-slate-200 shadow-md'
          } backdrop-blur-xl`}>
            {isDarkMode && (
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-cyan-400">
              <PhoneCall size={15} />
              <span>{t.testSmsSimulator}</span>
            </div>
            <p className={`text-[11px] mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              {t.testSmsPrompt}
            </p>

            <form onSubmit={handleSendTestSms} className="flex gap-2">
              <input
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder={t.testPhonePlaceholder}
                className={`flex-1 px-3 py-1.5 text-xs rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              <button
                type="submit"
                disabled={testSmsStatus === 'sending'}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 border border-cyan-400/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {testSmsStatus === 'sending' ? 'Sending...' : t.sendMockSms}
              </button>
            </form>

            {testSmsStatus === 'sent' && (
              <p className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 size={13} /> {t.smsSentNotice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Emergency Alert Modal */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <BroadcastModal
            isOpen={isBroadcastModalOpen}
            onClose={() => setIsBroadcastModalOpen(false)}
            onSubmit={handleBroadcastNewAlert}
            isDarkMode={isDarkMode}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Interactive Modal for Dispatching a New Emergency Warning
function BroadcastModal({ isOpen, onClose, onSubmit, isDarkMode, t }) {
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState('Red');
  const [corridor, setCorridor] = useState('NH-10 Sevoke - Singtam Corridor');
  const [trigger, setTrigger] = useState('Rainfall > 120mm in 3h + telemetry pore pressure threshold');
  const [authorizer, setAuthorizer] = useState('State Disaster Management Authority (SDMA)');
  const [smsEnglish, setSmsEnglish] = useState('EMERGENCY ALERT: High landslide probability along NH-10. Immediate precautionary evacuation recommended. Avoid road transit.');
  const [smsHindi, setSmsHindi] = useState('आपातकालीन चेतावनी: NH-10 पर भारी भूस्खलन की आशंका। तुरंत सुरक्षित स्थान पर जाएं। यात्रा से बचें।');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      id: `ALT-2026-${tier.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      tier,
      title: title.trim(),
      corridor,
      trigger: trigger.trim(),
      authorizer: authorizer.trim(),
      time: 'Just now',
      channels: ['SMS', 'Sirens', 'Push', 'Agency'],
      reach: 14200,
      deliveredRate: 98.2,
      status: 'Active',
      coords: [27.0850, 88.5120],
      smsEnglish: smsEnglish.trim(),
      smsHindi: smsHindi.trim()
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
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Radio size={18} />
            </div>
            <h3 className="font-bold text-base tracking-tight">{t.broadcastNewAlert}</h3>
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
          {/* Warning Tier */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Red', label: 'RED (Warning)', color: 'border-rose-500/40 bg-rose-500/15 text-rose-400' },
              { id: 'Orange', label: 'ORANGE (Watch)', color: 'border-amber-500/40 bg-amber-500/15 text-amber-400' },
              { id: 'Yellow', label: 'YELLOW (Advisory)', color: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400' }
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setTier(lvl.id)}
                className={`py-2 px-1.5 rounded-xl border text-center font-semibold text-[11px] transition-all cursor-pointer ${
                  tier === lvl.id
                    ? `${lvl.color} ring-1 ring-current`
                    : isDarkMode
                    ? 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12]'
                    : 'border-slate-300 text-slate-400 opacity-70'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Alert Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CRITICAL: Imminent slope collapse on NH-10 KM-32"
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
              }`}
            />
          </div>

          {/* Corridor & Authority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.targetArea}</label>
              <select
                value={corridor}
                onChange={(e) => setCorridor(e.target.value)}
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
                }`}
              >
                <option value="NH-10 Sevoke - Singtam Corridor" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>NH-10 (Sevoke - Singtam, Sikkim)</option>
                <option value="Mangan - Chungthang Axis" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Mangan - Chungthang (North Sikkim)</option>
                <option value="Haflong Hill Section" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Haflong Hill Corridor (Assam)</option>
                <option value="Bhalukpong - Tawang Axis" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Bhalukpong - Tawang (Arunachal)</option>
                <option value="Kohima - Dimapur NH-29" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Kohima - Dimapur NH-29 (Nagaland)</option>
                <option value="Shillong Bypass" className={isDarkMode ? 'bg-[#0f121a] text-zinc-100' : ''}>Shillong Bypass (Meghalaya)</option>
              </select>
            </div>
            <div>
              <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.authorizer}</label>
              <input
                type="text"
                value={authorizer}
                onChange={(e) => setAuthorizer(e.target.value)}
                className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
                }`}
              />
            </div>
          </div>

          {/* Trigger Condition */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.triggerThreshold}</label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
              }`}
            />
          </div>

          {/* SMS Payload English */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>English Broadcast SMS</label>
            <textarea
              rows={2}
              value={smsEnglish}
              onChange={(e) => setSmsEnglish(e.target.value)}
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
              }`}
            />
          </div>

          {/* SMS Payload Hindi */}
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Hindi Broadcast SMS (हिंदी संदेश)</label>
            <textarea
              rows={2}
              value={smsHindi}
              onChange={(e) => setSmsHindi(e.target.value)}
              className={`w-full p-2.5 rounded-xl border transition-all focus:outline-none ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500'
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/25 border border-rose-400/30 cursor-pointer active:scale-95 transition-all"
            >
              Broadcast Alert
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
