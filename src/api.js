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
    signup: (email, password, name, gender, dateOfBirth, rememberMe = true) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, gender, dateOfBirth, rememberMe }) }),
    login: (email, password, rememberMe = true) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    verifyEmail: (email) =>
      request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (email, code, newPassword) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) }),
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
    updateMine: (data) => request('/venues/me', { method: 'PUT', body: JSON.stringify(data) }),
    adminUpdate: (id, data) => request(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  users: {
    updateFavorite: (sport, team) =>
      request('/users/me/favorites', { method: 'PUT', body: JSON.stringify({ sport, team }) }),
    updateCountry: (country) =>
      request('/users/me/country', { method: 'PUT', body: JSON.stringify({ country }) }),
    requestProfilePictureUrl: (contentType) =>
      request('/uploads/profile-picture/request-url', { method: 'POST', body: JSON.stringify({ contentType }) }),
    saveProfilePicture: (objectPath) =>
      request('/uploads/profile-picture/save', { method: 'POST', body: JSON.stringify({ objectPath }) }),
    removeProfilePicture: () =>
      request('/uploads/profile-picture', { method: 'DELETE' }),
    requestVenueImageUrl: (contentType, imageType) =>
      request('/uploads/venue-image/request-url', { method: 'POST', body: JSON.stringify({ contentType, imageType }) }),
    updateProfile: (data) =>
      request('/users/me/profile', { method: 'PUT', body: JSON.stringify(data) }),
    removeFavorite: (sport) =>
      request(`/users/me/favorites/${encodeURIComponent(sport)}`, { method: 'DELETE' }),
    stats: () => request('/users/stats'),
    badge: () => request('/users/me/badge'),
  },
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/read/${id}`, { method: 'POST' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
    updateSettings: (enabled) =>
      request('/notifications/settings', { method: 'PUT', body: JSON.stringify({ enabled }) }),
  },
  games: {
    list: () => request('/games'),
  },
  sponsors: {
    list: () => request('/sponsors'),
    create: (data) => request('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/sponsors/${id}`, { method: 'DELETE' }),
    requestLogoUrl: (contentType) =>
      request('/uploads/venue-image/request-url', { method: 'POST', body: JSON.stringify({ contentType, imageType: 'sponsor-logo' }) }),
  },
  fans: {
    byTeam: (sport, team) => {
      const params = new URLSearchParams({ sport, team });
      return request(`/fans/by-team?${params}`);
    },
    invite: (partyId, toUserId) =>
      request('/fans/invite', { method: 'POST', body: JSON.stringify({ partyId, toUserId }) }),
    invitations: () => request('/fans/invitations'),
    acceptInvitation: (id) => request(`/fans/invitations/${id}/accept`, { method: 'POST' }),
    declineInvitation: (id) => request(`/fans/invitations/${id}/decline`, { method: 'POST' }),
  },
};
