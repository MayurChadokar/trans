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
  addrLabelGarage: { backgroundColor: '#FFB800', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 2, marginBottom: 10, fontSize: 9, fontWeight: 'bold', alignSelf: 'flex-start' },
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
    alignItems: 'stretch',
    fontSize: 9
  },
  tableCellGarage: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    justifyContent: 'center'
  },
  
  colNo: { width: '4%' },
  colDate: { width: '10%' },
  colVehicle: { width: '12%' },
  colFrom: { width: '15%' },
  colTo: { width: '15%' },
  colChalan: { width: '14%' },
  colExtra: { width: '15%', textAlign: 'right', color: '#B45309' },
  colAmount: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  colAmountGarage: { width: '20%', textAlign: 'right', fontWeight: 'bold' },

  // Footer Total Row
  totalRowArea: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: '#ccc' },
  gratitudeBanner: { width: '70%', backgroundColor: '#F3811E', color: 'white', padding: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 10 },
  totalLabelBox: { width: '15%', backgroundColor: '#f9f9f9', padding: 12, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ccc', fontWeight: 'bold' },
  totalValBox: { width: '15%', padding: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },
  
  totalRowGarage: { flexDirection: 'row', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#ccc', marginTop: -1 },
  totalLabelGarage: { width: '80%', padding: 8, fontWeight: 'bold', textAlign: 'left', borderRightWidth: 1, borderColor: '#ccc' },
  totalValueGarage: { width: '20%', padding: 8, textAlign: 'right', fontWeight: 'bold', fontSize: 10, backgroundColor: '#f9f9f9', borderRightWidth: 1, borderColor: '#ccc' },

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
  const isTransport = bill.billType === 'transport' || bill.type === 'transport'; 
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
            <View style={{ width: '60%' }}>
              <Text style={{ fontSize: 22, fontWeight: 'heavy', marginBottom: 2 }}>Repair Estimate</Text>
              <Text style={{ fontSize: 8.5, opacity: 0.9 }}>{business.slogan || 'Restoring Vehicles, Reviving Peace of Mind'}</Text>
            </View>
            <View style={{ width: '40%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
               {/* Logo */}
               <View style={{ width: 44, height: 44, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                 {business.logoUrl ? (
                   <Image src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 ) : (
                   <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{(business.businessName || 'B')[0]}</Text>
                 )}
               </View>
               <View style={{ textAlign: 'right' }}>
                 <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{business.businessName?.toUpperCase()}</Text>
                 <Text style={{ fontSize: 7, marginTop: 4 }}>Bill No: {bill.billNumber || 'Draft'}</Text>
                 <Text style={{ fontSize: 7, marginTop: 2 }}>Date: {dayjs(bill.billingDate || bill.createdAt).format('DD/MM/YYYY')}</Text>
               </View>
            </View>
          </View>
        )}

        {/* Info/Addressing */}
        <View style={isTransport ? styles.addressArea : styles.addressAreaGarage}>
          <View style={isTransport ? [styles.addrCol, { borderRightWidth: 1, borderColor: '#ccc' }] : styles.addrColGarage}>
            <Text style={isTransport ? styles.addrLabel : styles.addrLabelGarage}>{isTransport ? 'From (Transporter)' : 'Customer Information'}</Text>
            {isTransport ? (
              <>
                <Text style={[styles.addrText, { fontWeight: 'bold', fontSize: 10 }]}>{business.businessName}</Text>
                <Text style={styles.addrText}>{business.address}</Text>
                <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Mob :</Text> {business.phone}</Text>
                {business.email && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Email :</Text> {business.email}</Text>}
                {business.gstin && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>GSTIN :</Text> {business.gstin}</Text>}
                {business.panNo && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>PAN :</Text> {business.panNo}</Text>}
              </>
            ) : (
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Name:</Text><Text style={styles.addrText}>{bill.customerName}</Text></View>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Address:</Text><Text style={[styles.addrText, { flex: 1 }]}>{bill.customerAddress} {bill.customerCity} {bill.customerState} {bill.customerPincode}</Text></View>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Phone:</Text><Text style={styles.addrText}>{bill.customerPhone}</Text></View>
                {(bill.party?.email || bill.customerEmail) && <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Email:</Text><Text style={styles.addrText}>{bill.party?.email || bill.customerEmail}</Text></View>}
                {(bill.party?.gstin || bill.customerGstin) && <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>GSTIN:</Text><Text style={styles.addrText}>{bill.party?.gstin || bill.customerGstin}</Text></View>}
                {(bill.party?.pan || bill.customerPan) && <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>PAN:</Text><Text style={styles.addrText}>{bill.party?.pan || bill.customerPan}</Text></View>}
              </View>
            )}
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
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Make:</Text><Text style={styles.addrText}>{bill.vehicleCompany || '-'}</Text></View>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Model:</Text><Text style={styles.addrText}>{bill.vehicleModel || '-'}</Text></View>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>Reg No:</Text><Text style={[styles.addrText, { fontWeight: 'bold' }]}>{bill.vehicleNo?.toUpperCase() || '-'}</Text></View>
                <View style={{ flexDirection: 'row' }}><Text style={[styles.addrText, { width: 80, fontWeight: 'bold' }]}>KM Reading:</Text><Text style={styles.addrText}>{bill.kmReading || '-'}</Text></View>
              </View>
            )}
          </View>
        </View>

        {!isTransport && <View style={styles.summaryBannerGarage}><Text>Repair Details</Text></View>}
        {isTransport && <View style={styles.summaryBanner}><Text>Billing Summary</Text></View>}

        {/* Table Content */}
        <View style={{ borderLeftWidth: 1, borderTopWidth: 1, borderColor: '#ccc' }}>
          <View style={isTransport ? styles.tableHeader : styles.tableHeaderGarage}>
            {isTransport ? (
              <>
                <Text style={styles.colNo}>No.</Text>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colVehicle}>Vehicle No.</Text>
                <Text style={styles.colFrom}>Company (From)</Text>
                <Text style={styles.colTo}>Company (To)</Text>
                <Text style={styles.colChalan}>Chalan No.</Text>
                <Text style={styles.colExtra}>Extra</Text>
                <Text style={styles.colAmount}>Amount</Text>
              </>
            ) : (
              <>
                <Text style={[styles.tableCellGarage, styles.colDesc, { fontWeight: 'bold' }]}>Description</Text>
                <Text style={[styles.tableCellGarage, styles.colQty, { textAlign: 'center', fontWeight: 'bold' }]}>Quantity</Text>
                <Text style={[styles.tableCellGarage, styles.colRate, { textAlign: 'right', fontWeight: 'bold' }]}>Unit Price (₹)</Text>
                <Text style={[styles.tableCellGarage, styles.colAmountGarage, { textAlign: 'right', fontWeight: 'bold' }]}>Total Price (₹)</Text>
              </>
            )}
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              {isTransport ? (
                <>
                  <Text style={styles.colNo}>{idx + 1}</Text>
                  <Text style={styles.colDate}>{dayjs(item.date).format('DD/MM/YY')}</Text>
                  <Text style={styles.colVehicle}>{item.tempoNo || '-'}</Text>
                  <Text style={styles.colFrom}>{item.companyFrom || '-'}</Text>
                  <Text style={styles.colTo}>{item.companyTo || '-'}</Text>
                  <Text style={styles.colChalan}>{item.chalanNo || '-'}</Text>
                  <Text style={styles.colExtra}>{item.extraAmount > 0 ? `+${parseFloat(item.extraAmount).toLocaleString()}` : '-'}</Text>
                  <Text style={styles.colAmount}>{parseFloat(item.amount || 0).toLocaleString()}</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.tableCellGarage, styles.colDesc]}>{item.description}</Text>
                  <Text style={[styles.tableCellGarage, styles.colQty, { textAlign: 'center' }]}>{item.qty || 1}</Text>
                  <Text style={[styles.tableCellGarage, styles.colRate, { textAlign: 'right' }]}>{parseFloat(item.rate || item.amount).toLocaleString()}</Text>
                  <Text style={[styles.tableCellGarage, styles.colAmountGarage, { textAlign: 'right' }]}>{parseFloat(item.amount).toLocaleString()}</Text>
                </>
              )}
            </View>
          ))}
          {!isTransport && (
            <View style={{ marginTop: -1 }}>
               <View style={styles.totalRowGarage}>
                 <Text style={[styles.totalLabelGarage, { fontSize: 8, color: '#444' }]}>Parts Subtotal</Text>
                 <Text style={[styles.totalValueGarage, { fontSize: 8 }]}>₹{(bill.partsTotal || 0).toLocaleString()}</Text>
               </View>
               {parseFloat(bill.laborCharge || bill.labor || 0) > 0 && (
                 <View style={styles.totalRowGarage}>
                   <Text style={[styles.totalLabelGarage, { fontSize: 8, color: '#444' }]}>Labour Charge</Text>
                   <Text style={[styles.totalValueGarage, { fontSize: 8 }]}>₹{parseFloat(bill.laborCharge || bill.labor).toLocaleString()}</Text>
                 </View>
               )}
               {parseFloat(bill.gstAmount || 0) > 0 && (
                 <View style={styles.totalRowGarage}>
                   <Text style={[styles.totalLabelGarage, { fontSize: 8, color: '#444' }]}>GST ({bill.gstPercent}%)</Text>
                   <Text style={[styles.totalValueGarage, { fontSize: 8 }]}>₹{parseFloat(bill.gstAmount).toLocaleString()}</Text>
                 </View>
               )}
               <View style={styles.totalRowGarage}>
                 <Text style={[styles.totalLabelGarage, { fontWeight: 'bold', fontSize: 10 }]}>Grand Total</Text>
                 <Text style={[styles.totalValueGarage, { fontWeight: 'bold', fontSize: 11, backgroundColor: '#f2f2f2' }]}>₹{(bill.grandTotal || 0).toLocaleString()}</Text>
               </View>
            </View>
          )}


        </View>

        {isTransport && (
          <View style={{ marginTop: -1 }}>
             {parseFloat(bill.loadingCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '70%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '15%' }]}><Text>Loading :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.loadingCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.unloadingCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '70%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '15%' }]}><Text>Unloading :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.unloadingCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.detentionCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '70%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '15%' }]}><Text>Detention :</Text></View>
                 <View style={[styles.totalValBox, { fontSize: 9, padding: 8, width: '15%' }]}><Text>₹{parseFloat(bill.detentionCharge).toLocaleString()}</Text></View>
               </View>
             )}
             {parseFloat(bill.otherCharge || 0) > 0 && (
               <View style={styles.totalRowArea}>
                 <View style={{ width: '70%', borderRightWidth: 1, borderColor: '#ccc' }} />
                 <View style={[styles.totalLabelBox, { fontSize: 8, padding: 8, width: '15%' }]}><Text>Other :</Text></View>
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
          </View>
          <View style={styles.bankContent}>

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
