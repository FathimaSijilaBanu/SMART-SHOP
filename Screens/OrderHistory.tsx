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
import { RootStackParamList } from '../types';
import ApiService, { Order } from '../services/ApiService';

type OrderHistoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

interface OrderHistoryProps {
  navigation: OrderHistoryNavigationProp;
  route: {
    params: {
      userId: string;
      userType: 'customer' | 'shopkeeper';
      userName: string;
    };
  };
}

const OrderHistory = ({ navigation, route }: OrderHistoryProps) => {
  const { userId, userType, userName } = route.params;
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');

  const loadOrders = async () => {
    try {
      console.log('OrderHistory: Loading orders for user:', userId, 'type:', userType);
      const ordersData = await ApiService.getOrders();
      console.log('OrderHistory: Received orders:', ordersData.length, 'orders');
      console.log('OrderHistory: Orders data:', JSON.stringify(ordersData, null, 2));
      setOrders(ordersData);
    } catch (error: any) {
      console.error('Load orders error:', error);
      Alert.alert('Error', error.message || 'Failed to load orders');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, [userId, userType]);

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
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

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>{userName}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filter === status && styles.selectedFilterChip
            ]}
            onPress={() => setFilter(status as any)}
          >
            <Text style={[
              styles.filterText,
              filter === status && styles.selectedFilterText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {getFilteredOrders().length > 0 ? (
          getFilteredOrders().map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  {userType === 'shopkeeper' && (
                    <Text style={styles.customerName}>{order.customer_name}</Text>
                  )}
                  {userType === 'customer' && (
                    <Text style={styles.shopkeeperName}>{order.shopkeeper_name}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>
                  {formatDate(order.created_at || order.order_date || new Date().toISOString())}
                </Text>
                <Text style={styles.orderAmount}>{formatCurrency(order.total_amount)}</Text>
              </View>

              <View style={styles.orderItems}>
                <Text style={styles.itemsLabel}>Items ({order.items.length}):</Text>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.itemText}>
                    • {item.product_name} x {item.quantity}
                  </Text>
                ))}
              </View>

              <View style={styles.paymentStatus}>
                <Text style={styles.paymentLabel}>Payment: </Text>
                <Text style={[
                  styles.paymentValue,
                  { color: order.payment_status === 'paid' ? '#27ae60' : '#e74c3c' }
                ]}>
                  {order.payment_status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No orders found</Text>
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
    backgroundColor: '#3498db',
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 60,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFilterChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedFilterText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  shopkeeperName: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    marginTop: 2,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});

export default OrderHistory;
