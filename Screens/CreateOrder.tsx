import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OrderItem } from '../types';
import ApiService, { Product } from '../services/ApiService';

type CreateOrderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateOrder'>;

interface CreateOrderProps {
  navigation: CreateOrderNavigationProp;
  route: {
    params: {
      userId: string;
      userName: string;
      prefilledItems?: OrderItem[];
      totalAmount?: number;
    };
  };
}

const CreateOrder = ({ navigation, route }: CreateOrderProps) => {
  const { userId, userName, prefilledItems } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(prefilledItems || []);
  const [notes, setNotes] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid' | 'partial'>('unpaid');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const productsData = await ApiService.getProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error: any) {
      console.error('Load products error:', error);
      Alert.alert('Error', error.message || 'Failed to load products');
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const addProductToOrder = (product: Product, quantity: number = 1) => {
    const productIdStr = product.id.toString();
    const existingItemIndex = orderItems.findIndex(item => item.productId === productIdStr);
    const price = parseFloat(product.price);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      const newItem: OrderItem = {
        productId: productIdStr,
        productName: product.name,
        quantity,
        price,
        totalPrice: price * quantity,
      };
      setOrderItems([...orderItems, newItem]);
    }
    setShowProductModal(false);
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedItems = orderItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity,
          totalPrice: item.price * quantity,
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add items to your order');
      return;
    }

    // Get shopkeeper ID from first product
    const firstProduct = products.find(p => p.id.toString() === orderItems[0].productId);
    if (!firstProduct) {
      Alert.alert('Error', 'Product information not found');
      return;
    }

    setLoading(true);

    try {
      // Prepare order data for backend
      const orderData = {
        shopkeeper: firstProduct.shopkeeper,
        items: orderItems.map(item => ({
          product: parseInt(item.productId, 10),
          quantity: item.quantity,
        })),
        payment_status: paymentStatus,
      };

      const createdOrder = await ApiService.createOrder(orderData);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order has been placed. Order ID: ${createdOrder.id}\nTotal: ₹${parseFloat(createdOrder.total_amount).toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Submit order error:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Order</Text>
        <Text style={styles.headerSubtitle}>{userName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <View key={item.productId} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)} each</Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.productId, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.productId, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>{formatCurrency(item.totalPrice)}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeItem(item.productId)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items added yet</Text>
          )}
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any special instructions or notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items:</Text>
              <Text style={styles.summaryValue}>{orderItems.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity:</Text>
              <Text style={styles.summaryValue}>
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
            <View style={styles.paymentStatusContainer}>
              <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
              <View style={styles.paymentStatusButtons}>
                <TouchableOpacity
                  style={[styles.paymentStatusButton, paymentStatus === 'paid' && styles.paymentStatusActive]}
                  onPress={() => setPaymentStatus('paid')}
                >
                  <Text style={[styles.paymentStatusText, paymentStatus === 'paid' && styles.paymentStatusTextActive]}>Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentStatusButton, paymentStatus === 'unpaid' && styles.paymentStatusActive]}
                  onPress={() => setPaymentStatus('unpaid')}
                >
                  <Text style={[styles.paymentStatusText, paymentStatus === 'unpaid' && styles.paymentStatusTextActive]}>Credit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, (orderItems.length === 0 || loading) && styles.disabledButton]}
          onPress={submitOrder}
          disabled={orderItems.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.productModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Products</Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.productsList}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productItem}>
                {product.image && (
                  <Image 
                    source={{ uri: product.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.selectButton, product.stock === 0 && styles.disabledButton]}
                  onPress={() => addProductToOrder(product)}
                  disabled={product.stock === 0}
                >
                  <Text style={styles.selectButtonText}>
                    {product.stock === 0 ? 'Out of Stock' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
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
    backgroundColor: '#e67e22',
    padding: 16,
    paddingTop: 60,
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  paymentNote: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#e67e22',
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
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#95a5a6',
  },
  selectButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  selectButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CreateOrder;
