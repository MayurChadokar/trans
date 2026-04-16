import { apiClient } from './apiClient'

export async function sendOtp(phone) {
  const { data } = await apiClient.post('/auth/send-otp', { phone })
  return data
}

export async function verifyOtp(phone, otp) {
  const { data } = await apiClient.post('/auth/verify-otp', { phone, otp })
  return data
}

export async function setUserRole(phone, role) {
  const { data } = await apiClient.post('/auth/set-role', { phone, role })
  return data
}

export async function updateUserProfile(phone, profile) {
  const { data } = await apiClient.post('/auth/update-profile', { phone, ...profile })
  return data
}

export async function transportRegister(profile) {
  const { data } = await apiClient.post('/auth/register-transport', profile)
  return data
}

export async function garageRegister(profile) {
  const { data } = await apiClient.post('/auth/register-garage', profile)
  return data
}

export async function getMe() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  const endpoint = isAdmin ? '/admin/auth/me' : '/auth/me'
  const { data } = await apiClient.get(endpoint)
  return data
}

export async function logoutApi() {
  const { data } = await apiClient.post('/auth/logout')
  return data
}

export async function adminLogin(email, password) {
  const { data } = await apiClient.post('/admin/auth/login', { email, password })
  return data
}

export async function adminVerifyOtp(email, otp) {
  const { data } = await apiClient.post('/admin/auth/verify-otp', { email, otp })
  return data
}

export async function adminLogoutApi() {
  const { data } = await apiClient.post('/admin/auth/logout')
  return data
}

