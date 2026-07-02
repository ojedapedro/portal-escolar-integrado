/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asistencia } from '../types';
import { Search, Filter, Trash2, ShieldCheck, Download, Trash, RefreshCw, Clock, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AsistenciasTableProps {
  asistencias: Asistencia[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onResetMock: () => void;
}

export default function AsistenciasTable({
  asistencias,
  onDelete,
  onClearAll,
  onResetMock
}: AsistenciasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Asistió' | 'Retardo'>('Todos');

  // Filtering logic
  const filtered = asistencias.filter((item) => {
    const matchesSearch = 
      item.nombreAlumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alumnoID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.grado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    
    const headers = ["ID Alumno", "Nombre Alumno", "Grado Academico", "Fecha", "Hora de Registro", "Estado"];
    const rows = filtered.map(item => [
      item.alumnoID,
      item.nombreAlumno,
      item.grado,
      item.fecha,
      item.horaExacta,
      item.estado
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asistencia_instituto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF function
  const handleExportPDF = () => {
    if (filtered.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color Palette Constants
    const colors = {
      primary: [79, 70, 229],      // Indigo-600
      primaryLight: [238, 242, 255], // Indigo-50
      secondary: [15, 23, 42],      // Slate-900
      textMuted: [100, 116, 139],   // Slate-500
      border: [226, 232, 240],      // Slate-200
      bgLight: [248, 250, 252],     // Slate-50
      emerald: [16, 185, 129],     // Emerald-500
      amber: [245, 158, 11]         // Amber-500
    };

    // 1. Draw Institutional Header Banner
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Title in white
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('REPORTE DIARIO DE ASISTENCIA', 15, 18);

    // Subtitle/School Name
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(224, 231, 255); // Indigo-100
    doc.text('INSTITUTO EDUCATIVO • CONTROL DE ACCESOS QR', 15, 24);
    
    // Date and Time generated in Header
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = today.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    doc.setFont('helvetica', 'oblique');
    doc.setFontSize(9);
    doc.text(`Generado: ${dateStr} a las ${timeStr}`, 15, 30);

    // 2. Metrics Block (Summary Grid)
    const statsY = 48;
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
    doc.roundedRect(15, statsY, 180, 22, 3, 3, 'FD');

    // Stats computation
    const total = filtered.length;
    const aTiempo = filtered.filter(a => a.estado === 'Asistió').length;
    const retardos = filtered.filter(a => a.estado === 'Retardo').length;
    const rate = total > 0 ? Math.round((aTiempo / total) * 100) : 0;

    // Render Stats Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text('TOTAL REGISTROS', 22, statsY + 7);
    doc.text('LLEGADAS A TIEMPO', 68, statsY + 7);
    doc.text('RETARDOS / DEMORAS', 115, statsY + 7);
    doc.text('ÍNDICE DE PUNTUALIDAD', 158, statsY + 7);

    // Render Stats Values
    doc.setFontSize(13);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`${total}`, 22, statsY + 16);
    
    doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    doc.text(`${aTiempo}`, 68, statsY + 16);
    
    doc.setTextColor(colors.amber[0], colors.amber[1], colors.amber[2]);
    doc.text(`${retardos}`, 115, statsY + 16);
    
    // Color code punctuality rate
    if (rate >= 90) {
      doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
    } else if (rate >= 75) {
      doc.setTextColor(colors.amber[0], colors.amber[1], colors.amber[2]);
    } else {
      doc.setTextColor(239, 68, 68); // Red-500
    }
    doc.text(`${rate}%`, 158, statsY + 16);

    // 3. Table of Attendance Records
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('Detalle de Alumnos Registrados', 15, statsY + 31);

    // Map data for autotable
    const tableData = filtered.map((item) => [
      item.alumnoID,
      item.nombreAlumno,
      item.grado,
      item.fecha,
      item.horaExacta,
      item.estado
    ]);

    autoTable(doc, {
      startY: statsY + 35,
      head: [['Matrícula', 'Estudiante', 'Grado / Grupo', 'Fecha', 'Hora Entrada', 'Estado']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary as any,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: colors.secondary as any
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // slate-50 equivalent
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55, fontStyle: 'bold' },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 22 },
        5: { cellWidth: 18, fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        // Custom coloring for "Estado" column (index 5)
        if (data.column.index === 5 && data.cell.section === 'body') {
          const estado = data.cell.raw as string;
          if (estado === 'Retardo') {
            data.cell.styles.textColor = colors.amber as any;
          } else if (estado === 'Asistió') {
            data.cell.styles.textColor = colors.emerald as any;
          }
        }
      },
      margin: { left: 15, right: 15, bottom: 20 },
      didDrawPage: (data) => {
        // Footer on each page
        const pageCount = doc.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        
        // Footer text line
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.text('Este documento es un registro oficial de asistencia del Sistema Académico Integrado.', 15, footerY);
        
        // Page number
        const pageNumStr = `Página ${data.pageNumber} de ${pageCount}`;
        doc.text(pageNumStr, doc.internal.pageSize.getWidth() - 15 - doc.getTextWidth(pageNumStr), footerY);
      }
    });

    // Save the PDF
    const dateIso = today.toISOString().split('T')[0];
    doc.save(`asistencia_diaria_${dateIso}.pdf`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
      {/* Header and fast actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Registro de Asistencia
          </h2>
          <p className="text-xs text-slate-400">Registros de entradas auditados en tiempo real</p>
        </div>
 
        <div className="flex flex-wrap items-center gap-2">
          {asistencias.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Descargar CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Exportar PDF
              </button>
            </>
          )}
          <button
            onClick={onResetMock}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Restablecer datos de prueba"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reestablecer
          </button>
          {asistencias.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-medium text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Trash className="w-3.5 h-3.5" /> Vaciar Todo
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por alumno, ID o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200/80 text-slate-700 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* State Filter tabs */}
        <div className="sm:col-span-4 flex bg-slate-100 p-1 rounded-xl">
          {(['Todos', 'Asistió', 'Retardo'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`w-full text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'Todos' ? 'Todos' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Alumno / Matrícula</th>
                <th className="py-3 px-4">Grado y Grupo</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Hora de Entrada</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id || `${item.alumnoID}-${item.horaExacta}`} className="hover:bg-slate-50/50 transition-colors">
                    {/* Alumno Info */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900">{item.nombreAlumno}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Matrícula: {item.alumnoID}</p>
                      </div>
                    </td>

                    {/* Grado */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.grado}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">
                      {item.fecha}
                    </td>

                    {/* Hora */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.horaExacta}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.estado === 'Retardo'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.estado === 'Retardo' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                        {item.estado}
                      </span>
                    </td>

                    {/* Trash individual */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => item.id && onDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Borrar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm">No se encontraron registros de asistencia</p>
                      <p className="text-xs text-slate-400/80 mt-1">Intente cambiar los filtros o escanee un nuevo alumno.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer stats */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-medium gap-2">
        <p>Mostrando {filtered.length} de {asistencias.length} registros totales</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 
            A Tiempo: {asistencias.filter(a => a.estado === 'Asistió').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> 
            Retardos: {asistencias.filter(a => a.estado === 'Retardo').length}
          </span>
        </div>
      </div>
    </div>
  );
}
