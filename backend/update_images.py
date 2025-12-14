#!/usr/bin/env python3
"""
Script to update product images in the database
Run from backend directory: python manage.py shell < update_images.py
"""
from products.models import Product

# Product image mappings with Unsplash images
PRODUCT_IMAGES = {
    'Bun': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    'Amul Milk  Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    'Cooking Oil (1L)': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    'Eggs (12 pcs)': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    'Bananas (1kg)': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    'Bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
    'Rice (1kg)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Milk (1L)': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    'Tomatoes (500g)': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    'Onions (1kg)': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400',
}

updated_count = 0

for product_name, image_url in PRODUCT_IMAGES.items():
    try:
        product = Product.objects.get(name=product_name)
        product.image = image_url
        product.save()
        print(f"✓ Updated image for: {product_name}")
        updated_count += 1
    except Product.DoesNotExist:
        print(f"✗ Product not found: {product_name}")
    except Exception as e:
        print(f"✗ Error updating {product_name}: {e}")

print(f"\n{updated_count}/{len(PRODUCT_IMAGES)} products updated successfully!")
