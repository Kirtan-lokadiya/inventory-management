import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  col1: { width: '20%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '10%' },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

type BillItem = {
  part_id: string;
  quantity: number;
  rate: number;
  total: number;
};

type Bill = {
  id: string;
  invoice_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: BillItem[];
  total_amount: number;
  created_at: string;
};

type BillPDFProps = {
  bill: Bill;
};

export default function BillPDF({ bill }: BillPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>Invoice #{bill.invoice_number}</Text>
        </View>

        <View style={styles.section}>
          <Text>Bill To:</Text>
          <Text>{bill.customer_name}</Text>
          {bill.customer_email && <Text>{bill.customer_email}</Text>}
          {bill.customer_phone && <Text>{bill.customer_phone}</Text>}
          <Text>Date: {new Date(bill.created_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.col1]}>Sr. No.</Text>
            <Text style={[styles.tableCell, styles.col2]}>Item</Text>
            <Text style={[styles.tableCell, styles.col3]}>Quantity</Text>
            <Text style={[styles.tableCell, styles.col4]}>Rate</Text>
            <Text style={[styles.tableCell, styles.col5]}>Total</Text>
          </View>
          {bill.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {item.part_id}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                ₹{item.rate.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                ₹{item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <Text style={styles.total}>Total Amount:</Text>
          <Text style={styles.total}>₹{bill.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>This is a computer-generated invoice.</Text>
        </View>
      </Page>
    </Document>
  );
} 