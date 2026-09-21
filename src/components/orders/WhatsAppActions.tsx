'use client';

import React, { useState, useEffect } from 'react';
import { OrderWithItems } from '@/types/order';
import { Communication, CommunicationType } from '@/types/communication';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MessageCircle, Send, CheckCircle2, Sparkles, Heart, ClipboardCheck } from 'lucide-react';

interface WhatsAppActionsProps {
  order: OrderWithItems;
}

export function WhatsAppActions({ order }: WhatsAppActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preparedData, setPreparedData] = useState<{
    url: string;
    message: string;
    communication: Communication;
  } | null>(null);
  const [history, setHistory] = useState<Communication[]>([]);

  // Only allow on ENTREGADO orders
  const isDelivered = order.status === 'ENTREGADO';

  useEffect(() => {
    if (isDelivered) {
      loadHistory();
    }
  }, [order.id, isDelivered]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/communications?orderId=${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTemplate = async (type: CommunicationType) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, type }),
      });

      if (res.ok) {
        const data = await res.json();
        setPreparedData(data);
        await loadHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!preparedData?.url) return;
    window.open(preparedData.url, '_blank');
  };

  const handleMarkAsSent = async (commId: string) => {
    try {
      const res = await fetch(`/api/communications/${commId}/sent`, {
        method: 'PUT',
      });
      if (res.ok) {
        await loadHistory();
        if (preparedData?.communication.id === commId) {
          setPreparedData(prev =>
            prev ? { ...prev, communication: { ...prev.communication, status: 'MARKED_SENT' } } : null
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isDelivered) {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        WhatsApp / Encuesta
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setPreparedData(null);
        }}
        title={`💬 Contactar a ${order.customerName} (${order.customerWhatsapp})`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Selecciona una plantilla para preparar el mensaje personalizado de WhatsApp:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectTemplate('SURVEY')}
                disabled={isLoading}
                className="flex items-start gap-2.5 p-3 rounded-2xl border border-brand-200 bg-brand-50/40 hover:bg-brand-50 text-left transition-colors"
              >
                <ClipboardCheck className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-900">📋 Encuesta de satisfacción</div>
                  <div className="text-[11px] text-gray-500">Preguntar qué tal le pareció el producto</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('THANKS')}
                disabled={isLoading}
                className="flex items-start gap-2.5 p-3 rounded-2xl border border-brand-200 bg-brand-50/40 hover:bg-brand-50 text-left transition-colors"
              >
                <Heart className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-900">💗 Mensaje de agradecimiento</div>
                  <div className="text-[11px] text-gray-500">Agradecerle por apoyar el emprendimiento</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('NEW_PRODUCTS')}
                disabled={isLoading}
                className="flex items-start gap-2.5 p-3 rounded-2xl border border-gold-200 bg-gold-50/40 hover:bg-gold-50 text-left transition-colors"
              >
                <Sparkles className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-900">🛍️ Avisar nuevos productos</div>
                  <div className="text-[11px] text-gray-500">Invitar a ver novedades y reposiciones</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('FOLLOWUP')}
                disabled={isLoading}
                className="flex items-start gap-2.5 p-3 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-left transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-900">💬 Seguimiento general</div>
                  <div className="text-[11px] text-gray-500">Escribir un saludo de seguimiento</div>
                </div>
              </button>
            </div>
          </div>

          {/* Prepared Message Preview & WhatsApp Action */}
          {preparedData && (
            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>📱</span> Mensaje listo para WhatsApp:
              </div>

              <div className="bg-white rounded-xl p-3 text-xs text-gray-700 whitespace-pre-line border border-emerald-100 shadow-xs font-sans">
                {preparedData.message}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  onClick={handleOpenWhatsApp}
                  variant="success"
                  size="sm"
                  className="flex-1"
                >
                  <Send className="w-4 h-4" /> Abrir WhatsApp Web / App
                </Button>

                {preparedData.communication.status !== 'MARKED_SENT' && (
                  <Button
                    onClick={() => handleMarkAsSent(preparedData.communication.id)}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Marcar como enviado
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Communication History */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="text-xs font-bold text-gray-700 mb-2">Historial de comunicaciones preparadas:</h5>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {history.map(comm => (
                  <div
                    key={comm.id}
                    className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{comm.type}</span>
                      <span className="text-gray-400 ml-2">
                        {new Date(comm.createdAt).toLocaleDateString('es-CO')}
                      </span>
                    </div>

                    {comm.status === 'MARKED_SENT' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsSent(comm.id)}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Marcar enviado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
