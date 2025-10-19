"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard"); 
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">DIRO-APP Badminton</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Email / Username</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      <p className="mt-4 text-center text-sm text-gray-600">
      Belum punya akun?{" "}
      <span
        onClick={() => router.push("/register")}
        className="text-blue-600 hover:underline cursor-pointer"
      >
        Daftar
      </span>
      </p>
      </div>
    </div>
  );
}
