import { 
  Document, Page, Text, View, StyleSheet, Image, Font 
} from '@react-pdf/renderer';
import dayjs from 'dayjs';
import logo from '../../assets/trans-logo.png';

// Styles matching the "Hembox" PDF aesthetics
// Styles matching the professional aesthetics
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, color: '#000', fontFamily: 'Helvetica' },
  
  // Header
  header: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc' },
  headerGarage: { flexDirection: 'row', backgroundColor: '#FFB800', padding: 20, borderRadius: 4, marginBottom: 15 },
  logoBox: { width: '68%', paddingTop: 12, paddingBottom: 12, paddingLeft: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 65, height: 45, objectFit: 'contain', marginRight: 15 },
  brandName: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
  slogan: { fontSize: 9, color: '#444', marginTop: 5 },
  
  metaBox: { width: '32%', borderLeftWidth: 1, borderLeftColor: '#ccc' },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', height: 36, alignItems: 'center' },
  metaLabel: { width: '45%', paddingLeft: 8, fontWeight: 'bold', fontSize: 9 },
  metaVal: { width: '55%', paddingLeft: 4, fontWeight: 'bold', fontSize: 9.5 },

  // Addressing Info Area
  addressArea: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: '#ccc', marginBottom: 15 },
  addressAreaGarage: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  addrCol: { width: '50%', padding: 12 },
  addrColGarage: { width: '50%' },
  addrLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 6 },
  addrLabelGarage: { backgroundColor: '#FFB800', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2, marginBottom: 8, fontSize: 9, fontWeight: 'bold' },
  addrText: { fontSize: 8.5, color: '#333', lineHeight: 1.4 },

  // Summary Banner
  summaryBanner: { backgroundColor: '#F3811E', color: 'white', textAlign: 'center', padding: 8, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 },
  summaryBannerGarage: { backgroundColor: '#FFB800', color: '#000', textAlign: 'left', paddingVertical: 6, paddingHorizontal: 10, fontWeight: 'bold', fontSize: 9, borderRadius: 2, marginBottom: 8 },

  // Table
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#fdf7f2', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9
  },
  tableHeaderGarage: { 
    flexDirection: 'row', 
    backgroundColor: '#FFB800', 
    paddingVertical: 10,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 9
  },
  
  colNo: { width: '8%' },
  colDate: { width: '15%' },
  colFrom: { width: '22%' },
  colDesc: { width: '45%', textAlign: 'left', paddingLeft: 10 },
  colQty: { width: '15%' },
  colRate: { width: '20%', textAlign: 'right' },
  colTo: { width: '22%' },
  colChalan: { width: '18%' },
  colAmount: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  colAmountGarage: { width: '20%', textAlign: 'right', fontWeight: 'bold' },

  // Footer Total Row
  totalRowArea: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: '#ccc' },
  gratitudeBanner: { width: '67%', backgroundColor: '#F3811E', color: 'white', padding: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 10 },
  totalLabelBox: { width: '18%', backgroundColor: '#f9f9f9', padding: 12, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ccc', fontWeight: 'bold' },
  totalValBox: { width: '15%', padding: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },
  
  totalRowGarage: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', marginTop: -1 },
  totalLabelGarage: { width: '80%', padding: 10, fontWeight: 'bold', textAlign: 'left' },
  totalValueGarage: { width: '20%', padding: 10, textAlign: 'right', fontWeight: 'bold', fontSize: 11, backgroundColor: '#f9f9f9' },

  // Bank Section
  bankSection: { marginTop: 15, borderWidth: 1, borderColor: '#ccc' },
  bankHeader: { backgroundColor: '#fdf3f0', paddingVertical: 4, paddingHorizontal: 10, fontSize: 8, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  bankContent: { padding: 10 },
  bankGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  bankItem: { width: '48%', flexDirection: 'row' },
  bankKey: { width: 80, fontSize: 8.5, color: '#555' },
  bankValue: { fontWeight: 'bold', fontSize: 9 },

  // Signature
  footerSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerBrand: { fontSize: 12, fontWeight: 'bold' },
  signBox: { width: 180, textAlign: 'center' },
  signLine: { borderTopWidth: 1, borderTopColor: '#000', marginTop: 35, marginBottom: 5 },
  signLabel: { fontSize: 8.5, fontWeight: 'bold' },
  
  termsBoxGarage: { width: '60%', borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 4, backgroundColor: '#fafafa' },
  footerStripeGarage: { height: 12, backgroundColor: '#FFB800', marginTop: 20, borderRadius: 2 }
});

export const PDFInvoice = ({ bill, business }) => {
  const isTransport = bill.billType === 'transport';   // ← was bill.type (wrong)
  const items = bill.items || [];
  const themeColor = isTransport ? '#F3811E' : '#FFB800';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        {isTransport ? (
          <View style={styles.header}>
            <View style={styles.logoBox}>
              {/* Logo / Placeholder Box */}
              <View style={{ width: 64, height: 64, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: '#eee' }}>
                {business.logoUrl ? (
                  <Image src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{(business.businessName || 'B')[0]}</Text>
                )}
              </View>
              <View>
                <Text style={styles.brandName}>{business.businessName?.toUpperCase() || 'BUSINESS'}</Text>
                <Text style={styles.slogan}>{business.slogan || 'Move What Matters'}</Text>
              </View>
            </View>
            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Bill No.:</Text>
                <Text style={styles.metaVal}>{bill.billNumber || 'Draft'}</Text>
              </View>
              <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.metaLabel}>Date :</Text>
                <Text style={styles.metaVal}>{dayjs(bill.billingDate || bill.createdAt).format('DD/MM/YYYY')}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.headerGarage}>
            <View style={{ width: '15%', marginRight: 15 }}>
               <View style={{ width: 64, height: 64, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: '#eee' }}>
                 {business.logoUrl ? (
                   <Image src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 ) : (
                   <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{(business.businessName || 'B')[0]}</Text>
                 )}
               </View>
            </View>
            <View style={{ width: '55%' }}>
              <Text style={{ fontSize: 22, fontWeight: 'heavy', marginBottom: 2 }}>Repair Estimate</Text>
              <Text style={{ fontSize: 8.5, opacity: 0.9 }}>{business.slogan || 'Restoring Vehicles, Reviving Peace of Mind'}</Text>
            </View>
            <View style={{ width: '30%', textAlign: 'right' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{business.businessName?.toUpperCase()}</Text>
              <Text style={{ fontSize: 8, marginTop: 4 }}>Bill No: {bill.billNumber || 'Draft'}</Text>
              <Text style={{ fontSize: 8, marginTop: 2 }}>Date: {dayjs(bill.billingDate || bill.createdAt).format('DD/MM/YYYY')}</Text>
            </View>
          </View>
        )}

        {/* Info/Addressing */}
        <View style={isTransport ? styles.addressArea : styles.addressAreaGarage}>
          <View style={isTransport ? [styles.addrCol, { borderRightWidth: 1, borderColor: '#ccc' }] : styles.addrColGarage}>
            <Text style={isTransport ? styles.addrLabel : styles.addrLabelGarage}>{isTransport ? 'From (Transporter)' : 'Customer Information'}</Text>
            <Text style={[styles.addrText, { fontWeight: 'bold', fontSize: 10 }]}>{isTransport ? business.businessName : (bill.party?.name || bill.customerName)}</Text>
            <Text style={styles.addrText}>{isTransport ? business.address : (bill.party?.address || `${bill.customerAddress || ''} ${bill.customerCity || ''} ${bill.customerState || ''} ${bill.customerPincode || ''}`)}</Text>
            <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Mob :</Text> {isTransport ? business.phone : (bill.party?.phone || bill.customerPhone || '-')}</Text>
            {isTransport && business.email && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Email :</Text> {business.email}</Text>}
            {isTransport && business.gstin && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>GSTIN :</Text> {business.gstin}</Text>}
            {isTransport && business.panNo && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>PAN :</Text> {business.panNo}</Text>}
            {!isTransport && (bill.party?.email || bill.customerEmail) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Email :</Text> {bill.party?.email || bill.customerEmail}</Text>}
            {!isTransport && (bill.party?.gstin || bill.customerGstin) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>GSTIN :</Text> {bill.party?.gstin || bill.customerGstin}</Text>}
          </View>
          <View style={isTransport ? styles.addrCol : styles.addrColGarage}>
            <Text style={isTransport ? styles.addrLabel : styles.addrLabelGarage}>{isTransport ? 'Billed To (Customer)' : 'Vehicle Information'}</Text>
            {isTransport ? (
              <>
                <Text style={[styles.addrText, { fontWeight: 'bold', fontSize: 10 }]}>{bill.party?.name || bill.billedToName}</Text>
                <Text style={styles.addrText}>{bill.party?.address || bill.billedToAddress}</Text>
                <Text style={styles.addrText}>{(bill.party?.city || bill.billedToCity) && `${bill.party?.city || bill.billedToCity}, `}{bill.party?.state || bill.billedToState} {bill.party?.pincode || bill.billedToPincode}</Text>
                {(bill.party?.phone || bill.billedToPhone) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Mob :</Text> {bill.party?.phone || bill.billedToPhone}</Text>}
                {(bill.party?.email || bill.billedToEmail) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Email :</Text> {bill.party?.email || bill.billedToEmail}</Text>}
                {(bill.party?.gstin || bill.billedToGstin) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>GSTIN :</Text> {bill.party?.gstin || bill.billedToGstin}</Text>}
                {(bill.party?.panNo || bill.billedToPan) && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>PAN :</Text> {bill.party?.panNo || bill.billedToPan}</Text>}
              </>
            ) : (
              <>
                <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Make:</Text> {bill.vehicleCompany || '-'}</Text>
                <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Model:</Text> {bill.vehicleModel || '-'}</Text>
                <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Reg No:</Text> {bill.vehicleNo?.toUpperCase() || '-'}</Text>
                <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>KM Reading:</Text> {bill.kmReading || '-'}</Text>
              </>
            )}
          </View>
        </View>

        {!isTransport && <View style={styles.summaryBannerGarage}><Text>Repair Details</Text></View>}
        {isTransport && <View style={styles.summaryBanner}><Text>Billing Summary</Text></View>}

        {/* Table Content */}
        <View style={{ borderWidth: 1, borderColor: '#ccc', borderTopWidth: isTransport ? 0 : 1 }}>
          <View style={isTransport ? styles.tableHeader : styles.tableHeaderGarage}>
            {isTransport ? (
              <>
                <Text style={styles.colNo}>No.</Text>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colFrom}>Company (From)</Text>
                <Text style={styles.colTo}>Company (To)</Text>
                <Text style={styles.colChalan}>Chalan No.</Text>
                <Text style={styles.colAmount}>Amount</Text>
              </>
            ) : (
              <>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colQty}>Quantity</Text>
                <Text style={styles.colRate}>Unit Price (₹)</Text>
                <Text style={styles.colAmountGarage}>Total Price (₹)</Text>
              </>
            )}
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              {isTransport ? (
                <>
                  <Text style={styles.colNo}>{idx + 1}</Text>
                  <Text style={styles.colDate}>{dayjs(item.date).format('DD/MM/YY')}</Text>
                  <Text style={styles.colFrom}>{item.companyFrom || '-'}</Text>
                  <Text style={styles.colTo}>{item.companyTo || '-'}</Text>
                  <Text style={styles.colChalan}>{item.chalanNo || '-'}</Text>
                  <Text style={styles.colAmount}>{parseFloat(item.amount || 0).toLocaleString()}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.colDesc}>{item.description}</Text>
                  <Text style={styles.colQty}>{item.qty || 1}</Text>
                  <Text style={styles.colRate}>{parseFloat(item.rate || item.amount).toLocaleString()}</Text>
                  <Text style={styles.colAmountGarage}>{parseFloat(item.amount).toLocaleString()}</Text>
                </>
              )}
            </View>
          ))}
          {!isTransport && (
            <View style={styles.totalRowGarage}>
              <Text style={styles.totalLabelGarage}>Total</Text>
              <Text style={styles.totalValueGarage}>₹{(bill.grandTotal || 0).toLocaleString()}</Text>
            </View>
          )}

          {/* Payment Status Row for Garage */}
          {!isTransport && (
            <View style={{ flexDirection: 'row', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#ccc', backgroundColor: '#fcfcfc' }}>
              <View style={{ width: '50%', padding: 6, borderRightWidth: 1, borderColor: '#ccc' }}>
                <Text style={{ fontSize: 7, color: '#666' }}>Payment Status</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: bill.status === 'paid' ? '#16A34A' : '#D97706' }}>
                  {bill.status}
                </Text>
              </View>
              <View style={{ width: '50%', padding: 6 }}>
                <Text style={{ fontSize: 7, color: '#666' }}>Payment Method</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{bill.paymentMethod || bill.paymentMode || 'N/A'}</Text>
              </View>
            </View>
          )}
        </View>

        {isTransport && (
          <View style={{ marginTop: -1 }}>
             {parseFloat(bill.loadingCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '67%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '18%' }]}><Text>Loading :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.loadingCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.unloadingCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '67%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '18%' }]}><Text>Unloading :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.unloadingCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.detentionCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '67%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '18%' }]}><Text>Detention :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.detentionCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.otherCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '67%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '18%' }]}><Text>Other :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.otherCharge).toLocaleString()}</Text></View>
               </View>
             )}
             
             <View style={styles.totalRowArea}>
               <View style={[styles.gratitudeBanner, { backgroundColor: themeColor }]}><Text>{bill.notes || 'Grateful for Moving What Matters to You!'}</Text></View>
               <View style={styles.totalLabelBox}><Text>GRAND TOTAL :</Text></View>
               <View style={styles.totalValBox}><Text>₹{parseFloat(bill.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></View>
             </View>
          </View>
        )}

        {/* Bank & Payment Details */}
        <View style={styles.bankSection}>
          <View style={[styles.bankHeader, { backgroundColor: isTransport ? '#f3f3f3' : '#fdf3f0', flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text>BANK DETAILS :</Text>
            {isTransport && <Text style={{ fontSize: 7 }}>PAYMENT: {bill.status?.toUpperCase()} ({bill.paymentMode || 'N/A'})</Text>}
          </View>
          <View style={styles.bankContent}>
            <View style={styles.bankGrid}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Status:</Text>
                <Text style={[styles.metaVal, { color: bill.status === 'paid' ? '#16A34A' : '#DC2626', fontWeight: 'bold' }]}>
                  {(bill.status || 'Pending').toUpperCase()}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{isTransport ? 'Payment Mode:' : 'Payment Method:'}</Text>
                <Text style={styles.metaVal}>{(bill.paymentMethod || bill.paymentMode || (isTransport ? 'To Pay' : 'Cash')).toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.bankGrid}>
              <View style={styles.bankItem}>
                <Text style={styles.bankKey}>Bank Name:</Text>
                <Text style={styles.bankValue}>{(business.bankDetails?.bankName || 'NOT PROVIDED').toUpperCase()}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankKey}>IFSC Code:</Text>
                <Text style={styles.bankValue}>{(business.bankDetails?.ifsc || 'NOT PROVIDED').toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.bankGrid}>
              <View style={styles.bankItem}>
                <Text style={styles.bankKey}>Account No.:</Text>
                <Text style={styles.bankValue}>{business.bankDetails?.accountNumber || 'NOT PROVIDED'}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankKey}>Account Name:</Text>
                <Text style={styles.bankValue}>{business.bankDetails?.accountName || 'NOT PROVIDED'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={{ marginTop: 25, flexDirection: 'row', justifyContent: 'space-between' }}>
          {!isTransport ? (
            <View style={styles.termsBoxGarage}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>Terms and Conditions</Text>
              <Text style={{ fontSize: 7, color: '#555', lineHeight: 1.4 }}>
                By signing below, the customer agrees to the repair estimate and authorizes {business.businessName} to proceed with repairs. Estimates are valid for 30 days.
              </Text>
            </View>
          ) : (
            <View style={{ width: '60%' }}>
              <Text style={styles.footerBrand}>{business.businessName?.toUpperCase()} <Text style={{ fontWeight: 'normal', color: '#666', fontSize: 9 }}>— {business.slogan}</Text></Text>
            </View>
          )}

          <View style={styles.signBox}>
            <Text style={styles.signLabel}>{isTransport ? `For ${business.businessName},` : 'Customer Signature'}</Text>
            {isTransport && business.signatureUrl ? (
              <Image src={business.signatureUrl} style={{ width: 100, height: 40, marginTop: 5, marginBottom: 2, alignSelf: 'center', objectFit: 'contain' }} />
            ) : (
              <View style={styles.signLine} />
            )}
            <Text style={{ fontSize: 7, color: '#444' }}>{isTransport ? '(Authorized Signatory)' : 'Date'}</Text>
          </View>
        </View>

        {!isTransport && <View style={styles.footerStripeGarage} />}
      </Page>
    </Document>
  );
};
