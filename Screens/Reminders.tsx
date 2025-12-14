import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CreditRecord } from '../types';
import DataService from '../services/DataService';

type RemindersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reminders'>;

interface RemindersProps {
  navigation: RemindersNavigationProp;
  route: {
    params: {
      userId: string;
      userType: 'customer' | 'shopkeeper';
      userName: string;
    };
  };
}

const Reminders = ({ navigation, route }: RemindersProps) => {
  const { userId, userType, userName } = route.params;
  const [overdueRecords, setOverdueRecords] = useState<CreditRecord[]>([]);
  const [pendingRecords, setPendingRecords] = useState<CreditRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = async () => {
    try {
      const [allOverdue, userRecords] = await Promise.all([
        DataService.getOverdueCreditRecords(),
        DataService.getCreditRecords(userId, userType),
      ]);

      if (userType === 'shopkeeper') {
        // For shopkeepers, show overdue records for their customers
        const shopkeeperOverdue = allOverdue.filter(record => record.shopkeeperId === userId);
        setOverdueRecords(shopkeeperOverdue);
        
        // Also show pending records that are due soon (within 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dueSoon = userRecords.filter(record => 
          record.status === 'pending' && 
          record.dueDate <= sevenDaysFromNow &&
          record.dueDate > now
        );
        setPendingRecords(dueSoon);
      } else {
        // For customers, show their own overdue records
        const customerOverdue = allOverdue.filter(record => record.customerId === userId);
        setOverdueRecords(customerOverdue);
        
        // Show pending records due soon
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dueSoon = userRecords.filter(record => 
          record.status === 'pending' && 
          record.dueDate <= sevenDaysFromNow &&
          record.dueDate > now
        );
        setPendingRecords(dueSoon);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load reminders');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReminders();
  }, [userId, userType]);

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sendReminder = (record: CreditRecord) => {
    const message = `Dear ${record.customerName}, you have a pending payment of ${formatCurrency(record.remainingAmount)} that was due on ${record.dueDate.toLocaleDateString()}. Please make the payment at your earliest convenience.`;
    
    Alert.alert(
      'Reminder Sent',
      `Payment reminder sent to ${record.customerName}:\n\n"${message}"`,
      [{ text: 'OK' }]
    );
  };

  const sendBulkReminders = () => {
    if (overdueRecords.length === 0) {
      Alert.alert('No Reminders', 'There are no overdue payments to remind about.');
      return;
    }

    Alert.alert(
      'Send Bulk Reminders',
      `Send payment reminders to ${overdueRecords.length} customers with overdue payments?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send All',
          onPress: () => {
            overdueRecords.forEach(record => {
              // In a real app, this would send actual notifications
              console.log(`Reminder sent to ${record.customerName} for ${formatCurrency(record.remainingAmount)}`);
            });
            Alert.alert('Success', `Reminders sent to ${overdueRecords.length} customers`);
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Payment Reminders</Text>
          <Text style={styles.headerSubtitle}>{userName}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#e74c3c' }]}>{overdueRecords.length}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f39c12' }]}>{pendingRecords.length}</Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(overdueRecords.reduce((sum, r) => sum + r.remainingAmount, 0))}
          </Text>
          <Text style={styles.statLabel}>Total Overdue</Text>
        </View>
      </View>

      {/* Bulk Actions */}
      {userType === 'shopkeeper' && overdueRecords.length > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.bulkButton} onPress={sendBulkReminders}>
            <Text style={styles.bulkButtonText}>Send All Reminders</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overdue Payments */}
        {overdueRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overdue Payments</Text>
            {overdueRecords.map((record) => (
              <View key={record.id} style={[styles.reminderCard, styles.overdueCard]}>
                <View style={styles.cardHeader}>
                  <View>
                    {userType === 'shopkeeper' && (
                      <Text style={styles.customerName}>{record.customerName}</Text>
                    )}
                    <Text style={styles.amount}>{formatCurrency(record.remainingAmount)}</Text>
                    <Text style={styles.overdueText}>
                      {getDaysOverdue(record.dueDate)} days overdue
                    </Text>
                  </View>
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>OVERDUE</Text>
                  </View>
                </View>
                
                <Text style={styles.dueDate}>
                  Due: {record.dueDate.toLocaleDateString()}
                </Text>
                <Text style={styles.totalInfo}>
                  Total: {formatCurrency(record.totalAmount)} | 
                  Paid: {formatCurrency(record.paidAmount)}
                </Text>
                
                {userType === 'shopkeeper' && (
                  <TouchableOpacity 
                    style={styles.reminderButton}
                    onPress={() => sendReminder(record)}
                  >
                    <Text style={styles.reminderButtonText}>Send Reminder</Text>
                  </TouchableOpacity>
                )}
                
                {userType === 'customer' && (
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => navigation.navigate('CreditRecords', {
                      userId,
                      userType,
                      userName,
                    })}
                  >
                    <Text style={styles.payButtonText}>Make Payment</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Due Soon */}
        {pendingRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Soon (Next 7 Days)</Text>
            {pendingRecords.map((record) => (
              <View key={record.id} style={[styles.reminderCard, styles.dueSoonCard]}>
                <View style={styles.cardHeader}>
                  <View>
                    {userType === 'shopkeeper' && (
                      <Text style={styles.customerName}>{record.customerName}</Text>
                    )}
                    <Text style={styles.amount}>{formatCurrency(record.remainingAmount)}</Text>
                    <Text style={styles.dueSoonText}>
                      Due in {getDaysUntilDue(record.dueDate)} days
                    </Text>
                  </View>
                  <View style={[styles.dueBadge, styles.dueSoonBadge]}>
                    <Text style={styles.dueBadgeText}>DUE SOON</Text>
                  </View>
                </View>
                
                <Text style={styles.dueDate}>
                  Due: {record.dueDate.toLocaleDateString()}
                </Text>
                <Text style={styles.totalInfo}>
                  Total: {formatCurrency(record.totalAmount)} | 
                  Paid: {formatCurrency(record.paidAmount)}
                </Text>
                
                {userType === 'shopkeeper' && (
                  <TouchableOpacity 
                    style={[styles.reminderButton, styles.dueSoonReminderButton]}
                    onPress={() => sendReminder(record)}
                  >
                    <Text style={styles.reminderButtonText}>Send Reminder</Text>
                  </TouchableOpacity>
                )}
                
                {userType === 'customer' && (
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => navigation.navigate('CreditRecords', {
                      userId,
                      userType,
                      userName,
                    })}
                  >
                    <Text style={styles.payButtonText}>Make Payment</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {overdueRecords.length === 0 && pendingRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>
              {userType === 'customer' 
                ? 'You have no overdue payments or payments due soon.'
                : 'All your customers are up to date with their payments.'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#f39c12',
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
  bulkActions: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bulkButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  reminderCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  dueSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  cardHeader: {
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
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  overdueText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  dueSoonText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  dueBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueSoonBadge: {
    backgroundColor: '#f39c12',
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dueDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  totalInfo: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 12,
  },
  reminderButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dueSoonReminderButton: {
    backgroundColor: '#f39c12',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
});

export default Reminders;
