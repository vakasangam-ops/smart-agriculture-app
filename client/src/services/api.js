const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('krishi_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateLanguage: (language) => request('/auth/language', { method: 'PUT', body: JSON.stringify({ language }) }),

  // Farms & Crops
  getFarms: (farmerId) => request(`/farms${farmerId ? `?farmer_id=${farmerId}` : ''}`),
  createFarm: (farmData) => request('/farms', { method: 'POST', body: JSON.stringify(farmData) }),
  deleteFarm: (id) => request(`/farms/${id}`, { method: 'DELETE' }),
  addCrop: (farmId, cropData) => request(`/farms/${farmId}/crops`, { method: 'POST', body: JSON.stringify(cropData) }),
  updateCrop: (cropId, updates) => request(`/farms/crops/${cropId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteCrop: (cropId) => request(`/farms/crops/${cropId}`, { method: 'DELETE' }),

  // Crop Issues & Diagnosis
  getIssues: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/issues${qs ? `?${qs}` : ''}`);
  },
  reportIssue: (issueData) => request('/issues', { method: 'POST', body: JSON.stringify(issueData) }),
  getIssueById: (id) => request(`/issues/${id}`),
  submitExpertReview: (id, reviewData) => request(`/issues/${id}/review`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  updateIssueStatus: (id, status) => request(`/issues/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Village Center Services & Bookings
  getServices: (category) => request(`/services${category ? `?category=${category}` : ''}`),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  bookService: (bookingData) => request('/services/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getBookings: () => request('/services/bookings'),
  updateBookingStatus: (id, status, staffNotes) => request(`/services/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, staff_notes: staffNotes }) }),
  getSoilHealthRecords: () => request('/services/soil-health'),
  addSoilTest: (data) => request('/services/soil-health', { method: 'POST', body: JSON.stringify(data) }),

  // Government Schemes
  getSchemes: (level, category) => {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (category) params.append('category', category);
    return request(`/schemes${params.toString() ? `?${params.toString()}` : ''}`);
  },
  checkEligibility: (criteria) => request('/schemes/check-eligibility', { method: 'POST', body: JSON.stringify(criteria) }),
  applyScheme: (appData) => request('/schemes/apply', { method: 'POST', body: JSON.stringify(appData) }),
  getApplications: () => request('/schemes/applications'),
  verifyApplication: (id, status, notes) => request(`/schemes/applications/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status, verification_notes: notes }) }),

  // Mandi Market Prices
  getMarketPrices: (state, commodity, search) => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (commodity) params.append('commodity', commodity);
    if (search) params.append('search', search);
    return request(`/market${params.toString() ? `?${params.toString()}` : ''}`);
  },

  // Weather & Spray Advisor
  getWeatherForecast: (zone, lat, lon) => {
    const params = new URLSearchParams();
    if (zone) params.append('zone', zone);
    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    return request(`/weather/forecast${params.toString() ? `?${params.toString()}` : ''}`);
  },

  // Farm Finances
  getFinances: (farmId, cropId) => {
    const params = new URLSearchParams();
    if (farmId) params.append('farm_id', farmId);
    if (cropId) params.append('crop_id', cropId);
    return request(`/finances${params.toString() ? `?${params.toString()}` : ''}`);
  },
  logFinance: (data) => request('/finances', { method: 'POST', body: JSON.stringify(data) }),
  deleteFinance: (id) => request(`/finances/${id}`, { method: 'DELETE' }),

  // Admin & Alerts
  getAdminStats: () => request('/admin/stats'),
  getUsers: (role) => request(`/admin/users${role ? `?role=${role}` : ''}`),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getAlerts: (district) => request(`/admin/alerts${district ? `?district=${district}` : ''}`),
  broadcastAlert: (data) => request('/admin/alerts', { method: 'POST', body: JSON.stringify(data) }),
  deleteAlert: (id) => request(`/admin/alerts/${id}`, { method: 'DELETE' })
};
