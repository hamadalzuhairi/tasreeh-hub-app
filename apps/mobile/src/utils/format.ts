function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Western digits in YYYY/MM/DD HH:mm, as shown throughout the mockup.
export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatRelative(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return "قبل قليل";
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "قبل ساعة" : `قبل ${hours} ساعات`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  return `قبل ${days} أيام`;
}

export function formatDays(n: number) {
  if (n === 1) return "يوم";
  if (n === 2) return "يومان";
  if (n <= 10) return `${n} أيام`;
  return `${n} يوم`;
}

const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function weekdayAr(isoDate: string) {
  return WEEKDAYS_AR[new Date(`${isoDate}T12:00:00`).getDay()];
}
