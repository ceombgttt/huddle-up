const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    me: () => request('/auth/me'),
    signup: (email, password, name, gender) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, gender }) }),
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  parties: {
    list: (gameId, city) => {
      const params = new URLSearchParams();
      if (gameId) params.set('gameId', gameId);
      if (city) params.set('city', city);
      const qs = params.toString();
      return request(`/parties${qs ? '?' + qs : ''}`);
    },
    mine: () => request('/parties/mine'),
    create: (data) => request('/parties', { method: 'POST', body: JSON.stringify(data) }),
    join: (id) => request(`/parties/${id}/join`, { method: 'POST' }),
    leave: (id) => request(`/parties/${id}/leave`, { method: 'POST' }),
  },
  venues: {
    list: () => request('/venues'),
    claims: () => request('/venues/claims'),
    submitClaim: (data) => request('/venues/claims', { method: 'POST', body: JSON.stringify(data) }),
    approveClaim: (id) => request(`/venues/claims/${id}/approve`, { method: 'POST' }),
    rejectClaim: (id) => request(`/venues/claims/${id}/reject`, { method: 'POST' }),
  },
  users: {
    updateFavorite: (sport, team) =>
      request('/users/me/favorites', { method: 'PUT', body: JSON.stringify({ sport, team }) }),
    removeFavorite: (sport) =>
      request(`/users/me/favorites/${encodeURIComponent(sport)}`, { method: 'DELETE' }),
    stats: () => request('/users/stats'),
  },
};
