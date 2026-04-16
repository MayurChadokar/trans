import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Truck, MapPin, Plus, Calendar, Trash2, 
  Search, ArrowLeft, Loader2, CheckCircle2,
  Navigation, Hash, ArrowRight, Camera, Image as ImageIcon, X, Eye, Upload,
  FileText, User, ExternalLink
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
                  <span>•</span>
                  <span>{dayjs(leg.startDate).format('DD MMM')}</span>
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
  
  // Form state
  const [formData, setFormData] = useState({
    startDate: dayjs().format('YYYY-MM-DD'),
    vehicleId: '',
    partyId: '',
    groupId: null, // Link to existing journey
    source: '',
    destination: '',
    numberOfTrips: '',
    amount: ''
  })

  // Load trips from API
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

  const handleBulkAddToDraft = async (draftId = null) => {
    if (selectedIds.length === 0) return
    setIsBilling(true)
    try {
      const selectedTripDocs = trips.filter(t => selectedIds.includes(t._id || t.id))
      const partyId = selectedTripDocs[0].party?._id || selectedTripDocs[0].partyId
      
      // If multiple parties selected, warn
      const uniqueParties = [...new Set(selectedTripDocs.map(t => t.party?._id || t.partyId))]
      if (uniqueParties.length > 1) {
        alert("Please select trips for the same Party/Account to group them in one bill.")
        return
      }

      if (draftId) {
        // Add to existing draft
        const draft = drafts.find(d => d._id === draftId)
        await updateBillApi(draftId, { trips: [...(draft.trips || []), ...selectedIds] })
      } else {
        // Create new draft
        await createBill({
          party: partyId,
          billType: 'transport',
          status: 'draft',
          trips: selectedIds
        })
      }
      
      alert("Trips added to draft successfully!")
      setSelectedIds([])
      setShowDraftSelect(false)
      loadTrips() // refresh list to show billed status
      loadDrafts()
    } catch (e) {
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
      amount: ''
    })
  }

  const handleAddTrip = (e) => {
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
      amount: parseFloat(formData.amount)
    }

    createTrip(payload).then(res => {
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
          numberOfTrips: '',
          amount: ''
        })
      }
    })
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

  // Filter & Search (Mock)
  const [search, setSearch] = useState('')
  const filteredTrips = useMemo(() => {
    // Group by date, vehicle, party
    const groups = {}
    trips.forEach(t => {
      // Map back fields if they come from backend (source/destination/startDate)
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
      // Sort by creation time to get the sequence
      const sorted = [...group].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      
      // Combine routes: "A to B + C"
      let displayFrom = sorted[0].fromLocation
      let displayTo = sorted[0].toLocation
      
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i-1]
        const curr = sorted[i]
        // If the current trip starts where the previous one ended, just add the new destination
        if (curr.fromLocation.toLowerCase().trim() === prev.toLocation.toLowerCase().trim()) {
           displayTo += ` + ${curr.toLocation}`
        } else {
           displayTo += ` + ${curr.fromLocation} to ${curr.toLocation}`
        }
      }

      const totalAmount = sorted.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      const totalCount = sorted.reduce((sum, t) => sum + (parseInt(t.numberOfTrips) || 1), 0)
      const allBilled = sorted.every(t => t.billed)
      
      // For photo, use the first available chalan image
      const photo = sorted.find(t => t.chalanImage)?.chalanImage || null

      // Build smart route sequence (deduplicate matching internal points)
      let sequence = []
      if (sorted.length > 0) {
        sequence.push(sorted[0].fromLocation)
        sorted.forEach((t, i) => {
          if (i > 0) {
            // If new source is different from last destination, show it
            if (t.fromLocation !== sorted[i-1].toLocation) {
               sequence.push(t.fromLocation)
            }
          }
          sequence.push(t.toLocation)
        })
      }

      return {
        ...sorted[0], // base info
        id: sorted.map(t => t._id || t.id).join(','), 
        amount: totalAmount,
        numberOfTrips: totalCount,
        routePoints: sequence,
        rawLegs: sorted, // Save raw legs for the View modal
        fromLocation: displayFrom,
        toLocation: displayTo,
        billed: allBilled,
        chalanImage: photo,
        memberIds: sorted.map(s => s._id || s.id),
        groupId: sorted[0].groupId
      }
    })

    if (!search) return grouped
    const s = search.toLowerCase()
    return grouped.filter(t => 
      t.fromLocation.toLowerCase().includes(s) || 
      t.toLocation.toLowerCase().includes(s) ||
      (t.vehicle?.vehicleNumber || t.vehicleNumber || '').toLowerCase().includes(s) ||
      (t.party?.name || t.partyName || '').toLowerCase().includes(s)
    )
  }, [trips, search])

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
                  {vehicles.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.vehicleNumber} ({v.vehicleType})</option>)}
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
                <label className="form-label">From Location</label>
                <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g., Ahmedabad" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">To Location</label>
                <input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="e.g., Surat" className="form-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Number of Trips</label>
                <input type="number" value={formData.numberOfTrips} onChange={e => setFormData({...formData, numberOfTrips: e.target.value})} placeholder="1" className="form-input" min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1500" className="form-input" />
              </div>
            </div>

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
              placeholder="Search by location or vehicle..." 
              className="search-input"
            />
          </div>

          {/* Trips List */}
          <div className="trips-list">
            {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
              <div key={trip.id} className={`animate-fadeInUp trip-card-mobile ${selectedIds.includes(trip.id) ? 'selected' : ''}`} onClick={() => toggleTripSelection(trip.id)}>
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
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedIds.includes(trip.id) ? 'var(--primary)' : 'white' }}>
                      {selectedIds.includes(trip.id) && <CheckCircle2 size={14} color="white" />}
                    </div>
                  </div>
                  
                  <div className="trip-meta-grid">
                    <div className="meta-item"><Hash size={12} /> {trip.vehicle?.vehicleNumber || trip.vehicleNumber}</div>
                    <div className="meta-item"><User size={12} /> {trip.party?.name || trip.partyName}</div>
                    <div className="meta-item"><Calendar size={12} /> {dayjs(trip.date).format('DD MMM')}</div>
                    <div className="trip-badge">{trip.numberOfTrips} TRIP(S)</div>
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
                      onClick={(e) => { e.stopPropagation(); handleAddLeg(trip); }}
                      title="Add another leg/destination to this trip"
                      style={{ height: 34, borderRadius: 9, padding: '0 10px', border: '1.5px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: 800, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={12} /> ADD LEG
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
            )) : (
              <div className="empty-state">
                <Truck size={48} className="empty-icon" />
                <div className="empty-title">No trips recorded yet</div>
                <p className="empty-subtitle">Start by logging a new trip today</p>
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
            <button className="btn-clear-selection" onClick={() => setSelectedIds([])}>Clear</button>
          </div>
          <div className="action-bar-btns">
            {showDraftSelect ? (
              <div className="draft-selector animate-fadeIn">
                <div className="draft-selector-header">
                  <span>Select Draft Bill</span>
                  <X size={16} onClick={() => setShowDraftSelect(false)} style={{ cursor: 'pointer' }} />
                </div>
                <div className="draft-items-list">
                  {drafts.length > 0 ? drafts.map(d => (
                    <div key={d._id} className="draft-item" onClick={() => handleBulkAddToDraft(d._id)}>
                      <div style={{ fontWeight: 700 }}>{d.billNumber || 'New Draft'}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{d.party?.name}</div>
                    </div>
                  )) : <div className="draft-empty">No active drafts</div>}
                </div>
                <button className="btn-new-draft" onClick={() => handleBulkAddToDraft(null)}>
                  + Create New Bill
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', fontWeight: 800 }}
                onClick={() => setShowDraftSelect(true)}
                disabled={isBilling}
              >
                {isBilling ? <Loader2 size={18} className="spin" /> : <FileText size={18} />}
                Add to Bill
              </button>
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
        .trip-mgmt-container { padding-bottom: 24px; }
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
        .trip-amount-badge { background: #F1F5F9; color: #0F0D2E; padding: 6px 12px; border-radius: 10px; font-weight: 950; font-size: 1rem; border: 1px solid rgba(0,0,0,0.05); }
        
        .trip-meta-grid { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
        .meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #64748B; font-weight: 600; }
        .trip-badge { background: #F8FAFC; color: #475569; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.625rem; letter-spacing: 0.02em; }
        
        .trip-card-actions { display: flex; align-items: center; justify-content: space-between; }
        .action-left { display: flex; align-items: center; gap: 12px; }
        .chalan-thumb { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; position: relative; border: 1.5px solid #7C3AED; }
        .chalan-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .remove-photo-btn { position: absolute; top: 0; right: 0; background: #EF4444; border: none; color: white; border-radius: 0 0 0 4px; padding: 1px 2px; }
        
        .upload-chalan-btn { height: 42px; border-radius: 10px; padding: 0 10px; border: 1.5px dashed #CBD5E1; background: #F8FAFC; color: #64748B; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
        .upload-chalan-btn span { font-size: 0.5rem; font-weight: 800; }
        
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
        
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { opacity: 0.1; margin-bottom: 8px; color: #0F0D2E; }
        .empty-title { font-size: 0.9375rem; font-weight: 700; color: #334155; }
        .empty-subtitle { font-size: 0.8125rem; color: #64748B; margin-top: 4px; }
        
        .preview-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .modal-content { position: relative; width: 100%; max-width: 400px; }
        .preview-img { width: 100%; border-radius: 16px; border: 3px solid white; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .close-preview-btn { position: absolute; top: -50px; right: 0; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .trip-form-card { background: white; border-radius: 24px; padding: 20px; border: 1px solid #F1F5F9; }

        .billing-action-bar { position: fixed; bottom: 80px; left: 16px; right: 16px; background: rgba(15, 13, 46, 0.95); backdrop-filter: blur(12px); border-radius: 24px; padding: 16px; display: flex; align-items: center; justify-content: space-between; z-index: 900; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); }
        .selection-count { color: white; font-weight: 800; font-size: 0.9rem; }
        .btn-clear-selection { background: transparent; border: none; color: #94A3B8; font-size: 0.75rem; font-weight: 700; margin-left: 10px; cursor: pointer; }
        
        .draft-selector { position: absolute; bottom: 100%; right: 0; width: 280px; background: white; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
        .draft-selector-header { padding: 12px 16px; background: #F8FAFC; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 800; color: #64748B; border-bottom: 1px solid #F1F5F9; }
        .draft-items-list { max-height: 200px; overflow-y: auto; padding: 8px; display: flex; flexDirection: column; gap: 4px; }
        .draft-item { padding: 10px 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; color: #0F0D2E; }
        .draft-item:hover { background: #EEF2FF; color: var(--primary); }
        .btn-new-draft { width: 100%; border: none; background: #4F46E5; color: white; padding: 12px; font-weight: 800; font-size: 0.75rem; cursor: pointer; }
        
        .billing-status-chip { font-size: 0.6rem; font-weight: 950; padding: 3px 10px; border-radius: 8px; letter-spacing: 0.05em; }
        .trip-card-mobile.selected { border: 2px solid var(--primary); background: #f5f3ff; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
