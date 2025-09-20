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

type CustomerDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CustomerDashboard'>;

interface CustomerDashboardProps {
  navigation: CustomerDashboardNavigationProp;
  route: {
    params: {
      userId: string;
      userName: string;
    };
  };
}

const CustomerDashboard = ({ navigation, route }: CustomerDashboardProps) => {
  const { userId, userName } = route.params;
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalDue, setTotalDue] = useState(0);

  const loadData = async () => {
    try {
      const [credits, orders] = await Promise.all([
        DataService.getCreditRecords(userId, 'customer'),
        DataService.getOrders(userId, 'customer'),
      ]);
      
      setCreditRecords(credits);
      setRecentOrders(orders.slice(0, 3)); // Show only recent 3 orders
      
      // Calculate total due amount
      const total = credits.reduce((sum, record) => sum + record.remainingAmount, 0);
      setTotalDue(total);
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
      case 'overdue': return '#e74c3c';
      case 'paid': return '#27ae60';
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userName}!</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(totalDue)}</Text>
          <Text style={styles.statLabel}>Total Due</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{creditRecords.length}</Text>
          <Text style={styles.statLabel}>Credit Records</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{recentOrders.length}</Text>
          <Text style={styles.statLabel}>Recent Orders</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProductCatalog', {
              userType: 'customer',
              userId: userId,
            })}
          >
            <Text style={styles.actionIcon}>🛍️</Text>
            <Text style={styles.actionText}>Browse Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreateOrder', {
              userId: userId,
              userName: userName,
            })}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreditRecords', {
              userId: userId,
              userType: 'customer',
              userName: userName,
            })}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Credit Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Order History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Credit Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Credit Records</Text>
        {creditRecords.length > 0 ? (
          creditRecords.slice(0, 3).map((record) => (
            <View key={record.id} style={styles.creditCard}>
              <View style={styles.creditHeader}>
                <Text style={styles.creditAmount}>{formatCurrency(record.remainingAmount)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                  <Text style={styles.statusText}>{record.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.creditDate}>
                Due: {record.dueDate.toLocaleDateString()}
              </Text>
              <Text style={styles.creditTotal}>
                Total: {formatCurrency(record.totalAmount)} | 
                Paid: {formatCurrency(record.paidAmount)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No credit records found</Text>
        )}
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
                <Text style={styles.orderStatus}>{order.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.orderDate}>
                {order.orderDate.toLocaleDateString()}
              </Text>
              <Text style={styles.orderItems}>
                {order.items.length} items • {order.paymentStatus}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent orders</Text>
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
    backgroundColor: '#3498db',
    padding: 24,
    paddingTop: 60,
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
  creditDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  creditTotal: {
    fontSize: 12,
    color: '#95a5a6',
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
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  headerContent: {
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

export default CustomerDashboard;
