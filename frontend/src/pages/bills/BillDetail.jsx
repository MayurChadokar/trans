import { useParams, useNavigate } from 'react-router-dom'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, Printer, Trash2, Download, FileText, Pencil } from 'lucide-react'
import dayjs from 'dayjs'
import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PaymentModal from '../../components/billing/PaymentModal'

// ── Transport Consolidated Invoice Layout ────────────────────────────────────
function TransportInvoice({ bill, business, onPayOnline }) {
  const items = bill.items || []
  const displayDate = bill.billingDate || bill.billDate || bill.createdAt
  const accent = '#F3811E' // Radhe Tempo Orange

  return (
    <div className="invoice-wrap" style={{ color: '#000', fontFamily: 'Inter, sans-serif', padding: '10px', minHeight: '800px', backgroundColor: '#fff' }}>
      {/* Top Header Section */}
      {/* Top Header Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', border: '1px solid #ccc', borderRadius: '4px 4px 0 0' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo / Placeholder Box */}
            <div style={{ width: 52, height: 52, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1.5px solid #F1F5F9' }}>
               {business?.logoUrl 
                 ? <img src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 : <span style={{ fontSize: '1.4rem', fontWeight: 950, color: '#000' }}>{(business?.businessName || 'B')[0]}</span>
               }
            </div>
           <div style={{ flex: 1, textAlign: 'center' }}>
             <h1 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.9 }}>{business?.businessName?.toUpperCase() || 'KHAN TRANSPORT'}</h1>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
               <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
               <p style={{ fontSize: '0.62rem', fontWeight: 400, color: '#555', textTransform: 'capitalize', margin: 0 }}>{business?.slogan || 'Move What Matters'}</p>
               <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
             </div>
           </div>
        </div>
        <div style={{ borderLeft: '1px solid #ccc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', borderBottom: '1px solid #ccc' }}>
              <div style={{ padding: '8px 4px', background: '#fff', fontWeight: 600, fontSize: '0.65rem', textAlign: 'right' }}>Bill No.:</div>
              <div style={{ padding: '8px 6px', fontWeight: 800, fontSize: '0.75rem', borderLeft: '1px solid #eee', textAlign: 'left' }}>{bill.billNumber || 'Draft'}</div>
            </div>
           <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr' }}>
             <div style={{ padding: '8px 4px', background: '#fff', fontWeight: 600, fontSize: '0.65rem', textAlign: 'right' }}>Date :</div>
             <div style={{ padding: '8px 6px', fontWeight: 800, fontSize: '0.75rem', borderLeft: '1px solid #eee', textAlign: 'left' }}>{dayjs(displayDate).format('DD/MM/YYYY')}</div>
           </div>
        </div>
      </div>

      {/* From / To Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #ccc', borderTop: 'none' }}>
        <div style={{ padding: '8px 10px', background: '#fdf3f0', borderRight: '1px solid #ccc' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: 2 }}>From : <span style={{ fontWeight: 900 }}>{business?.businessName}</span></div>
          <div style={{ fontSize: '0.6rem', color: '#333', lineHeight: 1.3 }}>
            {business?.address}<br/>
            Mob : {business?.phone} {business?.email && `| Email: ${business?.email}`}<br/>
            {business?.gstin && `GSTIN: ${business?.gstin} `} {business?.panNo && `| PAN: ${business?.panNo}`}
          </div>
        </div>
        <div style={{ padding: '8px 10px', background: '#fdf3f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: 2 }}>Billed To : <span style={{ fontWeight: 900 }}>{bill.billedToName}</span></div>
          <div style={{ fontSize: '0.6rem', color: '#333', lineHeight: 1.3 }}>
            {bill.billedToAddress}<br/>
            {bill.billedToCity && `${bill.billedToCity}, `}{bill.billedToState} {bill.billedToPincode}<br/>
            {bill.billedToPhone && `Mob: ${bill.billedToPhone}`} {bill.billedToEmail && `| Email: ${bill.billedToEmail}`}<br/>
            {bill.billedToGstin && `GSTIN: ${bill.billedToGstin} `} {bill.billedToPan && `| PAN: ${bill.billedToPan}`}
          </div>
        </div>
      </div>

      {/* Billing Summary Centered Banner */}
      <div style={{ background: accent, color: 'white', textAlign: 'center', padding: '5px', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderX: '1px solid #ccc', margin: '0 -1px' }}>
        Billing Summary
      </div>

      {/* Table grid */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc', borderTop: 'none', marginBottom: 0 }}>
        <thead>
          <tr style={{ background: '#fdf7f2' }}>
            {['No.', 'Date', 'Company (From)', 'Company (To)', 'Chalan No.', 'Amount'].map((h, i) => (
              <th key={h} style={{ padding: '12px 6px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #ccc', textAlign: i === 5 ? 'right' : 'center', color: '#333' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{i + 1}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{dayjs(item.date).format('DD/MM/YY')}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.companyFrom || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{item.companyTo || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{item.chalanNo || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{parseFloat(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          {/* Extra Charges Rows */}
          {parseFloat(bill.loadingCharge || 0) > 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>Loading Charges :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc' }}>₹{parseFloat(bill.loadingCharge).toLocaleString()}</td>
            </tr>
          )}
          {parseFloat(bill.unloadingCharge || 0) > 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>Unloading Charges :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc' }}>₹{parseFloat(bill.unloadingCharge).toLocaleString()}</td>
            </tr>
          )}
          {parseFloat(bill.detentionCharge || 0) > 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>Detention Charges :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc' }}>₹{parseFloat(bill.detentionCharge).toLocaleString()}</td>
            </tr>
          )}
          {parseFloat(bill.otherCharge || 0) > 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>Other Charges :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc' }}>₹{parseFloat(bill.otherCharge).toLocaleString()}</td>
            </tr>
          )}

          {/* Total Row exactly like Radhe Tempo */}
          <tr>
            <td colSpan="4" style={{ background: accent, color: 'white', padding: '6px 20px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
              Grateful for Moving What Matters to You!
            </td>
            <td style={{ padding: '6px', textAlign: 'center', fontWeight: 900, fontSize: '1rem', border: '1px solid #ccc', background: '#f5f5f5' }}>TOTAL :</td>
            <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 950, fontSize: '1.25rem', border: '1px solid #ccc' }}>₹{bill.grandTotal?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Combined Bank Details & Signature Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 8, alignItems: 'start' }}>
        {/* Bank Details Box */}
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
           <div style={{ background: '#fdf3f0', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, borderBottom: '1px solid #ccc' }}>BANK DETAILS :</div>
           <div style={{ padding: '8px 12px', backgroundColor: '#fff' }}>
              {/* Mapping for both bankDetails object and legacy top-level fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                 <div style={{ fontSize: '0.65rem', marginBottom: 4, gridColumn: 'span 2' }}>
                    <span style={{ fontWeight: 600, color: '#555' }}>PAYMENT: </span>
                    <span style={{ fontWeight: 900, color: bill.status === 'paid' ? '#16A34A' : '#D97706', textTransform: 'uppercase' }}>{bill.status} ({bill.paymentMode || 'N/A'})</span>
                 </div>
                 <div style={{ fontSize: '0.65rem' }}>
                    <span style={{ fontWeight: 600, color: '#555' }}>A/c No : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.accountNumber || business?.bankAccNo || ''}</span>
                 </div>
                 <div style={{ fontSize: '0.65rem' }}>
                    <span style={{ fontWeight: 600, color: '#555' }}>IFSC : </span><span style={{ fontWeight: 900 }}>{(business?.bankDetails?.ifsc || business?.bankIfsc || '').toUpperCase()}</span>
                 </div>
                 <div style={{ fontSize: '0.65rem', marginTop: 3 }}>
                    <span style={{ fontWeight: 600, color: '#555' }}>Name : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.accountName || business?.name || ''}</span>
                 </div>
                 <div style={{ fontSize: '0.65rem', marginTop: 3 }}>
                    <span style={{ fontWeight: 600, color: '#555' }}>Bank : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.bankName || business?.bankName || ''}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Signatory Section on Right */}
        <div style={{ textAlign: 'center', paddingBottom: 6 }}>
           <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>For {business?.businessName || ''},</div>
           <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              {business?.signatureUrl ? (
                <img src={business.signatureUrl} style={{ maxHeight: '100%', maxWidth: 140, objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 170, borderBottom: '1px solid #000', marginTop: 35 }} />
              )}
           </div>
           <div style={{ fontSize: '0.7rem', color: '#666' }}>(Authorized Signatory)</div>
        </div>
      </div>

      {/* Footer Branding Line */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 950, fontSize: '1rem', color: '#000' }}>
          {business?.businessName} <span style={{ fontWeight: 400, color: '#444', fontSize: '0.8rem', fontStyle: 'italic', marginLeft: 8 }}>- {business?.slogan || 'Moving What Matters'}</span>
        </div>
      </div>
    </div>
  )
}

// ── Garage Specific Invoice Layout (Repair Estimate Style) ──────────────────
function GarageInvoice({ bill, business, onPayOnline }) {
  const items = bill.items || []
  const themeColor = '#FFB800' // Amber/Yellow from target image

  return (
    <div className="garage-invoice-wrap" style={{ color: '#000', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Banner */}
      <div style={{ background: themeColor, padding: window.innerWidth < 640 ? '10px 15px' : '12px 30px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: window.innerWidth < 640 ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>Repair Estimate</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, opacity: 0.85, color: '#333' }}>{business?.slogan || 'Restoring Vehicles, Reviving Peace of Mind'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo */}
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {business?.logoUrl
              ? <img src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#111' }}>{(business?.businessName || 'A')[0]}</span>
            }
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: '1.125rem', color: '#111' }}>{business?.businessName?.toUpperCase() || 'AUTO REPAIRS'}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: 4 }}>Bill No: {bill.billNumber || 'Draft'}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: window.innerWidth < 640 ? '12px' : '30px', border: '1px solid #eee', borderTop: 'none', borderRadius: '0 0 8px 8px', background: 'white' }}>
        
        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 30 }}>
          {/* Customer Info */}
          <div>
            <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.7rem', marginBottom: 10, borderRadius: 2 }}>Customer Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Name:</span> <span>{bill.customerName}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Address:</span> <span>{bill.customerAddress} {bill.customerCity} {bill.customerState} {bill.customerPincode}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Phone:</span> <span>{bill.customerPhone}</span></div>
              {bill.customerEmail && <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Email:</span> <span>{bill.customerEmail}</span></div>}
              {bill.customerGstin && <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>GSTIN:</span> <span>{bill.customerGstin}</span></div>}
              {bill.customerPan && <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>PAN:</span> <span>{bill.customerPan}</span></div>}
            </div>
          </div>
          {/* Vehicle Info */}
          <div>
            <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.7rem', marginBottom: 10, borderRadius: 2 }}>Vehicle Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Make:</span> <span>{bill.vehicleCompany || '—'}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Model:</span> <span>{bill.vehicleModel || '—'}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}><span style={{ fontWeight: 700 }}>Reg No:</span> <span style={{ fontWeight: 800 }}>{bill.vehicleNo?.toUpperCase()}</span></div>
            </div>
          </div>
        </div>

        {/* Grey horizontal line */}
        <div style={{ borderTop: '1px solid #ddd', margin: '20px 0' }} />

        {/* Repair Details Table */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.75rem', marginBottom: 10, borderRadius: 2 }}>Repair Details</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: themeColor }}>
                <th style={{ padding: window.innerWidth < 640 ? '5px' : '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.7rem', fontWeight: 800 }}>Description</th>
                <th style={{ padding: window.innerWidth < 640 ? '5px' : '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.7rem', fontWeight: 800, width: '15%' }}>Qty</th>
                <th style={{ padding: window.innerWidth < 640 ? '5px' : '8px', textAlign: 'right', border: '1px solid #ddd', fontSize: '0.7rem', fontWeight: 800, width: '20%' }}>Rate</th>
                <th style={{ padding: window.innerWidth < 640 ? '5px' : '8px', textAlign: 'right', border: '1px solid #ddd', fontSize: '0.7rem', fontWeight: 800, width: '20%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: window.innerWidth < 640 ? '4px 6px' : '6px 10px', border: '1px solid #ddd', fontSize: '0.75rem' }}>{item.description}</td>
                  <td style={{ padding: window.innerWidth < 640 ? '4px 6px' : '6px 10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'center' }}>{item.qty || 1}</td>
                  <td style={{ padding: window.innerWidth < 640 ? '4px 6px' : '6px 10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'right' }}>{parseFloat(item.rate || item.amount).toLocaleString()}</td>
                  <td style={{ padding: window.innerWidth < 640 ? '4px 6px' : '6px 10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{parseFloat(item.amount).toLocaleString()}</td>
                </tr>
              ))}
              {/* Parts Subtotal */}
              <tr>
                <td colSpan="3" style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: '0.7rem' }}>Parts Subtotal</td>
                <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 700, fontSize: '0.7rem' }}>₹{bill.partsTotal?.toLocaleString()}</td>
              </tr>
              {/* Labour Charge - only show if > 0 */}
              {parseFloat(bill.laborCharge || bill.labor || 0) > 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: '0.7rem' }}>Labour Charge</td>
                  <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 700, fontSize: '0.7rem' }}>₹{parseFloat(bill.laborCharge || bill.labor).toLocaleString()}</td>
                </tr>
              )}
              {/* GST - only show if > 0 */}
              {parseFloat(bill.gstAmount || 0) > 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: '0.7rem' }}>GST ({bill.gstPercent}%)</td>
                  <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 700, fontSize: '0.7rem' }}>₹{parseFloat(bill.gstAmount).toLocaleString()}</td>
                </tr>
              )}
              {/* Grand Total */}
              <tr>
                <td colSpan="3" style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 800, fontSize: '0.75rem' }}>Grand Total</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 950, fontSize: '0.95rem', background: '#fcfcfc' }}>₹{bill.grandTotal?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment & Notes Section */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1.1fr 0.9fr', gap: 30, marginBottom: 20 }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 800 }}>Payment Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}><span style={{ color: '#666' }}>Payment Status:</span> <span style={{ fontWeight: 700, color: bill.status === 'paid' ? '#16A34A' : '#DC2626' }}>{bill.status?.toUpperCase()}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}><span style={{ color: '#666' }}>Payment Method:</span> <span style={{ fontWeight: 700 }}>{bill.paymentMethod || bill.paymentMode || 'N/A'}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}><span style={{ color: '#666' }}>Payment Date:</span> <span style={{ fontWeight: 700 }}>{bill.paymentDate ? dayjs(bill.paymentDate).format('MMMM DD, YYYY') : dayjs(bill.billingDate || bill.billDate).format('MMMM DD, YYYY')}</span></div>
              {bill.transactionId && <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}><span style={{ color: '#666' }}>Transaction ID:</span> <span style={{ fontWeight: 700 }}>{bill.transactionId}</span></div>}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 800 }}>Additional Notes</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#444', lineHeight: 1.5 }}>
              {bill.notes || 'Estimate based on current damage assessment. Costs may vary due to part availability and repair complexity. Taxes and fees not included. Valid for 30 days.'}
            </p>
          </div>
        </div>

        {/* Another grey horizontal line */}
        <div style={{ borderTop: '1px solid #ddd', margin: '20px 0' }} />

        {/* Footer info splits */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1.4fr 1fr', gap: window.innerWidth < 640 ? 20 : 40, borderTop: '1px solid #ddd', paddingTop: 20 }}>
          <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, background: '#fafafa' }}>
             <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terms and Conditions</h4>
             <p style={{ margin: 0, fontSize: '0.65rem', color: '#555', lineHeight: 1.6 }}>
                By signing, customer authorizes {business?.businessName || 'garage'} to proceed with repairs. Estimate valid for 30 days.
             </p>
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Customer Signature:</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                {bill.customerSignatureUrl
                  ? <img src={bill.customerSignatureUrl} alt="Customer Signature" style={{ maxHeight: 50, maxWidth: 140, objectFit: 'contain', marginBottom: 2 }} />
                  : <div style={{ height: 32 }} />
                }
                <div style={{ borderBottom: '1.5px solid #333', width: '100%' }} />
                <span style={{ fontSize: '0.6rem', color: '#888', marginTop: 2 }}>Your Name</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Date:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, borderBottom: '1.5px solid #333', flex: 1, paddingBottom: 2 }}>
                {dayjs(bill.billDate).format('DD/MM/YYYY')}
              </span>
            </div>
          </div>
        </div>


      </div>
      
      {/* Footer stripe */}
      <div style={{ height: 16, background: themeColor, borderRadius: '0 0 8px 8px' }} />
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BillDetail() {
  const { id } = useParams()
  const { getBill, fetchBill, deleteBill, recordPayment } = useBills()
  const { user: sessionUser } = useAuth()
  const navigate = useNavigate()
  const printRef = useRef()
  const invoiceRef = useRef()
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const [bill, setBill] = useState(() => getBill(id))
  const [loading, setLoading] = useState(!bill)

  // Use bill.owner (from DB) if populated, otherwise fallback to session user
  const business = (bill?.owner && typeof bill.owner === 'object') ? bill.owner : sessionUser;

  useEffect(() => {
    if (!id || id === 'new') return
    if (bill) return
    setLoading(true)
    fetchBill(id).then(b => {
      if (b) setBill(b)
      setLoading(false)
    })
  }, [id, bill, fetchBill])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
      <div style={{ fontSize: '0.9rem' }}>Loading bill...</div>
    </div>
  )

  if (!bill) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h3>Bill not found</h3>
      <button className="btn btn-primary" onClick={() => navigate('/bills')}>Back to Bills</button>
    </div>
  )

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <html><head><title>Invoice ${bill.billNumber || 'Draft'}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background: white; color: #111; }
        .invoice-wrap { max-width: 760px; margin: 0 auto; }
        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
        .inv-brand { display: flex; gap: 14px; align-items: center; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; }
        td { padding: 8px 10px; border-bottom: 1px solid #F3F4F6; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style></head><body>${content}</body></html>
    `)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 300)
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      const element = invoiceRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      // Create PDF with page size = exact content size (no blank pages ever)
      const a4Width = 210 // mm
      const pxToMm = a4Width / canvas.width
      const contentHeightMm = canvas.height * pxToMm

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [a4Width, contentHeightMm], // custom height = exact content
      })
      pdf.addImage(imgData, 'PNG', 0, 0, a4Width, contentHeightMm)
      pdf.save(`Invoice_${bill.billNumber || bill._id}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Delete this bill?')) {
      deleteBill(id)
      navigate('/bills')
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 60, overflowX: 'hidden' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/${bill.billType}/bills`)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: window.innerWidth < 640 ? '100%' : 150, order: window.innerWidth < 640 ? 3 : 2 }}>
          <h2 style={{ fontWeight: 800, fontSize: window.innerWidth < 640 ? '0.9rem' : '1.1rem', color: '#0F0D2E', margin: 0 }}>#{bill.billNumber || 'Draft'}</h2>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{dayjs(bill.billingDate || bill.createdAt).format('DD MMM YYYY')}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: window.innerWidth < 640 ? 0 : 'auto', order: window.innerWidth < 640 ? 2 : 3 }}>
          {bill.status === 'draft' && (
            <button 
              id="btn-edit-bill" 
              onClick={() => navigate(`/${bill.billType}/bills/edit/${bill._id}`)} 
              style={{ padding: '0 12px', borderRadius: 12, height: 40, border: '1.5px solid #E2E8F0', background: 'white', color: '#4F46E5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700 }}
            >
              <Pencil size={16} /> Edit Draft
            </button>
          )}
          <button id="btn-delete-bill" onClick={handleDelete} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={16} color="#DC2626" />
          </button>
          <button id="btn-print-bill" onClick={handlePrint} className="btn-icon" style={{ background: 'white', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EEE' }}>
            <Printer size={18} />
          </button>
          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="btn btn-primary"
            style={{ padding: window.innerWidth < 640 ? '0 10px' : '0 12px', borderRadius: 12, height: 40, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? 'wait' : 'pointer' }}
          >
            <Download size={16} />
            {isDownloading ? 'Generating...' : (window.innerWidth < 640 ? 'PDF' : 'Download PDF')}
          </button>
        </div>
      </div>

      <div ref={printRef} className="invoice-container" style={{ background: 'white', borderRadius: 24, padding: '24px 16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.03)', overflowX: 'auto' }}>
        <div ref={invoiceRef}>
          {(bill.billType === 'transport' || bill.type === 'transport')
            ? <TransportInvoice bill={bill} business={business} onPayOnline={() => setIsPayModalOpen(true)} />
            : <GarageInvoice bill={bill} business={business} onPayOnline={() => setIsPayModalOpen(true)} />}
        </div>
      </div>

      <PaymentModal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)} 
        bill={bill} 
        business={business} 
        onSuccess={(amount) => recordPayment(bill._id, amount)}
      />

      <div style={{ marginTop: 20, textAlign: 'center' }}>
         <button className="btn btn-ghost" onClick={() => navigate('/bills')} style={{ fontSize: '0.85rem' }}>
           <FileText size={16} /> Back to all bills
         </button>
      </div>
    </div>
  )
}
