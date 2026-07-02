import { Alumno, Asistencia, ReciboPago, InventarioItem, UserSession } from './types';

export const INITIAL_ALUMNOS: Alumno[] = [
  {
    id: "ALUM-2026-001",
    nombre: "Sofía",
    apellidos: "García Mendoza",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    grado: "1º de Secundaria",
    grupo: "A",
    historialAcademico: [
      { ciclo: "2025-2026", materia: "Matemáticas", calificacion: 9.2, observaciones: "Excelente desempeño y participación activa" },
      { ciclo: "2025-2026", materia: "Español", calificacion: 8.8, observaciones: "Buen nivel de lectura y redacción" },
      { ciclo: "2025-2026", materia: "Ciencias", calificacion: 9.5, observaciones: "Líder en proyectos experimentales" }
    ]
  },
  {
    id: "ALUM-2026-002",
    nombre: "Mateo Alejandro",
    apellidos: "Rodríguez Silva",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    grado: "3º de Primaria",
    grupo: "B",
    historialAcademico: [
      { ciclo: "2025-2026", materia: "Matemáticas", calificacion: 8.0, observaciones: "Necesita practicar operaciones con fracciones" },
      { ciclo: "2025-2026", materia: "Ciencias Naturales", calificacion: 9.0, observaciones: "Muy curioso e interesado en la fauna" },
      { ciclo: "2025-2026", materia: "Geografía", calificacion: 7.5, observaciones: "Falta entrega ocasional de mapas" }
    ]
  },
  {
    id: "ALUM-2026-003",
    nombre: "Valentina",
    apellidos: "Hernández Rojas",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    grado: "2º de Primaria",
    grupo: "A",
    historialAcademico: [
      { ciclo: "2025-2026", materia: "Español", calificacion: 9.8, observaciones: "Excelente ortografía y dicción" },
      { ciclo: "2025-2026", materia: "Cálculo Mental", calificacion: 9.6, observaciones: "Rapidez sobresaliente en operaciones" }
    ]
  },
  {
    id: "ALUM-2026-004",
    nombre: "Santiago",
    apellidos: "Martínez Castro",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    grado: "1º de Preparatoria",
    grupo: "C",
    historialAcademico: [
      { ciclo: "2025-2026", materia: "Física I", calificacion: 8.4, observaciones: "Comprende bien las fórmulas teóricas" },
      { ciclo: "2025-2026", materia: "Álgebra Lineal", calificacion: 9.1, observaciones: "Estructurado y metódico" },
      { ciclo: "2025-2026", materia: "Química I", calificacion: 7.9, observaciones: "Requiere concentrarse en laboratorio" }
    ]
  },
  {
    id: "ALUM-2026-005",
    nombre: "Camila",
    apellidos: "López Duarte",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    grado: "3º de Secundaria",
    grupo: "B",
    historialAcademico: [
      { ciclo: "2025-2026", materia: "Historia de México", calificacion: 9.7, observaciones: "Capacidad de análisis crítico ejemplar" },
      { ciclo: "2025-2026", materia: "Formación Cívica", calificacion: 10.0, observaciones: "Liderazgo ético brillante" }
    ]
  }
];

export const INITIAL_ASISTENCIAS: Asistencia[] = [
  {
    alumnoID: "ALUM-2026-001",
    nombreAlumno: "Sofía García Mendoza",
    grado: "1º de Secundaria",
    fecha: "2026-07-01",
    horaExacta: "07:52:10",
    estado: "Asistió"
  },
  {
    alumnoID: "ALUM-2026-002",
    nombreAlumno: "Mateo Alejandro Rodríguez Silva",
    grado: "3º de Primaria",
    fecha: "2026-07-01",
    horaExacta: "08:05:43",
    estado: "Retardo"
  }
];

export const INITIAL_USERS: UserSession[] = [
  {
    uid: "user-admin-1",
    nombre: "Prof. Alejandro Ortega",
    email: "director@colegio.edu.mx",
    role: "Administrador",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    uid: "user-admin-2",
    nombre: "Lic. Clara Beltrán",
    email: "administracion@colegio.edu.mx",
    role: "Personal Administrativo",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  },
  {
    uid: "user-admin-3",
    nombre: "Mtro. Gabriel Soto",
    email: "gabriel.soto@colegio.edu.mx",
    role: "Profesor",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  }
];

export const INITIAL_RECIBOS: ReciboPago[] = [
  {
    folio: "REC-2026-8001",
    alumnoID: "ALUM-2026-001",
    nombreAlumno: "Sofía García Mendoza",
    concepto: "Colegiatura de Julio",
    monto: 3500.00,
    metodoPago: "Transferencia SPEI",
    fecha: "2026-07-01",
    hora: "09:15:30",
    estado: "Pagado",
    detalles: "Pago regular mensual de colegiatura correspondiente a secundaria."
  },
  {
    folio: "REC-2026-8002",
    alumnoID: "ALUM-2026-002",
    nombreAlumno: "Mateo Alejandro Rodríguez Silva",
    concepto: "Inscripción Ciclo Escolar",
    monto: 4500.00,
    metodoPago: "Tarjeta de Crédito/Débito",
    fecha: "2026-06-15",
    hora: "11:42:12",
    estado: "Pagado",
    detalles: "Cuota de inscripción anticipada de primaria."
  },
  {
    folio: "REC-2026-8003",
    alumnoID: "ALUM-2026-003",
    nombreAlumno: "Valentina Hernández Rojas",
    concepto: "Uniformes Deportivos",
    monto: 1250.00,
    metodoPago: "Efectivo",
    fecha: "2026-06-28",
    hora: "14:10:00",
    estado: "Pagado",
    detalles: "Jersey Deportivo Talla 10 y Pants escolar."
  },
  {
    folio: "REC-2026-8004",
    alumnoID: "ALUM-2026-004",
    nombreAlumno: "Santiago Martínez Castro",
    concepto: "Colegiatura de Julio",
    monto: 3800.00,
    metodoPago: "Transferencia SPEI",
    fecha: "2026-07-01",
    hora: "08:11:45",
    estado: "Pendiente",
    detalles: "Pendiente por verificar transferencia electrónica en banco."
  }
];

export const INITIAL_INVENTARIO: InventarioItem[] = [
  // Administrativos
  {
    id: "INV-ADM-001",
    nombre: "Hojas de Papel Bond Carta",
    categoria: "Administrativos",
    stockActual: 18,
    stockMinimo: 10,
    proveedor: "Papelería del Centro S.A.",
    unidadMedida: "Cajas"
  },
  {
    id: "INV-ADM-002",
    nombre: "Tóner Láser HP 85A Negro",
    categoria: "Administrativos",
    stockActual: 2,
    stockMinimo: 4,
    proveedor: "Distribuidora Office Depot",
    unidadMedida: "Pzs"
  },
  {
    id: "INV-ADM-003",
    nombre: "Carpetas de Registro Escolar",
    categoria: "Administrativos",
    stockActual: 25,
    stockMinimo: 15,
    proveedor: "Papelería del Centro S.A.",
    unidadMedida: "Pzs"
  },
  // Limpieza
  {
    id: "INV-LMP-001",
    nombre: "Desinfectante Multiusos Pinol",
    categoria: "Limpieza",
    stockActual: 4,
    stockMinimo: 5,
    proveedor: "Suministros Industriales Clean",
    unidadMedida: "Lotes (20 Litros)"
  },
  {
    id: "INV-LMP-002",
    nombre: "Pastillas Cloro Sanitizante",
    categoria: "Limpieza",
    stockActual: 15,
    stockMinimo: 8,
    proveedor: "Suministros Industriales Clean",
    unidadMedida: "Kilos"
  },
  {
    id: "INV-LMP-003",
    nombre: "Escobas de Cerdas de Nylon",
    categoria: "Limpieza",
    stockActual: 8,
    stockMinimo: 5,
    proveedor: "Suministros Industriales Clean",
    unidadMedida: "Pzs"
  },
  // Uniformes
  {
    id: "INV-UNI-001",
    nombre: "Jersey de Gala Secundaria",
    categoria: "Uniformes",
    stockActual: 30,
    stockMinimo: 15,
    proveedor: "Textiles Deportivos México",
    unidadMedida: "Pzs",
    talla: "M",
    genero: "Unisex",
    precioVenta: 450
  },
  {
    id: "INV-UNI-002",
    nombre: "Falda Plisada Escolar Gala",
    categoria: "Uniformes",
    stockActual: 6,
    stockMinimo: 10,
    proveedor: "Textiles Deportivos México",
    unidadMedida: "Pzs",
    talla: "CH",
    genero: "Femenino",
    precioVenta: 380
  },
  {
    id: "INV-UNI-003",
    nombre: "Suéter Tejido Azul Marino",
    categoria: "Uniformes",
    stockActual: 22,
    stockMinimo: 12,
    proveedor: "Textiles Deportivos México",
    unidadMedida: "Pzs",
    talla: "G",
    genero: "Unisex",
    precioVenta: 500
  }
];
