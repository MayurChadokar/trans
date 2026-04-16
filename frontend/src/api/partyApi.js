import { apiClient } from './apiClient'

export async function getParties() {
  const { data } = await apiClient.get('/parties')
  return data
}

export async function createParty(partyData) {
  const { data } = await apiClient.post('/parties', partyData)
  return data
}

export async function updateParty(id, partyData) {
  const { data } = await apiClient.patch(`/parties/${id}`, partyData)
  return data
}

export async function deleteParty(id) {
  const { data } = await apiClient.delete(`/parties/${id}`)
  return data
}
