import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getVehicles, createVehicle, updateVehicle } from '../api/transportApi'
import { getGarageVehicles, addGarageVehicle, deleteGarageVehicle } from '../api/garageApi'

const VehicleContext = createContext(null)

export function VehicleProvider({ children }) {
  const { user, isGarage } = useAuth()
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      if (!user?.role) return
      try {
        const res = isGarage ? await getGarageVehicles() : await getVehicles()
        if (res.success) {
          setVehicles(res.vehicles.map(v => ({ ...v, id: v._id || v.id })))
        }
      } catch (e) {
        console.error('Failed to load vehicles:', e.message)
      }
    }
    load()
  }, [user, isGarage])

  const addVehicle = useCallback(async (data) => {
    try {
      const res = isGarage ? await addGarageVehicle(data) : await createVehicle(data)
      if (res.success) {
        const normalized = { ...res.vehicle, id: res.vehicle._id || res.vehicle.id }
        setVehicles(prev => [normalized, ...prev])
        return normalized
      }
    } catch (e) {
      console.error('Add vehicle failed:', e.message)
    }
  }, [isGarage])

  const deleteVehicleInDb = useCallback(async (id) => {
    try {
      const res = isGarage ? await deleteGarageVehicle(id) : { success: false } // transport delete not yet implemented
      if (res.success) {
        setVehicles(prev => prev.filter(v => v.id !== id && v._id !== id))
      }
    } catch (e) {
      console.error('Delete vehicle failed:', e.message)
    }
  }, [isGarage])

  const updateVehicleInDb = useCallback(async (id, data) => {
    try {
      const res = await updateVehicle(id, data)
      if (res.success) {
        const normalized = { ...res.vehicle, id: res.vehicle._id || res.vehicle.id }
        setVehicles(prev => prev.map(v => (v._id === id || v.id === id) ? normalized : v))
      }
    } catch (e) {
      console.error('Update vehicle failed:', e.message)
    }
  }, [])

  return (
    <VehicleContext.Provider value={{ vehicles, addVehicle, updateVehicle: updateVehicleInDb, deleteVehicle: deleteVehicleInDb }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicles() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicles must be inside <VehicleProvider>')
  return ctx
}
