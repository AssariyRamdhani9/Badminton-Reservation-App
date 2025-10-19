"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import api from "@/utils/api";


import "../global.css";

export default function CalendarDashboard() {
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

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching data for user:", userId);
        const res = await api.get(`/reservations/user/${userId}`);
        console.log("✅ Data dari backend:", res.data);

        const events = res.data.map((r) => {
  const utcDate = new Date(r.reservation_date);

  const localDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

  const [year, month, day] = [
    localDate.getFullYear(),
    localDate.getMonth() + 1,
    localDate.getDate(),
  ];

  const [startHour, startMinute] = r.start_time.split(":");
  const [endHour, endMinute] = r.end_time.split(":");

  const startDate = new Date(year, month - 1, day, startHour, startMinute);
  const endDate = new Date(year, month - 1, day, endHour, endMinute);

  return {
    id: r.reservation_id,
    title: `Lapangan ${r.court_id} (${r.start_time} - ${r.end_time})`,
    start: startDate,
    end: endDate,
    color: r.payment_status === "PAID" ? "#28a745" : "#007bff",
  };
        }).filter(event => event !== null);

        console.log("🎨 Events untuk FullCalendar:", events);
        if (events.length === 0) console.warn("⚠️ Tidak ada event yang cocok untuk ditampilkan");
        setReservations(events);
      } catch (err) {
        console.error("❌ Gagal memuat data reservasi:", err);
        setError("Gagal memuat data reservasi. Cek konsol untuk detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, authError]);

  if (loading) return <div className="p-6">Memuat...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📅 Jadwal Reservasi Anda
      </h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="id"
        height="auto"
        events={reservations}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  );
}