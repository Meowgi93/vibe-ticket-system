import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';

const PrintTicketPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const { authFetch } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchParams = new URLSearchParams(location.search);
    const seatIdParam = searchParams.get('seatId');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await authFetch(`/api/tickets/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket');
                }
                const data = await response.json();
                setTicket(data);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching the ticket.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTicket();
        }
    }, [id, authFetch]);

    // Auto-print removed for mobile scanning view

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <div className="text-xl text-red-500 bg-gray-800 p-6 rounded-lg shadow-lg">
                    {error || 'Ticket not found'}
                </div>
            </div>
        );
    }

    // Filter seat if seatId is provided
    let displayedSeats = ticket.bookedSeats || [];
    if (seatIdParam) {
        const specificSeat = displayedSeats.find(s => String(s.id) === seatIdParam);
        if (specificSeat) {
            displayedSeats = [specificSeat];
        }
    }

    const qrValue = seatIdParam ? `TKT-${String(ticket.id).padStart(3, '0')}-S${seatIdParam}` : `TKT-${String(ticket.id).padStart(3, '0')}`;

    return (
        <div className="min-h-screen bg-surface-950 p-4 sm:p-8 flex justify-center items-center font-sans w-full relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col">
                
                {/* Header Strip */}
                <div className="p-6 text-center relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to bottom right, #306EF9, #FF4E78, #CAFB12)' }}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <h1 className="text-3xl font-black tracking-tighter relative z-10 drop-shadow-md" style={{ color: '#ffffff' }}>VIBE</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.8)' }}>Official E-Ticket</p>
                </div>

                {/* Concert Info */}
                <div className="p-6 pb-2 text-center relative">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#306EF9' }}>Admit One</p>
                    <h2 className="text-2xl font-bold leading-tight mb-1" style={{ color: '#08061e' }}>{ticket.concert?.title || 'Unknown Concert'}</h2>
                    <p className="text-sm font-semibold" style={{ color: '#312a72' }}>{ticket.concert?.artist || 'Unknown Artist'}</p>
                </div>

                {/* Details Grid */}
                <div className="px-6 py-4 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8f9fa', border: '1px solid rgba(8,6,30,0.1)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#312a72' }}>Date</p>
                        <p className="text-sm font-bold" style={{ color: '#08061e' }}>{ticket.showtime?.date || ticket.concert?.date || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8f9fa', border: '1px solid rgba(8,6,30,0.1)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#312a72' }}>Time</p>
                        <p className="text-sm font-bold" style={{ color: '#08061e' }}>{ticket.showtime?.time || ticket.concert?.time || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl col-span-2" style={{ backgroundColor: '#f8f9fa', border: '1px solid rgba(8,6,30,0.1)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#312a72' }}>Venue</p>
                        <p className="text-sm font-bold" style={{ color: '#08061e' }}>{ticket.concert?.venue || 'N/A'}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#312a72' }}>{ticket.concert?.location || 'N/A'}</p>
                    </div>
                </div>

                {/* Seat & User Info */}
                <div className="px-6 py-2">
                    <div className="border-t border-dashed pt-4 pb-2" style={{ borderColor: 'rgba(8,6,30,0.2)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-center" style={{ color: '#312a72' }}>Ticket Holder</p>
                        <p className="text-sm font-bold truncate text-center" style={{ color: '#08061e' }}>{ticket.holderName || ticket.user?.fullName || ticket.user?.name || 'Guest User'}</p>
                    </div>
                    
                    <div className="border-b border-dashed pb-4" style={{ borderColor: 'rgba(8,6,30,0.2)' }}>
                        {displayedSeats.map((s, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-2 text-center mt-2 bg-[#f8f9fa] rounded-xl p-2 border border-black/5">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#312a72' }}>Zone</p>
                                    <p className="text-xs font-bold" style={{ color: '#1b5ae0' }}>{s.zone?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#312a72' }}>Floor</p>
                                    <p className="text-xs font-bold" style={{ color: '#1b5ae0' }}>{s.zone?.name?.includes("VIP") ? "1" : "2"}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#312a72' }}>Row</p>
                                    <p className="text-xs font-bold" style={{ color: '#1b5ae0' }}>{s.row || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#312a72' }}>Seat</p>
                                    <p className="text-xs font-bold" style={{ color: '#1b5ae0' }}>{s.col || '-'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="p-8 pt-4 flex flex-col items-center bg-white relative mt-2">
                    {/* Cutouts for ticket effect */}
                    <div className="absolute -top-3 -left-4 w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: '#08061e' }}></div>
                    <div className="absolute -top-3 -right-4 w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: '#08061e' }}></div>
                    
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: '#312a72' }}>Scan at Entrance</p>
                    <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)]" style={{ border: '1px solid rgba(8,6,30,0.1)' }}>
                        <QRCode value={qrValue} size={180} level="H" />
                    </div>
                    <p className="text-xs font-mono font-bold mt-4 tracking-widest px-3 py-1 rounded-lg" style={{ color: '#312a72', backgroundColor: '#f8f9fa' }}>{qrValue}</p>
                </div>
            </div>
        </div>
    );
};

export default PrintTicketPage;
