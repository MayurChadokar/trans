import { apiClient } from './apiClient'

export async function getTransportStats() {
  const { data } = await apiClient.get('/transport/stats')
  return data
}

export async function getVehicles() {
  const { data } = await apiClient.get('/transport/vehicles')
  return data
}

export async function createVehicle(vehicleData) {
  const { data } = await apiClient.post('/transport/vehicles', vehicleData)
  return data
}

export async function updateVehicle(id, vehicleData) {
  const { data } = await apiClient.patch(`/transport/vehicles/${id}`, vehicleData)
  return data
}

export async function getTrips() {
  const { data } = await apiClient.get('/transport/trips')
  return data
}

export async function createTrip(tripData) {
  const { data } = await apiClient.post('/transport/trips', tripData)
  return data
}

export async function updateTrip(id, tripData) {
  const { data } = await apiClient.patch(`/transport/trips/${id}`, tripData)
  return data
}

export async function deleteTrip(id) {
  const { data } = await apiClient.delete(`/transport/trips/${id}`)
  return data
}
