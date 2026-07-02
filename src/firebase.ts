/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  orderBy,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { Alumno, Asistencia, ReciboPago, InventarioItem, UserSession } from "./types";
import { INITIAL_ALUMNOS, INITIAL_ASISTENCIAS, INITIAL_RECIBOS, INITIAL_INVENTARIO, INITIAL_USERS } from "./mockData";

// Firebase configuration structure (configured by user in secrets or .env)
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || ""
};

let db: any = null;
let isUsingFirebase = false;

// Attempt to initialize Firebase if keys are provided
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isUsingFirebase = true;
    console.log("🔥 Firebase Firestore inicializado con éxito.");
  } else {
    console.warn("⚠️ No se detectaron credenciales de Firebase. Usando almacenamiento LocalStorage.");
  }
} catch (error) {
  console.error("❌ Error al inicializar Firebase, cayendo en modo local de respaldo:", error);
}

// Ensure local storage is seeded with initial data if empty
const initLocalStorage = () => {
  if (!localStorage.getItem("alumnos")) {
    localStorage.setItem("alumnos", JSON.stringify(INITIAL_ALUMNOS));
  }
  if (!localStorage.getItem("asistencias")) {
    localStorage.setItem("asistencias", JSON.stringify(INITIAL_ASISTENCIAS));
  }
  if (!localStorage.getItem("pagos_recibos")) {
    localStorage.setItem("pagos_recibos", JSON.stringify(INITIAL_RECIBOS));
  }
  if (!localStorage.getItem("inventario")) {
    localStorage.setItem("inventario", JSON.stringify(INITIAL_INVENTARIO));
  }
  if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify(INITIAL_USERS));
  }
};

initLocalStorage();

export const checkDatabaseMode = () => {
  return {
    isFirebase: isUsingFirebase,
    configMissing: !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY"
  };
};

/**
 * ============================================================================
 * ALUMNOS SERVICES
 * ============================================================================
 */

export async function getAlumno(id: string): Promise<Alumno | null> {
  if (isUsingFirebase && db) {
    try {
      const docRef = doc(db, "alumnos", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Alumno;
      }
      return null;
    } catch (error) {
      console.error("Error al leer alumno de Firestore, usando local:", error);
    }
  }

  const alumnos = JSON.parse(localStorage.getItem("alumnos") || "[]") as Alumno[];
  const match = alumnos.find(a => a.id.toLowerCase().trim() === id.toLowerCase().trim());
  return match || null;
}

export async function getAlumnos(): Promise<Alumno[]> {
  if (isUsingFirebase && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "alumnos"));
      const list: Alumno[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Alumno);
      });
      return list;
    } catch (error) {
      console.error("Error al leer lista de alumnos de Firestore:", error);
    }
  }

  return JSON.parse(localStorage.getItem("alumnos") || "[]") as Alumno[];
}

export async function addAlumno(alumno: Alumno): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      await setDoc(doc(db, "alumnos", alumno.id), {
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        foto: alumno.foto,
        grado: alumno.grado,
        grupo: alumno.grupo,
        historialAcademico: alumno.historialAcademico || []
      });
      return;
    } catch (error) {
      console.error("Error al guardar alumno en Firestore:", error);
    }
  }

  const alumnos = JSON.parse(localStorage.getItem("alumnos") || "[]") as Alumno[];
  const index = alumnos.findIndex(a => a.id === alumno.id);
  if (index >= 0) {
    alumnos[index] = alumno;
  } else {
    alumnos.push(alumno);
  }
  localStorage.setItem("alumnos", JSON.stringify(alumnos));
}

/**
 * ============================================================================
 * ASISTENCIAS SERVICES
 * ============================================================================
 */

export async function addAsistencia(asistencia: Asistencia): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      await addDoc(collection(db, "asistencias"), asistencia);
      return;
    } catch (error) {
      console.error("Error al registrar asistencia en Firestore:", error);
    }
  }

  const asistencias = JSON.parse(localStorage.getItem("asistencias") || "[]") as Asistencia[];
  const recordWithId = { ...asistencia, id: `asist-${Date.now()}` };
  asistencias.unshift(recordWithId);
  localStorage.setItem("asistencias", JSON.stringify(asistencias));
}

export async function getAsistencias(): Promise<Asistencia[]> {
  if (isUsingFirebase && db) {
    try {
      const q = query(collection(db, "asistencias"), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      const list: Asistencia[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Asistencia);
      });
      return list.sort((a, b) => `${b.fecha} ${b.horaExacta}`.localeCompare(`${a.fecha} ${a.horaExacta}`));
    } catch (error) {
      console.error("Error al leer asistencias de Firestore:", error);
    }
  }

  return JSON.parse(localStorage.getItem("asistencias") || "[]") as Asistencia[];
}

export async function deleteAsistencia(id: string): Promise<void> {
  if (isUsingFirebase && db && !id.startsWith("asist-")) {
    try {
      await deleteDoc(doc(db, "asistencias", id));
      return;
    } catch (error) {
      console.error("Error al borrar asistencia en Firestore:", error);
    }
  }

  const asistencias = JSON.parse(localStorage.getItem("asistencias") || "[]") as Asistencia[];
  const updated = asistencias.filter(a => a.id !== id);
  localStorage.setItem("asistencias", JSON.stringify(updated));
}

export async function clearAsistencias(): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "asistencias"));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error al limpiar asistencias de Firestore:", error);
    }
  }

  localStorage.setItem("asistencias", JSON.stringify([]));
}

/**
 * ============================================================================
 * PAGOS & RECIBOS SERVICES
 * ============================================================================
 */

export async function getRecibos(): Promise<ReciboPago[]> {
  if (isUsingFirebase && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "pagos_recibos"));
      const list: ReciboPago[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ReciboPago);
      });
      return list.sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
    } catch (error) {
      console.error("Error al leer recibos de Firestore:", error);
    }
  }

  return JSON.parse(localStorage.getItem("pagos_recibos") || "[]") as ReciboPago[];
}

export async function addRecibo(recibo: ReciboPago): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      const docId = recibo.folio;
      await setDoc(doc(db, "pagos_recibos", docId), recibo);
      return;
    } catch (error) {
      console.error("Error al guardar recibo en Firestore:", error);
    }
  }

  const recibos = JSON.parse(localStorage.getItem("pagos_recibos") || "[]") as ReciboPago[];
  const index = recibos.findIndex(r => r.folio === recibo.folio);
  const recordWithId = { ...recibo, id: `rec-${Date.now()}` };
  if (index >= 0) {
    recibos[index] = recordWithId;
  } else {
    recibos.unshift(recordWithId);
  }
  localStorage.setItem("pagos_recibos", JSON.stringify(recibos));
}

export async function updateReciboEstado(folio: string, nuevoEstado: 'Pagado' | 'Pendiente' | 'Cancelado'): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      await setDoc(doc(db, "pagos_recibos", folio), { estado: nuevoEstado }, { merge: true });
      return;
    } catch (error) {
      console.error("Error al actualizar recibo en Firestore:", error);
    }
  }

  const recibos = JSON.parse(localStorage.getItem("pagos_recibos") || "[]") as ReciboPago[];
  const index = recibos.findIndex(r => r.folio === folio);
  if (index >= 0) {
    recibos[index].estado = nuevoEstado;
    localStorage.setItem("pagos_recibos", JSON.stringify(recibos));
  }
}

/**
 * ============================================================================
 * INVENTARIO SERVICES
 * ============================================================================
 */

export async function getInventario(): Promise<InventarioItem[]> {
  if (isUsingFirebase && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "inventario"));
      const list: InventarioItem[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as InventarioItem);
      });
      return list;
    } catch (error) {
      console.error("Error al leer inventario de Firestore:", error);
    }
  }

  return JSON.parse(localStorage.getItem("inventario") || "[]") as InventarioItem[];
}

export async function addInventarioItem(item: InventarioItem): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      await setDoc(doc(db, "inventario", item.id), item);
      return;
    } catch (error) {
      console.error("Error al guardar ítem de inventario en Firestore:", error);
    }
  }

  const inventario = JSON.parse(localStorage.getItem("inventario") || "[]") as InventarioItem[];
  const index = inventario.findIndex(i => i.id === item.id);
  if (index >= 0) {
    inventario[index] = item;
  } else {
    inventario.push(item);
  }
  localStorage.setItem("inventario", JSON.stringify(inventario));
}

export async function updateInventarioStock(id: string, nuevoStock: number): Promise<void> {
  if (isUsingFirebase && db) {
    try {
      await setDoc(doc(db, "inventario", id), { stockActual: nuevoStock }, { merge: true });
      return;
    } catch (error) {
      console.error("Error al actualizar stock en Firestore:", error);
    }
  }

  const inventario = JSON.parse(localStorage.getItem("inventario") || "[]") as InventarioItem[];
  const index = inventario.findIndex(i => i.id === id);
  if (index >= 0) {
    inventario[index].stockActual = nuevoStock;
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }
}

/**
 * ============================================================================
 * CONFIG & USERS SERVICES (For Roles & Simulated Auth)
 * ============================================================================
 */

export async function getUsuarios(): Promise<UserSession[]> {
  if (isUsingFirebase && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const list: UserSession[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ uid: doc.id, ...doc.data() } as UserSession);
      });
      return list;
    } catch (error) {
      console.error("Error al leer usuarios de Firestore:", error);
    }
  }

  return JSON.parse(localStorage.getItem("usuarios") || "[]") as UserSession[];
}
