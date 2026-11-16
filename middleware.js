// Password gate for the whole site (Vercel Routing Middleware, works on the free Hobby plan).
// Set SITE_PASSWORD (and optionally SITE_USER, default "siena") in Vercel > Project > Settings > Environment Variables.
// If SITE_PASSWORD isn't set, the site stays locked rather than going public by accident.
export const config = { matcher: '/:path*' };

const deny = () => new Response('Password required', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Siena concept", charset="UTF-8"', 'Cache-Control': 'no-store' },
});

const same = (a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

export default function middleware(request) {
  const pass = process.env.SITE_PASSWORD, user = process.env.SITE_USER || 'siena';
  if (!pass) return deny();
  const h = request.headers.get('authorization') || '';
  if (!h.startsWith('Basic ')) return deny();
  let decoded = '';
  try { decoded = atob(h.slice(6)); } catch { return deny(); }
  const i = decoded.indexOf(':');
  if (i < 0 || !same(decoded.slice(0, i), user) || !same(decoded.slice(i + 1), pass)) return deny();
  // no return value: the request carries on to the static files
}
