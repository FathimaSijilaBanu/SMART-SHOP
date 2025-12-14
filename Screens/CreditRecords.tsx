import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ApiService, { CreditRecord } from '../services/ApiService';

type CreditRecordsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreditRecords'>;

interface CreditRecordsProps {
  navigation: CreditRecordsNavigationProp;
  route: {
    params: {
      userId: string;
      userType: 'customer' | 'shopkeeper';
      userName: string;
    };
  };
}

const CreditRecords = ({ navigation, route }: CreditRecordsProps) => {
  const { userId, userType, userName } = route.params;
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CreditRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const loadCreditRecords = async () => {
    try {
      console.log('CreditRecords: Loading for user:', userId, 'type:', userType);
      const records = await ApiService.getCreditRecords();
      console.log('CreditRecords: Received', records.length, 'records');
      setCreditRecords(records);
    } catch (error: any) {
      console.error('Load credit records error:', error);
      Alert.alert('Error', error.message || 'Failed to load credit records');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCreditRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCreditRecords();
  }, [userId, userType]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'overdue': return '#e74c3c';
      case 'paid': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return creditRecords;
    return creditRecords.filter(record => record.status === filter);
  };

  const handlePayment = async () => {
    if (!selectedRecord || !paymentAmount) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const remainingAmount = parseFloat(selectedRecord.remaining_amount);
    if (amount <= 0 || amount > remainingAmount) {
      Alert.alert('Error', 'Invalid payment amount');
      return;
    }

    try {
      await ApiService.makePayment(selectedRecord.id, {
        amount: amount,
        payment_method: 'cash',
        notes: 'Payment via app',
      });

      Alert.alert('Success', 'Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedRecord(null);
      setPaymentAmount('');
      loadCreditRecords();
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Failed to record payment');
    }
  };

  const sendReminder = (record: CreditRecord) => {
    Alert.alert(
      'Reminder Sent',
      `Payment reminder sent to ${record.customer_name} for ${formatCurrency(parseFloat(record.remaining_amount))}`,
      [{ text: 'OK' }]
    );
  };

  const getTotalStats = () => {
    const filtered = getFilteredRecords();
    const totalOutstanding = filtered.reduce((sum, record) => sum + parseFloat(record.remaining_amount), 0);
    const totalPaid = filtered.reduce((sum, record) => sum + parseFloat(record.paid_amount), 0);
    return { totalOutstanding, totalPaid, count: filtered.length };
  };

  const stats = getTotalStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Credit Records</Text>
          <Text style={styles.headerSubtitle}>{userName}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalOutstanding)}</Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalPaid)}</Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.count}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['all', 'pending', 'overdue', 'paid'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterTab,
              filter === filterOption && styles.activeFilterTab
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text style={[
              styles.filterText,
              filter === filterOption && styles.activeFilterText
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Credit Records List */}
      <ScrollView 
        style={styles.recordsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {getFilteredRecords().length > 0 ? (
          getFilteredRecords().map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View>
                  {userType === 'shopkeeper' && (
                    <Text style={styles.customerName}>{record.customer_name}</Text>
                  )}
                  <Text style={styles.recordAmount}>{formatCurrency(record.remaining_amount)}</Text>
                  <Text style={styles.recordLabel}>Remaining</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                  <Text style={styles.statusText}>{record.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.recordDetails}>
                <Text style={styles.detailText}>
                  Total: {formatCurrency(record.total_amount)}
                </Text>
                <Text style={styles.detailText}>
                  Paid: {formatCurrency(record.paid_amount)}
                </Text>
                <Text style={styles.detailText}>
                  Due Date: {new Date(record.due_date).toLocaleDateString()}
                </Text>
                <Text style={styles.detailText}>
                  Created: {new Date(record.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.recordActions}>
                {record.status !== 'paid' && (
                  <>
                    {userType === 'customer' && (
                      <TouchableOpacity 
                        style={styles.payButton}
                        onPress={() => {
                          setSelectedRecord(record);
                          setShowPaymentModal(true);
                        }}
                      >
                        <Text style={styles.payButtonText}>Make Payment</Text>
                      </TouchableOpacity>
                    )}
                    
                    {userType === 'shopkeeper' && record.status === 'overdue' && (
                      <TouchableOpacity 
                        style={styles.reminderButton}
                        onPress={() => sendReminder(record)}
                      >
                        <Text style={styles.reminderButtonText}>Send Reminder</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No credit records found</Text>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.paymentModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Make Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedRecord && (
            <View style={styles.modalContent}>
              <Text style={styles.paymentInfo}>
                Outstanding Amount: {formatCurrency(selectedRecord.remaining_amount)}
              </Text>
              
              <Text style={styles.inputLabel}>Payment Amount</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="Enter amount"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handlePayment}
                >
                  <Text style={styles.confirmButtonText}>Record Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#9b59b6',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterTab: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  filterText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  recordsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  recordAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  recordLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recordDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reminderButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  paymentModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#9b59b6',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#ffffff',
  },
  modalContent: {
    padding: 24,
  },
  paymentInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  paymentInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreditRecords;
