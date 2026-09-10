import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  FileText,
  Bell,
  Settings as SettingsIcon,
  Menu,
  X,
  Sun,
  Moon,
  Crosshair,
  Navigation,
  Loader2,
  Globe,
  Search,
  Plus,
  CheckCircle2,
  Trash2,
  MapPin,
  AlertTriangle,
  Radio,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { translations } from './translations';
import RiskHeatmaps from './RiskHeatmaps';
import FieldReports from './FieldReports';
import AlertsHub from './AlertsHub';
import Settings from './Settings';

// Configure default Leaflet marker icons for React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map controller helper - pans smoothly without altering zoom when zoom is omitted
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      if (targetZoom) {
        map.flyTo(targetCenter, targetZoom, { duration: 1.4 });
      } else {
        map.panTo(targetCenter, { animate: true, duration: 0.8 });
      }
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

// Sidebar Navigation Component
function Sidebar({ isOpen, toggleSidebar, isDarkMode, t }) {
  const location = useLocation();
  const navItems = [
    { path: '/', label: t.dashboard, icon: Home },
    { path: '/heatmap', label: t.heatmap, icon: MapIcon },
    { path: '/reports', label: t.reports, icon: FileText },
    { path: '/alerts', label: t.alerts, icon: Bell },
    { path: '/settings', label: t.settings, icon: SettingsIcon },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-40 w-64 ${
          isDarkMode ? 'bg-[#0c0e14]/95 border-white/[0.07] shadow-2xl shadow-black/50' : 'bg-white/95 border-slate-200'
        } backdrop-blur-xl border-r flex flex-col transition-colors duration-300`}
        initial={{ x: '-100%' }}
        animate={{ x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      >
        <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 border border-white/10">
              <MapIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                {t.appName}
              </h1>
              <p className="text-[10px] text-blue-400 font-mono font-medium tracking-wider uppercase">
                {t.appSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-sm ${
                      isActive
                        ? isDarkMode
                          ? 'text-white font-semibold'
                          : 'bg-blue-50 text-blue-600 font-semibold'
                        : isDarkMode
                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className={`absolute inset-0 rounded-xl ${
                          isDarkMode
                            ? 'bg-white/[0.08] border border-white/[0.12] shadow-sm shadow-black/40'
                            : 'bg-blue-500/10 border border-blue-500/30'
                        }`}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                      />
                    )}
                    <Icon size={18} className={`mr-3 relative z-10 transition-colors ${isActive ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : ''}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t text-[11px] font-medium text-center ${
          isDarkMode ? 'border-white/[0.06] text-zinc-500' : 'border-slate-200/70 text-slate-400'
        }`}>
          {t.teamCredit}
        </div>
      </motion.aside>
    </>
  );
}

// Top Navbar Component
function Navbar({ toggleSidebar, isDarkMode, toggleTheme, language, setLanguage, t }) {
  return (
    <header
      className={`h-16 ${
        isDarkMode ? 'bg-[#0c0e14]/80 border-white/[0.06]' : 'bg-white/80 border-slate-200/70'
      } backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 transition-colors duration-300`}
    >
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className={`lg:hidden mr-3 p-2 rounded-xl border ${
            isDarkMode
              ? 'border-white/[0.08] hover:bg-white/[0.05] text-zinc-300'
              : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <h2 className={`text-sm sm:text-base font-semibold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
          {t.overview}
        </h2>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Language Switcher */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`text-xs font-medium py-1.5 px-3 rounded-lg border focus:outline-none cursor-pointer transition-all ${
              isDarkMode
                ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:border-white/[0.16] hover:bg-white/[0.07]'
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
            aria-label="Select interface language"
          >
            <option value="en" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>English (EN)</option>
            <option value="hi" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>हिंदी (HI)</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-all ${
            isDarkMode
              ? 'bg-white/[0.04] border-white/[0.08] text-amber-400 hover:bg-white/[0.08] hover:border-white/[0.16]'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Minimal Earth Logo Icon */}
        <div
          title="Geospatial Earth Grid Active"
          className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer group ${
            isDarkMode
              ? 'bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/[0.1]'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20'
          }`}
        >
          <Globe
            size={17}
            className="transition-transform group-hover:rotate-45 duration-700"
          />
        </div>
      </div>
    </header>
  );
}

// Main Dashboard Component
function Dashboard({ isDarkMode, t, openReportModal, alertsList, setAlertsList, activeAlertId, setActiveAlertId }) {
  const [mapType, setMapType] = useState('english');
  const [targetView, setTargetView] = useState({ center: [26.2006, 92.9376], zoom: 7 });
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  // Alert feed filter & search states
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Geolocation Detection
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }
    setIsLocating(true);
    setLocationStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords = [latitude, longitude];
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setTargetView({ center: coords, zoom: 14 });
        setIsLocating(false);
        setLocationStatus({
          type: 'success',
          message: `${t.userLiveLocation} (${t.accuracy}: ~${Math.round(accuracy)}m)`
        });
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Could not access location. Please check browser permissions.';
        if (error.code === 1) msg = 'Location permission denied by user.';
        else if (error.code === 2) msg = 'Location position unavailable.';
        else if (error.code === 3) msg = 'Location request timed out.';
        setLocationStatus({ type: 'error', message: msg });
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleResetView = () => {
    setTargetView({ center: [26.2006, 92.9376], zoom: 7 });
  };

  // Pan map to specific alert location without changing user's zoom level
  const handleFocusAlert = (alert) => {
    setActiveAlertId(alert.id);
    if (alert.coords && alert.coords.length === 2) {
      setTargetView({ center: alert.coords, zoom: null });
    }
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (e, id) => {
    e.stopPropagation();
    setAlertsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, acknowledged: !item.acknowledged } : item))
    );
  };

  // Delete alert
  const handleDeleteAlert = (e, id) => {
    e.stopPropagation();
    setAlertsList((prev) => prev.filter((item) => item.id !== id));
    if (activeAlertId === id) setActiveAlertId(null);
  };

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alertsList.filter((item) => {
      const matchesFilter = severityFilter === 'All' || item.level === severityFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [alertsList, severityFilter, searchQuery]);

  // Dynamic Statistics with Minimalist Modern High-End Styling
  const stats = useMemo(() => {
    const activeCount = alertsList.filter((a) => !a.acknowledged).length;
    const criticalCount = alertsList.filter((a) => a.level === 'Critical').length;
    return [
      {
        label: t.activeAlerts,
        value: activeCount.toString(),
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
        color: isDarkMode ? 'text-zinc-100' : 'text-slate-900',
        badgeColor: isDarkMode ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-red-700 bg-red-50 border-red-200',
        badge: 'Critical Feed'
      },
      {
        label: t.highRiskZones,
        value: criticalCount.toString(),
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        color: isDarkMode ? 'text-zinc-100' : 'text-slate-900',
        badgeColor: isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-orange-700 bg-orange-50 border-orange-200',
        badge: 'Priority Watch'
      },
      {
        label: t.fieldReports24h,
        value: alertsList.length.toString(),
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
        color: isDarkMode ? 'text-zinc-100' : 'text-slate-900',
        badgeColor: isDarkMode ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-blue-700 bg-blue-50 border-blue-200',
        badge: 'Live Reports'
      },
      {
        label: t.safeCorridors,
        value: '89%',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        color: isDarkMode ? 'text-zinc-100' : 'text-slate-900',
        badgeColor: isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'Operational'
      }
    ];
  }, [alertsList, isDarkMode, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
            {t.realTimeMonitor}
          </h2>
          <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {t.nerSubtitle}
          </p>
        </div>
        <button
          onClick={openReportModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all active:scale-95 flex items-center text-xs sm:text-sm cursor-pointer border border-blue-400/30"
        >
          <Radio size={16} className="mr-2 animate-pulse text-cyan-300" /> {t.broadcastAlert}
        </button>
      </div>

      {/* Metrics Cards - Sleek Obsidian Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            key={stat.label}
            className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group ${
              isDarkMode
                ? 'bg-[#0f121a]/85 border-white/[0.07] hover:border-white/[0.16] shadow-xl shadow-black/40'
                : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
            }`}
          >
            {isDarkMode && (
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />
            )}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <span className={`text-[11px] font-mono font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {stat.label}
              </span>
              <div className={`h-2 w-2 rounded-full ${stat.dot}`} />
            </div>
            <div className="relative z-10 flex items-baseline justify-between">
              <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: GIS Map & Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className={`lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}
        >
          <div
            className={`p-4 border-b flex flex-wrap justify-between items-center gap-2 ${
              isDarkMode ? 'border-white/[0.06] bg-black/20' : 'border-slate-100'
            }`}
          >
            <h3 className={`font-semibold text-sm sm:text-base flex items-center ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              <MapIcon size={17} className="mr-2 text-blue-400" /> {t.gisRiskHeatmap}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {/* Map Tile Layers */}
              <div className={`flex rounded-lg p-1 text-xs border ${
                isDarkMode ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setMapType('english')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    mapType === 'english'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.mapEnglish}
                </button>
                <button
                  onClick={() => setMapType('osm')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    mapType === 'osm'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.mapOsm}
                </button>
                <button
                  onClick={() => setMapType('topo')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    mapType === 'topo'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.mapTopo}
                </button>
              </div>

              {/* Geolocation Button */}
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                title="Detect live GPS position"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{t.locating}</span>
                  </>
                ) : (
                  <>
                    <Crosshair size={13} />
                    <span>{t.locateMe}</span>
                  </>
                )}
              </button>

              {userLocation && (
                <button
                  onClick={handleResetView}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isDarkMode
                      ? 'border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Reset to Northeast regional view"
                >
                  {t.resetNer}
                </button>
              )}

              <span className="flex items-center text-xs text-emerald-400 font-medium ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span> {t.live}
              </span>
            </div>
          </div>

          {/* Location Notification Message */}
          {locationStatus && (
            <div
              className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                locationStatus.type === 'error'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Navigation size={13} className={locationStatus.type === 'error' ? 'text-red-400' : 'text-emerald-400'} />
                {locationStatus.message}
              </span>
              <button
                onClick={() => setLocationStatus(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Leaflet Map Display */}
          <div className="h-[420px] sm:h-[520px] w-full relative z-0">
            <MapContainer center={[26.2006, 92.9376]} zoom={7} className="h-full w-full" zoomControl={false}>
              <MapController targetCenter={targetView.center} targetZoom={targetView.zoom} />

              {mapType === 'osm' ? (
                <TileLayer
                  key="osm"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              ) : mapType === 'topo' ? (
                <TileLayer
                  key="topo"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri'
                />
              ) : isDarkMode ? (
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

              {/* User Live GPS Marker */}
              {userLocation && (
                <>
                  <CircleMarker
                    center={[userLocation.lat, userLocation.lng]}
                    radius={22}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.25,
                      weight: 2
                    }}
                  />
                  <CircleMarker
                    center={[userLocation.lat, userLocation.lng]}
                    radius={8}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: '#2563eb',
                      fillOpacity: 1,
                      weight: 2
                    }}
                  />
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                      <div className="p-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                          <span>{t.userLiveLocation}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.accuracy}: ±{Math.round(userLocation.accuracy)}m
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">{t.riskIndex}:</span>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {t.monitoringActive}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Dynamic Alert Hazards on Map */}
              {alertsList.map((alert) => {
                if (!alert.coords || alert.coords.length !== 2) return null;
                const isSelected = activeAlertId === alert.id;
                const markerColor =
                  alert.level === 'Critical' ? '#ef4444' : alert.level === 'Warning' ? '#f97316' : '#3b82f6';

                return (
                  <div key={alert.id}>
                    <CircleMarker
                      center={alert.coords}
                      radius={isSelected ? 38 : 28}
                      pathOptions={{
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: isSelected ? 0.5 : 0.28,
                        weight: isSelected ? 3 : 1
                      }}
                    />
                    <CircleMarker
                      center={alert.coords}
                      radius={isSelected ? 10 : 7}
                      pathOptions={{
                        color: '#ffffff',
                        fillColor: markerColor,
                        fillOpacity: 1,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="p-1 max-w-[200px]">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                alert.level === 'Critical'
                                  ? 'bg-red-100 text-red-700'
                                  : alert.level === 'Warning'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {alert.level}
                            </span>
                            <span className="text-[10px] text-slate-400">{alert.time}</span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{alert.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{alert.desc}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </div>
                );
              })}
            </MapContainer>
          </div>
        </motion.div>

        {/* Functional Alert Feed Card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className={`rounded-2xl border p-5 flex flex-col ${
            isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
          } backdrop-blur-xl`}
        >
          {/* Feed Title & Counter */}
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-bold flex items-center ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              <Bell size={16} className="mr-2 text-rose-400" /> {t.alertFeed}
              <span className={`ml-2 text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {filteredAlerts.length}
              </span>
            </h3>
            <button
              onClick={openReportModal}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center cursor-pointer"
            >
              <Plus size={14} className="mr-1" /> {t.addReportBtn}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border transition-all focus:outline-none ${
                isDarkMode
                  ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:bg-white/[0.06]'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            {['All', 'Critical', 'Warning', 'Advisory'].map((f) => {
              const labelMap = {
                All: t.filterAll,
                Critical: t.filterCritical,
                Warning: t.filterWarning,
                Advisory: t.filterAdvisory
              };
              const active = severityFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : isDarkMode
                      ? 'bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labelMap[f]}
                </button>
              );
            })}
          </div>

          {/* Alerts List */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                <AlertTriangle size={22} className="mx-auto mb-2 opacity-40" />
                <p>{t.noAlertsFound}</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = activeAlertId === alert.id;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={alert.id}
                    onClick={() => handleFocusAlert(alert)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? isDarkMode
                          ? 'ring-1 ring-blue-500/70 bg-blue-500/[0.08] border-blue-500/30'
                          : 'ring-2 ring-blue-500 bg-blue-50/50'
                        : isDarkMode
                        ? 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] hover:border-white/[0.12]'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className={`font-semibold text-xs ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                        {alert.title}
                      </p>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium tracking-wider shrink-0 border ${
                          alert.level === 'Critical'
                            ? isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' : 'bg-red-100 text-red-700'
                            : alert.level === 'Warning'
                            ? isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-orange-100 text-orange-700'
                            : isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {alert.level}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {alert.desc}
                    </p>

                    {alert.location && (
                      <p className="text-[10px] text-blue-400 flex items-center mt-1.5 font-medium">
                        <MapPin size={11} className="mr-1" /> {alert.location}
                      </p>
                    )}

                    <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                      isDarkMode ? 'border-white/[0.05]' : 'border-slate-200/40'
                    }`}>
                      <span className={isDarkMode ? 'text-zinc-500 font-mono' : 'text-slate-400'}>{alert.time}</span>
                      <div className="flex items-center gap-2">
                        {/* Acknowledge Button */}
                        <button
                          onClick={(e) => handleAcknowledgeAlert(e, alert.id)}
                          className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md transition-all ${
                            alert.acknowledged
                              ? isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-emerald-600 bg-emerald-50'
                              : isDarkMode
                              ? 'text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.05]'
                              : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-700/20'
                          }`}
                          title={alert.acknowledged ? t.acknowledged : t.acknowledge}
                        >
                          <Check size={11} />
                          {alert.acknowledged ? t.acknowledged : t.acknowledge}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteAlert(e, alert.id)}
                          className="text-zinc-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                          title="Dismiss alert"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Interactive Report Incident Modal Component
function ReportModal({ isOpen, onClose, onSubmit, isDarkMode, t }) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Critical');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('27.0238');
  const [lng, setLng] = useState('93.5000');
  const [desc, setDesc] = useState('');

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      id: Date.now(),
      title: title.trim(),
      level,
      location: locationName.trim() || 'Reported NER Route',
      time: 'Just now',
      desc: desc.trim() || 'Field verification in progress.',
      coords: [parseFloat(lat) || 26.2, parseFloat(lng) || 92.9],
      acknowledged: false,
      verified: true
    });

    // Reset Form
    setTitle('');
    setLocationName('');
    setDesc('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative ${
          isDarkMode ? 'bg-[#0f121a] border-white/[0.1] text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`flex justify-between items-center mb-5 pb-3 border-b ${
          isDarkMode ? 'border-white/[0.08]' : 'border-slate-200/60'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-sm sm:text-base">{t.modalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">{t.incidentTitle} *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.incidentTitlePlaceholder}
              className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:bg-white/[0.07]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.severity}</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-[#121622] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="Critical" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Critical</option>
                <option value="Warning" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Warning</option>
                <option value="Advisory" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Advisory</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.locationName}</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={t.locationPlaceholder}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:bg-white/[0.07]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.latitude}</label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.longitude}</label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseGps}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
          >
            <Crosshair size={12} /> {t.useCurrentCoords}
          </button>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">{t.description}</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.descPlaceholder}
              className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:bg-white/[0.07]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          <div className={`flex justify-end space-x-3 pt-3 border-t ${
            isDarkMode ? 'border-white/[0.08]' : 'border-slate-200/60'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
                isDarkMode ? 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 cursor-pointer border border-blue-400/30 text-xs"
            >
              {t.submitReport}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Initial Mock Hazard Alert Stream
const INITIAL_ALERTS = [
  {
    id: 1,
    title: 'NH-10 Sector 4 Landslide Risk',
    location: 'Sevoke - Gangtok Corridor, Sikkim',
    time: '10 mins ago',
    desc: 'Heavy soil saturation (>85%) with continuous torrential rainfall detected by telemetry.',
    level: 'Critical',
    coords: [27.0238, 93.5],
    acknowledged: false,
    verified: true
  },
  {
    id: 2,
    title: 'Tawang Route Slope Monitoring',
    location: 'West Kameng, Arunachal Pradesh',
    time: '1 hour ago',
    desc: 'Heavy precipitation forecast (120mm/24h) along unstable scree slopes.',
    level: 'Warning',
    coords: [27.5861, 91.8656],
    acknowledged: false,
    verified: true
  },
  {
    id: 3,
    title: 'Bridge 22 Blockage Advisory',
    location: 'Shillong Bypass, Meghalaya',
    time: '3 hours ago',
    desc: 'Field report verified: Partial rockfall debris cleared, traffic moving on single lane.',
    level: 'Advisory',
    coords: [25.5788, 91.8933],
    acknowledged: true,
    verified: true
  }
];

// App Root Component
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [alertsList, setAlertsList] = useState(INITIAL_ALERTS);

  // Requirement 5: Auto save and restore last used theme (dark/light)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('bhumi_theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  // Requirement 1 & 5: Auto save and restore language (English & Hindi)
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('bhumi_lang');
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  // Current translation dictionary
  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  // Persist Dark Mode to localStorage & HTML document class
  useEffect(() => {
    try {
      localStorage.setItem('bhumi_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.warn('Could not persist theme', e);
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist Language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bhumi_lang', language);
    } catch (e) {
      console.warn('Could not persist language', e);
    }
  }, [language]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleAddNewIncident = (newIncident) => {
    setAlertsList((prev) => [newIncident, ...prev]);
    setActiveAlertId(newIncident.id);
  };

  return (
    <Router>
      <div
        className={`min-h-screen font-sans transition-colors duration-300 ${
          isDarkMode ? 'bg-[#08090d] text-zinc-100 dark-micro-grid selection:bg-blue-500/30 selection:text-white' : 'bg-slate-50/80 text-slate-800 light-micro-grid'
        }`}
      >
        {/* Sleek Minimal Ambient Spotlight */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {isDarkMode ? (
            <>
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-500/10 via-indigo-500/[0.03] to-transparent blur-3xl rounded-full" />
              <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500/[0.02] blur-3xl rounded-full" />
            </>
          ) : (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full filter blur-[120px] opacity-20 bg-blue-300" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full filter blur-[120px] opacity-20 bg-indigo-200" />
            </>
          )}
        </div>

        <div className="relative z-10 flex">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} t={t} />

          <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full">
            <Navbar
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              language={language}
              setLanguage={setLanguage}
              t={t}
            />

            <main className="flex-1 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard
                        isDarkMode={isDarkMode}
                        t={t}
                        openReportModal={() => setIsModalOpen(true)}
                        alertsList={alertsList}
                        setAlertsList={setAlertsList}
                        activeAlertId={activeAlertId}
                        setActiveAlertId={setActiveAlertId}
                      />
                    }
                  />
                  <Route
                    path="/heatmap"
                    element={<RiskHeatmaps isDarkMode={isDarkMode} t={t} />}
                  />
                  <Route
                    path="/reports"
                    element={<FieldReports isDarkMode={isDarkMode} t={t} />}
                  />
                  <Route
                    path="/alerts"
                    element={<AlertsHub isDarkMode={isDarkMode} t={t} />}
                  />
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                        language={language}
                        setLanguage={setLanguage}
                        t={t}
                      />
                    }
                  />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* New Incident / Broadcast Modal */}
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddNewIncident}
          isDarkMode={isDarkMode}
          t={t}
        />
      </div>
    </Router>
  );
}

export default App;
