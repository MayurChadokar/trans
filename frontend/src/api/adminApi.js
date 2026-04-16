import { apiClient } from './apiClient';

// Dashboard & Stats
export async function getAdminDashboardStats(mode = '') {
  const { data } = await apiClient.get(`/admin/dashboard/stats?mode=${mode}`);
  return data;
}

export async function getAdminRecentActivity() {
  const { data } = await apiClient.get('/admin/dashboard/activity');
  return data;
}

// User Management (Renamed to match UserManagement.jsx imports)
export async function adminListUsers({ role = '', q = '' } = {}) {
  const { data } = await apiClient.get(`/admin/users?role=${role}&q=${q}`);
  return data;
}

export async function adminCreateUser(userData) {
  const { data } = await apiClient.post('/admin/users', userData);
  return data;
}

export async function adminUpdateUser(id, patch) {
  const { data } = await apiClient.patch(`/admin/users/${id}`, patch);
  return data;
}

export async function adminDeleteUser(id) {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
}

export async function getAdminUserHistory(id) {
  const { data } = await apiClient.get(`/admin/users/${id}/history`);
  return data;
}

// Transport Oversight
export async function getAdminTransportBills(mode = 'transport') {
  const { data } = await apiClient.get(`/admin/transport/bills?mode=${mode}`);
  return data;
}

export async function getAdminTransportFleet() {
  const { data } = await apiClient.get('/admin/transport/fleet');
  return data;
}

export async function getAdminTransportAnalytics() {
  const { data } = await apiClient.get('/admin/transport/analytics');
  return data;
}

// Global Software Sales
export async function getAdminSales() {
  const { data } = await apiClient.get('/admin/sales');
  return data;
}

export async function createAdminSale(payload) {
  const { data } = await apiClient.post('/admin/sales', payload);
  return data;
}

export async function addAdminSalePayment(id, payload) {
  const { data } = await apiClient.patch(`/admin/sales/${id}/payment`, payload);
  return data;
}

// Garage/Workshop Oversight
export async function getAdminGarageStats() {
  const { data } = await apiClient.get('/admin/garage/stats');
  return data;
}

export async function getAdminWorkshops() {
  const { data } = await apiClient.get('/admin/garage/workshops');
  return data;
}

export async function getAdminAllBills() {
  const { data } = await apiClient.get('/admin/garage/bills');
  return data;
}

// Global Trip History Logs
export async function getAdminTripHistory(params = {}) {
  const { data } = await apiClient.get('/admin/transport/trips', { params });
  return data;
}

// Global Subscription Plans
export async function getAdminPlans(target = '') {
  const { data } = await apiClient.get(`/admin/plans?target=${target}`);
  return data;
}

export async function createAdminPlan(payload) {
  const { data } = await apiClient.post('/admin/plans', payload);
  return data;
}

export async function updateAdminPlan(id, payload) {
  const { data } = await apiClient.patch(`/admin/plans/${id}`, payload);
  return data;
}

export async function deleteAdminPlan(id) {
  const { data } = await apiClient.delete(`/admin/plans/${id}`);
  return data;
}

// Global Specialized Users (Drivers, Mechanics, Staff)
export async function getAdminSpecialUsers(params = {}) {
  const { data } = await apiClient.get('/admin/special', { params });
  return data;
}

export async function createAdminSpecialUser(payload) {
  const { data } = await apiClient.post('/admin/special', payload);
  return data;
}

export async function updateAdminSpecialUser(id, payload) {
  const { data } = await apiClient.patch(`/admin/special/${id}`, payload);
  return data;
}

export async function deleteAdminSpecialUser(id) {
  const { data } = await apiClient.delete(`/admin/special/${id}`);
  return data;
}
