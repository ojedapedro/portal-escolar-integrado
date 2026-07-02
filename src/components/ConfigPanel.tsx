/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppConfig, UserSession, UserRole } from '../types';
import { Settings, Shield, Clock, Eye, Info, Database, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';
import { checkDatabaseMode } from '../firebase';
import { INITIAL_USERS } from '../mockData';

interface ConfigPanelProps {
  config: AppConfig;
  onChangeConfig: (newConfig: AppConfig) => void;
  systemTimeOffset: number; // in minutes
  onChangeTimeOffset: (offset: number) => void;
  activeUser: UserSession;
  onChangeUser: (user: UserSession) => void;
}

export default function ConfigPanel({
  config,
  onChangeConfig,
  systemTimeOffset,
  onChangeTimeOffset,
  activeUser,
  onChangeUser
}: ConfigPanelProps) {
  const dbMode = checkDatabaseMode();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Session Autenticación Switcher (Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-slate-800">Autenticación de Sesión (Simulador de Roles)</h2>
            <p className="text-xs text-slate-400">Verifique el comportamiento de la app según el rol del usuario</p>
          </div>
        </div>

        {/* Selected Active User summary card */}
        <div className="bg-indigo-50/30 border border-indigo-100/60 p-4 rounded-2xl flex items-center gap-3">
          <img
            src={activeUser.foto}
            alt={activeUser.nombre}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <span className="text-[9px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {activeUser.role}
            </span>
            <p className="font-bold text-xs text-slate-800 mt-1">{activeUser.nombre}</p>
            <p className="text-[10px] text-slate-400">{activeUser.email}</p>
          </div>
        </div>

        {/* Choose Session profile */}
        <div className="grid grid-cols-3 gap-2">
          {INITIAL_USERS.map((usr) => (
            <button
              key={usr.uid}
              onClick={() => onChangeUser(usr)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                activeUser.uid === usr.uid
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="block text-[10px] font-black tracking-wide leading-tight truncate">{usr.nombre.split(' ')[1] || usr.nombre}</span>
              <span className={`text-[8px] font-bold block mt-1 ${activeUser.uid === usr.uid ? 'text-indigo-100' : 'text-slate-400'}`}>
                {usr.role === 'Personal Administrativo' ? 'Admin. Aux' : usr.role}
              </span>
            </button>
          ))}
        </div>

        {/* Role Privileges list */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 space-y-1">
          <span className="font-bold block text-slate-700">Permisos activos del Rol:</span>
          {activeUser.role === 'Administrador' && (
            <p>✓ Acceso completo a Auditoría, Calificaciones, Pagos, Inventario y Configuración.</p>
          )}
          {activeUser.role === 'Personal Administrativo' && (
            <p>✓ Puede emitir Recibos de Pago y ajustar Inventarios. No puede limpiar registros de asistencia.</p>
          )}
          {activeUser.role === 'Profesor' && (
            <p>✓ Consulta kárdex de alumnos e Historial de Asistencia. Restringido de emitir cobros o modificar stock.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-slate-800">Parámetros Escolares</h2>
            <p className="text-xs text-slate-400">Configuración institucional del sistema</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className={`p-3 rounded-2xl border ${
          dbMode.isFirebase 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
            : 'bg-amber-50/50 border-amber-100 text-amber-800'
          } flex items-start gap-2.5`}
        >
          <Database className={`w-4 h-4 shrink-0 mt-0.5 ${dbMode.isFirebase ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`} />
          <div className="text-[10px] font-medium leading-normal">
            <span className="font-bold block">
              {dbMode.isFirebase ? '🔥 Conectado a Firestore' : '📦 Base de Datos: Modo Local Activo'}
            </span>
            {dbMode.isFirebase ? (
              <span>Sincronizando recibos, asistencias e inventarios en tiempo real.</span>
            ) : (
              <span>Utilizando LocalStorage para persistencia instantánea de datos y kárdex.</span>
            )}
          </div>
        </div>

        {/* Hour Limit Setting */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Hora Límite de Entrada (Llegada a Tiempo)
          </label>
          <input
            type="time"
            value={config.horaLimite}
            onChange={(e) => onChangeConfig({ ...config, horaLimite: e.target.value })}
            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          />
          <p className="text-[9px] text-slate-400 mt-1">
            Los alumnos que registren asistencia después de esta hora recibirán automáticamente el estado de <span className="text-amber-500 font-bold">Retardo</span>.
          </p>
        </div>

        {/* Lock Duration setting */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" /> Tiempo de Bloqueo de Escáner
          </label>
          <select
            value={config.bloqueoLecturaMs}
            onChange={(e) => onChangeConfig({ ...config, bloqueoLecturaMs: Number(e.target.value) })}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value={2000}>2 Segundos (Rápido)</option>
            <option value={5000}>5 Segundos (Recomendado Institucional)</option>
            <option value={10000}>10 Segundos (Filtro Estricto)</option>
          </select>
          <p className="text-[9px] text-slate-400 mt-1">
            Bloquea lecturas consecutivas del mismo QR para evitar duplicaciones innecesarias en Firestore.
          </p>
        </div>

        {/* Custom Simulator Clock */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> Reloj Simulador (Pruebas de Entrada)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeTimeOffset(-60)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-lg transition-all"
              title="Restar 1 hora"
            >
              -1h
            </button>
            <button
              onClick={() => onChangeTimeOffset(-10)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-lg transition-all"
              title="Restar 10 minutos"
            >
              -10m
            </button>
            <button
              onClick={() => onChangeTimeOffset(0)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-mono text-[9px] font-bold rounded-lg transition-all flex-1 text-center"
              title="Hora Actual del Servidor"
            >
              Hora Real
            </button>
            <button
              onClick={() => onChangeTimeOffset(10)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-lg transition-all"
              title="Sumar 10 minutos"
            >
              +10m
            </button>
            <button
              onClick={() => onChangeTimeOffset(60)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-lg transition-all"
              title="Sumar 1 hora"
            >
              +1h
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5">
            Útil para cambiar la hora actual y comprobar si la lectura de asistencia se procesa como <strong>A Tiempo</strong> o <strong>Retardo</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
