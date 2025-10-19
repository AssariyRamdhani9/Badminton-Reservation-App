"use client";
import { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import api from '@/utils/api';
import useAuth from '@/hooks/useAuth'; 
import { useRouter } from 'next/navigation'; 

const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

export default function ReservationPage() {
    const { isAuthenticated, getUserId, user, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        court_id: '1', 
        reservation_date: moment().format('YYYY-MM-DD'),
        start_time: '',
        end_time: '',
    });

    const [courts, setCourts] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        } else if (!loading && isAuthenticated) {
            fetchCourts();
        }
    }, [loading, isAuthenticated]);

    const fetchCourts = async () => {
        try {
            const response = await api.get('/courts');
            const processedCourts = response.data.map(c => ({
                ...c,
                hourly_rate: parseFloat(c.hourly_rate) 
            }));
            setCourts(processedCourts);
            if (processedCourts.length > 0) {
                setFormData(prev => ({ ...prev, court_id: processedCourts[0].court_id.toString() }));
            }
        } catch (err) {
            console.error("Gagal ambil data lapangan:", err);
            setMessage("Gagal memuat data lapangan. Pastikan server backend berjalan.");
            setIsError(true);
        }
    };

    const { durationHours, totalPrice } = useMemo(() => {
        const { start_time, end_time } = formData;
        if (!start_time || !end_time) return { durationHours: 0, totalPrice: 0 };

        let start = moment(start_time, 'HH:mm');
        let end = moment(end_time, 'HH:mm');

        let duration = end.diff(start, 'hours', true);
        if (duration <= 0) {
            return { durationHours: 0, totalPrice: 0 }; 
        }

        const selectedCourt = courts.find(c => c.court_id.toString() === formData.court_id);
        const rate = selectedCourt ? selectedCourt.hourly_rate : 0;
        
        const price = duration * rate;

        return {
            durationHours: duration.toFixed(1),
            totalPrice: Math.round(price),
        };
    }, [formData.start_time, formData.end_time, formData.court_id, courts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || loadingSubmit) return;
        const userId = getUserId();
        if (!userId) {
            alert("Sesi habis. Silakan login kembali.");
            router.push("/login");
            return;
        }

        if (durationHours <= 0 || totalPrice <= 0) {
            setMessage("Durasi atau harga tidak valid. Periksa jam masuk dan keluar.");
            setIsError(true);
            return;
        }

        setLoadingSubmit(true);
        setMessage("");
        setIsError(false);

        const reservationPayload = {
            user_id: userId,
            court_id: parseInt(formData.court_id),
            reservation_date: formData.reservation_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            total_price: totalPrice,
        };

        try {
            const response = await api.post("/reservations", reservationPayload);
            console.log("DEBUG response from /reservations:", response.data);
            const { reservation_id: reservationId, paymentUrl, message: backendMsg } = response.data;

            if (paymentUrl) {
            setMessage("Reservasi dibuat. Mengarahkan ke halaman pembayaran...");
            setIsError(false);
            window.location.href = paymentUrl; 
            } else if (reservationId) {
            setMessage("Reservasi dibuat (PENDING). Tidak ada link pembayaran.");
            router.push(`/confirmation?status=pending&id=${reservationId}`);
            } else {
            setMessage("Reservasi dibuat, tetapi ID reservasi tidak ditemukan.");
            setIsError(true);
            }
        } catch (error) {
        } finally {
            setLoadingSubmit(false);
        }
        };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Buat Reservasi</h1>
            <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
                ← Kembali ke Dashboard
            </button>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6">
                <p className="font-bold">Tips!</p>
                <p>Harga sudah termasuk durasi {durationHours} jam untuk Lapangan yang dipilih. Lapangan akan ter-booking setelah pembayaran sukses.</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Lapangan</label>
                    <select
                        name="court_id"
                        value={formData.court_id}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    >
                        {courts.map(court => (
                            <option key={court.court_id} value={court.court_id}>
                                {court.name} (Rp {court.hourly_rate.toLocaleString('id-ID')}/jam)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="text"
                            value={user?.phone_number || user?.email || 'Data Pengguna'}
                            readOnly
                            placeholder="Nomor diambil dari akun"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input
                            type="date"
                            name="reservation_date"
                            value={formData.reservation_date}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            min={moment().format('YYYY-MM-DD')}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                        <input
                            type="time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                        <input
                            type="time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={durationHours > 0 ? durationHours : ''}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-l-lg shadow-sm bg-gray-100"
                            />
                            <span className="p-3 bg-gray-200 text-gray-700 border border-gray-300 rounded-r-lg">Jam</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga Total</label>
                        <div className="flex items-center">
                            <span className="p-3 bg-gray-200 text-gray-700 border border-gray-300 rounded-l-lg">Rp</span>
                            <input
                                type="text"
                                value={totalPrice > 0 ? totalPrice.toLocaleString('id-ID') : ''}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-r-lg shadow-sm bg-gray-100"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    disabled={loading || durationHours <= 0 || totalPrice <= 0}
                >
                    {loading ? 'Memproses & Membayar...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}