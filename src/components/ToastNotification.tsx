/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Clock, AlertOctagon, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  key?: React.Key;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { id, type, title, message, foto, extra, duration = 4500 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Icons and styles based on type
  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      iconText: 'text-emerald-500 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
      progressBg: 'bg-emerald-500 dark:bg-emerald-400'
    },
    retardo: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/40',
      text: 'text-amber-800 dark:text-amber-300',
      iconText: 'text-amber-500 dark:text-amber-400',
      icon: <Clock className="w-5 h-5 shrink-0" />,
      progressBg: 'bg-amber-500 dark:bg-amber-400'
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-900/40',
      text: 'text-rose-800 dark:text-rose-300',
      iconText: 'text-rose-500 dark:text-rose-400',
      icon: <AlertOctagon className="w-5 h-5 shrink-0" />,
      progressBg: 'bg-rose-500 dark:bg-rose-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-900/40',
      text: 'text-yellow-800 dark:text-yellow-300',
      iconText: 'text-yellow-500 dark:text-yellow-400',
      icon: <AlertCircle className="w-5 h-5 shrink-0" />,
      progressBg: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/40',
      text: 'text-blue-800 dark:text-blue-300',
      iconText: 'text-blue-500 dark:text-blue-400',
      icon: <Info className="w-5 h-5 shrink-0" />,
      progressBg: 'bg-blue-500'
    }
  };

  const style = config[type] || config.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border ${style.border} ${style.bg} p-4 shadow-xl backdrop-blur-md relative overflow-hidden flex gap-3`}
    >
      {/* If student photo is present, render it as avatar, otherwise render type icon */}
      {foto ? (
        <div className="relative shrink-0">
          <img 
            src={foto} 
            alt={title} 
            className="w-11 h-11 rounded-full object-cover border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <span className={`${style.iconText}`}>
              {React.cloneElement(style.icon, { className: 'w-3.5 h-3.5' })}
            </span>
          </div>
        </div>
      ) : (
        <div className={`p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/20 shadow-sm ${style.iconText} h-fit`}>
          {style.icon}
        </div>
      )}

      {/* Message content */}
      <div className="flex-1 space-y-1.5 min-w-0 pr-4">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 leading-none mb-1">
            {type === 'success' ? 'Llegada Temprana' : type === 'retardo' ? 'Llegada con Retardo' : type === 'error' ? 'Incidencia' : 'Mensaje Sistema'}
          </span>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
            {title}
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {message}
        </p>
        
        {extra && (
          <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            {extra}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Dynamic Progress indicator bar at the bottom */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[3px] ${style.progressBg}`}
      />
    </motion.div>
  );
}

interface ToastNotificationContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function ToastNotificationContainer({ toasts, onClose }: ToastNotificationContainerProps) {
  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none"
      id="toast-notifications-container"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
