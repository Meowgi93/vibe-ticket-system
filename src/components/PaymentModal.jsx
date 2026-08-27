import { useState } from "react";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";

export default function PaymentModal({ isOpen, onClose, onSuccess, totalAmount, isProcessing, error }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("card"); // 'card' or 'promptpay'
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvv(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="animate-fade-in-up w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface-900 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-surface-800/50 p-6">
          <h2 className="font-display text-xl font-bold text-white">Secure Checkout</h2>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Total Summary */}
          <div className="mb-8 rounded-xl bg-gradient-to-r from-brand-500/10 to-brand-600/10 border border-brand-500/20 p-5 text-center">
            <p className="text-sm font-medium text-brand-400 mb-1">Total to pay</p>
            <p className="font-display text-4xl font-bold text-white">฿{totalAmount.toLocaleString()}</p>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-6 flex gap-2 rounded-xl bg-surface-800 p-1">
            <button
              onClick={() => setMethod("card")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                method === "card" ? "bg-surface-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Credit / Debit Card
            </button>
            <button
              onClick={() => setMethod("promptpay")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                method === "promptpay" ? "bg-[#113566] text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              PromptPay
            </button>
          </div>

          {/* Card Form */}
          {method === "card" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                  <div className="absolute right-3 top-3 flex gap-1">
                    <div className="h-6 w-8 rounded bg-white/10"></div>
                    <div className="h-6 w-8 rounded bg-white/10"></div>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Name on Card</label>
                <input
                  type="text"
                  placeholder="JANE DOE"
                  className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">CVC</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PromptPay */}
          {method === "promptpay" && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Scan this QR code with your mobile banking app to pay.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <QRCode value={`PROMPTPAY-MOCK-${totalAmount}`} size={180} level="H" />
              </div>
              <p className="text-xs text-brand-400/80 animate-pulse">Waiting for payment...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-pink-500/20 bg-pink-500/10 p-4 text-center">
              <p className="text-sm font-semibold text-pink-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-surface-800/50 p-6">
          <button
            onClick={onSuccess}
            disabled={isProcessing}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : method === "card" ? (
              `Pay ฿${totalAmount.toLocaleString()}`
            ) : (
              "Simulate Transfer Success"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
