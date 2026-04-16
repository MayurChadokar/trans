import { apiClient } from './apiClient'

// ── Shared bill endpoint (single POST handles both types via billType field) ──

export async function createBill(billData) {
  const { data } = await apiClient.post('/bills', billData)
  return data
}

export async function createTransportBill(billData) {
  const { data } = await apiClient.post('/bills', { ...billData, billType: 'transport' })
  return data
}

export async function createGarageBill(billData) {
  const { data } = await apiClient.post('/bills', { ...billData, billType: 'garage' })
  return data
}

export async function getBills() {
  const { data } = await apiClient.get('/bills')
  return data
}

export async function getBillDetail(id) {
  const { data } = await apiClient.get(`/bills/${id}`)
  return data
}

export async function getDrafts() {
  const { data } = await apiClient.get('/bills/drafts')
  return data
}

export async function updateBill(id, billData) {
  const { data } = await apiClient.patch(`/bills/${id}`, billData)
  return data
}

export async function deleteBillApi(id) {
  const { data } = await apiClient.delete(`/bills/${id}`)
  return data
}
