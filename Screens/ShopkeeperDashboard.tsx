import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CreditRecord, Order } from '../types';
import DataService from '../services/DataService';

type ShopkeeperDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShopkeeperDashboard'>;

interface ShopkeeperDashboardProps {
  navigation: ShopkeeperDashboardNavigationProp;
  route: {
    params: {
      userId: string;
      userName: string;
    };
  };
}

const ShopkeeperDashboard = ({ navigation, route }: ShopkeeperDashboardProps) => {
  const { userId, userName } = route.params;
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  const loadData = async () => {
    try {
      const [credits, orders, overdueRecords] = await Promise.all([
        DataService.getCreditRecords(userId, 'shopkeeper'),
        DataService.getOrders(userId, 'shopkeeper'),
        DataService.getOverdueCreditRecords(),
      ]);
      
      setCreditRecords(credits);
      setPendingOrders(orders.filter(o => o.status === 'pending').slice(0, 3));
      
      // Calculate total outstanding amount
      const total = credits.reduce((sum, record) => sum + record.remainingAmount, 0);
      setTotalOutstanding(total);
      
      // Count overdue records for this shopkeeper
      const shopkeeperOverdue = overdueRecords.filter(r => r.shopkeeperId === userId);
      setOverdueCount(shopkeeperOverdue.length);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Shop Dashboard</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(totalOutstanding)}</Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#e74c3c' }]}>{overdueCount}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreditRecords', {
              userId: userId,
              userType: 'shopkeeper',
              userName: userName,
            })}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Credit Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('OrderHistory', {
              userId: userId,
              userType: 'shopkeeper',
              userName: userName,
            })}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>All Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reminders', {
              userId: userId,
              userType: 'shopkeeper',
              userName: userName,
            })}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Send Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProductCatalog', {
              userType: 'shopkeeper',
              userId: userId,
            })}
          >
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Manage Products</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Orders</Text>
        {pendingOrders.length > 0 ? (
          pendingOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
              <Text style={styles.orderDate}>
                {order.orderDate.toLocaleDateString()}
              </Text>
              <Text style={styles.orderItems}>
                {order.items.length} items • {order.paymentStatus}
              </Text>
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => {
                    DataService.updateOrderStatus(order.id, 'confirmed');
                    loadData();
                  }}
                >
                  <Text style={styles.actionButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    DataService.updateOrderStatus(order.id, 'cancelled');
                    loadData();
                  }}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No pending orders</Text>
        )}
      </View>

      {/* Recent Credit Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Credit Records</Text>
        {creditRecords.length > 0 ? (
          creditRecords.slice(0, 3).map((record) => (
            <View key={record.id} style={styles.creditCard}>
              <View style={styles.creditHeader}>
                <Text style={styles.customerName}>{record.customerName}</Text>
                <Text style={styles.creditAmount}>{formatCurrency(record.remainingAmount)}</Text>
              </View>
              <Text style={styles.creditDate}>
                Due: {record.dueDate.toLocaleDateString()}
              </Text>
              <Text style={styles.creditTotal}>
                Total: {formatCurrency(record.totalAmount)} | 
                Paid: {formatCurrency(record.paidAmount)}
              </Text>
              {record.status === 'overdue' && (
                <TouchableOpacity 
                  style={styles.reminderButton}
                  onPress={() => Alert.alert('Reminder', `Reminder sent to ${record.customerName}`)}
                >
                  <Text style={styles.reminderButtonText}>Send Reminder</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No credit records found</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  creditCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  creditDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  creditTotal: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 8,
  },
  reminderButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ShopkeeperDashboard;
