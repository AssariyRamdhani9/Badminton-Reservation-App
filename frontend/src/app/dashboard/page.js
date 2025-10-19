"use client";

import CalendarDashboard from "@/components/CalendarDashboard";
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  if (!user) {
    return <p className="p-6 text-gray-500">Memuat data user...</p>;
  }

  return (
    <main className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">MENU</h1>
        <ul className="space-y-3">
          <li><a href="/dashboard" className="block hover:text-blue-300">Dashboard</a></li>
          <li><a href="/reservation" className="block hover:text-blue-300">Buat Reservasi</a></li>
          <li><a href="/userReservations" className="block hover:text-blue-300">Data Reservasi</a></li>
        </ul>
      </aside>

      <section className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Selamat Datang, {user.username}</h1>
        <CalendarDashboard user_id={user.user_id} />
      </section>
    </main>
  );
}
