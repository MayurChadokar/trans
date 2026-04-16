import { apiClient } from './apiClient'

export async function getProfile() {
  const { data } = await apiClient.get('/profile')
  return data
}

export async function updateProfile(payload) {
  const isFormData = payload instanceof FormData
  const endpoint = isFormData ? '/profile/business' : '/profile'
  const { data } = await apiClient.patch(endpoint, payload, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    }
  })
  return data
}
