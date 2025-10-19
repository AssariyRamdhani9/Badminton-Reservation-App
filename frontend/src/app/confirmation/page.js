"use client";
import { useSearchParams } from 'next/navigation';

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    let message = '';
    if (status === 'success' || status === 'settlement') {
        message = `Pembayaran SUKSES! Order ID: ${orderId}. Status akan segera diperbarui.`;
    } else if (status === 'pending') {
        message = `Pembayaran pending. Silakan selesaikan pembayaran. Order ID: ${orderId}.`;
    } else {
        message = `Pembayaran GAGAL. Order ID: ${orderId}.`;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Status Pembayaran</h1>
            <p className={`p-4 rounded-lg ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
            </p>
        </div>
    );
}