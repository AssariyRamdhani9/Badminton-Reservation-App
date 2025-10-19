"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/utils/api";

export default function UserReservations() {
  const router = useRouter();
  const { isAuthenticated, getUserId, loading: authLoading, error: authError } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    const userId = getUserId();
    if (!isAuthenticated || !userId) {
      setError("User tidak autentikasi atau ID tidak tersedia. Silakan login.");
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/reservations/user/${userId}`);
        setReservations(res.data);
      } catch (err) {
        console.error("❌ Gagal memuat reservasi:", err);
        setError("Gagal memuat reservasi. Cek konsol untuk detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [authLoading, isAuthenticated, authError]);

  if (loading) return <div className="p-4 text-center">Memuat...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-sm transition duration-200"
      >
        Kembali
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Reservasi Anda</h2>

      {reservations.length === 0 ? (
        <p className="text-gray-500">Tidak ada reservasi yang ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => {
                const date = new Date(reservation.reservation_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Jakarta",
                });
                const timeRange = `${reservation.start_time} - ${reservation.end_time}`;

                return (
                  <tr key={reservation.reservation_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{reservation.reservation_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{timeRange}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Lapangan {reservation.court_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reservation.total_price} IDR</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reservation.payment_status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {reservation.payment_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
