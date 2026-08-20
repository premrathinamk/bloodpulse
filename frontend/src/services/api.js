const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchDonors({ bloodGroup = '', locality = '', compatible = false } = {}) {
  const params = new URLSearchParams();
  if (bloodGroup && bloodGroup !== 'Any Blood Group') {
    params.append('bloodGroup', bloodGroup);
  }
  if (locality && locality.trim()) {
    params.append('locality', locality.trim());
  }
  if (compatible) {
    params.append('compatible', 'true');
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/donors${queryString}`);
  if (!res.ok) throw new Error('Failed to fetch donors');
  return res.json();
}

export async function fetchMyDonorProfile(userEmail) {
  if (!userEmail) return { success: false, exists: false };
  const res = await fetch(`${API_BASE}/donors/me?email=${encodeURIComponent(userEmail)}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function registerDonor(donorData) {
  const res = await fetch(`${API_BASE}/donors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donorData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to register donor');
  return data;
}

export async function updateDonorProfile(id, donorData, userEmail) {
  const res = await fetch(`${API_BASE}/donors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail
    },
    body: JSON.stringify({ ...donorData, userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update donor profile');
  return data;
}

export async function deleteMyDonorProfile(id, userEmail) {
  const res = await fetch(`${API_BASE}/donors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail
    },
    body: JSON.stringify({ userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete donor profile');
  return data;
}

export async function requestDonorContact(donorId, requesterData = {}) {
  const res = await fetch(`${API_BASE}/donors/${donorId}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requesterData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to request contact');
  return data;
}

export async function fetchSosAlerts() {
  const res = await fetch(`${API_BASE}/sos`);
  if (!res.ok) throw new Error('Failed to fetch SOS alerts');
  return res.json();
}

export async function broadcastEmergencySos(sosData) {
  const res = await fetch(`${API_BASE}/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sosData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to broadcast SOS');
  return data;
}

export async function updateSosAlert(id, sosData, userEmail) {
  const res = await fetch(`${API_BASE}/sos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...sosData, userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update SOS alert');
  return data;
}

export async function deleteSosAlert(id, userEmail) {
  const res = await fetch(`${API_BASE}/sos/${id}?userEmail=${encodeURIComponent(userEmail || '')}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete SOS alert');
  return data;
}

export async function fetchBloodRequests() {
  const res = await fetch(`${API_BASE}/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}

export async function createBloodRequest(requestData) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create blood request');
  return data;
}

export async function updateBloodRequest(id, requestData, userEmail) {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...requestData, userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update blood request');
  return data;
}

export async function deleteBloodRequest(id, userEmail) {
  const res = await fetch(`${API_BASE}/requests/${id}?userEmail=${encodeURIComponent(userEmail || '')}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete blood request');
  return data;
}

// 🔐 Authentication & OTP Verification Services
export async function sendOtp(email, fullName = '', password = '') {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fullName, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send OTP email');
  return data;
}

export async function verifyOtp({ email, otp, fullName = '', role = 'DONOR', password = '' }) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, fullName, role, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Verification failed');
  return data;
}

export async function loginUser(email, password = '') {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

// 🛡️ Admin Console Services
export async function fetchAdminData(adminEmail) {
  const res = await fetch(`${API_BASE}/admin/data`, {
    headers: {
      'x-admin-email': adminEmail
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load admin console data');
  return data;
}

export async function deleteDonorById(id, adminEmail) {
  const res = await fetch(`${API_BASE}/admin/donors/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-email': adminEmail
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete donor');
  return data;
}

export async function deleteSosAlertById(id, adminEmail) {
  const res = await fetch(`${API_BASE}/admin/sos/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-email': adminEmail
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete SOS alert');
  return data;
}

export async function deleteBloodRequestById(id, adminEmail) {
  const res = await fetch(`${API_BASE}/admin/requests/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-email': adminEmail
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete request');
  return data;
}
