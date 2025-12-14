import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ApiService, { Product } from '../services/ApiService';

type ProductCatalogNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductCatalog'>;

interface ProductCatalogProps {
  navigation: ProductCatalogNavigationProp;
  route?: {
    params?: {
      userType?: 'customer' | 'shopkeeper';
      userId?: string;
    };
  };
}

const ProductCatalog = ({ navigation, route }: ProductCatalogProps) => {
  const userType = route?.params?.userType || 'customer';
  const userId = route?.params?.userId;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);

  const loadData = async () => {
    try {
      console.log('ProductCatalog: Loading products for user:', userId, 'type:', userType);
      // Fetch products from Django backend
      // Note: Removed shopkeeper filter so all products are visible
      // Shopkeepers can see all products to place orders with other shopkeepers
      const params: any = {};
      
      console.log('ProductCatalog: Fetching with params:', params);
      const productsData = await ApiService.getProducts(params);
      console.log('ProductCatalog: Received', productsData.length, 'products');
      
      if (productsData.length === 0) {
        console.warn('ProductCatalog: No products returned from API');
      }
      
      // Extract unique categories from products
      const uniqueCategories = [...new Set(productsData.map(p => p.category))];
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(['All', ...uniqueCategories]);
    } catch (error: any) {
      console.error('Load products error:', error);
      Alert.alert('Error', error.message || 'Failed to load products');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [userId, userType]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId, 10));
      return total + (product ? parseFloat(product.price) * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const proceedToOrder = () => {
    if (Object.keys(cart).length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
      return;
    }

    const orderItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId, 10))!;
      const price = parseFloat(product.price);
      return {
        productId: product.id.toString(),
        productName: product.name,
        quantity,
        price,
        totalPrice: price * quantity,
      };
    });

    navigation.navigate('CreateOrder', {
      userId: userId || '1',
      userName: 'Customer',
      prefilledItems: orderItems,
      totalAmount: getCartTotal(),
    });

    setShowCart(false);
    setCart({});
  };

  const getProductImage = (product: Product) => {
    // Direct image URL mapping for products
    const imageMap: { [key: string]: string } = {
      'Bun': 'https://images.unsplash.com/photo-1592811773343-9abf0b1a6920?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400',
      'Amul Milk  Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
      'Cooking Oil (1L)': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      'Eggs (12 pcs)': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
      'Bananas (1kg)': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      'Bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
      'Rice (1kg)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'Milk (1L)': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      'Tomatoes (500g)': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
      'Onions (1kg)': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400',
    };
    
    // Return mapped image or fallback to a generic image
    return imageMap[product.name] || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400';
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Catalog</Text>
        </View>
        {userType === 'customer' && (
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView 
        style={styles.productsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image 
                source={{ uri: getProductImage(product) }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock}</Text>
                </View>
                <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
              </View>
              
              {userType === 'customer' && (
                <View style={styles.productActions}>
                  {cart[product.id] ? (
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(product.id)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{cart[product.id]}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => addToCart(product.id)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <Text style={styles.addButtonText}>
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No products found</Text>
        )}
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Shopping Cart</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.cartItems}>
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find(p => p.id === parseInt(productId, 10));
              if (!product) return null;
              const price = parseFloat(product.price);
              
              return (
                <View key={productId} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{product.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      {formatCurrency(price)} × {quantity}
                    </Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => removeFromCart(product.id)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => addToCart(product.id)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    {formatCurrency(price * quantity)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          
          <View style={styles.cartFooter}>
            <Text style={styles.cartTotal}>
              Total: {formatCurrency(getCartTotal())}
            </Text>
            <TouchableOpacity 
              style={styles.orderButton}
              onPress={proceedToOrder}
            >
              <Text style={styles.orderButtonText}>Proceed to Order</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#3498db',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cartButton: {
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 40,
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
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  productStock: {
    fontSize: 12,
    color: '#95a5a6',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
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
    fontSize: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    minWidth: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  cartModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cartHeader: {
    backgroundColor: '#3498db',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#ffffff',
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  cartFooter: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductCatalog;
