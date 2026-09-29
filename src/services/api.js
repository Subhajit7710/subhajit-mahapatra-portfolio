const rawBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE = (rawBase || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
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
