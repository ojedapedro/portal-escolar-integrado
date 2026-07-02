export interface Alumno {
  id: string;
  nombre: string;
  apellidos: string;
  foto: string;
  grado: string;
  grupo: string;
  historialAcademico?: HistorialItem[];
}

export interface HistorialItem {
  ciclo: string;
  materia: string;
  calificacion: number;
  observaciones?: string;
}

export interface Asistencia {
  id?: string;
  alumnoID: string;
  nombreAlumno: string;
  grado: string;
  fecha: string;
  horaExacta: string;
  estado: 'Asistió' | 'Retardo';
}

export interface AppConfig {
  horaLimite: string; // HH:MM format, e.g. "08:00"
  bloqueoLecturaMs: number; // Lock duration on scan (default 5000)
}

// User / Roles definitions
export type UserRole = 'Administrador' | 'Personal Administrativo' | 'Profesor';

export interface UserSession {
  uid: string;
  nombre: string;
  email: string;
  role: UserRole;
  foto: string;
}

// Payments and Receipts
export interface ReciboPago {
  id?: string;
  folio: string;
  alumnoID: string;
  nombreAlumno: string;
  concepto: string; // 'Inscripción' | 'Colegiatura' | 'Uniformes' | 'Insumos'
  monto: number;
  metodoPago: 'Efectivo' | 'Tarjeta de Crédito/Débito' | 'Transferencia SPEI';
  fecha: string;
  hora: string;
  estado: 'Pagado' | 'Pendiente' | 'Cancelado';
  detalles?: string;
}

// Inventories (Administrative, Cleaning, Uniforms)
export type InventarioCategoria = 'Administrativos' | 'Limpieza' | 'Uniformes';

export interface InventarioItem {
  id: string;
  nombre: string;
  categoria: InventarioCategoria;
  stockActual: number;
  stockMinimo: number;
  proveedor: string;
  unidadMedida: string; // e.g. 'Pzs', 'Litros', 'Cajas', etc.
  // Uniform extra fields
  talla?: string;      // e.g. 'CH', 'M', 'G', '12', '14'
  genero?: 'Femenino' | 'Masculino' | 'Unisex';
  precioVenta?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'retardo';
  title: string;
  message: string;
  foto?: string;
  extra?: string; // e.g. "Grupo: 3ºA • 08:04 AM"
  duration?: number;
}

