/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Alumno, Asistencia, AppConfig, UserSession, ToastMessage } from './types';
import { 
  getAlumnos, 
  getAsistencias, 
  getAlumno, 
  addAsistencia, 
  addAlumno, 
  deleteAsistencia, 
  clearAsistencias 
} from './firebase';
import { playSuccessSound, playErrorSound } from './utils/audio';
import ScannerPanel from './components/ScannerPanel';
import AlumnoCard from './components/AlumnoCard';
import AlumnosManager from './components/AlumnosManager';
import ConfigPanel from './components/ConfigPanel';
import AsistenciasTable from './components/AsistenciasTable';
import PagosManager from './components/PagosManager';
import InventarioManager from './components/InventarioManager';
import DashboardKPI from './components/DashboardKPI';
import LoginPanel from './components/LoginPanel';
import ToastNotificationContainer from './components/ToastNotification';
import { INITIAL_ALUMNOS, INITIAL_ASISTENCIAS, INITIAL_USERS } from './mockData';

// Icons
import { 
  School, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  GraduationCap, 
  DollarSign, 
  Archive, 
  Settings, 
  QrCode,
  Lock,
  UserCheck,
  BarChart3,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'dashboard' | 'asistencia' | 'academicos' | 'pagos' | 'inventario' | 'config';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center shrink-0 hover:scale-105"
      title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-indigo-650" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500" />
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  // Core States
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Simulated Authentication State (with Roles: Administrador, Personal Administrativo, Profesor)
  const [activeUser, setActiveUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Scanned Student Feedback States
  const [lastScannedAlumno, setLastScannedAlumno] = useState<Alumno | null>(null);
  const [lastAsistencia, setLastAsistencia] = useState<Asistencia | null>(null);
  
  // Scanning Locks and Status Colors
  const [isLocked, setIsLocked] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastErrorMsg, setLastErrorMsg] = useState('');

  // Toast Notification System States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // System Configurations
  const [config, setConfig] = useState<AppConfig>({
    horaLimite: "08:00",
    bloqueoLecturaMs: 5000
  });

  // Simulator Time Offset (to simulate being early/late easily)
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [simulatedTime, setSimulatedTime] = useState<Date>(new Date());

  // Real-time tick update
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (timeOffset !== 0) {
        now.setMinutes(now.getMinutes() + timeOffset);
      }
      setSimulatedTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeOffset]);

  // Load students and logs on mount
  const loadDatabaseData = async () => {
    try {
      const allAlumnos = await getAlumnos();
      const allAsistencias = await getAsistencias();
      setAlumnos(allAlumnos);
      setAsistencias(allAsistencias);
    } catch (err) {
      console.error("Error al cargar datos escolares:", err);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Format active simulated hour
  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0];
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // MAIN QR SCAN EVENTHANDLER
  const handleScan = async (decodedText: string) => {
    if (isLocked) return;

    const cleanId = decodedText.trim();
    console.log(`🔍 Código QR Escaneado: "${cleanId}"`);

    // Lock scanner immediately to prevent duplicate triggers
    setIsLocked(true);

    try {
      // 1. Fetch student info from database (Firestore or local fallback)
      const matchingAlumno = await getAlumno(cleanId);

      if (matchingAlumno) {
        // 2. Student verified successfully! Compute business rule parameters
        const scanTime = new Date();
        if (timeOffset !== 0) {
          scanTime.setMinutes(scanTime.getMinutes() + timeOffset);
        }

        const dateStr = formatLocalDate(scanTime);
        const timeStr = formatTime(scanTime);

        // Check if scan time exceeds Configured Limit (Hora Límite)
        const [limitH, limitM] = config.horaLimite.split(':').map(Number);
        const currentH = scanTime.getHours();
        const currentM = scanTime.getMinutes();

        let attendanceState: 'Asistió' | 'Retardo' = 'Asistió';
        if (currentH > limitH || (currentH === limitH && currentM > limitM)) {
          attendanceState = 'Retardo';
        }

        // 3. Register the new log in the database
        const newAsistencia: Asistencia = {
          alumnoID: matchingAlumno.id,
          nombreAlumno: `${matchingAlumno.nombre} ${matchingAlumno.apellidos}`,
          grado: matchingAlumno.grado,
          fecha: dateStr,
          horaExacta: timeStr,
          estado: attendanceState
        };

        await addAsistencia(newAsistencia);

        // Play feedback Beep
        playSuccessSound();

        // Check for week retardos threshold and trigger automated parent email alert
        if (attendanceState === 'Retardo') {
          const today = new Date(scanTime);
          const day = today.getDay();
          const monday = new Date(today);
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          monday.setDate(diff);
          monday.setHours(0, 0, 0, 0);
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);

          const toISODate = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayStr = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dayStr}`;
          };

          const weekStart = toISODate(monday);
          const weekEnd = toISODate(sunday);

          // Find existing retardos in current week
          const previousRetardos = asistencias.filter(as => {
            return as.alumnoID === matchingAlumno.id && 
                   as.estado === 'Retardo' && 
                   as.fecha >= weekStart && 
                   as.fecha <= weekEnd;
          });
          const totalRetardosWeek = previousRetardos.length + 1; // including current new one

          const isAlertEnabled = localStorage.getItem('alertas_correo_activas') !== 'false';
          const threshold = parseInt(localStorage.getItem('alertas_correo_umbral') || '3');

          if (isAlertEnabled && totalRetardosWeek > threshold) {
            const savedEmails = localStorage.getItem('correos_padres');
            let parentEmail = 'padre@ejemplo.com';
            if (savedEmails) {
              try {
                const parsed = JSON.parse(savedEmails);
                parentEmail = parsed[matchingAlumno.id] || parentEmail;
              } catch (e) {}
            }

            // Trigger secondary automatic email toast
            setTimeout(() => {
              showToast({
                type: 'success',
                title: 'Alerta Enviada a Padres',
                message: `El alumno acumuló ${totalRetardosWeek} retardos semanales. Alerta automática enviada a ${parentEmail}.`,
                extra: `SMTP • Correo Enviado con Éxito`
              });
            }, 1500);
          }
        }

        // Feed state to presentation card
        setLastScannedAlumno(matchingAlumno);
        setLastAsistencia(newAsistencia);
        setScanStatus('success');

        // Trigger Toast Notification
        showToast({
          type: attendanceState === 'Asistió' ? 'success' : 'retardo',
          title: `${matchingAlumno.nombre} ${matchingAlumno.apellidos}`,
          message: `Registro exitoso • ${attendanceState === 'Asistió' ? 'A Tiempo' : 'Retardo'}`,
          foto: matchingAlumno.foto,
          extra: `${matchingAlumno.grado} ${matchingAlumno.grupo} • ${timeStr}`
        });

        // Reload data grid
        await loadDatabaseData();
      } else {
        // Student ID not found in database!
        playErrorSound();
        setScanStatus('error');
        const errMsg = `El código "${cleanId}" no coincide con ningún alumno inscrito.`;
        setLastErrorMsg(errMsg);

        // Trigger Error Toast
        showToast({
          type: 'error',
          title: 'Código QR Inválido',
          message: errMsg,
          extra: `ID Escaneado: ${cleanId}`
        });
      }
    } catch (err) {
      console.error("Error al procesar asistencia:", err);
      playErrorSound();
      setScanStatus('error');
      const errMsg = "Error de conexión al procesar el código. Reintente.";
      setLastErrorMsg(errMsg);

      // Trigger Connection Error Toast
      showToast({
        type: 'error',
        title: 'Error de Red',
        message: errMsg
      });
    } finally {
      // Release lock after configured cooling down period (5000ms by default)
      setTimeout(() => {
        setIsLocked(false);
        setScanStatus('idle');
      }, config.bloqueoLecturaMs);
    }
  };

  // Add Alumno Callback
  const handleAddAlumno = async (nuevo: Alumno) => {
    await addAlumno(nuevo);
    await loadDatabaseData();
  };

  // Update Alumno Callback
  const handleUpdateAlumno = async (updated: Alumno) => {
    await addAlumno(updated); // setDoc handles overwrite
    await loadDatabaseData();
  };

  // Delete individual Attendance Callback
  const handleDeleteAsistencia = async (id: string) => {
    if (activeUser.role === 'Profesor') {
      alert("⚠️ Tu rol de Profesor no tiene privilegios para eliminar auditorías de asistencia.");
      return;
    }
    await deleteAsistencia(id);
    await loadDatabaseData();
  };

  // Clear all attendances
  const handleClearAllAsistencias = async () => {
    if (activeUser.role !== 'Administrador') {
      alert("⚠️ Solo los usuarios con rol Administrador pueden vaciar las bitácoras completas.");
      return;
    }
    if (confirm("¿Está seguro de que desea eliminar permanentemente todos los registros de asistencia de Firestore?")) {
      await clearAsistencias();
      setLastScannedAlumno(null);
      setLastAsistencia(null);
      await loadDatabaseData();
    }
  };

  // Reset Database to factory defaults (Mock Seeds)
  const handleResetMockData = async () => {
    if (activeUser.role !== 'Administrador') {
      alert("⚠️ Solo un Administrador puede restablecer las colecciones del sistema.");
      return;
    }
    if (confirm("¿Desea restablecer el catálogo escolar de alumnos, inventarios, cobros y la bitácora con los datos de prueba?")) {
      localStorage.removeItem("alumnos");
      localStorage.removeItem("asistencias");
      localStorage.removeItem("pagos_recibos");
      localStorage.removeItem("inventario");
      
      setLastScannedAlumno(null);
      setLastAsistencia(null);
      window.location.reload();
    }
  };

  // Daily statistics calculations
  const asistenciasHoy = asistencias.filter(a => a.fecha === formatLocalDate(simulatedTime));
  const countA_Tiempo = asistenciasHoy.filter(a => a.estado === 'Asistió').length;
  const countRetardo = asistenciasHoy.filter(a => a.estado === 'Retardo').length;

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col justify-between transition-colors duration-300">
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 shrink-0" />
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <LoginPanel onLoginSuccess={(user) => {
          setActiveUser(user);
          localStorage.setItem('active_user', JSON.stringify(user));
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-350">
      {/* Decorative Top Accent */}
      <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 shrink-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex-grow flex flex-col pb-16">
        
        {/* Top Branding Navigation Bar */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-2xl shadow-md w-14 h-14 flex items-center justify-center shrink-0">
              <img 
                src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
                alt="Logo Portal Escolar" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  Gestión Administrativa y Académica
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">v3.0.0</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">
                Portal Escolar Integrado
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Logged user badge */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 text-xs">
              <img src={activeUser.foto} alt={activeUser.nombre} className="w-6 h-6 rounded-full object-cover" />
              <div>
                <span className="font-extrabold text-slate-700 dark:text-slate-200 block">{activeUser.nombre.split(' ')[1] || activeUser.nombre}</span>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block">{activeUser.role}</span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Cerrar Sesión Button */}
            <button
              onClick={() => {
                setActiveUser(null);
                localStorage.removeItem('active_user');
              }}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/25 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center shrink-0 hover:scale-105"
              title="Cerrar Sesión de Trabajo"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Server Clock */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-4 shadow-sm shrink-0">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Reloj Sistema</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 block">
                  {formatTime(simulatedTime)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Unified Application Tabs / Sidebar Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
          
          {/* Navigation Sidebar/Rail */}
          <nav className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl space-y-2 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block px-2.5 mb-3">Módulos Escolares</span>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              Dashboard KPI General
            </button>

            <button
              onClick={() => setActiveTab('asistencia')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'asistencia'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4.5 h-4.5" />
              Asistencia por Código QR
            </button>

            <button
              onClick={() => setActiveTab('academicos')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'academicos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4.5 h-4.5" />
              Kárdex y Estudios Académicos
            </button>

            <button
              onClick={() => setActiveTab('pagos')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pagos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-4.5 h-4.5" />
              Control de Pagos y Recibos
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventario'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Archive className="w-4.5 h-4.5" />
              Control de Inventarios
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              Parámetros e Identidad
            </button>

            {/* Quick Helper Info */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 px-2.5 space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Auditoría Hoy</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 block">{countA_Tiempo}</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold block">A Tiempo</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <span className="text-xs font-black text-amber-800 dark:text-amber-400 block">{countRetardo}</span>
                  <span className="text-[9px] text-amber-600 dark:text-amber-500 font-bold block">Retardos</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Active View Container */}
          <main className="lg:col-span-9 flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                
                {/* TAB 0: DASHBOARD KPI */}
                {activeTab === 'dashboard' && (
                  <DashboardKPI showToast={showToast} />
                )}

                {/* TAB 1: ASISTENCIA QR */}
                {activeTab === 'asistencia' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                      {/* Live camera feed viewport (7/12 cols) */}
                      <div className="md:col-span-6 flex flex-col">
                        <ScannerPanel
                          onScan={handleScan}
                          isLocked={isLocked}
                          scanStatus={scanStatus}
                          lastErrorMsg={lastErrorMsg}
                          alumnos={alumnos}
                        />
                      </div>

                      {/* Live verification & confirmation card (5/12 cols) */}
                      <div className="md:col-span-6 flex flex-col">
                        <AlumnoCard
                          lastScannedAlumno={lastScannedAlumno}
                          lastAsistencia={lastAsistencia}
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <AsistenciasTable
                        asistencias={asistencias}
                        onDelete={handleDeleteAsistencia}
                        onClearAll={handleClearAllAsistencias}
                        onResetMock={handleResetMockData}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: KÁRDEX Y ESTUDIOS ACADÉMICOS */}
                {activeTab === 'academicos' && (
                  <AlumnosManager
                    alumnos={alumnos}
                    onAddAlumno={handleAddAlumno}
                    onUpdateAlumno={handleUpdateAlumno}
                  />
                )}

                {/* TAB 3: CONTROL DE PAGOS Y RECIBOS */}
                {activeTab === 'pagos' && (
                  <PagosManager />
                )}

                {/* TAB 4: CONTROL DE INVENTARIOS */}
                {activeTab === 'inventario' && (
                  <InventarioManager />
                )}

                {/* TAB 5: PARÁMETROS E IDENTIDAD */}
                {activeTab === 'config' && (
                  <ConfigPanel
                    config={config}
                    onChangeConfig={setConfig}
                    systemTimeOffset={timeOffset}
                    onChangeTimeOffset={setTimeOffset}
                    activeUser={activeUser}
                    onChangeUser={setActiveUser}
                    showToast={showToast}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          </main>

        </div>

      </div>
      <ToastNotificationContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

