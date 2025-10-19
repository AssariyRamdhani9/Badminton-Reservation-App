/**
  @param {string} startTime 
  @param {string} endTime 
  @param {number} intervalMinutes 
  @returns {Array<{startTime: string, endTime: string}>}
 */
exports.generateAllTimeSlots = (startTime, endTime, intervalMinutes = 60) => {
  const slots = [];


  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const toHHMM = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  let current = toMinutes(startTime);
  const end = toMinutes(endTime);


  while (current + intervalMinutes <= end) {
    const slotStart = toHHMM(current);
    const slotEnd = toHHMM(current + intervalMinutes);
    slots.push({ startTime: slotStart, endTime: slotEnd });
    current += intervalMinutes;
  }

  return slots;
};
