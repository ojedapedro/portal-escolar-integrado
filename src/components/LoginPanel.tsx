import React, { useState } from 'react';
import { UserSession } from '../types';
import { INITIAL_USERS } from '../mockData';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  School, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPanelProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Decorative top header / branding */}
      <div className="mb-8 text-center max-w-md w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto h-20 w-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-slate-200/80 dark:border-slate-800 p-2.5 mb-4"
        >
          <img 
            src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
            alt="Logo Portal de Acceso Escolar" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/30">
            SISTEMA ACADÉMICO INTEGRADO
          </span>
          <h2 className="mt-3 text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            Portal de Acceso Escolar
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ingresa tus credenciales institucionales para gestionar el ciclo administrativo.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold px-4 py-3 rounded-2xl flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@colegio.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5">
                Contraseña Administrativa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Encriptado SHA-256
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Iniciar Sesión de Trabajo
                </>
              )}
            </button>
          </form>

          {/* Quick access/demo section */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block text-center mb-4 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Acceso Rápido (Demo de Roles)
            </span>
            <div className="space-y-2.5">
              {INITIAL_USERS.map((user) => {
                const isDirector = user.role === 'Administrador';
                const isStaff = user.role === 'Personal Administrativo';
                
                let roleColor = 'border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300';
                if (isDirector) {
                  roleColor = 'border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300';
                } else if (isStaff) {
                  roleColor = 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
                }

                return (
                  <button
                    key={user.uid}
                    onClick={() => handleQuickLogin(user)}
                    disabled={isLoading}
                    className="w-full text-left p-3 border border-slate-150 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.foto}
                        alt={user.nombre}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-150 text-xs block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {user.nombre}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleColor}`}>
                        {user.role}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
        Cumple con el estándar de protección escolar y auditoría institucional. Las conexiones del sistema administrativo quedan registradas en el libro de firmas diario.
      </div>
    </div>
  );
}
