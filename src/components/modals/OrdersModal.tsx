import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle2, 
  Search, 
  Clock, 
  Phone, 
  DollarSign, 
  Edit3,
  User,
  Shirt
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { storageService } from '../../services/storage';
import { OrderItem, OrderStatus } from '../../types';
import { GARMENT_CONFIGS } from '../../constants/garments';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; border: string }> = {
  design: { label: 'Diseño', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
  pending_approval: { label: 'Pendiente Aprobación', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' },
  approved: { label: 'Aprobado', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
  in_production: { label: 'En Producción', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
  completed: { label: 'Terminado', color: 'bg-teal-500/10 text-teal-400', border: 'border-teal-500/20' },
  delivered: { label: 'Entregado', color: 'bg-slate-500/10 text-slate-300', border: 'border-slate-500/20' },
};

export const OrdersModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    projectName,
    garmentType,
    size,
    shirtColor,
    currentProjectId,
    setToast,
  } = useEditorStore();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(35000); // Pesos or currency
  const [deposit, setDeposit] = useState(15000);
  const [notes, setNotes] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('design');

  useEffect(() => {
    if (activeModal === 'orders') {
      loadOrders();
    }
  }, [activeModal]);

  const loadOrders = async () => {
    try {
      const list = await storageService.getOrders();
      setOrders(list);
    } catch {
      setToast({ text: 'Error al cargar pedidos.', type: 'error' });
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setToast({ text: 'Ingresa el nombre del cliente.', type: 'error' });
      return;
    }

    const newOrder: OrderItem = {
      id: 'ord_' + Date.now(),
      projectId: currentProjectId || undefined,
      projectName: projectName,
      customerName,
      customerPhone,
      garmentType,
      size,
      color: shirtColor,
      quantity,
      unitPrice,
      deposit,
      status: orderStatus,
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await storageService.saveOrder(newOrder);
      setOrders(prev => [newOrder, ...prev]);
      setShowForm(false);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setToast({ text: '¡Pedido creado y guardado con éxito!', type: 'success' });
    } catch {
      setToast({ text: 'Error al registrar el pedido.', type: 'error' });
    }
  };

  const handleUpdateStatus = async (order: OrderItem, newStatus: OrderStatus) => {
    const updated = { ...order, status: newStatus, updatedAt: Date.now() };
    await storageService.saveOrder(updated);
    setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
    setToast({ text: `Estado actualizado a "${STATUS_LABELS[newStatus].label}"`, type: 'info' });
  };

  const handleDeleteOrder = async (id: string) => {
    await storageService.deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setToast({ text: 'Pedido eliminado.', type: 'info' });
  };

  if (activeModal !== 'orders') return null;

  const filtered = orders.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Gestor de Pedidos de Clientes</h2>
              <p className="text-xs text-slate-400">Control de producción, pagos y anticipos para sublimación</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + New Order Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar cliente o proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Ver Lista' : 'Nuevo Pedido'}</span>
          </button>
        </div>

        {/* New Order Form */}
        {showForm ? (
          <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Datos del Pedido (Diseño Actual: {projectName})
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Ej. +57 300 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Garment summary */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Prenda: <strong>{GARMENT_CONFIGS[garmentType]?.name}</strong></span>
                <span>Talla: <strong className="text-amber-400 font-mono">{size}</strong></span>
                <span className="flex items-center gap-1">
                  Color: <div className="w-3 h-3 rounded-full border border-slate-600 inline-block" style={{ backgroundColor: shirtColor }} />
                </span>
              </div>

              {/* Financial calculations */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Cantidad (Unid.)</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Anticipo Pagado ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={deposit}
                    onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">TOTAL:</span>
                  <span className="text-white font-bold text-sm font-mono">${(quantity * unitPrice).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ANTICIPO:</span>
                  <span className="text-emerald-400 font-bold text-sm font-mono">${deposit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SALDO PENDIENTE:</span>
                  <span className="text-amber-400 font-bold text-sm font-mono">${Math.max(0, quantity * unitPrice - deposit).toLocaleString()}</span>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 block">Estado Inicial</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de entrega, especificaciones de sublimación..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30"
              >
                Registrar Pedido en Base de Datos Local
              </button>
            </div>
          </form>
        ) : (
          /* Orders List */
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-1">
                <p>No se encontraron pedidos registrados.</p>
                <p className="text-slate-600 text-[11px]">Haz clic en "Nuevo Pedido" para registrar el encargo de un cliente.</p>
              </div>
            ) : (
              filtered.map((order) => {
                const total = order.quantity * order.unitPrice;
                const balance = Math.max(0, total - order.deposit);
                const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.design;

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{order.customerName}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color} ${statusMeta.border}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{order.projectName}</span>
                          <span>•</span>
                          <span>{order.quantity} unid.</span>
                          <span>•</span>
                          <span className="text-amber-400 font-mono">Talla {order.size}</span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Financial stats */}
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[9px] block">TOTAL</span>
                        <span className="text-white font-bold">${total.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">ANTICIPO</span>
                        <span className="text-emerald-400 font-bold">${order.deposit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">SALDO</span>
                        <span className="text-amber-400 font-bold">${balance.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
