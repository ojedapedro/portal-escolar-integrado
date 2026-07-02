/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alumno, HistorialItem } from '../types';
import { Plus, GraduationCap, Download, QrCode, ClipboardList, ChevronRight, X, Sparkles, PlusCircle, Trash, Star } from 'lucide-react';
import StudentQRCard from './StudentQRCard';

interface AlumnosManagerProps {
  alumnos: Alumno[];
  onAddAlumno: (nuevo: Alumno) => void;
  onUpdateAlumno: (updated: Alumno) => void;
}

const GRADOS = [
  "1º de Primaria",
  "2º de Primaria",
  "3º de Primaria",
  "4º de Primaria",
  "5º de Primaria",
  "6º de Primaria",
  "1º de Secundaria",
  "2º de Secundaria",
  "3º de Secundaria",
  "1º de Preparatoria",
  "2º de Preparatoria",
  "3º de Preparatoria"
];

const GRUPOS = ["A", "B", "C", "D"];

// A list of high quality premium student avatars to choose from easily
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
];

export default function AlumnosManager({ alumnos, onAddAlumno, onUpdateAlumno }: AlumnosManagerProps) {
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(alumnos[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintBadgeModal, setShowPrintBadgeModal] = useState(false);
  
  // Grade Form State
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [materia, setMateria] = useState('');
  const [ciclo, setCiclo] = useState('2025-2026');
  const [calificacion, setCalificacion] = useState('9.0');
  const [observaciones, setObservaciones] = useState('');

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [grado, setGrado] = useState(GRADOS[0]);
  const [grupo, setGrupo] = useState(GRUPOS[0]);
  const [foto, setFoto] = useState(AVATAR_PRESETS[0]);
  const [customId, setCustomId] = useState('');

  const handleGenerateId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCustomId(`ALUM-2026-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidos.trim()) return;

    const finalId = customId.trim() || `ALUM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevo: Alumno = {
      id: finalId,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      grado,
      grupo,
      foto,
      historialAcademico: []
    };

    onAddAlumno(nuevo);
    setSelectedAlumno(nuevo);
    setShowAddModal(false);

    // Reset Form
    setNombre('');
    setApellidos('');
    setCustomId('');
  };

  const handleAddHistorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno || !materia.trim()) return;

    const newGrade: HistorialItem = {
      materia: materia.trim(),
      ciclo,
      calificacion: parseFloat(calificacion) || 0,
      observaciones: observaciones.trim() || undefined
    };

    const updatedAlumno: Alumno = {
      ...selectedAlumno,
      historialAcademico: [...(selectedAlumno.historialAcademico || []), newGrade]
    };

    onUpdateAlumno(updatedAlumno);
    setSelectedAlumno(updatedAlumno);
    
    // Clear grade form
    setMateria('');
    setObservaciones('');
    setShowGradeForm(false);
  };

  const handleRemoveHistorial = (index: number) => {
    if (!selectedAlumno) return;

    const updatedHistorial = [...(selectedAlumno.historialAcademico || [])];
    updatedHistorial.splice(index, 1);

    const updatedAlumno: Alumno = {
      ...selectedAlumno,
      historialAcademico: updatedHistorial
    };

    onUpdateAlumno(updatedAlumno);
    setSelectedAlumno(updatedAlumno);
  };

  // Build the QR code generation URL
  const getQrUrl = (id: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(id)}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5.5 h-5.5 text-blue-500" /> Control de Estudios Académicos
            </h2>
            <p className="text-xs text-slate-400">Gestión de niveles académicos, asignaciones y calificaciones de estudiantes</p>
          </div>
          <button
            onClick={() => {
              handleGenerateId();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Alumno
          </button>
        </div>

        {/* Desktop Split View: Left List, Right Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Column */}
          <div className="lg:col-span-4 space-y-2 max-h-[580px] overflow-y-auto pr-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-1">Alumnos Inscritos ({alumnos.length})</span>
            {alumnos.map((alum) => (
              <div
                key={alum.id}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between group relative ${
                  selectedAlumno?.id === alum.id
                    ? 'bg-blue-50/70 border-blue-200 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div 
                  onClick={() => setSelectedAlumno(alum)}
                  className="flex items-center gap-3 truncate flex-1 cursor-pointer"
                >
                  <img
                    src={alum.foto}
                    alt={alum.nombre}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-xs text-slate-800 truncate">
                      {alum.nombre} {alum.apellidos}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {alum.grado} • Grupo {alum.grupo}
                    </p>
                  </div>
                </div>
                
                {/* Generate QR button next to student record */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlumno(alum);
                      setShowPrintBadgeModal(true);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-100 hover:border-blue-200 shadow-sm transition-all cursor-pointer hover:scale-105"
                    title="Generar e Imprimir Credencial QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <div className="cursor-pointer" onClick={() => setSelectedAlumno(alum)}>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      selectedAlumno?.id === alum.id ? 'text-blue-500 translate-x-0.5' : 'text-slate-300'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Student Academic Folder & QR Credential (col-span-8) */}
          <div className="lg:col-span-8">
            {selectedAlumno ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Card: High fidelity Credential with QR */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
                  <div className="w-full text-center pb-3 border-b border-dashed border-slate-200">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Credencial Digital QR</span>
                    <span className="text-[11px] font-display font-semibold text-blue-600 block mt-0.5">Instituto San Agustín</span>
                  </div>

                  <div className="flex flex-col items-center my-4 text-center">
                    <div className="relative mb-3">
                      <img
                        src={selectedAlumno.foto}
                        alt={selectedAlumno.nombre}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    </div>

                    <h3 className="font-bold text-sm text-slate-800 leading-tight">
                      {selectedAlumno.nombre} {selectedAlumno.apellidos}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {selectedAlumno.grado} - Grupo "{selectedAlumno.grupo}"
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 bg-white border border-slate-100 px-2.5 py-0.5 rounded-full mt-1">
                      ID: {selectedAlumno.id}
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                    <img
                      src={getQrUrl(selectedAlumno.id)}
                      alt={`QR de ${selectedAlumno.nombre}`}
                      className="w-24 h-24"
                    />
                    <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Identificador de Asistencia
                    </span>
                  </div>

                  <div className="w-full mt-4 space-y-2">
                    <button
                      onClick={() => setShowPrintBadgeModal(true)}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Imprimir Credencial QR
                    </button>
                    <a
                      href={getQrUrl(selectedAlumno.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer text-center"
                    >
                      <Download className="w-3 h-3" /> Descargar QR Plano
                    </a>
                  </div>
                </div>

                {/* Right Card: Historial Académico */}
                <div className="md:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                        <ClipboardList className="w-4 h-4 text-indigo-500" /> Historial Académico Básico
                      </h4>
                      <p className="text-[10px] text-slate-400">Asignaturas y evaluaciones registradas</p>
                    </div>

                    <button
                      onClick={() => setShowGradeForm(!showGradeForm)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> {showGradeForm ? 'Cerrar' : 'Agregar Nota'}
                    </button>
                  </div>

                  {/* Add grade form inline */}
                  {showGradeForm && (
                    <form onSubmit={handleAddHistorial} className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 space-y-3 animate-in slide-in-from-top-2 duration-150">
                      <h5 className="text-[10px] font-black uppercase text-blue-800 tracking-wider">Registrar Asignatura</h5>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold">Materia *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Matemáticas"
                            value={materia}
                            onChange={(e) => setMateria(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold">Ciclo Escolar</label>
                          <select
                            value={ciclo}
                            onChange={(e) => setCiclo(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                          >
                            <option value="2025-2026">2025-2026</option>
                            <option value="2024-2025">2024-2025</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold">Calificación *</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            required
                            value={calificacion}
                            onChange={(e) => setCalificacion(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg cursor-pointer"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 font-bold">Observación Académica</label>
                        <input
                          type="text"
                          placeholder="Ej. Demuestra gran talento para lógica..."
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                        />
                      </div>
                    </form>
                  )}

                  {/* Grades List */}
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {selectedAlumno.historialAcademico && selectedAlumno.historialAcademico.length > 0 ? (
                      selectedAlumno.historialAcademico.map((grade, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100/80 flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">{grade.materia}</span>
                              <span className="text-[9px] text-slate-400 font-mono">({grade.ciclo})</span>
                            </div>
                            {grade.observaciones && (
                              <p className="text-[10px] text-slate-500 italic">“{grade.observaciones}”</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2 py-0.5 rounded font-mono ${
                              grade.calificacion >= 9 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : grade.calificacion >= 7.5
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {grade.calificacion.toFixed(1)}
                            </span>

                            <button
                              onClick={() => handleRemoveHistorial(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar registro"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Star className="w-6 h-6 text-slate-300 mx-auto mb-1 animate-bounce" />
                        <p className="text-xs text-slate-400">Sin calificaciones registradas para el ciclo.</p>
                      </div>
                    )}
                  </div>

                  {/* Level status warning */}
                  <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/40 text-[10px] text-indigo-800 leading-normal">
                    💡 <strong>Asignación Escolar:</strong> Los estudiantes se promueven de grado de forma automática al finalizar el ciclo anual. El tutor escolar de {selectedAlumno.nombre} puede consultar este kárdex en línea.
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <GraduationCap className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-600 text-sm">Folder de Alumno</h4>
                <p className="text-slate-400 text-xs mt-1">Selecciona un estudiante del directorio para revisar su historial académico, credenciales y calificaciones.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-800">Registrar Alumno</h3>
                <p className="text-xs text-slate-400">Ingrese los datos para dar de alta en el sistema escolar</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Sofía"
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Surnames */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej. García Mendoza"
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Degree and Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grado Académico</label>
                  <select
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {GRADOS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo</label>
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {GRUPOS.map(g => (
                      <option key={g} value={g}>Grupo {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom ID input & generator */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex justify-between items-center">
                  <span>Código de Matrícula (ID Único)</span>
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="text-blue-600 hover:text-blue-700 text-[10px] font-bold"
                  >
                    Autogenerar ID
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="ALUM-2026-XXXX"
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 font-mono rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Photo Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Elegir Foto de Perfil</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFoto(url)}
                      className={`relative rounded-full p-0.5 shrink-0 transition-transform cursor-pointer hover:scale-105 active:scale-95 ${
                        foto === url ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Guardar en Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Credential Generator Modal */}
      {showPrintBadgeModal && selectedAlumno && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <StudentQRCard 
              alumno={selectedAlumno} 
              onClose={() => setShowPrintBadgeModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
