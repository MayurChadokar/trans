import { apiClient } from './apiClient'

export async function getFinanceStats() {
  const { data } = await apiClient.get('/finance/stats')
  return data
}

export async function getTransactions() {
  const { data } = await apiClient.get('/finance')
  return data
}

export async function addTransaction(txData) {
  const { data } = await apiClient.post('/finance', txData)
  return data
}
