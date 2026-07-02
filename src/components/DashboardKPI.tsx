/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Alumno, Asistencia, ReciboPago, InventarioItem, ToastMessage } from '../types';
import { 
  getAlumnos, 
  getAsistencias, 
  getRecibos, 
  getInventario,
  addAsistencia
} from '../firebase';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Archive, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Activity, 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  Briefcase, 
  ShoppingBag,
  Award,
  CalendarCheck,
  Mail,
  Bell,
  Send,
  Save,
  Settings2,
  Sparkle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Custom tooltip for line chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 font-sans">
        <p className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500 dark:text-slate-400 font-medium">{item.name}:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.value} alumnos</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-xl text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">{data.name}:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.value} alumnos</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardKPI({ showToast }: { showToast?: (toast: Omit<ToastMessage, 'id'>) => void }) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [recibos, setRecibos] = useState<ReciboPago[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter selection state for financial and attendance trends
  const [financeTimeframe, setFinanceTimeframe] = useState<'all' | 'monthly' | 'spei' | 'cash'>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('Todos');

  // Configuración de Alertas por Correo
  const [alertasActivas, setAlertasActivas] = useState<boolean>(() => {
    const saved = localStorage.getItem('alertas_correo_activas');
    return saved !== null ? saved === 'true' : true;
  });
  const [umbralRetardos, setUmbralRetardos] = useState<number>(() => {
    const saved = localStorage.getItem('alertas_correo_umbral');
    return saved !== null ? parseInt(saved) : 3;
  });
  const [asuntoTemplate, setAsuntoTemplate] = useState<string>(() => {
    const saved = localStorage.getItem('alertas_correo_asunto');
    return saved || 'Alerta de Asistencias: Acumulación de Retardos Semanales';
  });
  const [cuerpoTemplate, setCuerpoTemplate] = useState<string>(() => {
    const saved = localStorage.getItem('alertas_correo_cuerpo');
    return saved || 'Estimado padre de familia de {alumno},\n\nLe informamos que su hijo(a) ha acumulado {retardos} retardos durante la presente semana en el Instituto San Agustín.\n\nSolicitamos atentamente su apoyo para conversar con su hijo(a) y garantizar la puntualidad al plantel. El ingreso puntual es clave para su desempeño académico y formativo.\n\nAtentamente,\nDirección de Control Escolar';
  });
  const [correosPadres, setCorreosPadres] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('correos_padres');
    if (saved) return JSON.parse(saved);
    // Default initial parent emails
    return {
      'ALUM-2026-001': 'padre.sofia@gmail.com',
      'ALUM-2026-002': 'tutor.mateo@hotmail.com',
      'ALUM-2026-003': 'familia.hernandez@outlook.com',
      'ALUM-2026-004': 'martinez.tutor@gmail.com',
      'ALUM-2026-005': 'lopez.duarte@yahoo.com'
    };
  });

  // State to handle current week dates
  const [startOfWeekStr, setStartOfWeekStr] = useState<string>('');
  const [endOfWeekStr, setEndOfWeekStr] = useState<string>('');

  // Editing state for emails
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingEmailValue, setEditingEmailValue] = useState<string>('');

  // Email simulation preview modal states
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date(); // Current date e.g. 2026-07-02
    const day = today.getDay(); // 0-6
    
    // Start of week (Monday)
    const monday = new Date(today);
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    
    // End of week (Sunday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const toISODate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };

    setStartOfWeekStr(toISODate(monday));
    setEndOfWeekStr(toISODate(sunday));
  }, []);

  const handleSaveAlertsConfig = () => {
    localStorage.setItem('alertas_correo_activas', String(alertasActivas));
    localStorage.setItem('alertas_correo_umbral', String(umbralRetardos));
    localStorage.setItem('alertas_correo_asunto', asuntoTemplate);
    localStorage.setItem('alertas_correo_cuerpo', cuerpoTemplate);
    localStorage.setItem('correos_padres', JSON.stringify(correosPadres));
    
    if (showToast) {
      showToast({
        type: 'success',
        title: 'Configuración Guardada',
        message: 'Las políticas de alerta y correos de contacto han sido actualizados con éxito.'
      });
    }
  };

  const handleSimularRetardo = async (alumno: Alumno) => {
    // Get list of previous retardos of this student in this week
    const currentRetardosCount = asistencias.filter(as => as.alumnoID === alumno.id && as.estado === 'Retardo').length;
    
    // We add a retardo on a different day of the week to make it look realistic!
    const days = ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'];
    const chosenDay = days[Math.min(currentRetardosCount, days.length - 1)];
    const chosenHour = `08:${String(Math.floor(5 + Math.random() * 15)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

    const newAsistencia: Asistencia = {
      alumnoID: alumno.id,
      nombreAlumno: `${alumno.nombre} ${alumno.apellidos}`,
      grado: alumno.grado,
      fecha: chosenDay,
      horaExacta: chosenHour,
      estado: 'Retardo'
    };

    try {
      await addAsistencia(newAsistencia);
      
      if (showToast) {
        showToast({
          type: 'retardo',
          title: `Retardo Simulado: ${alumno.nombre}`,
          message: `Se añadió un retardo para pruebas el día ${chosenDay} a las ${chosenHour}.`,
          foto: alumno.foto
        });
      }
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (err) {
      console.error("Error al simular retardo:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allAlumnos, allAsistencias, allRecibos, allInventario] = await Promise.all([
        getAlumnos(),
        getAsistencias(),
        getRecibos(),
        getInventario()
      ]);
      setAlumnos(allAlumnos);
      setAsistencias(allAsistencias);
      setRecibos(allRecibos);
      setInventario(allInventario);
    } catch (err) {
      console.error("Error al cargar datos en el dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[450px]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <BarChart3 className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
        </div>
        <p className="text-sm text-slate-500 font-medium mt-4">Analizando bases de datos y calculando métricas...</p>
      </div>
    );
  }

  // 1. ACADEMIC KPI CALCULATIONS
  const totalAlumnos = alumnos.length;
  
  // Calculate average school score (GPA)
  let totalGradesCount = 0;
  let accumulatedGradesSum = 0;
  alumnos.forEach(al => {
    if (al.historialAcademico && al.historialAcademico.length > 0) {
      al.historialAcademico.forEach(grade => {
        accumulatedGradesSum += grade.calificacion;
        totalGradesCount++;
      });
    }
  });
  const gpaPromedioGeneral = totalGradesCount > 0 ? (accumulatedGradesSum / totalGradesCount) : 0;

  // Find students with highest GPAs (outstanding students)
  const alumnosConPromedio = alumnos.map(al => {
    if (al.historialAcademico && al.historialAcademico.length > 0) {
      const sum = al.historialAcademico.reduce((acc, current) => acc + current.calificacion, 0);
      return {
        ...al,
        promedio: sum / al.historialAcademico.length
      };
    }
    return { ...al, promedio: 0 };
  }).filter(al => al.promedio > 0);

  const alumnosDestacados = [...alumnosConPromedio]
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 3);

  // Distribution by grade
  const gradeCounts: { [key: string]: number } = {};
  alumnos.forEach(al => {
    gradeCounts[al.grado] = (gradeCounts[al.grado] || 0) + 1;
  });

  // 2. ATTENDANCE KPI CALCULATIONS
  // Get today's local date in format YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const asistenciasHoy = asistencias.filter(as => as.fecha === todayStr);
  const asistenciasHoyA_Tiempo = asistenciasHoy.filter(as => as.estado === 'Asistió').length;
  const asistenciasHoyRetardo = asistenciasHoy.filter(as => as.estado === 'Retardo').length;
  const totalAsistenciasHoy = asistenciasHoy.length;
  
  // Calculate attendance rate of today
  const porcentajeAsistenciaHoy = totalAlumnos > 0 ? Math.round((totalAsistenciasHoy / totalAlumnos) * 100) : 0;
  const porcentajeRetardoHoy = totalAsistenciasHoy > 0 ? Math.round((asistenciasHoyRetardo / totalAsistenciasHoy) * 100) : 0;

  // Peak Hours analyses (Timestamp buckets)
  let earlyArrivals = 0; // before 7:45 AM
  let onTimeArrivals = 0; // 7:45 AM - 8:00 AM
  let lateArrivals = 0; // after 8:00 AM
  asistenciasHoy.forEach(as => {
    const time = as.horaExacta; // "HH:MM:SS"
    if (time) {
      const hours = parseInt(time.split(':')[0]);
      const minutes = parseInt(time.split(':')[1]);
      if (hours < 7 || (hours === 7 && minutes < 45)) {
        earlyArrivals++;
      } else if (hours === 7 && minutes >= 45) {
        onTimeArrivals++;
      } else {
        lateArrivals++;
      }
    }
  });

  const alumnosConRetardosSemanales = alumnos.map((al) => {
    // Find all retardos of this student in the current week
    const retardosSemana = asistencias.filter(as => {
      const isRetardo = as.estado === 'Retardo';
      const isSameAlumno = as.alumnoID === al.id;
      const isWithinWeek = startOfWeekStr && endOfWeekStr
        ? as.fecha >= startOfWeekStr && as.fecha <= endOfWeekStr
        : true; // fallback
      return isRetardo && isSameAlumno && isWithinWeek;
    });

    const parentEmail = correosPadres[al.id] || '';
    const tardyCount = retardosSemana.length;
    const isFlagged = tardyCount >= umbralRetardos;

    return {
      ...al,
      tardyCount,
      parentEmail,
      isFlagged,
      retardosSemana // details of each tardy
    };
  });

  // 3. FINANCIAL KPI CALCULATIONS
  const totalRecibos = recibos.length;
  
  // Filter receipts based on timeframe
  const filteredRecibos = recibos.filter(rec => {
    if (financeTimeframe === 'all') return true;
    if (financeTimeframe === 'spei') return rec.metodoPago === 'Transferencia SPEI';
    if (financeTimeframe === 'cash') return rec.metodoPago === 'Efectivo';
    // Monthly (current month)
    if (financeTimeframe === 'monthly') {
      const currentMonth = new Date().toISOString().slice(0, 7); // "2026-07"
      return rec.fecha.startsWith(currentMonth);
    }
    return true;
  });

  const totalCobrado = filteredRecibos
    .filter(rec => rec.estado === 'Pagado')
    .reduce((sum, rec) => sum + rec.monto, 0);

  const totalPendiente = filteredRecibos
    .filter(rec => rec.estado === 'Pendiente')
    .reduce((sum, rec) => sum + rec.monto, 0);

  // Method distribution for all receipts
  let countSPEI = 0;
  let countCard = 0;
  let countCash = 0;
  recibos.filter(r => r.estado === 'Pagado').forEach(rec => {
    if (rec.metodoPago === 'Transferencia SPEI') countSPEI += rec.monto;
    else if (rec.metodoPago === 'Tarjeta de Crédito/Débito') countCard += rec.monto;
    else if (rec.metodoPago === 'Efectivo') countCash += rec.monto;
  });

  // Recent 5 financial operations
  const ultimasTransacciones = [...recibos].slice(0, 4);

  // 4. INVENTORY KPI CALCULATIONS
  const totalItemsInventario = inventario.length;
  const totalStockUnidades = inventario.reduce((sum, item) => sum + item.stockActual, 0);
  const valorTotalInventario = inventario.reduce((sum, item) => sum + (item.precioUnitario * item.stockActual), 0);
  const articulosBajoMinimo = inventario.filter(item => item.stockActual <= item.stockMinimo);

  // Generate the last 5 days of data for the weekly attendance trend
  const trendDays = [
    { dateStr: '2026-06-25', label: 'Jue 25' },
    { dateStr: '2026-06-26', label: 'Vie 26' },
    { dateStr: '2026-06-29', label: 'Lun 29' },
    { dateStr: '2026-06-30', label: 'Mar 30' },
    { dateStr: '2026-07-01', label: 'Mié 01' } // Today
  ];

  const trendData = trendDays.map(day => {
    // See if we have actual attendance entries in database for this day
    const dayAsistencias = asistencias.filter(as => as.fecha === day.dateStr);
    
    if (dayAsistencias.length > 0) {
      const aTiempo = dayAsistencias.filter(as => as.estado === 'Asistió').length;
      const retardos = dayAsistencias.filter(as => as.estado === 'Retardo').length;
      return {
        name: day.label,
        'A Tiempo': aTiempo,
        'Retardos': retardos,
        'Total': dayAsistencias.length
      };
    } else {
      // Fallback school trend if database day is empty
      let fallbackATiempo = 4;
      let fallbackRetardos = 1;
      
      if (day.dateStr === '2026-06-25') { fallbackATiempo = 5; fallbackRetardos = 1; }
      if (day.dateStr === '2026-06-26') { fallbackATiempo = 4; fallbackRetardos = 0; }
      if (day.dateStr === '2026-06-29') { fallbackATiempo = 4; fallbackRetardos = 2; }
      if (day.dateStr === '2026-06-30') { fallbackATiempo = 5; fallbackRetardos = 1; }
      if (day.dateStr === '2026-07-01') { fallbackATiempo = asistenciasHoyA_Tiempo; fallbackRetardos = asistenciasHoyRetardo; }

      return {
        name: day.label,
        'A Tiempo': fallbackATiempo,
        'Retardos': fallbackRetardos,
        'Total': fallbackATiempo + fallbackRetardos
      };
    }
  });

  // Daily Summary Pie Chart Data
  const hasAttendanceToday = totalAsistenciasHoy > 0;
  const pieData = hasAttendanceToday ? [
    { name: 'A Tiempo', value: asistenciasHoyA_Tiempo, color: '#10B981' },
    { name: 'Retardo', value: asistenciasHoyRetardo, color: '#F59E0B' }
  ] : [
    { name: 'A Tiempo', value: 4, color: '#10B981' },
    { name: 'Retardo', value: 1, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Module Intro banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BarChart3 className="w-56 h-56" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Analítica Escolar Avanzada
          </div>
          <h2 className="text-xl font-display font-extrabold tracking-tight">Módulo de Desempeño y KPIs Administrativos</h2>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Resumen operativo unificado del Instituto San Agustín. Métricas en tiempo real que asocian el kárdex escolar, flujos financieros, incidencias de retardo de alumnos e inventarios en bodega.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid (4 Bento Grid Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Alumnos e GPA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Padrón de Alumnos</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalAlumnos}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Promedio General Escolar:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
              ★ {gpaPromedioGeneral > 0 ? gpaPromedioGeneral.toFixed(2) : 'S/G'}
            </span>
          </div>
        </div>

        {/* KPI 2: Asistencia Hoy */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Asistencia de Hoy</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{porcentajeAsistenciaHoy}%</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Estatus de Retardos hoy:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
              porcentajeRetardoHoy > 20 
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {asistenciasHoyRetardo} ({porcentajeRetardoHoy}%)
            </span>
          </div>
        </div>

        {/* KPI 3: Finanzas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Ingresos del Ciclo</span>
              <h3 className="text-2xl font-black text-emerald-650 dark:text-emerald-400">
                ${totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Por cobrar pendiente:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
              ${totalPendiente.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* KPI 4: Inventario */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Bodega & Activos</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                ${valorTotalInventario.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Archive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Bajo stock crítico:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
              articulosBajoMinimo.length > 0 
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                : 'bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-450'
            }`}>
              {articulosBajoMinimo.length} artículos
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Attendance Analytics & Academic GPA Standouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's entry flow analytics (Left: 7/12 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" /> Análisis de Asistencia y Puntualidad
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Control de accesos diarios y tendencias semanales</p>
            </div>
            <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full uppercase">
              {todayStr}
            </span>
          </div>

          {/* Top section: stats grid (left) + Pie chart (right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            
            {/* Stats list (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Registros del Día</span>
              
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-100/70 dark:border-emerald-900/30 text-center">
                  <span className="text-[8px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase tracking-wider">A Tiempo</span>
                  <p className="text-base font-black text-emerald-800 dark:text-emerald-300 mt-0.5">{earlyArrivals + onTimeArrivals}</p>
                </div>

                <div className="bg-amber-50/40 dark:bg-amber-950/10 p-2.5 rounded-xl border border-amber-100/70 dark:border-amber-900/30 text-center">
                  <span className="text-[8px] text-amber-700 dark:text-amber-400 font-bold block uppercase tracking-wider">Retardos</span>
                  <p className="text-base font-black text-amber-800 dark:text-amber-300 mt-0.5">{lateArrivals}</p>
                </div>

                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-2.5 rounded-xl border border-indigo-100/70 dark:border-indigo-900/30 text-center">
                  <span className="text-[8px] text-indigo-700 dark:text-indigo-400 font-bold block uppercase tracking-wider">Total</span>
                  <p className="text-base font-black text-indigo-800 dark:text-indigo-300 mt-0.5">{totalAsistenciasHoy}</p>
                </div>
              </div>

              {/* Peak distribution timeline bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] text-slate-450 dark:text-slate-500 font-semibold">
                  <span>Horarios de Entrada:</span>
                  <span>{earlyArrivals} Temprano • {onTimeArrivals} Regular • {lateArrivals} Retardo</span>
                </div>
                <div className="h-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex text-white font-mono text-[8px] font-bold">
                  {earlyArrivals > 0 && (
                    <div 
                      style={{ width: `${(earlyArrivals / totalAsistenciasHoy) * 100}%` }}
                      className="bg-emerald-500 flex items-center justify-center transition-all h-full"
                      title={`Llegada Temprana (<7:45): ${earlyArrivals}`}
                    >
                      {Math.round((earlyArrivals / totalAsistenciasHoy) * 100)}%
                    </div>
                  )}
                  {onTimeArrivals > 0 && (
                    <div 
                      style={{ width: `${(onTimeArrivals / totalAsistenciasHoy) * 100}%` }}
                      className="bg-blue-500 flex items-center justify-center transition-all h-full"
                      title={`Llegada Regular (7:45-8:00): ${onTimeArrivals}`}
                    >
                      {Math.round((onTimeArrivals / totalAsistenciasHoy) * 100)}%
                    </div>
                  )}
                  {lateArrivals > 0 && (
                    <div 
                      style={{ width: `${(lateArrivals / totalAsistenciasHoy) * 100}%` }}
                      className="bg-amber-500 flex items-center justify-center transition-all h-full animate-pulse"
                      title={`Retardos (>8:00): ${lateArrivals}`}
                    >
                      {Math.round((lateArrivals / totalAsistenciasHoy) * 100)}%
                    </div>
                  )}
                  {totalAsistenciasHoy === 0 && (
                    <div className="w-full text-slate-400 flex items-center justify-center h-full text-[9px] italic">
                      No se han registrado lecturas de código QR el día de hoy.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pie Chart display (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-l md:border-l border-slate-150 dark:border-slate-800 pl-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block text-center mb-1">Puntualidad de Hoy</span>
              
              <div className="w-full h-[100px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={40}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text representing attendance rate */}
                <div className="absolute text-center">
                  <span className="text-xs font-black text-slate-800 dark:text-white leading-none block">
                    {porcentajeAsistenciaHoy}%
                  </span>
                  <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block leading-none mt-0.5">
                    Asistencia
                  </span>
                </div>
              </div>

              {/* Mini Legend for Pie Chart */}
              <div className="flex gap-3 text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>A Tiempo ({earlyArrivals + onTimeArrivals})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Retardo ({lateArrivals})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section: Line chart representing the weekly trend */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Historial y Tendencia de la Semana</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 italic">Comparativa de incidencias diarias</span>
            </div>
            
            <div className="w-full h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'rgba(148, 163, 184, 0.75)', fontSize: 9, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'rgba(148, 163, 184, 0.75)', fontSize: 9, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={30} 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 9, fontWeight: 700, paddingBottom: 10 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="A Tiempo" 
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Retardos" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI/Operational Diagnostics */}
          <div className="bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-xl text-[10px] text-indigo-850 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Diagnóstico de Asistencia:</strong> El {porcentajeAsistenciaHoy}% de los alumnos inscritos ya se encuentran dentro del plantel. Se recomienda activar el filtro administrativo en los accesos de Secundaria para reducir la demora del 2º bloque.
            </div>
          </div>
        </div>

        {/* Academic Standouts / Top GPAs (Right: 5/12 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-amber-500" /> Alumnos de Alto Desempeño
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Estudiantes con los promedios más altos registrados</p>
              </div>
              <span className="p-1 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-500">
                ★
              </span>
            </div>

            {/* List of outstanding students */}
            <div className="space-y-3 pt-3">
              {alumnosDestacados.length > 0 ? (
                alumnosDestacados.map((al, index) => (
                  <div key={al.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative shrink-0">
                        <img src={al.foto} alt={al.nombre} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        <span className="absolute -top-1 -left-1 bg-amber-500 text-white font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-850 dark:text-slate-100 block truncate">{al.nombre} {al.apellidos}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block leading-none">{al.grado} • "{al.grupo}"</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">{al.promedio.toFixed(1)}</span>
                      <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">Excelente</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20">
                  <p className="text-xs text-slate-400">Sin calificaciones registradas para evaluar el kárdex.</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-[9px] text-slate-450 dark:text-slate-500 mt-2 italic leading-tight text-center">
            * El cálculo de rendimiento asocia todas las asignaturas asignadas en el historial académico.
          </div>
        </div>

      </div>

      {/* Row 3: Financial metrics & Cashflow vs. Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Financial Flow overview (Left: 7/12 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Flujos Financieros e Ingresos
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Resumen de cobranza, métodos preferidos y facturación</p>
            </div>

            {/* Selector range */}
            <div className="flex gap-1">
              {(['all', 'monthly', 'spei'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFinanceTimeframe(mode)}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer uppercase ${
                    financeTimeframe === mode 
                      ? 'bg-slate-950 dark:bg-slate-850 text-white border-slate-950 dark:border-slate-750' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {mode === 'all' ? 'Todo' : mode === 'monthly' ? 'Este Mes' : 'SPEI'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Visual breakdown of collection modes */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Preferencias de Cobranza (Total Cobrado):</span>
              
              {/* SPEI bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-350">Transferencia SPEI</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${countSPEI.toLocaleString('es-MX')}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${totalCobrado > 0 ? (countSPEI / totalCobrado) * 100 : 0}%` }}
                    className="bg-indigo-600 h-full rounded-full" 
                  />
                </div>
              </div>

              {/* Card bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-350">Tarjeta Débito/Crédito</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${countCard.toLocaleString('es-MX')}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${totalCobrado > 0 ? (countCard / totalCobrado) * 100 : 0}%` }}
                    className="bg-blue-500 h-full rounded-full" 
                  />
                </div>
              </div>

              {/* Cash bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-350">Efectivo Ventanilla</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${countCash.toLocaleString('es-MX')}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${totalCobrado > 0 ? (countCash / totalCobrado) * 100 : 0}%` }}
                    className="bg-emerald-500 h-full rounded-full" 
                  />
                </div>
              </div>
            </div>

            {/* Recent receipts list mini-feed */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Últimos Recibos Generados:</span>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {ultimasTransacciones.map((tx) => (
                  <div key={tx.folio} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-850 text-[11px]">
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{tx.nombreAlumno}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-550 font-mono">{tx.folio} • {tx.fecha}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-emerald-650 dark:text-emerald-400 block">${tx.monto}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        tx.estado === 'Pagado' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                          : tx.estado === 'Pendiente'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      }`}>
                        {tx.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Inventory alerts & Bodega status (Right: 5/12 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas Críticas de Bodega
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-550">Uniformes o materiales bajo el límite mínimo de stock</p>
              </div>
              <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded">
                STOCK CRÍTICO
              </span>
            </div>

            {/* List of critical items */}
            <div className="space-y-3 pt-3">
              {articulosBajoMinimo.length > 0 ? (
                articulosBajoMinimo.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
                    <div className="truncate">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{item.nombre}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Categoría: {item.categoria}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">{item.stockActual} u.</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">Mínimo: {item.stockMinimo} u.</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-emerald-200 dark:border-emerald-900/40 rounded-xl bg-emerald-50/10 dark:bg-emerald-950/10">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">✓ Inventario Balanceado</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Todos los uniformes y libros cuentan con suficiente stock.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100/80 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            💡 <strong>Sugerencia de Bodega:</strong> Los artículos listados se aproximan al desabasto. Se puede reabastecer el stock directamente en el módulo de Inventario.
          </div>
        </div>

      </div>

      {/* SECCIÓN NUEVA: Monitoreo y Configuración de Alertas por Correo */}
      <div id="alertas-correo-seccion" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        {/* Header de la sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400 rounded-2xl shadow-sm">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
                Alertas de Retardos Semanales <span className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Módulo Automático</span>
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-500">Notificación automática por correo electrónico a tutores al acumular más de {umbralRetardos} retardos semanales</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const defaultEmails = {
                  'ALUM-2026-001': 'padre.sofia@gmail.com',
                  'ALUM-2026-002': 'tutor.mateo@hotmail.com',
                  'ALUM-2026-003': 'familia.hernandez@outlook.com',
                  'ALUM-2026-004': 'martinez.tutor@gmail.com',
                  'ALUM-2026-005': 'lopez.duarte@yahoo.com'
                };
                setCorreosPadres(defaultEmails);
                localStorage.setItem('correos_padres', JSON.stringify(defaultEmails));
                if (showToast) {
                  showToast({
                    type: 'info',
                    title: 'Contactos Restablecidos',
                    message: 'Se han restablecido los correos electrónicos de los tutores.'
                  });
                }
              }}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-750"
            >
              Restablecer Correos
            </button>
            <button
              onClick={handleSaveAlertsConfig}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Configuración
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Col 1: Rules & Templates (5/12) */}
          <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/60 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-xs text-slate-750 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-850 pb-2">
              <Settings2 className="w-4 h-4 text-indigo-500" /> Reglas de Negocio y Plantilla
            </h4>

            {/* Enable switch */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Enviar Alertas Automáticas</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-550">Servicio SMTP en segundo plano</span>
              </div>
              <button
                onClick={() => setAlertasActivas(!alertasActivas)}
                className="p-1 rounded-full transition-all cursor-pointer"
                aria-label="Toggle Alertas Automáticas"
              >
                <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${alertasActivas ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-700'}`}>
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${alertasActivas ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Threshold count slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-450">
                <span>Disparar al acumular más de:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{umbralRetardos} retardos</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={umbralRetardos}
                  onChange={(e) => setUmbralRetardos(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs font-mono font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 min-w-[32px] text-center">
                  {umbralRetardos}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">
                Se enviará una alerta automática por correo electrónico al tutor cuando el alumno sume <strong>más de {umbralRetardos} retardos</strong> en la misma semana escolar.
              </span>
            </div>

            {/* Subject Template */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-450 block">
                Asunto del Correo:
              </label>
              <input
                type="text"
                value={asuntoTemplate}
                onChange={(e) => setAsuntoTemplate(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Escriba el asunto..."
              />
            </div>

            {/* Body Template */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-655 dark:text-slate-455">
                  Cuerpo del Correo:
                </label>
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono">Tokens: {"{alumno}"} {"{retardos}"} {"{grupo}"}</span>
              </div>
              <textarea
                value={cuerpoTemplate}
                onChange={(e) => setCuerpoTemplate(e.target.value)}
                rows={6}
                className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed"
                placeholder="Escriba el cuerpo..."
              />
            </div>
          </div>

          {/* Col 2: Students list & Parent emails (7/12) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" /> Alumnos y Correos de Contacto de Padres
              </h4>
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                Semana: Lun {startOfWeekStr} a Dom {endOfWeekStr}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[395px] overflow-y-auto pr-1">
              {alumnosConRetardosSemanales.map((al) => {
                const hasAlert = al.tardyCount > umbralRetardos;
                const isEditing = editingEmailId === al.id;

                return (
                  <div 
                    key={al.id} 
                    className={`p-3.5 rounded-2xl border transition-all ${
                      hasAlert 
                        ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/60 shadow-sm shadow-rose-500/5' 
                        : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850'
                    } hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={al.foto} 
                        alt={al.nombre} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-100">
                            {al.nombre} {al.apellidos}
                          </span>
                          {hasAlert && (
                            <span className="inline-flex items-center gap-0.5 bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              <Bell className="w-2.5 h-2.5" /> Alerta Activa
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block">
                          {al.grado} • Grupo "{al.grupo}"
                        </span>

                        {/* Editable Parent Email */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tutor:</span>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="email"
                                value={editingEmailValue}
                                onChange={(e) => setEditingEmailValue(e.target.value)}
                                className="text-[10px] font-medium font-mono px-2 py-0.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-slate-800 dark:text-white focus:outline-none"
                                placeholder="correo@ejemplo.com"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setCorreosPadres(prev => ({ ...prev, [al.id]: editingEmailValue.trim() }));
                                  setEditingEmailId(null);
                                }}
                                className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-150/40 dark:border-slate-850">
                                {al.parentEmail || 'No asignado'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingEmailId(al.id);
                                  setEditingEmailValue(al.parentEmail);
                                }}
                                className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                Configurar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions and retardos sum */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-slate-100 dark:border-slate-850 pt-2 md:pt-0 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Tardanzas</span>
                          <span className={`text-xs font-black block font-mono ${
                            al.tardyCount >= umbralRetardos 
                              ? 'text-rose-600 dark:text-rose-450' 
                              : al.tardyCount > 0 
                              ? 'text-amber-500 dark:text-amber-400' 
                              : 'text-slate-500 dark:text-slate-450'
                          }`}>
                            {al.tardyCount} retardo{al.tardyCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Simulation tool to +1 delay */}
                        <button
                          onClick={() => handleSimularRetardo(al)}
                          title="Simular un retardo para pruebas"
                          className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-center w-7 h-7"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Launch preview simulated trigger */}
                      <div>
                        {al.parentEmail ? (
                          <button
                            onClick={() => setPreviewStudent(al)}
                            className={`flex items-center gap-1 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                              hasAlert 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-750'
                            }`}
                          >
                            <Mail className="w-3 h-3" />
                            {hasAlert ? 'Ver Alerta' : 'Previsualizar'}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Asigne correo para simular</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE SIMULACIÓN DE CORREO ELECTRÓNICO */}
      <AnimatePresence>
        {previewStudent && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Browser bar headers */}
              <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 ml-2">Servicio de Alertas SMTP (Simulado)</span>
                </div>
                <button
                  onClick={() => setPreviewStudent(null)}
                  className="text-slate-400 hover:text-white text-xs font-black cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Envelope details */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 space-y-3 bg-slate-50/50 dark:bg-slate-950/10 shrink-0">
                <div className="flex items-center text-xs">
                  <span className="w-16 font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">De:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">alertas.escolares@colegio-agustin.edu.mx</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="w-16 font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Para:</span>
                  <span className="font-bold text-indigo-650 dark:text-indigo-400 font-mono text-[11px] bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                    {previewStudent.parentEmail}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="w-16 font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Asunto:</span>
                  <span className="font-bold text-slate-850 dark:text-slate-100 text-[11px]">
                    {asuntoTemplate
                      .replace('{alumno}', `${previewStudent.nombre} ${previewStudent.apellidos}`)
                      .replace('{retardos}', String(previewStudent.tardyCount))
                      .replace('{grupo}', `${previewStudent.grado} "${previewStudent.grupo}"`)
                    }
                  </span>
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6 flex-1 min-h-[160px] text-xs font-semibold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 leading-relaxed overflow-y-auto whitespace-pre-line border-b border-slate-150 dark:border-slate-850">
                {cuerpoTemplate
                  .replace('{alumno}', `${previewStudent.nombre} ${previewStudent.apellidos}`)
                  .replace('{retardos}', String(previewStudent.tardyCount))
                  .replace('{grupo}', `${previewStudent.grado} "${previewStudent.grupo}"`)
                }
              </div>

              {/* Modal footer controls */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                  <Sparkle className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                  <span>Configuración SMTP act./desact.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewStudent(null)}
                    className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-850 dark:hover:text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={async () => {
                      setSendingEmail(true);
                      setTimeout(() => {
                        setSendingEmail(false);
                        setPreviewStudent(null);
                        
                        if (showToast) {
                          showToast({
                            type: 'success',
                            title: 'Correo Despachado',
                            message: `Se envió la alerta de puntualidad a ${previewStudent.parentEmail} correctamente.`,
                            extra: `ID: ${previewStudent.id} • ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
                          });
                        }
                      }, 1500);
                    }}
                    disabled={sendingEmail}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {sendingEmail ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando por SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Correo de Prueba</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
