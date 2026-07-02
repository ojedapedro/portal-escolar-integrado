import React, { useState, useEffect } from 'react';
import { InventarioItem, InventarioCategoria } from '../types';
import { getInventario, addInventarioItem, updateInventarioStock } from '../firebase';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Layers, 
  CheckCircle, 
  Minus, 
  ShieldAlert,
  User,
  Activity,
  Archive,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InventarioManager() {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | InventarioCategoria>('Todos');
  const [stockStatusFilter, setStockStatusFilter] = useState<'Todos' | 'Bajo Stock' | 'Ok'>('Todos');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<InventarioCategoria>('Administrativos');
  const [stockActual, setStockActual] = useState(10);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [proveedor, setProveedor] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('Pzs');
  
  // Uniform field states
  const [talla, setTalla] = useState('');
  const [genero, setGenero] = useState<'Femenino' | 'Masculino' | 'Unisex'>('Unisex');
  const [precioVenta, setPrecioVenta] = useState('450');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getInventario();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !proveedor) return;

    const prefix = categoria === 'Administrativos' ? 'ADM' : categoria === 'Limpieza' ? 'LMP' : 'UNI';
    const numId = Math.floor(100 + Math.random() * 900);
    const id = `INV-${prefix}-${numId}`;

    const newItem: InventarioItem = {
      id,
      nombre,
      categoria,
      stockActual,
      stockMinimo,
      proveedor,
      unidadMedida,
      ...(categoria === 'Uniformes' ? {
        talla: talla || 'M',
        genero,
        precioVenta: parseFloat(precioVenta) || 0
      } : {})
    };

    await addInventarioItem(newItem);
    
    // Refresh
    const data = await getInventario();
    setItems(data);

    // Reset Form
    setNombre('');
    setProveedor('');
    setStockActual(10);
    setStockMinimo(5);
    setUnidadMedida('Pzs');
    setTalla('');
    setGenero('Unisex');
    setPrecioVenta('450');
    setShowAddForm(false);
  };

  const handleQuickStockAdjust = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newStock = Math.max(0, item.stockActual + delta);
    await updateInventarioStock(id, newStock);
    
    // Refresh local state faster
    setItems(prev => prev.map(i => i.id === id ? { ...i, stockActual: newStock } : i));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Todos' || item.categoria === categoryFilter;
    
    const isLow = item.stockActual <= item.stockMinimo;
    const matchesStatus = 
      stockStatusFilter === 'Todos' || 
      (stockStatusFilter === 'Bajo Stock' && isLow) || 
      (stockStatusFilter === 'Ok' && !isLow);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockCount = items.filter(i => i.stockActual <= i.stockMinimo).length;

  return (
    <div className="space-y-6">
      
      {/* Alert Banner for low stock */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="bg-amber-500 text-white p-2.5 rounded-2xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-amber-800 font-bold text-sm">Alerta de Reabastecimiento de Inventario</h4>
            <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
              Hay <strong>{lowStockCount}</strong> insumos escolares que han llegado o están por debajo de su nivel de <strong>stock mínimo</strong>. Por favor, contacte a los proveedores correspondientes para evitar desabasto institucional.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Inventory List and controls (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-indigo-500" /> Control de Inventarios y Suministros
                </h2>
                <p className="text-xs text-slate-400">Administración de insumos administrativos, limpieza y uniformes</p>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md cursor-pointer active:scale-95"
              >
                {showAddForm ? 'Cerrar Registro' : <><Plus className="w-4 h-4" /> Registrar Ítem</>}
              </button>
            </div>

            {/* Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-indigo-100 bg-indigo-50/10 rounded-2xl p-5 mb-6 space-y-4"
                >
                  <form onSubmit={handleCreateItem} className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-indigo-800 tracking-wider">Nuevo Suministro o Insumo</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Nombre */}
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre del Insumo / Producto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Tóner Láser HP, Papel Higiénico 12 rollos, etc."
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Categoria */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría *</label>
                        <select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value as InventarioCategoria)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        >
                          <option value="Administrativos">a) Insumo Administrativo</option>
                          <option value="Limpieza">b) Insumo de Limpieza</option>
                          <option value="Uniformes">c) Uniformes Institucionales</option>
                        </select>
                      </div>
                    </div>

                    {/* Uniform conditional fields */}
                    {categoria === 'Uniformes' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-indigo-700 uppercase">Talla *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. CH, M, G, 12, 14"
                            value={talla}
                            onChange={(e) => setTalla(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-indigo-700 uppercase">Género *</label>
                          <select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value as any)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                          >
                            <option value="Unisex">Unisex</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-indigo-700 uppercase">Precio de Venta ($ MXN) *</label>
                          <input
                            type="number"
                            required
                            placeholder="Ej. 450"
                            value={precioVenta}
                            onChange={(e) => setPrecioVenta(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Stock actual */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Stock Inicial Actual *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={stockActual}
                          onChange={(e) => setStockActual(parseInt(e.target.value) || 0)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Stock minimo */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Stock Mínimo (Alerta) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={stockMinimo}
                          onChange={(e) => setStockMinimo(parseInt(e.target.value) || 1)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Unidad Medida */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Unidad de Medida *</label>
                        <input
                          type="text"
                          required
                          placeholder="Pzs, Cajas, Litros, Kilos"
                          value={unidadMedida}
                          onChange={(e) => setUnidadMedida(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Proveedor */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Proveedor Autorizado *</label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre del proveedor"
                          value={proveedor}
                          onChange={(e) => setProveedor(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        Añadir al Almacén
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filtering bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar suministro o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
                >
                  <option value="Todos">Todas las Categorías</option>
                  <option value="Administrativos">Insumos Administrativos</option>
                  <option value="Limpieza">Insumos de Limpieza</option>
                  <option value="Uniformes">Uniformes escolares</option>
                </select>
              </div>

              <div>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
                >
                  <option value="Todos">Todos los Niveles</option>
                  <option value="Bajo Stock">⚠️ Bajo Stock (Alerta)</option>
                  <option value="Ok">Nivel de Stock Óptimo</option>
                </select>
              </div>
            </div>

            {/* Inventory table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Cód / Nombre</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Stock Mín.</th>
                      <th className="py-3 px-4">Stock Actual</th>
                      <th className="py-3 px-4">Proveedor</th>
                      <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                          Cargando almacén escolar...
                        </td>
                      </tr>
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        const isLow = item.stockActual <= item.stockMinimo;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-[10px] text-slate-400 block font-mono">{item.id}</span>
                              <span className="font-bold text-slate-800 block">{item.nombre}</span>
                              {item.talla && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-1.5 py-0.2 font-bold inline-block mt-1">
                                  Talla {item.talla} • {item.genero}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                item.categoria === 'Administrativos' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : item.categoria === 'Limpieza' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-purple-50 text-purple-700'
                              }`}>
                                {item.categoria}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono font-bold">
                              {item.stockMinimo} {item.unidadMedida}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className={`font-black text-sm px-2 py-1 rounded-lg ${
                                isLow ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-800'
                              }`}>
                                {item.stockActual} {item.unidadMedida}
                              </span>
                              {isLow && (
                                <span className="text-[9px] text-amber-600 block font-sans font-bold mt-1">
                                  ⚠️ ¡Reabastecer!
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {item.proveedor}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
                                <button
                                  onClick={() => handleQuickStockAdjust(item.id, -1)}
                                  className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-rose-600 cursor-pointer"
                                  title="Disminuir stock"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleQuickStockAdjust(item.id, 1)}
                                  className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-emerald-600 cursor-pointer"
                                  title="Aumentar stock"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                          <div className="flex flex-col items-center justify-center">
                            <Package className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-sm">No se encontraron artículos en esta categoría</p>
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

        {/* Categories summary panel (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-display font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-500" /> Resumen de Almacén
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">Insumos Administrativos</h4>
                  <p className="text-[10px] text-blue-600 mt-1">Hojas, tinta, tóner, carpetas, papelería</p>
                </div>
                <span className="text-lg font-mono font-black text-blue-800">
                  {items.filter(i => i.categoria === 'Administrativos').length} ítems
                </span>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Insumos de Limpieza</h4>
                  <p className="text-[10px] text-emerald-600 mt-1">Cloro, desinfectantes, escobas, aseo</p>
                </div>
                <span className="text-lg font-mono font-black text-emerald-800">
                  {items.filter(i => i.categoria === 'Limpieza').length} ítems
                </span>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-purple-800 uppercase tracking-wider">Uniformes Escolares</h4>
                  <p className="text-[10px] text-purple-600 mt-1">Faldas, suéteres, pants, tallas variadas</p>
                </div>
                <span className="text-lg font-mono font-black text-purple-800">
                  {items.filter(i => i.categoria === 'Uniformes').length} ítems
                </span>
              </div>
            </div>

            {/* Provider contact helper */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Contacto de Proveedores Rápidos</span>
              <div className="text-[11px] text-slate-600 space-y-1.5">
                <p>📞 <strong>Suministros Clean:</strong> 55-1234-5678</p>
                <p>📞 <strong>Textiles México:</strong> 55-9876-5432</p>
                <p>📞 <strong>Papelería del Centro:</strong> 55-8765-4321</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
