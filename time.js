const now = new Date();
const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
const istDate = new Date(now.getTime() + istOffset);

const formattedTime = `${String(istDate.getUTCHours()).padStart(
  2,
  "0"
)}:${String(istDate.getUTCMinutes()).padStart(2, "0")}, ${String(
  istDate.getUTCDate()
).padStart(2, "0")}/${String(istDate.getUTCMonth() + 1).padStart(
  2,
  "0"
)}/${istDate.getUTCFullYear()}`;

console.log(formattedTime);
