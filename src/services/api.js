const REQUEST_TIMEOUT_MS = 25000;

function resolveApiBase() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  const isLocalhost = /localhost|127\.0\.0\.1/.test(raw || '');

  if (!raw || (import.meta.env.PROD && isLocalhost)) {
    return '/api';
  }

  return raw.replace(/\/$/, '');
}

const API_BASE = resolveApiBase();

function endpoint(path) {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE === '/api' || API_BASE.endsWith('/api')) {
    return `${API_BASE}${suffix}`;
  }
  return `${API_BASE}/api${suffix}`;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint(path), {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The server took too long to respond. Check that the Render web service is running and SMTP is reachable.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const getProfile = () => request('/profile');
export const getSkills = () => request('/skills');
export const getProjects = () => request('/projects');
export const getCertifications = () => request('/certifications');
export const sendContact = (payload) =>
  request('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
