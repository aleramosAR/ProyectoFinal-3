export function formatDate(date) {
  const h = date.getHours();
  const hh = (String(h).length == 1) ? `0${h}` : h;
  const mi = date.getMinutes();
  const min = (String(mi).length == 1) ? `0${mi}` : mi;
  const d = date.getDate();
  const dd = (String(d).length == 1) ? `0${d}` : d;
  const m = date.getMonth();
  const mm = (String(m).length == 1) ? `0${m}` : m;
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy} - ${hh}:${min}hs.`
}