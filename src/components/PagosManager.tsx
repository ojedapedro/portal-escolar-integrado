import React, { useState, useEffect } from 'react';
import { ReciboPago, Alumno } from '../types';
import { getRecibos, addRecibo, updateReciboEstado, getAlumnos } from '../firebase';
import { 
  DollarSign, 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  CreditCard, 
  FileCheck,
  Building,
  User,
  Hash,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PagosManager() {
  const [recibos, setRecibos] = useState<ReciboPago[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAlumnoID, setSelectedAlumnoID] = useState('');
  const [concepto, setConcepto] = useState('Colegiatura de Julio');
  const [customConcepto, setCustomConcepto] = useState('');
  const [monto, setMonto] = useState('3500');
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Tarjeta de Crédito/Débito' | 'Transferencia SPEI'>('Transferencia SPEI');
  const [detalles, setDetalles] = useState('');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [conceptoFilter, setConceptoFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  // Active printable receipt state
  const [activeReceipt, setActiveReceipt] = useState<ReciboPago | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const listRecibos = await getRecibos();
      const listAlumnos = await getAlumnos();
      setRecibos(listRecibos);
      setAlumnos(listAlumnos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnoID) return;

    const alumno = alumnos.find(a => a.id === selectedAlumnoID);
    if (!alumno) return;

    const finalConcepto = concepto === 'Otro' ? customConcepto : concepto;
    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('es-MX', { hour12: false });

    const nuevoRecibo: ReciboPago = {
      folio: `REC-2026-${folioNum}`,
      alumnoID: alumno.id,
      nombreAlumno: `${alumno.nombre} ${alumno.apellidos}`,
      concepto: finalConcepto || 'Pago Diverso',
      monto: parseFloat(monto) || 0,
      metodoPago,
      fecha: dateStr,
      hora: timeStr,
      estado: 'Pagado',
      detalles: detalles || `Registro administrativo de ingreso para ${alumno.nombre}.`
    };

    await addRecibo(nuevoRecibo);
    
    // Refresh
    const listRecibos = await getRecibos();
    setRecibos(listRecibos);

    // Reset Form
    setSelectedAlumnoID('');
    setConcepto('Colegiatura de Julio');
    setCustomConcepto('');
    setMonto('3500');
    setMetodoPago('Transferencia SPEI');
    setDetalles('');
    setShowAddForm(false);
    
    // Auto preview receipt
    setActiveReceipt(nuevoRecibo);
  };

  const handleUpdateStatus = async (folio: string, status: 'Pagado' | 'Pendiente' | 'Cancelado') => {
    await updateReciboEstado(folio, status);
    const listRecibos = await getRecibos();
    setRecibos(listRecibos);
  };

  const filteredRecibos = recibos.filter(r => {
    const matchesSearch = 
      r.nombreAlumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.alumnoID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConcepto = conceptoFilter === 'Todos' || r.concepto.toLowerCase().includes(conceptoFilter.toLowerCase());
    const matchesEstado = estadoFilter === 'Todos' || r.estado === estadoFilter;

    return matchesSearch && matchesConcepto && matchesEstado;
  });

  // Calculate quick indicators
  const totalIngresos = recibos.filter(r => r.estado === 'Pagado').reduce((sum, r) => sum + r.monto, 0);
  const totalPendientes = recibos.filter(r => r.estado === 'Pendiente').reduce((sum, r) => sum + r.monto, 0);
  const countPagados = recibos.filter(r => r.estado === 'Pagado').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Top Banner & Indicator widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
            <TrendingUp className="w-48 h-48" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-100 block mb-2">Ingresos Recaudados</span>
          <h3 className="text-3xl font-display font-extrabold">${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-indigo-100/90 mt-4 flex items-center gap-1.5 font-medium">
            <span className="bg-indigo-400/30 px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold">LIVE</span>
            {countPagados} recibos emitidos y conciliados exitosamente.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Cuentas por Cobrar</span>
              <h3 className="text-2xl font-display font-bold text-slate-800">${totalPendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
            </div>
            <span className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl border border-amber-100">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            Total en estado <strong>Pendiente</strong> que requiere conciliación o recordatorio.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Método de Uso Frecuente</span>
              <h3 className="text-lg font-display font-bold text-slate-800">Transferencia SPEI</h3>
            </div>
            <span className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            El 75% de los tutores académicos prefiere pagos SPEI electrónicos.
          </p>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ledger & Controls: left column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            
            {/* Header and Add Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-500" /> Control Financiero e Ingresos
                </h2>
                <p className="text-xs text-slate-400">Emisión de recibos digitales y auditoría administrativa</p>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md cursor-pointer active:scale-95"
              >
                {showAddForm ? 'Cerrar Registro' : <><Plus className="w-4 h-4" /> Registrar Ingreso</>}
              </button>
            </div>

            {/* Quick add form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-indigo-100 bg-indigo-50/20 rounded-2xl p-5 mb-6 space-y-4"
                >
                  <form onSubmit={handleCreatePago} className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-indigo-800 tracking-wider">Nuevo Recibo de Pago</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Alumno */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Seleccionar Alumno *</label>
                        <select
                          required
                          value={selectedAlumnoID}
                          onChange={(e) => {
                            setSelectedAlumnoID(e.target.value);
                            // Auto fill suggested amount based on concept
                          }}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Elige un alumno del directorio --</option>
                          {alumnos.map(al => (
                            <option key={al.id} value={al.id}>{al.nombre} {al.apellidos} ({al.grado})</option>
                          ))}
                        </select>
                      </div>

                      {/* Concepto */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Concepto de Pago *</label>
                        <select
                          value={concepto}
                          onChange={(e) => {
                            setConcepto(e.target.value);
                            if (e.target.value === 'Colegiatura de Julio') setMonto('3500');
                            if (e.target.value === 'Inscripción Ciclo Escolar') setMonto('4500');
                            if (e.target.value === 'Uniformes Deportivos') setMonto('1250');
                            if (e.target.value === 'Insumos Escolares / Agenda') setMonto('350');
                          }}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        >
                          <option value="Colegiatura de Julio">Colegiatura de Julio ($3,500)</option>
                          <option value="Inscripción Ciclo Escolar">Inscripción Ciclo Escolar ($4,500)</option>
                          <option value="Uniformes Deportivos">Uniformes Deportivos ($1,250)</option>
                          <option value="Insumos Escolares / Agenda">Insumos Escolares / Agenda ($350)</option>
                          <option value="Otro">Otro (Especificar)</option>
                        </select>
                      </div>
                    </div>

                    {concepto === 'Otro' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-indigo-700 uppercase">Especificar Concepto personalizado *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Constancia de Estudios, Examen extraordinario"
                          value={customConcepto}
                          onChange={(e) => setCustomConcepto(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Monto */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Monto ($ MXN) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Monto total"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Metodo de Pago */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Método de Pago *</label>
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value as any)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        >
                          <option value="Transferencia SPEI">Transferencia SPEI</option>
                          <option value="Tarjeta de Crédito/Débito">Tarjeta Bancaria</option>
                          <option value="Efectivo">Efectivo (Caja)</option>
                        </select>
                      </div>

                      {/* Boton */}
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          Generar Folio y Recibo
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Notas Administrativas / Bitácora</label>
                      <input
                        type="text"
                        placeholder="Observaciones adicionales para el recibo (ej. Referencia bancaria, talla entregada)"
                        value={detalles}
                        onChange={(e) => setDetalles(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter and Search controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por folio, alumno, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <select
                  value={conceptoFilter}
                  onChange={(e) => setConceptoFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
                >
                  <option value="Todos">Todos los Conceptos</option>
                  <option value="Colegiatura">Colegiaturas</option>
                  <option value="Inscripción">Inscripción</option>
                  <option value="Uniformes">Uniformes</option>
                  <option value="Insumos">Insumos</option>
                </select>
              </div>

              <div>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Ledger table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Folio / Fecha</th>
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Monto / Método</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                          Cargando transacciones...
                        </td>
                      </tr>
                    ) : filteredRecibos.length > 0 ? (
                      filteredRecibos.map((recibo) => (
                        <tr key={recibo.folio} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block font-mono">{recibo.folio}</span>
                            <span className="text-[10px] text-slate-400 block">{recibo.fecha} {recibo.hora}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700 block">{recibo.nombreAlumno}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {recibo.alumnoID}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {recibo.concepto}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">${recibo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <span className="text-[10px] text-slate-400 block font-light">{recibo.metodoPago}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              recibo.estado === 'Pagado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : recibo.estado === 'Pendiente'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {recibo.estado}
                            </span>
                            
                            {/* Fast status switch for testing */}
                            <div className="flex gap-1 justify-center mt-1">
                              {recibo.estado !== 'Pagado' && (
                                <button 
                                  onClick={() => handleUpdateStatus(recibo.folio, 'Pagado')}
                                  className="text-[9px] text-emerald-600 hover:underline bg-emerald-50 px-1 rounded"
                                >
                                  Marcar Pagado
                                </button>
                              )}
                              {recibo.estado !== 'Cancelado' && (
                                <button 
                                  onClick={() => handleUpdateStatus(recibo.folio, 'Cancelado')}
                                  className="text-[9px] text-rose-600 hover:underline bg-rose-50 px-1 rounded"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setActiveReceipt(recibo)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Ver Recibo Digital"
                            >
                              <FileText className="w-4 h-4" />
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                          <div className="flex flex-col items-center justify-center">
                            <FileCheck className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-sm">No se encontraron recibos de ingresos</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt High fidelity preview: right column */}
        <div className="lg:col-span-4">
          {activeReceipt ? (
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 shadow-xl space-y-6 relative overflow-hidden" id="printable-invoice">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase text-indigo-800 tracking-wider">Centro Escolar</span>
                  </div>
                  <h4 className="text-sm font-display font-extrabold text-slate-800">COLEGIO PATRIA DE MÉXICO</h4>
                  <p className="text-[9px] text-slate-400 font-medium leading-normal">
                    R.F.C. CPM-040812-XX9<br />
                    Av. de la Reforma 450, CDMX
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Folio Digital</span>
                  <span className="text-sm font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border">{activeReceipt.folio}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-4">
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Datos del Estudiante</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold space-y-0.5">
                    <p className="text-sm font-extrabold text-slate-900">{activeReceipt.nombreAlumno}</p>
                    <p className="text-slate-500 font-mono">Matrícula: {activeReceipt.alumnoID}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Concepto
                    </span>
                    <span className="font-extrabold text-slate-800 text-right">{activeReceipt.concepto}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      Método de Pago
                    </span>
                    <span className="font-bold text-slate-700">{activeReceipt.metodoPago}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Fecha Emisión
                    </span>
                    <span className="font-mono text-slate-600 font-semibold">{activeReceipt.fecha} a las {activeReceipt.hora}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      Estado de Pago
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      activeReceipt.estado === 'Pagado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeReceipt.estado === 'Pendiente'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {activeReceipt.estado}
                    </span>
                  </div>
                </div>

                {activeReceipt.detalles && (
                  <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 italic">
                    {activeReceipt.detalles}
                  </div>
                )}

                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Monto Recibido</span>
                  <span className="text-2xl font-display font-black text-indigo-700">
                    ${activeReceipt.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 text-center space-y-4">
                <div className="inline-block border-t border-slate-200 w-44 pt-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Firma Cajero Digital</span>
                  <span className="text-[10px] font-mono text-slate-500">Caja de Administración</span>
                </div>

                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 text-[10px] text-emerald-800 font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Este recibo cuenta con Certificado Digital de Conciliación CPM
                </div>
              </div>

              {/* Print action buttons */}
              <div className="flex gap-2 justify-center no-print pt-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Recibo
                </button>
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                      + ["Folio", "AlumnoID", "Nombre", "Concepto", "Monto", "Metodo", "Fecha"].join(",") + "\n"
                      + [activeReceipt.folio, activeReceipt.alumnoID, activeReceipt.nombreAlumno, activeReceipt.concepto, activeReceipt.monto, activeReceipt.metodoPago, activeReceipt.fecha].join(",");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `recibo_digital_${activeReceipt.folio}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Datos
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 animate-pulse" />
              <h4 className="text-slate-700 font-bold font-display text-sm">Vista Previa de Recibo</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Selecciona un recibo del historial en la izquierda o emite uno nuevo para ver, imprimir o exportar.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
