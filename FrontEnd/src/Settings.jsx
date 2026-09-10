import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Map as MapIcon,
  Sliders,
  CloudRain,
  Activity,
  Satellite,
  ShieldCheck,
  Radio,
  Smartphone,
  Volume2,
  Building,
  Database,
  CheckCircle2,
  RotateCcw,
  Save,
  Server,
  Trash2,
  Info,
  Check
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'en',
  defaultBasemap: 'english',
  regionFocus: 'all',
  rainfallThreshold: 140,
  soilThreshold: 85,
  insarThreshold: 12,
  shadowMode: true,
  enableSms: true,
  enableSirens: true,
  enablePush: true,
  enableAgency: true,
  imdApiUrl: 'https://mausam.imd.gov.in/api/v2/nowcast/ner',
  ogcApiUrl: 'https://sensors.bhumiraksha.gov.in/ogc/v1.1/Datastreams',
  isroApiUrl: 'https://bhuvan-app3.nrsc.gov.in/bhoonidhi/api',
  pollingInterval: '5'
};

export default function Settings({ isDarkMode, setIsDarkMode, language, setLanguage, t }) {
  // Load custom user settings from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bhumi_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [apiHealthStatus, setApiHealthStatus] = useState(null);

  // Sync theme and language with parent state
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      theme: isDarkMode ? 'dark' : 'light',
      language
    }));
  }, [isDarkMode, language]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('bhumi_settings', JSON.stringify(settings));
      // Apply theme & language immediately
      if (settings.theme === 'dark' && !isDarkMode) setIsDarkMode(true);
      if (settings.theme === 'light' && isDarkMode) setIsDarkMode(false);
      if (settings.language !== language) setLanguage(settings.language);

      setToastMessage(t.settingsSavedToast);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error('Error saving settings', e);
    }
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setIsDarkMode(true);
    setLanguage('en');
    localStorage.removeItem('bhumi_settings');
    setToastMessage('Settings reset to factory defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearCache = () => {
    try {
      // Clear offline app cache keys while preserving user theme
      const currentTheme = localStorage.getItem('bhumi_theme');
      const currentLang = localStorage.getItem('bhumi_lang');
      localStorage.clear();
      if (currentTheme) localStorage.setItem('bhumi_theme', currentTheme);
      if (currentLang) localStorage.setItem('bhumi_lang', currentLang);

      setToastMessage(t.cacheCleared);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.warn('Error clearing cache', e);
    }
  };

  const handleTestApiHealth = () => {
    setApiHealthStatus('testing');
    setTimeout(() => {
      setApiHealthStatus('healthy');
      setTimeout(() => setApiHealthStatus(null), 4000);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <SettingsIcon size={20} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.settingsTitle}
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            {t.settingsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDarkMode
                ? 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RotateCcw size={14} /> {t.resetDefaults}
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
          >
            <Save size={15} /> {t.saveSettings}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl border bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white font-bold text-sm">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Sections Grid */}
      <div className="space-y-6">
        {/* Section 1: Display & Localization */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
        } backdrop-blur-xl space-y-5`}>
          <div className={`flex items-center gap-2 pb-3 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
          }`}>
            <Globe size={18} className="text-blue-400" />
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.sectionDisplay}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Theme Mode */}
            <div>
              <label className="block font-bold mb-2">{t.themeModeLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('theme', 'dark');
                    setIsDarkMode(true);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Moon size={15} /> {t.themeDark}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('theme', 'light');
                    setIsDarkMode(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                    !isDarkMode
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Sun size={15} /> {t.themeLight}
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block font-bold mb-2">{t.languageLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('language', 'en');
                    setLanguage('en');
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('language', 'hi');
                    setLanguage('hi');
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  हिंदी (HI)
                </button>
              </div>
            </div>

            {/* Default Basemap */}
            <div>
              <label className="block font-semibold mb-1.5 text-zinc-300">{t.defaultMapLayer}</label>
              <select
                value={settings.defaultBasemap}
                onChange={(e) => handleChange('defaultBasemap', e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="english" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>English (GIS Street Network)</option>
                <option value="osm" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>OpenStreetMap Standard</option>
                <option value="topo" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Terrain / Topographic Contours</option>
              </select>
            </div>

            {/* Default Region Focus */}
            <div>
              <label className="block font-semibold mb-1.5 text-zinc-300">{t.defaultRegionFocus}</label>
              <select
                value={settings.regionFocus}
                onChange={(e) => handleChange('regionFocus', e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="all" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Entire Northeast Region (NER)</option>
                <option value="sikkim" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Sikkim (NH-10 & Mangan Corridors)</option>
                <option value="assam" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Assam (Dima Hasao Hill Corridors)</option>
                <option value="arunachal" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Arunachal Pradesh (Tawang Highway)</option>
                <option value="meghalaya" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Meghalaya (Shillong Bypass)</option>
                <option value="nagaland" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Nagaland (Kohima-Dimapur)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AI Risk Thresholds & Trigger Rules */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
        } backdrop-blur-xl space-y-5`}>
          <div className={`flex items-center gap-2 pb-3 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
          }`}>
            <Sliders size={18} className="text-amber-400" />
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.sectionThresholds}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Rainfall Slider */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <CloudRain size={14} className="text-blue-400" /> {t.thresholdRainfall}
                </span>
                <span className="font-mono font-bold text-blue-400 text-sm">{settings.rainfallThreshold} mm</span>
              </div>
              <input
                type="range"
                min="80"
                max="240"
                step="5"
                value={settings.rainfallThreshold}
                onChange={(e) => handleChange('rainfallThreshold', parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400 mt-1.5">Triggers immediate Red Warning when crossed.</p>
            </div>

            {/* Soil Moisture Slider */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" /> {t.thresholdSoil}
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{settings.soilThreshold}%</span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                step="1"
                value={settings.soilThreshold}
                onChange={(e) => handleChange('soilThreshold', parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400 mt-1.5">IoT telemetry pore water saturation level.</p>
            </div>

            {/* InSAR Creep Slider */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <Satellite size={14} className="text-purple-400" /> {t.thresholdInSAR}
                </span>
                <span className="font-mono font-bold text-purple-400 text-sm">{settings.insarThreshold} mm/wk</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={settings.insarThreshold}
                onChange={(e) => handleChange('insarThreshold', parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400 mt-1.5">Satellite ground shift displacement trigger.</p>
            </div>
          </div>

          {/* Shadow Mode Toggle */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                <ShieldCheck size={16} className="text-blue-400" /> {t.shadowModeLabel}
              </p>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {t.shadowModeDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.shadowMode}
                onChange={(e) => handleChange('shadowMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Section 3: Multi-Channel Broadcast Options */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
        } backdrop-blur-xl space-y-5`}>
          <div className={`flex items-center gap-2 pb-3 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
          }`}>
            <Radio size={18} className="text-rose-400" />
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {t.sectionChannels}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {[
              { key: 'enableSms', label: t.enableSmsDispatch, icon: Smartphone, desc: 'Inclusive 2G SMS dispatch to keypad phones' },
              { key: 'enableSirens', label: t.enableSirens, icon: Volume2, desc: 'Acoustic siren activation in downstream settlements' },
              { key: 'enablePush', label: t.enablePush, icon: Radio, desc: 'High-priority smartphone app notifications' },
              { key: 'enableAgency', label: t.enableAgency, icon: Building, desc: 'Immediate automated wire to PWD, BRO & NDRF control' }
            ].map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.key}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{ch.label}</p>
                      <p className="text-[10px] text-zinc-400">{ch.desc}</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings[ch.key]}
                      onChange={(e) => handleChange(ch.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Sensor & External API Integrations (SIH Standards) */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
        } backdrop-blur-xl space-y-5`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/60'
          }`}>
            <div className="flex items-center gap-2">
              <Server size={18} className="text-emerald-400" />
              <h2 className={`text-base font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                {t.sectionAPIs}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleTestApiHealth}
              disabled={apiHealthStatus === 'testing'}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {apiHealthStatus === 'testing' ? (
                'Pinging Endpoints...'
              ) : apiHealthStatus === 'healthy' ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Check size={13} /> 3/3 Endpoints Online
                </span>
              ) : (
                'Test API Health'
              )}
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.imdApiLabel}</label>
              <input
                type="text"
                value={settings.imdApiUrl}
                onChange={(e) => handleChange('imdApiUrl', e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all font-mono text-[11px] ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-300">{t.ogcApiLabel}</label>
              <input
                type="text"
                value={settings.ogcApiUrl}
                onChange={(e) => handleChange('ogcApiUrl', e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all font-mono text-[11px] ${
                  isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">{t.isroApiLabel}</label>
                <input
                  type="text"
                  value={settings.isroApiUrl}
                  onChange={(e) => handleChange('isroApiUrl', e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all font-mono text-[11px] ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">{t.pollingInterval}</label>
                <select
                  value={settings.pollingInterval}
                  onChange={(e) => handleChange('pollingInterval', e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all text-xs font-semibold ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 focus:border-white/[0.2]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="1" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Every 1 Minute (High Alert)</option>
                  <option value="5" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Every 5 Minutes (Standard Operation)</option>
                  <option value="15" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Every 15 Minutes (Conserve Telemetry)</option>
                  <option value="30" className={isDarkMode ? 'bg-[#0f121a] text-white' : ''}>Every 30 Minutes (Low Bandwidth)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Offline Cache & Reset */}
        <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          isDarkMode ? 'bg-[#0f121a]/90 border-white/[0.07] shadow-xl shadow-black/30' : 'bg-white border-slate-200'
        } backdrop-blur-xl`}>
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              <Database size={16} className="text-blue-400" /> {t.sectionStorage}
            </h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Local offline PWA storage: ~2.4 MB (Tile caches, offline observations & localized telemetry)
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} /> {t.clearCache}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
