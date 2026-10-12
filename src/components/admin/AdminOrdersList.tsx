import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  ChevronDown, 
  MessageCircle, 
  Eye,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  ShieldCheck,
  Banknote,
  HelpCircle,
  X
} from 'lucide-react';
import type { Order, OrderStatus, PaymentEnvironment } from '../../types';
import { fetchAllOrdersForAdmin, updateOrderStatus, getOrderPaymentEnvironment } from '../../lib/orderService';
import { formatINR } from '../../lib/whatsapp';

export const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { orders: fetched, error: fetchErr } = await fetchAllOrdersForAdmin();
      setOrders(fetched);
      if (fetchErr) {
        setError(fetchErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    const env = getOrderPaymentEnvironment(order);

    // Guardrail against accidental fulfillment of test orders
    if (env === 'test' && ['confirmed', 'processing', 'shipped', 'delivered'].includes(newStatus)) {
      const proceed = window.confirm(
        `⚠️ WARNING: This order (${order.order_number}) is a TEST TRANSACTION where no real payment was collected.\n\nAre you sure you want to mark its fulfillment status as "${newStatus.toUpperCase()}"?`
      );
      if (!proceed) return;
    }

    setUpdatingId(order.id);
    setNotification(null);

    try {
      const { error: err } = await updateOrderStatus(order.id, newStatus);
      if (err) {
        setNotification({
          type: 'error',
          message: `Failed to update status for order ${order.order_number}: ${err}`,
        });
        return;
      }

      setNotification({
        type: 'success',
        message: `Order ${order.order_number} fulfillment status updated to "${newStatus.toUpperCase()}" successfully.`,
      });

      // Refresh orders from database to confirm state
      await loadOrders();

      if (selectedOrder && (selectedOrder.id === order.id || selectedOrder.order_number === order.order_number)) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Unexpected error updating order ${order.order_number}: ${err.message || err}`,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.order_status !== statusFilter) {
      return false;
    }

    const env = getOrderPaymentEnvironment(order);
    if (envFilter !== 'all' && env !== envFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = order.order_number.toLowerCase().includes(q);
      const matchName = order.customer_name.toLowerCase().includes(q);
      const matchPhone = order.customer_phone.includes(q);
      const matchCity = order.city.toLowerCase().includes(q);
      const matchPayId = order.razorpay_payment_id?.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity || Boolean(matchPayId);
    }
    return true;
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shipped':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cod_pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderEnvironmentBadge = (env: PaymentEnvironment) => {
    switch (env) {
      case 'test':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-400 shadow-2xs">
            <FlaskConical className="w-3 h-3 text-amber-700 shrink-0" />
            <span>TEST ORDER</span>
          </span>
        );
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>LIVE ORDER</span>
          </span>
        );
      case 'cod':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs">
            <Banknote className="w-3 h-3 text-sky-700 shrink-0" />
            <span>COD ORDER</span>
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300 shadow-2xs">
            <MessageCircle className="w-3 h-3 text-teal-700 shrink-0" />
            <span>WHATSAPP ORDER</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs">
            <HelpCircle className="w-3 h-3 text-gray-500 shrink-0" />
            <span>ENVIRONMENT UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#8B4F58] mb-1">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Order Fulfillment & Payment Security
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
            Customer Orders Management
          </h2>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-[#F0C9D3] bg-white hover:bg-[#FFF8F9] text-xs font-semibold text-[#8B4F58] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh from Database</span>
        </button>
      </div>

      {/* In-App Action Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-start gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Database Connection / Schema Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Supabase Database Notice</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800">{error}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#FFF8F9] p-4 rounded-2xl border border-[#F5D8E0] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Environment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#5A4E53]">Environment:</span>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#F0C9D3] bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] cursor-pointer"
            >
              <option value="all">All Environments</option>
              <option value="test">Test Orders</option>
              <option value="live">Live Orders</option>
              <option value="cod">Cash on Delivery</option>
              <option value="whatsapp">WhatsApp Orders</option>
              <option value="unknown">Environment Unknown</option>
            </select>
          </div>

          {/* Fulfillment Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#5A4E53]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#F0C9D3] bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#8B4F58] cursor-pointer"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500">
          <div className="w-8 h-8 border-3 border-[#8B4F58] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span>Loading customer orders from database...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F5D8E0] space-y-2">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="font-heading font-bold text-base text-[#1F1A1C]">
            No Orders Found
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || envFilter !== 'all'
              ? 'No orders match your current filter criteria.'
              : 'No orders have been placed yet. When customers check out, their orders will appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#F5D8E0] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFF8F9] border-b border-[#F5D8E0] text-[11px] font-bold text-[#8B4F58] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref & Env</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const env = getOrderPaymentEnvironment(order);
                  return (
                    <tr key={order.id} className="hover:bg-[#FFFDFD] transition-colors">
                      {/* Order Reference & Environment Badge */}
                      <td className="py-3 px-4 font-mono font-bold text-[#1F1A1C]">
                        <div className="flex items-center gap-2">
                          <span>{order.order_number}</span>
                        </div>
                        <div className="mt-1">
                          {renderEnvironmentBadge(env)}
                        </div>
                        <span className="text-[10px] text-gray-400 font-sans font-normal block mt-1">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F1A1C]">{order.customer_name}</div>
                        <div className="text-[11px] text-gray-500">+91 {order.customer_phone}</div>
                        <div className="text-[10px] text-gray-400">{order.city}, {order.state}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-700">
                          {order.items.length} {order.items.length === 1 ? 'piece' : 'pieces'}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-xs">
                          {order.items.map((i) => i.product_name).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-[#8B4F58]">
                        {formatINR(order.total)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getPaymentBadgeClass(order.payment_status)}`}>
                            {order.payment_method.toUpperCase()} • {order.payment_status.replace('_', ' ')}
                          </span>
                          {order.razorpay_payment_id && (
                            <div className="text-[9px] font-mono text-gray-400 truncate max-w-[130px]" title={order.razorpay_payment_id}>
                              {order.razorpay_payment_id}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Order Status Select */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={order.order_status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                            className={`pl-2.5 pr-6 py-1 rounded-full text-[11px] font-bold border appearance-none cursor-pointer focus:outline-hidden disabled:opacity-50 ${getStatusBadgeClass(order.order_status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FFF0F3] text-gray-600 hover:text-[#8B4F58] transition-colors cursor-pointer"
                          title="View Full Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${order.customer_name}, this is Akshaysinh Kher from Vaidehi Imitation regarding your order ${order.order_number}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-block cursor-pointer"
                          title="Message Customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#F5D8E0] space-y-4 text-left animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8B4F58]">
                  ORDER DETAILS
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-heading font-bold text-lg text-[#1F1A1C]">
                    {selectedOrder.order_number}
                  </h3>
                  {renderEnvironmentBadge(getOrderPaymentEnvironment(selectedOrder))}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Test Payment Prominent Warning Callout */}
            {getOrderPaymentEnvironment(selectedOrder) === 'test' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>TEST MODE — This is a test transaction. No real payment was collected.</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  This order was created using Razorpay Sandbox/Test API keys. Do not dispatch physical inventory or deliver items based on this transaction.
                </p>
              </div>
            )}

            {/* Live Payment Confirmation Callout */}
            {getOrderPaymentEnvironment(selectedOrder) === 'live' && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>LIVE TRANSACTION:</strong> Genuine funds collected and verified via Razorpay production gateway.</span>
              </div>
            )}

            {/* Unknown Environment Callout */}
            {getOrderPaymentEnvironment(selectedOrder) === 'unknown' && selectedOrder.payment_method === 'razorpay' && (
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-300 text-gray-800 text-xs flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-500 shrink-0" />
                <span><strong>ENVIRONMENT UNKNOWN:</strong> The payment environment for this order could not be reliably determined from trusted server metadata.</span>
              </div>
            )}

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FFF8F9] text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Customer Name</span>
                <span className="font-bold text-[#1F1A1C]">{selectedOrder.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Mobile Contact</span>
                <span className="font-bold text-[#1F1A1C]">+91 {selectedOrder.customer_phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px]">Delivery Address</span>
                <span className="text-gray-800">
                  {selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Payment Method</span>
                <span className="capitalize font-semibold text-gray-800">{selectedOrder.payment_method}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Payment Status</span>
                <span className="capitalize font-semibold text-emerald-700">{selectedOrder.payment_status}</span>
              </div>
              {selectedOrder.razorpay_payment_id && (
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[10px]">Razorpay Payment ID</span>
                  <span className="font-mono text-[11px] text-gray-800">{selectedOrder.razorpay_payment_id}</span>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="col-span-2 pt-1 border-t border-[#F0C9D3]">
                  <span className="text-[#8B4F58] font-bold block text-[10px]">Customer Order Note:</span>
                  <span className="text-gray-700 italic">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8B4F58] uppercase tracking-wider block">
                Ordered Items ({selectedOrder.items.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-gray-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#1F1A1C]">{item.product_name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Code: {item.product_code} • Qty: {item.quantity} × {formatINR(item.unit_price)}
                      </div>
                    </div>
                    <span className="font-bold text-[#1F1A1C]">{formatINR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-sm text-[#1F1A1C]">
              <span>Order Total Amount:</span>
              <span className="text-[#8B4F58]">{formatINR(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
