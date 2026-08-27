import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TicketHolderModal({ isOpen, onClose, onContinue }) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    holderName: '',
    holderEmail: '',
    holderPhone: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill with user info when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        holderName: user.fullName || '',
        holderEmail: user.email || '',
        holderPhone: user.phone || ''
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.holderName || formData.holderName.trim().length < 2) {
      newErrors.holderName = "Please enter a valid full name.";
    }
    
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!formData.holderEmail || !emailRegex.test(formData.holderEmail)) {
      newErrors.holderEmail = "Please enter a valid email address.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.holderPhone || !phoneRegex.test(formData.holderPhone)) {
      newErrors.holderPhone = "Phone number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onContinue(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="animate-fade-in-up w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-900 shadow-2xl">
        <div className="border-b border-white/5 bg-surface-800/50 p-6">
          <h2 className="font-display text-xl font-bold text-white">Ticket Holder Details</h2>
          <p className="mt-1 text-sm text-gray-400">Please confirm the attendee's information for the E-Ticket.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData({...formData, holderName: e.target.value})}
              className={`w-full rounded-xl border ${errors.holderName ? 'border-pink-500' : 'border-white/10'} bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`}
              placeholder="John Doe"
            />
            {errors.holderName && <p className="mt-1 text-xs text-pink-500">{errors.holderName}</p>}
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
            <input
              type="email"
              value={formData.holderEmail}
              onChange={(e) => setFormData({...formData, holderEmail: e.target.value})}
              className={`w-full rounded-xl border ${errors.holderEmail ? 'border-pink-500' : 'border-white/10'} bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`}
              placeholder="john@example.com"
            />
            {errors.holderEmail && <p className="mt-1 text-xs text-pink-500">{errors.holderEmail}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</label>
            <input
              type="text"
              value={formData.holderPhone}
              onChange={(e) => setFormData({...formData, holderPhone: e.target.value.replace(/\D/g, '')})}
              maxLength={10}
              className={`w-full rounded-xl border ${errors.holderPhone ? 'border-pink-500' : 'border-white/10'} bg-surface-800 px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono`}
              placeholder="0812345678"
            />
            {errors.holderPhone && <p className="mt-1 text-xs text-pink-500">{errors.holderPhone}</p>}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-95"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
