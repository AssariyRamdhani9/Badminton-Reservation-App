"use client";
import { useState } from 'react';

export default function CourtAvailability({ date, availability, onBook }) {

  const groupedSlots = availability.reduce((acc, slot) => {
    if (!acc[slot.courtName]) {
      acc[slot.courtName] = [];
    }
    acc[slot.courtName].push(slot);
    return acc;
  }, {});

  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookClick = () => {
    if (selectedSlot) {
        onBook(selectedSlot); 
    }
  };

  if (Object.keys(groupedSlots).length === 0) {
    return (
      <p className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
        ❌ Semua lapangan sudah terpesan untuk tanggal {date}. Silakan pilih tanggal lain.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Slot Tersedia untuk {date}</h2>
      
      {Object.entries(groupedSlots).map(([courtName, slots]) => (
        <div key={courtName} className="mb-6 p-4 border rounded-xl shadow-md bg-white">
          <h3 className="text-xl font-bold text-gray-800 mb-3">{courtName}</h3>
          <div className="flex flex-wrap gap-3">
            {slots.map((slot) => (
              <button
                key={`${slot.courtId}-${slot.startTime}`}
                onClick={() => handleSlotClick(slot)}
                className={`
                  p-3 rounded-lg text-sm transition-all duration-150
                  ${selectedSlot && selectedSlot.courtId === slot.courtId && selectedSlot.startTime === slot.startTime 
                    ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-300' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                  }
                `}
              >
                {slot.startTime} - {slot.endTime} (Rp {slot.price / 1000}K)
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl flex justify-between items-center z-10">
          <div>
            <p className="font-semibold text-lg">Pilihan Anda:</p>
            <p className="text-gray-600">
              {selectedSlot.courtName} | {date} | {selectedSlot.startTime} - {selectedSlot.endTime}
            </p>
          </div>
          <button
            onClick={handleBookClick}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-xl"
          >
            Lanjutkan ke Pembayaran (Rp {selectedSlot.price.toLocaleString('id-ID')})
          </button>
        </div>
      )}
    </div>
  );
}