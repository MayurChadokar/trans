import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Truck, MapPin, Plus, Calendar, Trash2, 
  Search, ArrowLeft, Loader2, CheckCircle2,
  Navigation, Hash, ArrowRight, Camera, Image as ImageIcon, X, Eye, Upload,
  FileText, User, ExternalLink, CreditCard
} from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { useParties } from '../../context/PartyContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { uploadSingleFile } from '../../api/uploadApi'
import { getTrips, createTrip, updateTrip, deleteTrip as deleteTripApi } from '../../api/transportApi'
import { getDrafts as getDraftsApi, createBill, updateBill as updateBillApi } from '../../api/billApi'

// UI Components
const JourneyDetailModal = ({ isOpen, onClose, trip, onDeleteLeg }) => {
  if (!isOpen || !trip) return null;
  const legs = trip.rawLegs || [];
  
  return (
    <div className="preview-modal" onClick={onClose}>
      <div className="modal-content journey-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Journey Breakdown</h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{legs.length} Continuous Legs</span>
          </div>
          <button className="close-preview-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="legs-list-container">
          {legs.map((leg, i) => (
            <div key={leg._id || i} className="leg-item">
              <div className="leg-marker">
                <div className="marker-dot"></div>
                {i < legs.length - 1 && <div className="marker-line"></div>}
              </div>
              <div className="leg-content">
                <div className="leg-route">
                  {leg.source} <ArrowRight size={12} /> {leg.destination}
                </div>
                <div className="leg-meta">
                  <span>₹{parseFloat(leg.amount).toLocaleString()}</span>
                  {leg.extraCharges > 0 && <span style={{ color: '#D97706' }}>+₹{leg.extraCharges}</span>}
                  {leg.returnCharges > 0 && <span style={{ color: '#047857' }}>+₹{leg.returnCharges} (Ret)</span>}
                  <span>•</span>
                  <span>{leg.chalanNumber || dayjs(leg.startDate).format('DD MMM')}</span>
                </div>
              </div>
              <button className="leg-delete-btn" onClick={() => onDeleteLeg(leg._id || leg.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        
        <div className="journey-summary-footer">
          <div className="summary-item">
            <span className="label">Total Amount</span>
            <span className="value">₹{trip.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TripManagement() {
  const { vehicles } = useVehicles()
  const { parties } = useParties()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedJourney, setSelectedJourney] = useState(null)
  
  // Local state for trips (since "no backend changes" requested)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Photo states
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  
  // Selection & Billing
  const [selectedIds, setSelectedIds] = useState([])
  const [drafts, setDrafts] = useState([])
  const [showDraftSelect, setShowDraftSelect] = useState(false)
  const [isBilling, setIsBilling] = useState(false)
  const [billingMode, setBillingMode] = useState(false)
  const [expandedParties, setExpandedParties] = useState([])
  const [search, setSearch] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    startDate: dayjs().format('YYYY-MM-DD'),
    vehicleId: '',
    partyId: '',
    groupId: null, // Link to existing journey
    source: '',
    destination: '',
    numberOfTrips: '1',
    amount: '',
    chalanNumber: '',
    extraCharges: '',
    returnCharges: '',
    isCompleted: true,
    reason: '',
    deliveries: [{ from: '', to: '' }]
  })

  // Load trips from API
  // Filter & Search Logic
  const filteredTrips = useMemo(() => {
    const groups = {}
    trips.forEach(t => {
      const from = t.source || t.fromLocation || ''
      const to = t.destination || t.toLocation || ''
      const d = t.startDate || t.date || ''
      const vId = typeof t.vehicle === 'object' ? t.vehicle?._id : t.vehicle
      const pId = typeof t.party === 'object' ? t.party?._id : t.party

      const key = t.groupId || `${d}_${vId}_${pId}`
      if (!groups[key]) groups[key] = []
      groups[key].push({ ...t, fromLocation: from, toLocation: to, date: d, vehicleId: vId, partyId: pId })
    })

    const grouped = Object.values(groups).map(group => {
      const sorted = [...group].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      let displayFrom = sorted[0].fromLocation
      let displayTo = sorted[0].toLocation
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i-1]; const curr = sorted[i];
        if (curr.fromLocation.toLowerCase().trim() === prev.toLocation.toLowerCase().trim()) {
           displayTo += ` + ${curr.toLocation}`
        } else {
           displayTo += ` + ${curr.fromLocation} to ${curr.toLocation}`
        }
      }
      const totalAmount = sorted.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      const totalCount = sorted.reduce((sum, t) => sum + (parseInt(t.numberOfTrips) || 1), 0)
      
      // Aggregate all charge types
      const totalExtra = sorted.reduce((sum, t) => sum + (parseFloat(t.extraCharges) || 0), 0)
      const totalReturn = sorted.reduce((sum, t) => sum + (parseFloat(t.returnCharges) || 0), 0)
      const anyIncomplete = sorted.some(t => t.isCompleted === false)
      const reasons = sorted.map(t => t.reason).filter(Boolean)

      const chalanNums = [...new Set(sorted.map(t => t.chalanNumber).filter(Boolean))].join(', ')
      const allBilled = sorted.every(t => t.billed)
      const photo = sorted.find(t => t.chalanImage)?.chalanImage || null
      let sequence = []
      if (sorted.length > 0) {
        sequence.push(sorted[0].fromLocation)
        sorted.forEach((t, i) => {
          if (i > 0 && t.fromLocation !== sorted[i-1].toLocation) sequence.push(t.fromLocation)
          sequence.push(t.toLocation)
        })
      }
      return {
        ...sorted[0], id: sorted.map(t => t._id || t.id).join(','), 
        amount: totalAmount, numberOfTrips: totalCount, extraCharges: totalExtra,
        returnCharges: totalReturn, isCompleted: !anyIncomplete, reasons,
        chalanNumber: chalanNums, routePoints: sequence, rawLegs: sorted,
        fromLocation: displayFrom, toLocation: displayTo, billed: allBilled,
        chalanImage: photo, memberIds: sorted.map(s => s._id || s.id), groupId: sorted[0].groupId
      }
    })

    if (!search) return grouped
    const s = search.toLowerCase()
    return grouped.filter(t => 
      t.fromLocation.toLowerCase().includes(s) || t.toLocation.toLowerCase().includes(s) ||
      (t.vehicle?.vehicleNumber || t.vehicleNumber || '').toLowerCase().includes(s) ||
      (t.party?.name || t.partyName || '').toLowerCase().includes(s) ||
      (t.party?.phone || '').toLowerCase().includes(s)
    )
  }, [trips, search])
  
  const filteredByParty = useMemo(() => {
    let list = filteredTrips
    if (billingMode) list = list.filter(t => !t.billed && !t.billId)
    const groups = {}
    list.forEach(t => {
      const pId = t.party?._id || t.partyId || 'none'
      const pName = t.party?.name || 'Uncategorized'
      if (!groups[pId]) groups[pId] = { id: pId, name: pName, trips: [], totalPending: 0 }
      groups[pId].trips.push(t)
      if (!t.billed && !t.billId) {
        const tExtras = (parseFloat(t.extraCharges) || 0) + (parseFloat(t.returnCharges) || 0)
        groups[pId].totalPending += (parseFloat(t.amount) || 0) + tExtras
      }
    })
    return Object.values(groups).sort((a,b) => {
      const dateA = new Date(a.trips?.[0]?.startDate || a.trips?.[0]?.date || 0);
      const dateB = new Date(b.trips?.[0]?.startDate || b.trips?.[0]?.date || 0);
      return dateB - dateA;
    })
  }, [filteredTrips, billingMode])

  const loadTrips = async () => {
    try {
      const res = await getTrips()
      if (res.success) setTrips(res.trips)
    } catch (e) {
      console.error("Failed to load trips", e)
    } finally {
      setLoading(false)
    }
  }

  const loadDrafts = async () => {
    try {
      const res = await getDraftsApi()
      if (res.success) setDrafts(res.drafts)
    } catch (e) {
      console.error("Failed to load drafts", e)
    }
  }

  useEffect(() => {
    loadTrips()
    loadDrafts()
  }, [])

  useEffect(() => {
    if (filteredByParty.length > 0 && expandedParties.length === 0) {
      setExpandedParties([filteredByParty[0].id])
    }
  }, [filteredByParty])

  const handleBulkAddToDraft = async (draftId = null, forceStatus = 'draft') => {
    if (selectedIds.length === 0) return
    setIsBilling(true)
    try {
      // Flatten joined IDs (from grouped trips) into a list of individual IDs
      const allIndividualIds = selectedIds.flatMap(id => id.split(','));
      const selectedTripDocs = trips.filter(t => allIndividualIds.includes(t._id || t.id))
      
      if (selectedTripDocs.length === 0) {
        alert("No trips found for selection.");
        setIsBilling(false);
        return;
      }

      const firstTrip = selectedTripDocs[0]
      const partyObj = firstTrip.party
      const partyId = partyObj?._id || partyObj
      
      const uniqueParties = [...new Set(selectedTripDocs.map(t => (t.party?._id || t.party)))]
      if (uniqueParties.length > 1) {
        alert("Please select trips for the same Party/Account to group them in one bill.")
        setIsBilling(false)
        return
      }

      // Build List-Wise Items
      const billItems = []
      selectedTripDocs.forEach(trip => {
        const date = dayjs(trip.startDate).format('YYYY-MM-DD')
        const chalanNo = trip.chalanNumber || ''
        const tExtras = (parseFloat(trip.extraCharges) || 0) + (parseFloat(trip.returnCharges) || 0)
        
        // Robust vehicle number retrieval
        const tripVehicleId = trip.vehicle?._id || trip.vehicle;
        const vNumDoc = trip.vehicle?.vehicleNumber || trip.vehicleNumber;
        const vObj = vehicles.find(v => (v._id || v.id) === tripVehicleId);
        const vNum = vNumDoc || vObj?.vehicleNumber || '—';
        
        if (trip.deliveries && trip.deliveries.length > 0) {
          trip.deliveries.forEach((del, idx) => {
            billItems.push({
              date,
              companyFrom: del.from,
              companyTo: del.to,
              chalanNo,
              tempoNo: vNum,
              extraAmount: idx === 0 ? tExtras.toString() : '0',
              amount: idx === 0 ? (parseFloat(trip.amount)).toString() : '0',
              tripIds: [trip._id || trip.id]
            })
          })
        } else {
          billItems.push({
            date,
            companyFrom: trip.source || trip.fromLocation,
            companyTo: trip.destination || trip.toLocation,
            chalanNo,
            tempoNo: vNum,
            extraAmount: tExtras.toString(),
            amount: (parseFloat(trip.amount)).toString(),
            tripIds: [trip._id || trip.id]
          })
        }
      })

      let finalBill;
      if (draftId) {
        const draft = drafts.find(d => d._id === draftId)
        finalBill = await updateBillApi(draftId, { 
          trips: [...(draft.trips || []), ...selectedIds],
          items: [...(draft.items || []), ...billItems]
        })
      } else {
        finalBill = await createBill({
          party: partyId,
          billedToName: partyObj?.name,
          billedToPhone: partyObj?.phone,
          billedToEmail: partyObj?.email,
          billedToAddress: partyObj?.address,
          billedToCity: partyObj?.city,
          billedToState: partyObj?.state,
          billedToPincode: partyObj?.pincode,
          billedToGstin: partyObj?.gstin,
          billedToPan: partyObj?.pan,
          billType: 'transport',
          status: forceStatus,
          trips: allIndividualIds,
          items: billItems
        })
      }
      
      // alert("Trips added to bill successfully!")
      const billUrlId = finalBill?.bill?._id || finalBill?.bill?.id || finalBill?._id || finalBill?.id
      if (billUrlId) navigate(`/bills/${billUrlId}`)
      
      setSelectedIds([])
      setShowDraftSelect(false)
      loadTrips()
      loadDrafts()
    } catch (e) {
      console.error(e)
      alert("Failed to update bill")
    } finally {
      setIsBilling(false)
    }
  }

  const toggleTripSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleAddLeg = (trip) => {
    // Scroll to top and open form
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowForm(true)
    
    // Pre-fill with previous leg's data
    setFormData({
      startDate: dayjs(trip.startDate).format('YYYY-MM-DD'),
      vehicleId: trip.vehicle?._id || trip.vehicle,
      partyId: trip.party?._id || trip.party,
      groupId: trip.groupId, // Link to this specific journey
      source: trip.destination || trip.toLocation,
      destination: '',
      numberOfTrips: 1,
      amount: '',
      chalanNumber: '',
      loadingCharge: '',
      unloadingCharge: '',
      detentionCharge: '',
      otherCharge: '',
      deliveries: [{ from: trip.destination || trip.toLocation, to: '' }]
    })
  }

  const handleAddTrip = async (e) => {
    e.preventDefault()
    
    // Detailed validation
    if (!formData.startDate) return alert("Please select a Date")
    if (!formData.vehicleId) return alert("Please select a Vehicle")
    if (!formData.partyId) return alert("Please select an Account/Party")
    if (!formData.source) return alert("Please enter the Starting Location (From)")
    if (!formData.destination) return alert("Please enter the Destination (To)")
    if (!formData.amount) return alert("Please enter the Trip Amount (₹)")

    const payload = {
      ...formData,
      vehicle: formData.vehicleId,
      party: formData.partyId,
      numberOfTrips: parseInt(formData.numberOfTrips) || 1,
      amount: parseFloat(formData.amount),
      extraCharges: parseFloat(formData.extraCharges) || 0,
      returnCharges: parseFloat(formData.returnCharges) || 0,
      isCompleted: formData.isCompleted,
      reason: formData.reason,
      deliveries: formData.deliveries.slice(0, parseInt(formData.numberOfTrips) || 1)
    }

    try {
      const res = await createTrip(payload)
      if (res.success) {
        setTrips(prev => [res.trip, ...prev])
        setShowForm(false)
        setFormData({
          startDate: dayjs().format('YYYY-MM-DD'),
          vehicleId: '',
          partyId: '',
          groupId: null,
          source: '',
          destination: '',
          numberOfTrips: '1',
          amount: '',
          chalanNumber: '',
          extraCharges: '',
          returnCharges: '',
          isCompleted: true,
          reason: '',
          deliveries: [{ from: '', to: '' }]
        })
      } else {
        alert(res.message || "Failed to save trip")
      }
    } catch (e) {
      console.error("Save trip error:", e)
      alert(e.response?.data?.message || "Something went wrong while saving the trip")
    }
  }

  const handleDelete = async (id) => {
    const idsToDelete = id.split(',')
    const msg = idsToDelete.length > 1 
      ? `Delete this entire journey (${idsToDelete.length} legs)?` 
      : 'Delete this trip record?'
      
    if (window.confirm(msg)) {
       try {
         await Promise.all(idsToDelete.map(tid => deleteTripApi(tid)))
         setTrips(prev => prev.filter(t => !idsToDelete.includes(t._id || t.id)))
       } catch (e) {
         alert('Delete failed')
       }
    }
  }

  // Photo handlers
  const handlePhotoCapture = (tripId) => {
    setSelectedTripId(tripId)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const folder = 'trans/chalan'
      const up = await uploadSingleFile(file, { folder })
      const url = up?.url || null
      const selectedIds = selectedTripId.split(',')
      
      await Promise.all(selectedIds.map(tid => updateTrip(tid, { chalanImage: url })))
      
      setTrips(prev => prev.map(t =>
        selectedIds.includes(t._id || t.id) ? { ...t, chalanImage: url } : t
      ))
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally {
      setSelectedTripId(null)
      e.target.value = ''
    }
  }

  const removePhoto = async (e, tripId) => {
    e.stopPropagation()
    const idsToRemove = tripId.split(',')
    if (window.confirm("Remove this Chalan photo?")) {
      try {
        await Promise.all(idsToRemove.map(tid => updateTrip(tid, { chalanImage: null })))
        setTrips(prev => prev.map(t => 
          idsToRemove.includes(t._id || t.id) ? { ...t, chalanImage: null } : t
        ))
      } catch (e) {
        alert('Update failed')
      }
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn trip-mgmt-container">
      
      {/* Header section */}
      <div className="trip-header">
        <div className="trip-header-info">
          <h1 className="trip-title">Detailed Trip Management</h1>
          <p className="trip-subtitle">Track and manage route-wise operations</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.open('https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollectionMainOnline.xhtml#', '_blank')}
            className="btn btn-ghost"
            title="Redirects to official government portal for tax payment"
            style={{ height: 44, borderRadius: 12, padding: '0 14px', fontWeight: 700, fontSize: '0.8rem', border: '1.5px solid #FDE68A', background: '#FFFBEB', color: '#B45309', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ExternalLink size={15} /> Pay Checkpost Tax
          </button>
          <button onClick={() => navigate('/bills/new?type=transport')} className="btn btn-ghost" style={{ height: 44, borderRadius: 12, padding: '0 16px', fontWeight: 700, fontSize: '0.875rem', border: '1.5px solid #F1F5F9' }}>
            <FileText size={18} /> Generate Bill
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary add-trip-btn">
            {showForm ? <><ArrowLeft size={18} /> Cancel</> : <><Plus size={18} /> Log New Trip</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <button 
          onClick={() => setBillingMode(false)}
          style={{ 
            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: !billingMode ? '#0F0D2E' : '#F3F4F6',
            color: !billingMode ? 'white' : '#6B7280',
            fontWeight: 700, fontSize: '0.8rem', transition: '0.2s'
          }}
        >All Activity</button>
        <button 
          onClick={() => setBillingMode(true)}
          style={{ 
            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: billingMode ? '#0F0D2E' : '#F3F4F6',
            color: billingMode ? 'white' : '#6B7280',
            fontWeight: 700, fontSize: '0.8rem', transition: '0.2s',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <CreditCard size={14} /> Unbilled Trips
        </button>
      </div>

      {/* Stats row */}
      {!showForm && (
        <div className="stats-grid-compact">
          <div className="stat-card">
            <div className="stat-label">Total Trips</div>
            <div className="stat-value">{trips.length}</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Pending Trips</div>
            <div className="stat-value">{trips.filter(t => !t.billed).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Billed Trips</div>
            <div className="stat-value">{trips.filter(t => t.billed).length}</div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="animate-fadeInUp trip-form-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Navigation size={22} color="var(--primary)" /> Add Trip Details
          </h2>
          <form onSubmit={handleAddTrip} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} className="form-input" required>
                  <option value="">— Select —</option>
                  {vehicles.map(v => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.vehicleNumber} {v.tripCount > 0 ? `(${v.tripCount} trips)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Account / Party</label>
              <select value={formData.partyId} onChange={e => setFormData({...formData, partyId: e.target.value})} className="form-input" required>
                <option value="">— Select Account —</option>
                {parties.map(p => {
                  const pId = p._id || p.id
                  const pendingCount = trips.filter(t => {
                    const tpId = t.party?._id || t.party
                    return tpId === pId && !t.billed
                  }).length
                  return <option key={pId} value={pId}>{p.name} {pendingCount > 0 ? `(${pendingCount} pending)` : ''}</option>
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Number of Deliveries</label>
                <select 
                  value={formData.numberOfTrips} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    const newDeliveries = [...formData.deliveries];
                    while(newDeliveries.length < val) newDeliveries.push({ from: '', to: '' });
                    setFormData({...formData, numberOfTrips: e.target.value, deliveries: newDeliveries});
                  }} 
                  className="form-input"
                >
                  <option value="1">1 Delivery</option>
                  <option value="2">2 Deliveries</option>
                  <option value="3">3 Deliveries</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1500" className="form-input" />
              </div>
            </div>

            {/* Dynamic Delivery Locations */}
            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Delivery Locations</span>
              {Array.from({ length: parseInt(formData.numberOfTrips) || 1 }).map((_, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      value={formData.deliveries[idx]?.from || ''} 
                      onChange={e => {
                        const newD = [...formData.deliveries];
                        newD[idx] = { ...newD[idx], from: e.target.value };
                        const update = { deliveries: newD };
                        if(idx === 0) update.source = e.target.value;
                        setFormData({...formData, ...update});
                      }} 
                      placeholder={`From Location ${idx + 1}`} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      value={formData.deliveries[idx]?.to || ''} 
                      onChange={e => {
                        const newD = [...formData.deliveries];
                        newD[idx] = { ...newD[idx], to: e.target.value };
                        const update = { deliveries: newD };
                        if(idx === (parseInt(formData.numberOfTrips) - 1)) update.destination = e.target.value;
                        setFormData({...formData, ...update});
                      }} 
                      placeholder={`To Location ${idx + 1}`} 
                      className="form-input" 
                      required 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Challan Number</label>
                <input value={formData.chalanNumber} onChange={e => setFormData({...formData, chalanNumber: e.target.value})} placeholder="CH-123456" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: !formData.isCompleted ? '#DC2626' : '#047857', fontWeight: !formData.isCompleted ? 900 : 700 }}>
                  Return Charge (₹) {!formData.isCompleted && <span style={{ fontSize: '0.6rem' }}>[Required for Unloading]</span>}
                </label>
                <div className="input-group">
                  <span className="input-prefix" style={{ color: !formData.isCompleted ? '#DC2626' : '#047857' }}>₹</span>
                  <input type="number" value={formData.returnCharges} onChange={e => setFormData({...formData, returnCharges: e.target.value})} placeholder="0" className="form-input" style={{ color: !formData.isCompleted ? '#DC2626' : '#047857', fontWeight: 900 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#D97706' }}>Extra Charges (₹)</label>
                <div className="input-group">
                  <span className="input-prefix" style={{ color: '#D97706' }}>₹</span>
                  <input type="number" value={formData.extraCharges} onChange={e => setFormData({...formData, extraCharges: e.target.value})} placeholder="0" className="form-input" style={{ color: '#D97706', fontWeight: 700 }} />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'center' }}>
                <input 
                  type="checkbox" 
                  id="isCompleted"
                  checked={formData.isCompleted} 
                  onChange={e => setFormData({...formData, isCompleted: e.target.checked})} 
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <label htmlFor="isCompleted" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Trip Is Completed</label>
              </div>
            </div>

            {!formData.isCompleted && (
              <div className="form-group animate-fadeIn">
                <label className="form-label" style={{ color: '#DC2626' }}>Reason for Incomplete Trip</label>
                <textarea 
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                  placeholder="Why is the trip incomplete? (e.g. breakdown, returned, etc.)" 
                  className="form-input"
                  style={{ height: 80, resize: 'none' }}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, height: 50, borderRadius: 16, fontWeight: 800 }}>
              Save Trip Record
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="search-container">
            <Search size={20} color="#9CA3AF" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by location, vehicle, party..." 
              className="search-input"
            />
          </div>

          {/* Grouped Trips List */}
          <div className="trips-list">
            {filteredByParty.length > 0 ? filteredByParty.map((group) => (
              <div key={group.id} className={`party-accordion-item ${expandedParties.includes(group.id) ? 'expanded' : ''}`} style={{ marginBottom: 12 }}>
                <div 
                  className="party-accordion-header"
                  onClick={() => setExpandedParties(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '12px 16px', background: 'white', borderRadius: 16, 
                    border: '1.5px solid #F1F5F9', cursor: 'pointer', transition: '0.2s'
                  }}
                >
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                     <div style={{ 
                        width: 36, height: 36, borderRadius: 12, 
                        background: expandedParties.includes(group.id) ? 'var(--primary)' : '#EDE9FE', 
                        color: expandedParties.includes(group.id) ? 'white' : '#7C3AED', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', transition: '0.3s'
                     }}>{group.name[0]}</div>
                     <div>
                       <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F0D2E' }}>{group.name}</h3>
                       <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>{group.trips.length} Journey(s)</p>
                     </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                     {group.totalPending > 0 && (
                       <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#DC2626', background: '#FEE2E2', padding: '4px 12px', borderRadius: 10 }}>
                         ₹{group.totalPending.toLocaleString()}
                       </div>
                     )}
                     <div style={{ transform: expandedParties.includes(group.id) ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s', color: '#94A3B8' }}>
                       <Navigation size={16} />
                     </div>
                   </div>
                </div>
                
                {expandedParties.includes(group.id) && (
                  <div className="party-accordion-content animate-fadeIn" style={{ padding: '12px 4px 4px 4px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {billingMode && (
                      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const pIds = group.trips.filter(t => !t.billed && !t.billId).map(t => t.id);
                            setSelectedIds(prev => {
                              const other = prev.filter(id => !pIds.includes(id));
                              const allSelected = pIds.every(id => prev.includes(id));
                              return allSelected ? other : [...other, ...pIds];
                            });
                          }}
                          style={{ border: 'none', background: '#F5F3FF', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: 8, cursor: 'pointer' }}
                        >
                          {group.trips.filter(t => !t.billed && !t.billId).every(t => selectedIds.includes(t.id)) ? 'Deselect All' : 'Select All for Bill'}
                        </button>
                      </div>
                    )}
                    {group.trips.map((trip) => (
                      <div 
                        key={trip.id} 
                        className={`animate-fadeInUp trip-card-mobile ${selectedIds.includes(trip.id) ? 'selected' : ''} ${(trip.billed || trip.billId) ? 'billed-item' : ''}`} 
                        onClick={() => {
                          const billId = trip.billId || trip.bill?._id || trip.bill;
                          if (billId) {
                            navigate(`/bills/${billId}`);
                          } else {
                            toggleTripSelection(trip.id);
                          }
                        }}
                      >
                        <div className="trip-card-main">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className="trip-route-sequence">
                              {trip.routePoints?.map((point, idx) => (
                                <React.Fragment key={idx}>
                                  <span className="location">{point}</span>
                                  {idx < trip.routePoints.length - 1 && <ArrowRight size={14} className="route-arrow" />}
                                </React.Fragment>
                              ))}
                            </div>
                            {/* Selection Indicator */}
                            {!(trip.billed || trip.billId) && (
                              <div style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedIds.includes(trip.id) ? 'var(--primary)' : 'white' }}>
                                {selectedIds.includes(trip.id) && <CheckCircle2 size={14} color="white" />}
                              </div>
                            )}
                            {(trip.billed || trip.billId) && (
                              <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 800 }}>
                                VIEW <Eye size={14} />
                              </div>
                            )}
                          </div>
                          
                          <div className="trip-meta-grid">
                            <div className="meta-item"><Hash size={12} /> {trip.vehicle?.vehicleNumber || trip.vehicleNumber}</div>
                            <div className="meta-item"><Calendar size={12} /> {dayjs(trip.date).format('DD MMM')}</div>
                            {trip.chalanNumber && <div className="meta-item"><FileText size={12} /> {trip.chalanNumber}</div>}
                            <div className="trip-badge">{trip.numberOfTrips} DELIVERY(S)</div>
                            {(parseFloat(trip.returnCharges) || 0) > 0 && 
                              <div className="trip-badge return" style={{ background: '#D1FAE5', color: '#047857' }}>
                                +₹{(parseFloat(trip.returnCharges)).toLocaleString()} RETURN
                              </div>
                            }
                            {(parseFloat(trip.extraCharges) || 0) > 0 && 
                              <div className="trip-badge extra" style={{ background: '#FEF3C7', color: '#D97706' }}>
                                +₹{(parseFloat(trip.extraCharges)).toLocaleString()} EXTRA
                              </div>
                            }
                            {!trip.isCompleted && (
                              <div className="trip-badge alert" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                INCOMPLETE {trip.reasons?.length > 0 && `(${trip.reasons[0].slice(0, 15)}...)`}
                              </div>
                            )}
                            <div className="billing-status-chip" style={{ 
                              background: trip.billed ? '#DCFCE7' : trip.billId ? '#EEF2FF' : '#FEF3C7',
                              color: trip.billed ? '#16A34A' : trip.billId ? '#4F46E5' : '#D97706'
                            }}>
                              {trip.billed ? 'BILLED' : trip.billId ? 'IN DRAFT' : 'PENDING'}
                            </div>
                          </div>
                        </div>

                        <div className="trip-card-actions" onClick={e => e.stopPropagation()}>
                          <div className="action-left">
                            {trip.chalanImage ? (
                              <div className="chalan-thumb" onClick={() => { setPreviewImage(trip.chalanImage); setIsPreviewOpen(true); }}>
                                <img src={trip.chalanImage} alt="Chalan" />
                                <button className="remove-photo-btn" onClick={(e) => removePhoto(e, trip.id)} aria-label="Remove photo">
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <button className="upload-chalan-btn" onClick={() => handlePhotoCapture(trip.id)}>
                                <Camera size={16} />
                                <span>CHALAN</span>
                              </button>
                            )}
                            {trip.amount && <div className="trip-amount-badge">₹{parseFloat(trip.amount).toLocaleString()}</div>}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedJourney(trip); setIsDetailOpen(true); }}
                              title="View journey breakdown"
                              style={{ height: 34, width: 34, borderRadius: 9, border: '1.5px solid #F1F5F9', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); window.open('https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollectionMainOnline.xhtml#', '_blank'); }}
                              title="Pay checkpost tax for this trip on the official government portal"
                              style={{ height: 34, borderRadius: 9, padding: '0 10px', border: '1.5px solid #FDE68A', background: '#FFFBEB', color: '#B45309', fontWeight: 800, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              <ExternalLink size={12} /> PAY TAX
                            </button>
                            <button className="delete-trip-btn" onClick={() => handleDelete(trip.id)} aria-label="Delete trip">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <div className="empty-state">
                <Truck size={48} className="empty-icon" />
                <div className="empty-title">No trips found</div>
                <p className="empty-subtitle">{billingMode ? 'No unbilled trips found for any party' : 'Start by logging a new trip today'}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Action Bar for Bulk Billing */}
      {selectedIds.length > 0 && (
        <div className="animate-slideUp billing-action-bar">
          <div className="action-bar-info">
            <span className="selection-count">{selectedIds.length} Trips Selected</span>
            <button className="btn-clear-selection" style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => setSelectedIds([])}>Clear</button>
          </div>
          <div className="action-bar-btns" style={{ display: 'flex', gap: 10 }}>
            <button 
              className="btn" 
              style={{ height: 44, borderRadius: 12, border: '1.5px solid #CBD5E1', background: 'white', color: '#475569', padding: '0 20px', fontWeight: 850, fontSize: '0.75rem' }}
              onClick={() => handleBulkAddToDraft(null, 'draft')}
              disabled={isBilling}
            >
              DRAFT
            </button>
            <button 
              className="btn btn-primary" 
              style={{ height: 44, borderRadius: 12, padding: '0 24px', fontWeight: 950, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.4)' }}
              onClick={() => handleBulkAddToDraft(null, 'unpaid')}
              disabled={isBilling}
            >
              {isBilling ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}
              GENERATE BILL
            </button>
            
            {showDraftSelect && (
              <div className="draft-selector animate-fadeIn" style={{ position: 'absolute', bottom: 60, right: 0, width: 200, background: 'white', border: '1.5px solid #F1F5F9', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: 12, zIndex: 100 }}>
                <div className="draft-selector-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Draft Bills</span>
                   <X size={14} onClick={() => setShowDraftSelect(false)} style={{ cursor: 'pointer' }} />
                </div>
                <div className="draft-items-list" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {drafts.length > 0 ? drafts.map(d => (
                    <div key={d._id} className="draft-item" onClick={() => handleBulkAddToDraft(d._id)} style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 10, cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{d.billNumber || 'No #'}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{d.party?.name}</div>
                    </div>
                  )) : <div className="draft-empty" style={{ fontSize: '0.7rem', textAlign: 'center', padding: 10 }}>No drafts</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Journey Detail Modal */}
      <JourneyDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        trip={selectedJourney}
        onDeleteLeg={(legId) => {
          if (window.confirm("Delete this leg?")) {
            deleteTripApi(legId).then(() => {
              setTrips(prev => prev.filter(t => (t._id || t.id) !== legId));
              setIsDetailOpen(false);
            });
          }
        }}
      />

      {/* Photo Preview Modal */}
      {isPreviewOpen && (
        <div className="preview-modal" onClick={() => setIsPreviewOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-preview-btn" onClick={() => setIsPreviewOpen(false)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Chalan Preview" className="preview-img" />
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" onChange={onFileChange} />

      <style>{`
        .trip-mgmt-container { padding-bottom: 200px; }
        .trip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .trip-title { fontSize: 1.25rem; font-weight: 900; color: #0F0D2E; margin: 0; }
        .trip-subtitle { color: #6B7280; font-size: 0.8125rem; margin-top: 2px; }
        .add-trip-btn { height: 44px; border-radius: 12px; padding: 0 16px; display: flex; alignItems: center; gap: 8px; font-weight: 700; font-size: 0.875rem; }
        
        .stats-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 18px; padding: 16px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .stat-card.accent { background: #EEF2FF; border-color: #E0E7FF; }
        .stat-label { color: #6B7280; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
        .accent .stat-label { color: #4F46E5; }
        .stat-value { font-size: 1.25rem; font-weight: 900; color: #0F0D2E; }
        .accent .stat-value { color: #4338CA; }

        .search-container { background: white; border-radius: 16px; padding: 0 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border: 1.5px solid #F1F5F9; }
        .search-input { border: none; background: transparent; flex: 1; height: 44px; outline: none; font-size: 0.875rem; font-weight: 500; }
        
        .trips-list { display: flex; flex-direction: column; gap: 12px; }
        .trip-card-mobile { background: white; border-radius: 20px; padding: 16px; border: 1px solid #F1F5F9; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .trip-card-main { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #F1F5F9; }
        .trip-route-sequence { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
        .location { font-size: 0.9375rem; font-weight: 800; color: #0F0D2E; }
        .route-arrow { color: #94A3B8; }
        .trip-amount-badge { background: #F1F5F9; color: #0F0D2E; padding: 4px 10px; border-radius: 8px; font-weight: 950; font-size: 0.85rem; border: 1px solid rgba(0,0,0,0.05); }
        
        .trip-meta-grid { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
        .meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #64748B; font-weight: 600; }
        .trip-badge { background: #F8FAFC; color: #475569; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.625rem; letter-spacing: 0.02em; }
        
        .trip-card-actions { display: flex; align-items: center; justify-content: space-between; }
        .action-left { display: flex; align-items: center; gap: 12px; }
        .chalan-thumb { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; position: relative; border: 1.5px solid #7C3AED; }
        .chalan-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .remove-photo-btn { position: absolute; top: 0; right: 0; background: #EF4444; border: none; color: white; border-radius: 0 0 0 4px; padding: 1px 2px; }
        
        .upload-chalan-btn { height: 36px; border-radius: 8px; padding: 0 8px; border: 1.5px dashed #CBD5E1; background: #F8FAFC; color: #64748B; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
        .upload-chalan-btn span { font-size: 0.45rem; font-weight: 800; }
        
        .delete-trip-btn:active { color: #EF4444; transform: scale(0.9); }
        
        /* Journey Modal Styles */
        .journey-modal { max-width: 450px !important; padding: 0 !important; overflow: hidden; background: white; border-radius: 24px; }
        .modal-header { padding: 20px; border-bottom: 1.5px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
        .legs-list-container { padding: 20px; max-height: 400px; overflow-y: auto; background: #FAFBFE; }
        
        .leg-item { display: flex; gap: 16px; margin-bottom: 24px; position: relative; padding: 12px; background: white; border-radius: 16px; border: 1px solid #F1F5F9; }
        .leg-item:last-child { margin-bottom: 0; }
        .leg-marker { display: flex; flex-direction: column; align-items: center; padding-top: 6px; }
        .marker-dot { width: 10px; height: 10px; border-radius: 50%; background: #7C3AED; border: 2.5px solid #DDD6FE; z-index: 1; }
        .marker-line { width: 2px; flex: 1; background: #E2E8F0; margin: 4px 0; }
        
        .leg-content { flex: 1; }
        .leg-route { font-weight: 800; color: #0F0D2E; font-size: 0.9375rem; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .leg-route svg { opacity: 0.4; }
        .leg-meta { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #64748B; font-weight: 600; }
        
        .leg-delete-btn { background: #FEE2E2; color: #EF4444; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .leg-delete-btn:hover { background: #EF4444; color: white; }
        
        .journey-summary-footer { padding: 20px; background: #F8FAFC; border-top: 1.5px solid #F1F5F9; }
        .summary-item { display: flex; justify-content: space-between; align-items: center; }
        .summary-item .label { font-weight: 800; color: #64748B; font-size: 0.875rem; }
        .summary-item .value { font-weight: 950; color: #0F0D2E; font-size: 1.25rem; }
        
        .party-accordion-header:hover { border-color: #DDD6FE !important; background: #FDFDFF !important; }
        .party-accordion-item.expanded .party-accordion-header { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-color: #EDE9FE !important; }
        
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { opacity: 0.1; margin-bottom: 8px; color: #0F0D2E; }
        .empty-title { font-size: 0.9375rem; font-weight: 700; color: #334155; }
        .empty-subtitle { font-size: 0.8125rem; color: #64748B; margin-top: 4px; }
        
        .preview-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .modal-content { position: relative; width: 100%; max-width: 400px; }
        .preview-img { width: 100%; border-radius: 16px; border: 3px solid white; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .close-preview-btn { position: absolute; top: -50px; right: 0; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .trip-form-card { background: white; border-radius: 24px; padding: 20px; border: 1px solid #F1F5F9; }

        .billing-action-bar { position: fixed; bottom: 96px; left: 16px; right: 16px; background: rgba(15, 13, 46, 0.95); backdrop-filter: blur(12px); border-radius: 20px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; z-index: 900; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); }
        .selection-count { color: white; font-weight: 800; font-size: 0.9rem; }
        .btn-clear-selection { background: transparent; border: none; color: #94A3B8; font-size: 0.75rem; font-weight: 700; margin-left: 10px; cursor: pointer; }
        
        .draft-selector { position: absolute; bottom: 100%; right: 0; width: 280px; background: white; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); overflow: hidden; border: 1px solid #F1F5F9; }
        .draft-selector-header { padding: 14px 18px; background: #F8FAFC; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 900; color: #475569; border-bottom: 1.5px solid #F1F5F9; }
        .draft-items-list { max-height: 220px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .draft-item { padding: 12px; border-radius: 14px; cursor: pointer; transition: 0.2s; color: #0F0D2E; border: 1px solid transparent; }
        .draft-item:hover { background: #F5F3FF; color: #7C3AED; border-color: #DDD6FE; }
        .draft-empty { padding: 30px 20px; text-align: center; color: #94A3B8; font-size: 0.8rem; font-weight: 600; }
        .btn-new-draft { width: 100%; border: none; background: #0F0D2E; color: white; padding: 14px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-new-draft:hover { background: #1E293B; }
        .btn-new-draft:active { transform: scale(0.98); }
        
        .billing-status-chip { font-size: 0.6rem; font-weight: 950; padding: 3px 10px; border-radius: 8px; letter-spacing: 0.05em; }
        .trip-card-mobile.selected { border: 2px solid var(--primary); background: #f5f3ff; }
        .trip-card-mobile.billed-item { border-left: 4px solid #10B981; cursor: pointer; }
        .trip-card-mobile.billed-item:hover { background: #F0FDF4; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
