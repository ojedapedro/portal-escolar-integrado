/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Alumno } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  X, 
  Sparkles, 
  RotateCw, 
  School, 
  ShieldCheck, 
  CreditCard, 
  Info,
  Check,
  Download
} from 'lucide-react';

interface StudentQRCardProps {
  alumno: Alumno;
  onClose?: () => void;
}

type BadgeTheme = 'classic-blue' | 'school-emerald' | 'gold-royal' | 'ink-saver';

export default function StudentQRCard({ alumno, onClose }: StudentQRCardProps) {
  const [theme, setTheme] = useState<BadgeTheme>('classic-blue');
  const [viewSide, setViewSide] = useState<'front' | 'back' | 'both'>('both');
  const [includeSignature, setIncludeSignature] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Theme styling configurations
  const themeStyles = {
    'classic-blue': {
      bg: 'bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950',
      textHeader: 'text-blue-200',
      title: 'text-white',
      accentBorder: 'border-blue-400',
      badgeBg: 'bg-blue-900/40 text-blue-100 border-blue-800/60',
      stripe: 'bg-blue-600',
      textColor: 'text-slate-800',
      primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    'school-emerald': {
      bg: 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-950',
      textHeader: 'text-emerald-200',
      title: 'text-white',
      accentBorder: 'border-emerald-400',
      badgeBg: 'bg-emerald-900/40 text-emerald-100 border-emerald-800/60',
      stripe: 'bg-emerald-600',
      textColor: 'text-slate-800',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    'gold-royal': {
      bg: 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950',
      textHeader: 'text-amber-400',
      title: 'text-amber-100',
      accentBorder: 'border-amber-500/70',
      badgeBg: 'bg-amber-950/40 text-amber-200 border-amber-900/50',
      stripe: 'bg-amber-500',
      textColor: 'text-slate-800',
      primaryBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    'ink-saver': {
      bg: 'bg-white border-2 border-slate-900',
      textHeader: 'text-slate-600',
      title: 'text-slate-900',
      accentBorder: 'border-slate-900',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      stripe: 'bg-slate-900',
      textColor: 'text-slate-900',
      primaryBtn: 'bg-slate-900 hover:bg-black text-white',
    }
  };

  const currentTheme = themeStyles[theme];

  // Handler to trigger standard browser print
  const handlePrint = () => {
    window.print();
  };

  // Helper to trigger direct SVG download of the QR Code
  const downloadQrCode = () => {
    const svgElement = document.getElementById(`qr-svg-${alumno.id}`);
    if (!svgElement) return;
    
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_Alumno_${alumno.nombre}_${alumno.apellidos}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-100/10 p-6 max-w-4xl w-full mx-auto space-y-6 text-slate-100">
      
      {/* Printable CSS Rules (Inject only when active) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: #ffffff !important;
          }
          /* Target exactly the printable containers inside the print area */
          .printable-badge-area, .printable-badge-area * {
            visibility: visible;
          }
          .printable-badge-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 40px !important;
            padding: 20px !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Force page margins */
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Generador de Credenciales Físicas
          </span>
          <h2 className="text-xl font-display font-bold text-white mt-0.5">
            Impresión de Identificaciones Oficiales
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalice y mande a imprimir tarjetas de PVC o papel opalina con código QR.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Control Panel Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start print:hidden">
        
        {/* Left column: Setup controls */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <CreditCard className="w-4 h-4 text-blue-500" /> Preferencias de Tarjeta
          </h3>

          {/* Theme Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Estilo Visual (Fondo / Temática)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('classic-blue')}
                className={`text-xs p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  theme === 'classic-blue' 
                    ? 'bg-blue-950/80 border-blue-500 text-blue-100 shadow-sm shadow-blue-500/20' 
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <span>Azul Clásico</span>
                {theme === 'classic-blue' && <Check className="w-3 h-3 text-blue-400" />}
              </button>
              
              <button
                type="button"
                onClick={() => setTheme('school-emerald')}
                className={`text-xs p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  theme === 'school-emerald' 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-sm shadow-emerald-500/20' 
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <span>Esmeralda</span>
                {theme === 'school-emerald' && <Check className="w-3 h-3 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('gold-royal')}
                className={`text-xs p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  theme === 'gold-royal' 
                    ? 'bg-slate-900/90 border-amber-500 text-amber-200 shadow-sm shadow-amber-500/10' 
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <span>Oro Real</span>
                {theme === 'gold-royal' && <Check className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('ink-saver')}
                className={`text-xs p-2.5 rounded-xl border border-slate-700 bg-white hover:bg-slate-50 text-slate-900 flex items-center justify-between text-left transition-all cursor-pointer ${
                  theme === 'ink-saver' ? 'ring-2 ring-slate-400' : ''
                }`}
              >
                <span>Ahorro de Tinta</span>
                {theme === 'ink-saver' && <Check className="w-3 h-3 text-slate-900" />}
              </button>
            </div>
          </div>

          {/* View Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Caras a Imprimir</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewSide('front')}
                className={`text-[11px] py-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${
                  viewSide === 'front' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Frente
              </button>
              <button
                type="button"
                onClick={() => setViewSide('back')}
                className={`text-[11px] py-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${
                  viewSide === 'back' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Reverso
              </button>
              <button
                type="button"
                onClick={() => setViewSide('both')}
                className={`text-[11px] py-1.5 rounded-lg text-center transition-all cursor-pointer font-medium ${
                  viewSide === 'both' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ambos
              </button>
            </div>
          </div>

          {/* Extras Toggle */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Incluir Firma de Director</span>
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-700 bg-slate-800 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Core Actions */}
          <div className="pt-4 border-t border-slate-850 space-y-2">
            <button
              onClick={handlePrint}
              className={`w-full flex items-center justify-center gap-2 font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${currentTheme.primaryBtn}`}
            >
              <Printer className="w-4 h-4" /> Mandar a Imprimir (PDF)
            </button>

            <button
              onClick={downloadQrCode}
              className="w-full flex items-center justify-center gap-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 font-medium text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Descargar Código QR (SVG)
            </button>
          </div>
        </div>

        {/* Right column: Print Preview and Card Stage */}
        <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950/30 border border-slate-800/40 p-6 rounded-2xl min-h-[460px]">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-4 block print:hidden">
            Vista Previa Escalar (85.6mm × 54mm)
          </span>

          {/* Printable badge area which matches standard PVC card dimensions */}
          <div 
            ref={cardRef}
            className="printable-badge-area flex flex-col sm:flex-row gap-6 items-center justify-center w-full"
          >
            
            {/* FRONT OF THE ID CARD */}
            {(viewSide === 'front' || viewSide === 'both') && (
              <div 
                className={`relative w-[240px] h-[375px] rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between select-none ${
                  theme === 'ink-saver' 
                    ? 'bg-white border-2 border-slate-900 text-slate-900' 
                    : `${currentTheme.bg} border border-slate-750/30 text-white`
                }`}
              >
                {/* Decorative Header Lines */}
                {theme !== 'ink-saver' && (
                  <div className="absolute top-0 left-0 w-full h-24 bg-white/5 skew-y-3 origin-top-left pointer-events-none" />
                )}

                {/* Card Header */}
                <div className="p-4 z-10 flex items-center gap-2 border-b border-dashed border-slate-100/10 relative">
                  <div className={`p-0.5 rounded-lg shrink-0 bg-white ${theme === 'ink-saver' ? 'border border-slate-300' : ''}`}>
                    <img 
                      src="https://i.ibb.co/xqqX6KCg/Generate-Logo-s-mbolo-futurista-mejorado-de-birrete-de-graduaci-n-sobre-edificio-acad-mico-y-libro.png" 
                      alt="Logo Colegio" 
                      className="w-6 h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="leading-tight">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'ink-saver' ? 'text-slate-500' : currentTheme.textHeader}`}>
                      Instituto San Agustín
                    </span>
                    <span className={`text-[10px] font-display font-extrabold block ${theme === 'ink-saver' ? 'text-slate-850' : 'text-white'}`}>
                      CREDENCIAL ESCOLAR
                    </span>
                  </div>
                </div>

                {/* Card Body - Photo & Core Student info */}
                <div className="px-4 flex flex-col items-center flex-grow justify-center py-2 text-center relative z-10">
                  <div className="relative mb-2.5">
                    <img
                      src={alumno.foto}
                      alt={alumno.nombre}
                      className={`w-20 h-20 rounded-full object-cover shadow-md border-2 ${
                        theme === 'ink-saver' ? 'border-slate-900' : 'border-white'
                      }`}
                    />
                    {/* Tiny chip illustration */}
                    {theme !== 'ink-saver' && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 w-4 h-4 rounded border border-amber-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-amber-200 rounded-sm" />
                      </div>
                    )}
                  </div>

                  <h3 className={`font-bold text-sm tracking-tight leading-snug truncate w-full ${theme === 'ink-saver' ? 'text-slate-900' : 'text-white'}`}>
                    {alumno.nombre}
                  </h3>
                  <h4 className={`font-bold text-xs tracking-tight leading-none text-slate-400 truncate w-full mt-0.5 ${theme === 'ink-saver' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {alumno.apellidos}
                  </h4>

                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border mt-2.5 inline-block ${currentTheme.badgeBg}`}>
                    {alumno.grado} • "{alumno.grupo}"
                  </span>
                </div>

                {/* Card Footer Stripe */}
                <div className={`py-2 px-4 flex justify-between items-center z-10 relative ${
                  theme === 'ink-saver' ? 'bg-slate-100 border-t border-slate-200' : 'bg-black/25'
                }`}>
                  <div>
                    <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-widest">Código Único</span>
                    <span className="text-[9px] font-mono font-bold leading-none">{alumno.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-widest">Ciclo</span>
                    <span className="text-[9px] font-bold leading-none">2025-2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* BACK OF THE ID CARD */}
            {(viewSide === 'back' || viewSide === 'both') && (
              <div 
                className={`relative w-[240px] h-[375px] rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between select-none ${
                  theme === 'ink-saver' 
                    ? 'bg-white border-2 border-slate-900 text-slate-900' 
                    : `${currentTheme.bg} border border-slate-750/30 text-white`
                }`}
              >
                {/* Back Header Banner */}
                <div className={`py-3 px-4 text-center border-b border-dashed border-slate-100/10 ${theme === 'ink-saver' ? 'bg-slate-100' : 'bg-black/15'}`}>
                  <span className="text-[8px] font-black uppercase tracking-widest block">IDENTIFICACIÓN OFICIAL</span>
                  <span className="text-[7px] text-slate-400 block mt-0.5">SISTEMA INTEGRAL DE ASISTENCIA</span>
                </div>

                {/* Back Body: Real High Quality QR code with qrcode.react */}
                <div className="px-4 py-3 flex flex-col items-center justify-center flex-grow text-center">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <QRCodeSVG 
                      id={`qr-svg-${alumno.id}`}
                      value={alumno.id} 
                      size={110} 
                      level="H" 
                      includeMargin={false}
                      fgColor="#0f172a"
                      bgColor="#ffffff"
                    />
                  </div>
                  
                  <span className="text-[8px] font-mono font-bold tracking-wider mt-2 text-slate-400 uppercase">
                    Escanee para registro escolar
                  </span>
                  
                  {/* Institutional Rules */}
                  <div className={`text-[7px] leading-snug max-w-[200px] mt-3 border-t pt-2.5 border-dashed border-slate-100/10 ${
                    theme === 'ink-saver' ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    Esta credencial es personal e intransferible. Identifica al estudiante para control de asistencia diaria en los accesos del plantel.
                  </div>
                </div>

                {/* Signature, info and bar code decoration */}
                <div className="p-3 bg-black/10 flex flex-col items-center border-t border-slate-100/10 text-center">
                  {includeSignature ? (
                    <div className="mb-1 w-full flex flex-col items-center">
                      {/* Fake signature line */}
                      <span className="font-serif italic text-xs text-blue-400 font-bold select-none h-4 inline-block transform -rotate-1">
                        Dra. Elena Ruiz G.
                      </span>
                      <div className="w-24 h-px bg-slate-500 mt-0.5" />
                      <span className="text-[6px] text-slate-400 uppercase tracking-widest mt-0.5">Dirección Académica</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full pb-1">
                      <span className="text-[7px] font-bold text-slate-400">INSTITUTO SAN AGUSTÍN S.C.</span>
                      <span className="text-[6px] text-slate-400 mt-0.5">Tel: 55-8493-2900 • CDMX, México</span>
                    </div>
                  )}

                  {/* Micro simulated barcode stripes */}
                  <div className="flex gap-[1px] w-36 h-3.5 bg-white p-0.5 rounded mt-1.5 justify-center opacity-70">
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[2px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[3px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[2px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[3px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[2px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                    <div className="w-[2px] h-full bg-slate-900" />
                    <div className="w-[3px] h-full bg-slate-900" />
                    <div className="w-[1px] h-full bg-slate-900" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Quick printable note helper */}
          <div className="flex items-start gap-2 max-w-md bg-slate-800/40 p-3 rounded-xl border border-slate-750/30 mt-4 text-[10px] text-slate-400 leading-normal print:hidden">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Tip de Impresión:</strong> Para credenciales físicas del tamaño de una tarjeta de crédito, guarde como PDF, imprima a 100% de escala (sin ajustar a página) y seleccione papel opalina grueso o imprima directamente en tarjetas de PVC.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
