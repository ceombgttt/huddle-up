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
    signup: (email, password, name, gender, dateOfBirth, rememberMe = true, referralCode = '') =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, gender, dateOfBirth, rememberMe, referralCode }) }),
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
    update: (id, data) => request(`/parties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    join: (id) => request(`/parties/${id}/join`, { method: 'POST' }),
    leave: (id) => request(`/parties/${id}/leave`, { method: 'POST' }),
    delete: (id) => request(`/parties/${id}`, { method: 'DELETE' }),
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
    updateSmsSettings: (data) =>
      request('/users/me/sms-settings', { method: 'PUT', body: JSON.stringify(data) }),
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
    me: () => request('/sponsors/me'),
    updateMe: (data) => request('/sponsors/me', { method: 'PUT', body: JSON.stringify(data) }),
    banners: () => request('/sponsors/banners'),
    slots: () => request('/sponsors/slots'),
    requestLogoUrl: (contentType) =>
      request('/uploads/venue-image/request-url', { method: 'POST', body: JSON.stringify({ contentType, imageType: 'sponsor-logo' }) }),
  },
  push: {
    getVapidKey: () => request('/push/vapid-key'),
    subscribe: (subscription) => request('/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) }),
    unsubscribe: (endpoint) => request('/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) }),
    watchGame: (data) => request('/push/watch-game', { method: 'POST', body: JSON.stringify(data) }),
    unwatchGame: (gameId) => request(`/push/watch-game/${encodeURIComponent(gameId)}`, { method: 'DELETE' }),
    watchedGames: () => request('/push/watched-games'),
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
  friends: {
    list: () => request('/friends/list'),
    requests: () => request('/friends/requests'),
    sendRequest: (friendId) => request('/friends/request', { method: 'POST', body: JSON.stringify({ friendId }) }),
    accept: (id) => request(`/friends/accept/${id}`, { method: 'POST' }),
    decline: (id) => request(`/friends/decline/${id}`, { method: 'POST' }),
    remove: (friendId) => request(`/friends/${friendId}`, { method: 'DELETE' }),
    status: (userId) => request(`/friends/status/${userId}`),
  },
  chat: {
    getMessages: (partyId, before) => {
      const params = before ? `?before=${encodeURIComponent(before)}` : '';
      return request(`/chat/parties/${partyId}/messages${params}`);
    },
    sendMessage: (partyId, message, messageType = 'chat') =>
      request(`/chat/parties/${partyId}/messages`, { method: 'POST', body: JSON.stringify({ message, message_type: messageType }) }),
  },
  stripe: {
    products: () => request('/stripe/products'),
    checkout: (priceId) => request('/stripe/checkout', { method: 'POST', body: JSON.stringify({ priceId }) }),
    subscription: () => request('/stripe/subscription'),
    portal: () => request('/stripe/portal', { method: 'POST' }),
    syncSubscription: () => request('/stripe/sync-subscription', { method: 'POST' }),
  },
  referrals: {
    myCode: () => request('/referrals/my-code'),
    apply: (referralCode) => request('/referrals/apply', { method: 'POST', body: JSON.stringify({ referralCode }) }),
    stats: () => request('/referrals/stats'),
    validate: (code) => request(`/referrals/validate/${encodeURIComponent(code)}`),
  },
  photos: {
    getPartyPhotos: (partyId) => request(`/photos/parties/${partyId}/photos`),
    uploadPhoto: async (partyId, file, caption = '') => {
      const res = await fetch(`/api/photos/parties/${partyId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'x-file-content-type': file.type,
          'x-photo-caption': caption,
        },
        body: file,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    deletePhoto: (photoId) => request(`/photos/photos/${photoId}`, { method: 'DELETE' }),
    tagPhoto: (photoId, taggedUserId) => request(`/photos/photos/${photoId}/tag`, { method: 'POST', body: JSON.stringify({ taggedUserId }) }),
    removeTag: (photoId, taggedUserId) => request(`/photos/photos/${photoId}/tag/${taggedUserId}`, { method: 'DELETE' }),
  },
  rewards: {
    balance: () => request('/rewards/balance'),
    history: () => request('/rewards/history'),
    catalog: () => request('/rewards/catalog'),
    redeem: (rewardId) => request('/rewards/redeem', { method: 'POST', body: JSON.stringify({ rewardId }) }),
    redemptions: () => request('/rewards/redemptions'),
    checkin: (partyId) => request('/rewards/checkin', { method: 'POST', body: JSON.stringify({ partyId }) }),
  },
  qr: {
    getVenueQr: () => request('/qr/venue/qr'),
    generateQr: () => request('/qr/venue/generate', { method: 'POST' }),
    venueStats: () => request('/qr/venue/stats'),
    verifyToken: (token) => request(`/qr/verify/${encodeURIComponent(token)}`),
    scan: (token, partyId) => request('/qr/scan', { method: 'POST', body: JSON.stringify({ token, partyId }) }),
    adminStats: () => request('/qr/admin/stats'),
    adminGenerateQr: (venueId) => request(`/qr/admin/generate/${venueId}`, { method: 'POST' }),
    adminGetVenueQr: (venueId) => request(`/qr/admin/venue/${venueId}/qr`),
  },
  fantasy: {
    leagues: () => request('/fantasy/leagues'),
    createLeague: (data) => request('/fantasy/leagues', { method: 'POST', body: JSON.stringify(data) }),
    getLeague: (id) => request(`/fantasy/leagues/${id}`),
    deleteLeague: (id) => request(`/fantasy/leagues/${id}`, { method: 'DELETE' }),
    joinLeague: (id, data) => request(`/fantasy/leagues/${id}/join`, { method: 'POST', body: JSON.stringify(data) }),
    joinByCode: (data) => request('/fantasy/leagues/join-by-code', { method: 'POST', body: JSON.stringify(data) }),
    updateTeam: (id, data) => request(`/fantasy/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    addPlayer: (teamId, data) => request(`/fantasy/teams/${teamId}/players`, { method: 'POST', body: JSON.stringify(data) }),
    removePlayer: (playerId) => request(`/fantasy/players/${playerId}`, { method: 'DELETE' }),
    partyLeagues: (partyId) => request(`/fantasy/parties/${partyId}/leagues`),
    linkPartyLeague: (partyId, leagueId) => request(`/fantasy/parties/${partyId}/leagues`, { method: 'POST', body: JSON.stringify({ leagueId }) }),
    unlinkPartyLeague: (partyId, leagueId) => request(`/fantasy/parties/${partyId}/leagues/${leagueId}`, { method: 'DELETE' }),
    partyLeaderboard: (partyId) => request(`/fantasy/parties/${partyId}/leaderboard`),
    partySharedPlayers: (partyId) => request(`/fantasy/parties/${partyId}/shared-players`),
  },
  reviews: {
    getPartyReviews: (partyId) => request(`/reviews/parties/${partyId}/reviews`),
    submitReview: (partyId, data) => request(`/reviews/parties/${partyId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
    deleteReview: (partyId) => request(`/reviews/parties/${partyId}/reviews`, { method: 'DELETE' }),
  },
  teamChats: {
    getRooms: () => request('/team-chats/rooms'),
    getMessages: (roomId, before) => {
      const params = before ? `?before=${encodeURIComponent(before)}` : '';
      return request(`/team-chats/rooms/${roomId}/messages${params}`);
    },
    sendMessage: (roomId, message) => request(`/team-chats/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
    createRoom: (data) => request('/team-chats/rooms', { method: 'POST', body: JSON.stringify(data) }),
    searchRooms: (q) => request(`/team-chats/rooms/search?q=${encodeURIComponent(q)}`),
  },
  trending: {
    feed: () => request('/trending/feed'),
    suggested: () => request('/trending/suggested'),
    getHighlights: (partyId) => request(`/trending/highlights/${partyId}`),
    listHighlights: () => request('/trending/highlights'),
    createHighlight: (partyId, data) => request(`/trending/highlights/${partyId}`, { method: 'POST', body: JSON.stringify(data) }),
  },
  tickets: {
    setup: (partyId, data) => request(`/tickets/parties/${partyId}/tickets/setup`, { method: 'POST', body: JSON.stringify(data) }),
    getInfo: (partyId) => request(`/tickets/parties/${partyId}/tickets`),
    purchase: (partyId) => request(`/tickets/parties/${partyId}/tickets/purchase`, { method: 'POST' }),
    myTickets: () => request('/tickets/my-tickets'),
    promote: (partyId, data) => request(`/tickets/parties/${partyId}/promote`, { method: 'POST', body: JSON.stringify(data) }),
    promoted: () => request('/tickets/promoted'),
    cancelPromotion: (partyId) => request(`/tickets/parties/${partyId}/promote`, { method: 'DELETE' }),
  },
  alerts: {
    getPreferences: () => request('/alerts/preferences'),
    updatePreferences: (data) => request('/alerts/preferences', { method: 'PUT', body: JSON.stringify(data) }),
    teamAlerts: () => request('/alerts/team-alerts'),
    rivalryAlerts: () => request('/alerts/rivalry-alerts'),
    rivalryPairs: () => request('/alerts/rivalry-pairs'),
  },
  profile: {
    getUser: (userId) => request(`/profile/users/${userId}`),
    getActivity: (userId) => request(`/profile/users/${userId}/activity`),
    myStats: () => request('/profile/me/stats'),
  },
  analytics: {
    overview: () => request('/analytics/overview'),
    userGrowth: (days = 30) => request(`/analytics/user-growth?days=${days}`),
    partyTrends: (days = 30) => request(`/analytics/party-trends?days=${days}`),
    topSports: () => request('/analytics/top-sports'),
    topCities: () => request('/analytics/top-cities'),
    topTeams: () => request('/analytics/top-teams'),
    venuePerformance: () => request('/analytics/venue-performance'),
    engagement: () => request('/analytics/engagement'),
    recentActivity: () => request('/analytics/recent-activity'),
    userCities: () => request('/analytics/user-cities'),
    hourlyActivity: () => request('/analytics/hourly-activity'),
  },
};
