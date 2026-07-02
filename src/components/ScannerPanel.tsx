/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Video, AlertCircle, RefreshCw } from 'lucide-react';
import { Alumno } from '../types';

interface ScannerPanelProps {
  onScan: (decodedText: string) => void;
  isLocked: boolean;
  scanStatus: 'idle' | 'success' | 'error';
  lastErrorMsg?: string;
  alumnos: Alumno[];
}

export default function ScannerPanel({
  onScan,
  isLocked,
  scanStatus,
  lastErrorMsg,
  alumnos
}: ScannerPanelProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-viewport";

  // Load cameras list on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        } else {
          setInitError("No se encontraron cámaras de hardware. Puede usar los botones de simulación rápida en el panel inferior.");
        }
      })
      .catch((err) => {
        console.warn("Error al buscar cámaras:", err);
        setInitError("Permiso de cámara denegado o bloqueado por el navegador. Use los botones de simulación.");
      });

    return () => {
      // Ensure scanner is stopped on unmount
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.log("Unmount stop error:", err));
        }
      }
    };
  }, []);

  const startScanner = async () => {
    if (isScanning || !selectedCameraId) return;
    setInitError(null);

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          onScan(decodedText);
        },
        (_errorMessage) => {
          // Silent - QR not found in frame yet
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting camera scanner:", err);
      setInitError("No se pudo conectar a la cámara seleccionada. Verifique permisos.");
    };
  };

  const stopScanner = async () => {
    if (!isScanning || !scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      setIsScanning(false);
      scannerRef.current = null;
    } catch (err) {
      console.error("Error stopping camera scanner:", err);
    }
  };

  // Border glow and color depending on scanner state
  const getBorderColor = () => {
    if (isLocked) {
      if (scanStatus === 'success') return 'border-emerald-500 shadow-lg shadow-emerald-500/20';
      if (scanStatus === 'error') return 'border-rose-500 shadow-lg shadow-rose-500/20';
      return 'border-amber-500 shadow-lg shadow-amber-500/20'; // Cool down state
    }
    if (isScanning) return 'border-blue-500 shadow-lg shadow-blue-500/20';
    return 'border-slate-300 dark:border-slate-700';
  };

  return (
    <div id="scanner-view-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="scanner-title" className="text-xl font-display font-semibold text-slate-800">Cámara del Escáner</h2>
            <p className="text-xs text-slate-400">Escanee el código QR del alumno para procesar asistencia</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {isScanning ? 'En Vivo' : 'Apagado'}
            </span>
          </div>
        </div>

        {/* Camera Selector */}
        {cameras.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Video className="w-3.5 h-3.5" /> Cambiar Cámara
            </label>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) {
                  stopScanner().then(() => startScanner());
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-2.5 outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {cameras.map((cam, idx) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Cámara ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Visor Area */}
        <div className={`relative aspect-square w-full max-w-[340px] mx-auto rounded-2xl border-2 ${getBorderColor()} bg-black overflow-hidden transition-all duration-300 flex flex-col items-center justify-center shadow-2xl`}>
          
          {/* Subtle radial gradient background overlay */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />

          {/* Main QR target element */}
          <div id={containerId} className="absolute inset-0 w-full h-full [&>video]:object-cover" />

          {/* Decorative scan target graphics overlay (Professional Polish style) */}
          {isScanning && !isLocked && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Custom theme scanner overlay wrapper */}
              <div className="relative w-64 h-64 scanner-overlay rounded-lg">
                <div className="corner corner-tl"></div>
                <div className="corner corner-tr"></div>
                <div className="corner corner-bl"></div>
                <div className="corner corner-br"></div>
                <div className="scan-line absolute top-0 left-0 w-full h-[2px] bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-scan-line"></div>
              </div>
              <div className="absolute bottom-4 text-white/50 text-[10px] font-light">Alinee el código QR dentro del marco</div>
            </div>
          )}

          {/* Feedback states overlays */}
          {isLocked && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none transition-all duration-300 ${scanStatus === 'success' ? 'bg-emerald-950/80' : 'bg-rose-950/80'}`}>
              <div className="p-3 bg-white/10 rounded-full mb-3 backdrop-blur-md animate-bounce">
                {scanStatus === 'success' ? (
                  <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className="text-white font-semibold text-lg">
                {scanStatus === 'success' ? '¡Éxito!' : 'Error'}
              </h3>
              <p className="text-white/80 text-xs mt-1">
                {scanStatus === 'success' ? 'Asistencia registrada correctamente.' : (lastErrorMsg || 'No se reconoce el alumno.')}
              </p>
              <div className="mt-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white font-mono animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Bloqueado 5s
              </div>
            </div>
          )}

          {/* Idle screen if camera is off */}
          {!isScanning && !isLocked && (
            <div className="text-center p-6 flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                <Video className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium text-sm">Cámara Apagada</p>
              <p className="text-slate-500 text-xs mt-1 max-w-[220px]">Encienda el visor para leer códigos QR físicos de alumnos.</p>
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {!isScanning ? (
            <button
              id="btn-start-camera"
              onClick={startScanner}
              disabled={isLocked}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Encienda la Cámara
            </button>
          ) : (
            <button
              id="btn-stop-camera"
              onClick={stopScanner}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all"
            >
              <CameraOff className="w-4 h-4" /> Apague la Cámara
            </button>
          )}
        </div>

        {/* Warning messages */}
        {initError && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-800 p-2.5 rounded-xl text-xs leading-normal">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{initError}</span>
          </div>
        )}
      </div>

      {/* Simulator Quick Action Panel */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
          Simulador de Escaneo de Alumnos
        </span>
        <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {alumnos.map((alum) => (
            <button
              key={alum.id}
              onClick={() => {
                if (!isLocked) {
                  onScan(alum.id);
                }
              }}
              disabled={isLocked}
              className="text-left bg-slate-50 hover:bg-blue-50 active:scale-95 border border-slate-100 hover:border-blue-200 p-2 rounded-xl text-[11px] font-medium text-slate-700 truncate transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              title={`Simular escaneo de ${alum.nombre}`}
            >
              <img src={alum.foto} alt={alum.nombre} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
              <div className="truncate">
                <p className="font-semibold truncate text-slate-800">{alum.nombre}</p>
                <p className="text-[9px] text-slate-400 truncate">{alum.grado}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              if (!isLocked) {
                onScan("ALUM-MOCK-INVALID-ID");
              }
            }}
            disabled={isLocked}
            className="text-left bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 hover:border-rose-200 p-2 rounded-xl text-[11px] font-medium text-rose-700 truncate transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[9px]">?</span>
            <div className="truncate">
              <p className="font-semibold truncate">Escanear Inválido</p>
              <p className="text-[9px] text-rose-400">ID Inexistente</p>
            </div>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          💡 Haga clic en cualquier alumno para simular la lectura de su QR físico.
        </p>
      </div>
    </div>
  );
}
