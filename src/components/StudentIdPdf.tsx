import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed, but standard Helvetica is default

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
  },
  pageBack: {
    flexDirection: 'column',
    backgroundColor: '#dcfce7',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 40,
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#2563eb',
  },
  subTitle: {
    fontSize: 6,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  instituteText: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    flex: 1,
    width: '100%',
  },
  leftColumn: {
    width: '35%',
    flexDirection: 'column',
  },
  centerColumn: {
    width: '25%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rightColumn: {
    width: '35%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 6,
    fontWeight: 'black',
    color: '#94a3b8',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 7,
    fontWeight: 'black',
    color: '#0f172a',
    marginBottom: 2,
  },
  valueSmall: {
    fontSize: 7,
    color: '#475569',
    marginBottom: 2,
  },
  photoWrapper: {
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 2,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  photo: {
    width: 50,
    height: 60,
    objectFit: 'cover',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  footer: {
    height: 20,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  footerSub: {
    fontSize: 6,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  bottomStrip: {
    height: 3,
    backgroundColor: '#2563eb',
    width: '100%',
  },
  backTitle: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#0f172a',
    marginBottom: 4,
  },
  backSub: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  qrCodeBox: {
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 6,
    fontWeight: 'black',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  authorizedBox: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    alignItems: 'center',
  },
  authorizedText: {
    fontSize: 5,
    fontWeight: 'black',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 2,
  }
});

interface StudentIdPdfProps {
  studentName: string;
  studentPhone: string;
  batchName: string;
  enrollmentDate: string;
  instituteName?: string;
  instituteLogo?: string;
  paymentId?: string;
  studentEmail?: string;
  teacherName?: string;
  age?: number | string;
  dob?: string;
  studentPhoto?: string;
  qrCodeDataUrl?: string; // Add QR code base64 as Image can't render canvas SVG directly in react-pdf
}

export const StudentIdPdf = ({
  studentName,
  studentPhone,
  batchName,
  enrollmentDate,
  instituteName = "VidyaNation Academy",
  instituteLogo,
  paymentId = "VN-00000000",
  studentEmail,
  teacherName,
  age,
  dob,
  studentPhoto,
  qrCodeDataUrl,
}: StudentIdPdfProps) => {
  return (
    <Document>
      <Page size={[242.64, 153]} orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.titleText}>VidyaNation</Text>
              <Text style={styles.subTitle}>The Future of local education</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
             <Text style={styles.instituteText}>{instituteName}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{studentName}</Text>

            <Text style={styles.valueSmall}>Phone: {studentPhone || 'N/A'}</Text>
            
            {studentEmail && <Text style={styles.valueSmall}>Email: {studentEmail}</Text>}
            
            {dob ? (
              <Text style={styles.valueSmall}>DOB: {dob}</Text>
            ) : age ? (
              <Text style={styles.valueSmall}>{age} Years Old</Text>
            ) : null}
          </View>

          <View style={styles.centerColumn}>
            <View style={styles.photoWrapper}>
              {studentPhoto ? (
                <Image src={studentPhoto} style={styles.photo} />
              ) : (
                <View style={styles.photo} />
              )}
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View>
              <Text style={styles.sectionTitle}>Batch Details</Text>
              
              <Text style={styles.label}>Batch Name</Text>
              <Text style={styles.value}>{batchName}</Text>

              {teacherName && (
                <View>
                  <Text style={styles.label}>Teacher</Text>
                  <Text style={styles.valueSmall}>{teacherName}</Text>
                </View>
              )}

              <Text style={styles.valueSmall}>ID: {paymentId}</Text>
              <Text style={styles.valueSmall}>Issued: {enrollmentDate}</Text>
            </View>
            <View style={styles.authorizedBox}>
              <Text style={styles.authorizedText}>Authorized</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>vidyanation.online</Text>
          <Text style={styles.footerSub}>Verified Student Asset</Text>
        </View>
        <View style={styles.bottomStrip} />
      </Page>

      <Page size={[242.64, 153]} orientation="landscape" style={styles.pageBack}>
        <Text style={styles.backTitle}>VidyaNation</Text>
        <Text style={styles.backSub}>The Future of Local Education Search</Text>

        {qrCodeDataUrl && paymentId && (
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <View style={styles.qrCodeBox}>
              <Image src={qrCodeDataUrl} style={{ width: 50, height: 50 }} />
            </View>
            <Text style={styles.qrText}>Verify Student</Text>
          </View>
        )}

        <View style={[styles.footer, { position: 'absolute', bottom: 0, backgroundColor: 'transparent', borderTopWidth: 0 }]}>
           <Text style={[styles.footerText, { color: '#64748b' }]}>VERIFIED INSTITUTION ASSET</Text>
        </View>
      </Page>
    </Document>
  );
};
