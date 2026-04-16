import axios from 'axios'

export async function uploadSingleFile(file, { folder = 'trans' } = {}) {
  if (!file) return null
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)

  const token = localStorage.getItem('access_token')
  const baseURL = import.meta.env.VITE_API_BASE_URL

  const { data } = await axios.post(`${baseURL}/uploads/single`, form, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  })
  return data
}

