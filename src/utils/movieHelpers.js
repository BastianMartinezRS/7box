export const POSTER_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#181d2a"/>
      <rect x="16" y="16" width="268" height="418" rx="12" fill="none" stroke="#38ef7d" stroke-opacity="0.35" stroke-width="2"/>
      <text x="150" y="210" text-anchor="middle" fill="#38ef7d" font-family="sans-serif" font-size="28" font-weight="bold">7box</text>
      <text x="150" y="244" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">Póster no disponible</text>
    </svg>`
  );

export function handlePosterError(e) {
  if (e?.currentTarget && e.currentTarget.dataset.fallbackApplied !== 'true') {
    e.currentTarget.dataset.fallbackApplied = 'true';
    e.currentTarget.src = POSTER_FALLBACK;
  }
}

export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = null;

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export function parseDurationMinutes(duracion) {
  if (!duracion || typeof duracion !== 'string') return 0;
  const text = duracion.trim().toLowerCase();
  const hoursMatch = text.match(/(\d+)\s*h/);
  const minsMatch = text.match(/(\d+)\s*m/);

  if (hoursMatch || minsMatch) {
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  const plainNum = text.match(/\d+/);
  return plainNum ? parseInt(plainNum[0], 10) : 0;
}

export function formatHoursMinutes(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
