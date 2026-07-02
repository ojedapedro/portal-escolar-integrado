import React, { useState } from 'react';
import { UserSession } from '../types';
import { INITIAL_USERS } from '../mockData';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '../App';

interface LoginPanelProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [budgetView, setBudgetView] = useState<'total' | 'details'>('total');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const DAYS_DATA = [
    { name: 'Lun', value: '$120k', height: '40%', status: 'Completado' },
    { name: 'Mar', value: '$180k', height: '60%', status: 'Completado' },
    { name: 'Mié', value: '$165k', height: '55%', status: 'Completado' },
    { name: 'Jue', value: '$270k', height: '90%', status: 'Auditado', active: true },
    { name: 'Vie', value: '$90k', height: '30%', status: 'Pendiente' }
  ];

  // Quick login helper
  const handleQuickLogin = (user: UserSession) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      const matchedUser = INITIAL_USERS.find(
        (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (matchedUser) {
        // For simulation purposes, accept any password longer than 4 characters
        if (password.length >= 4) {
          setIsLoading(false);
          onLoginSuccess(matchedUser);
        } else {
          setIsLoading(false);
          setError('Contraseña incorrecta (Debe tener mínimo 4 caracteres en simulación).');
        }
      } else {
        setIsLoading(false);
        setError('El correo electrónico no coincide con ningún usuario registrado.');
      }
    }, 800);
  };

  // Simulated Google Sign In
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Auto-login with the first administrator
      onLoginSuccess(INITIAL_USERS[0]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: GORGEOUS DUAL-PANE BRANDING/DASHBOARD MOCKUP */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Brand header */}
        <div className="z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 flex items-center justify-center">
            <img 
              src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
              alt="San Agustin Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase">INSTITUTO SAN AGUSTÍN</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sistema de Gestión de Alumnos</p>
          </div>
        </div>

        {/* Centerpiece Visual Mockup */}
        <div className="z-10 my-auto flex flex-col items-center justify-center relative w-full max-w-lg mx-auto">
          
          {/* Floating Card 1: Presupuesto (Top Left) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              scale: { duration: 0.6, delay: 0.2 },
              y: {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            className="absolute -top-12 -left-8 z-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.3)" }}
              onClick={() => setBudgetView(budgetView === 'total' ? 'details' : 'total')}
              className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl cursor-pointer select-none transition-all duration-300 w-52 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {budgetView === 'total' ? (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Presupuesto</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                        +12%
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white">$624,000</span>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1.5 font-bold flex items-center justify-between">
                      <span>Ciclo Anual</span>
                      <span className="text-indigo-400 font-extrabold animate-pulse">Ver detalles</span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Distribución</span>
                      <span className="text-[8px] text-slate-400 font-bold underline">Volver</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold">Academia:</span>
                        <span className="font-mono text-white font-bold">$250k</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-indigo-500 rounded-full w-[40%]" />
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold">Operativo:</span>
                        <span className="font-mono text-white font-bold">$180k</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-blue-500 rounded-full w-[29%]" />
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold">Bases:</span>
                        <span className="font-mono text-white font-bold">$194k</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full w-[31%]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Large Centered Logo Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full aspect-square max-w-[340px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[48px] p-8 flex flex-col items-center justify-center shadow-3xl relative overflow-hidden group"
          >
            {/* Soft inner radial light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
            
            <img 
              src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
              alt="Futuristic Cap and Book"
              className="w-44 h-44 object-contain mb-6 drop-shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            <h3 className="text-xl font-black text-white tracking-wide text-center">Portal Escolar Integrado</h3>
            <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest text-center mt-1">GERENCIA ADMINISTRATIVA</p>
          </motion.div>

          {/* Floating Card 2: Pagos Auditados (Bottom Right) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, 10, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.3 },
              scale: { duration: 0.6, delay: 0.3 },
              y: {
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            className="absolute -bottom-10 -right-8 z-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: 4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.3)" }}
              className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl w-52 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pagos Auditados</span>
                <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Semanal</span>
              </div>
              
              {/* Interactive columns */}
              <div className="flex items-end justify-between gap-2 h-14 mb-3.5 px-1">
                {DAYS_DATA.map((day, idx) => {
                  const isHovered = hoveredDayIndex === idx;
                  return (
                    <div 
                      key={day.name}
                      onMouseEnter={() => setHoveredDayIndex(idx)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      className="flex-1 flex flex-col items-center cursor-pointer group"
                    >
                      <div className="w-full relative flex justify-center items-end h-10">
                        {/* Animated tooltips above columns */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.span
                              initial={{ opacity: 0, y: -4, scale: 0.8 }}
                              animate={{ opacity: 1, y: -16, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.8 }}
                              className="absolute bg-indigo-600 text-white font-mono font-bold text-[8px] px-1 rounded shadow-md pointer-events-none whitespace-nowrap z-30"
                            >
                              {day.value}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        
                        {/* Bar */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: day.height }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`w-full rounded-md transition-all duration-200 ${
                            isHovered 
                              ? 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                              : day.active 
                                ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                                : 'bg-slate-800 group-hover:bg-slate-700'
                          }`}
                        />
                      </div>
                      <span className={`text-[8px] font-bold mt-1 transition-colors ${isHovered ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}`}>
                        {day.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic responsive footer */}
              <div className="border-t border-slate-800/80 pt-2 flex items-center gap-1.5 min-h-[24px]">
                <AnimatePresence mode="wait">
                  {hoveredDayIndex !== null ? (
                    <motion.div 
                      key={`hover-${hoveredDayIndex}`}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between w-full text-[10px]"
                    >
                      <span className="font-semibold text-indigo-400">{DAYS_DATA[hoveredDayIndex].name}: {DAYS_DATA[hoveredDayIndex].value}</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${
                        DAYS_DATA[hoveredDayIndex].status === 'Completado' || DAYS_DATA[hoveredDayIndex].status === 'Auditado'
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {DAYS_DATA[hoveredDayIndex].status}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold w-full"
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-400" />
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Todo en regla</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Brand footer */}
        <div className="z-10 flex items-center justify-between text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} Instituto San Agustín</span>
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Sistema Auditado y Conexión Segura
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: GORGEOUS CLEAN LOGIN FORM */}
      <div className="flex-1 bg-slate-950 flex flex-col justify-between p-8 md:p-12 relative min-h-screen">
        
        {/* Top bar with quick buttons & theme toggler */}
        <div className="flex items-center justify-between md:justify-end gap-3 z-10 w-full mb-8">
          <div className="flex lg:hidden items-center gap-2">
            <img 
              src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-xs tracking-wide text-white">SAN AGUSTÍN</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center shrink-0"
              title="Cuentas de Demostración"
            >
              <Laptop className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Centered Login Form panel */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-8 z-10">
          
          {/* Mobile-only / Top-form brand icon */}
          <div className="flex flex-col items-start gap-4">
            <div className="h-12 w-12 bg-indigo-650/10 border border-indigo-500/20 rounded-2xl p-2.5 flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <img 
                src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
                alt="Cap and Book Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-display font-black text-white tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="mt-1 text-sm text-slate-400 font-medium leading-relaxed">
                Ingrese sus credenciales para acceder al panel.
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold px-4 py-3 rounded-2xl flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="analistadedatosnova@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-800 rounded-2xl bg-slate-900/60 dark:bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3.5 border border-slate-800 rounded-2xl bg-slate-900/60 dark:bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end text-xs">
              <span className="text-indigo-400 font-bold hover:underline cursor-pointer">
                ¿Olvidó su contraseña?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-650/10 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google alternative */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-full border-t border-slate-800" />
              <span className="relative px-3 bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                O CONTINUAR CON
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-800 rounded-2xl bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 font-bold text-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.591-5.59c1.508 0 2.883.548 3.957 1.455l3.129-3.128C19.196 3.812 16.732 2.743 13.99 2.743c-5.11 0-9.255 4.143-9.255 9.255s4.145 9.256 9.255 9.256c5.54 0 8.874-3.899 8.874-9.256 0-.608-.052-1.121-.164-1.713H12.24Z"
                />
              </svg>
              <span>Iniciar sesión con Google</span>
            </button>
          </div>

          {/* Quick access collapsible section */}
          <AnimatePresence>
            {showDemoAccounts && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-3"
              >
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cuentas de Demostración
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {INITIAL_USERS.map((user) => {
                    const isDirector = user.role === 'Administrador';
                    const isStaff = user.role === 'Personal Administrativo';
                    
                    let roleColor = 'border-blue-900/40 bg-blue-950/20 text-blue-400';
                    if (isDirector) {
                      roleColor = 'border-purple-900/40 bg-purple-950/20 text-purple-400';
                    } else if (isStaff) {
                      roleColor = 'border-emerald-900/40 bg-emerald-950/20 text-emerald-400';
                    }

                    return (
                      <button
                        key={user.uid}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        disabled={isLoading}
                        className="w-full text-left p-2.5 border border-slate-800 rounded-xl hover:bg-slate-850 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={user.foto}
                            alt={user.nombre}
                            className="w-7 h-7 rounded-full object-cover border border-slate-700"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-200 text-[11px] block truncate group-hover:text-indigo-400 transition-colors">
                              {user.nombre}
                            </span>
                            <span className="text-[9px] text-slate-500 block truncate font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${roleColor}`}>
                            {user.role.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Audit Disclaimer in Form Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed z-10">
          Usted está ingresando a un sistema institucional restringido. Todas las operaciones realizadas son grabadas para la auditoría de control interno.
        </div>
      </div>

    </div>
  );
}
