/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, UserCheck, Calendar, Clock, GraduationCap } from 'lucide-react';
import { Alumno, Asistencia } from '../types';

interface AlumnoCardProps {
  lastScannedAlumno: Alumno | null;
  lastAsistencia: Asistencia | null;
}

export default function AlumnoCard({
  lastScannedAlumno,
  lastAsistencia
}: AlumnoCardProps) {
  
  if (!lastScannedAlumno || !lastAsistencia) {
    return (
      <div id="alumno-card-empty" className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-900/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-center justify-center mb-4 text-blue-600 animate-pulse">
          <UserCheck className="w-10 h-10" />
        </div>
        <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-200">Esperando Lectura...</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mt-2">
          Coloque un código QR frente a la cámara o haga clic en un alumno del simulador para registrar su asistencia diaria.
        </p>
        
        {/* Visual tips */}
        <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Paso 1</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mostrar QR</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Frente al lente de la cámara activa.</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Paso 2</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auditar Hora</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">El sistema asigna retardo si pasa del límite.</span>
          </div>
        </div>
      </div>
    );
  }

  const isRetardo = lastAsistencia.estado === 'Retardo';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lastScannedAlumno.id + lastAsistencia.horaExacta}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.3 }}
        id="alumno-card-success"
        className={`bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between h-full shadow-[-10px_0_30px_rgba(0,0,0,0.02)]`}
      >
        <div className="flex-grow flex flex-col items-center pt-4 text-center">
          
          {/* Picture with premium verified badge styling */}
          <div className="relative mb-8">
            <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={lastScannedAlumno.foto}
                alt={`${lastScannedAlumno.nombre} ${lastScannedAlumno.apellidos}`}
                className="w-full h-full object-cover bg-slate-100"
              />
            </div>
            
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg ${
              isRetardo ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              {isRetardo ? 'Retardo' : 'Verificado'}
            </div>
          </div>

          {/* Student details in modern spacing */}
          <div className="space-y-1 mb-6 text-slate-900">
            <h3 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {lastScannedAlumno.nombre} {lastScannedAlumno.apellidos}
            </h3>
            <p className="text-indigo-600 font-semibold text-base">
              {lastScannedAlumno.grado} • Grupo {lastScannedAlumno.grupo}
            </p>
            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
              Matrícula: {lastScannedAlumno.id}
            </p>
          </div>

          {/* Metrics grid matching theme */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
              <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Hora Registro</span>
              <span className="text-lg font-mono text-slate-700 font-semibold">{lastAsistencia.horaExacta} AM</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
              <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Estado</span>
              <span className={`text-lg font-bold ${isRetardo ? 'text-amber-600' : 'text-emerald-600'}`}>
                {lastAsistencia.estado}
              </span>
            </div>
          </div>

          {/* Elegant confirmation bar */}
          <div className={`p-4 rounded-2xl w-full border flex items-center justify-center gap-2.5 shadow-sm ${
            isRetardo 
              ? 'bg-amber-50 text-amber-800 border-amber-100' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
          }`}>
            {isRetardo ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-bold text-sm">Registro de Retardo Exitoso</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-bold text-sm">¡Asistencia Registrada Exitosamente!</span>
              </>
            )}
          </div>
        </div>

        {/* Quick action helper label */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 font-medium">
            Siguiente alumno puede escanear en cuanto se libere el visor.
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
