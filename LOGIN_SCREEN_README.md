# SmartShop Login Screen

## Features

### 🎨 Attractive Design
- Modern, clean UI with a professional color scheme
- Smooth animations and transitions
- Responsive design that works on different screen sizes
- Beautiful gradient and shadow effects

### 👥 Dual User Types
- **Customer Login**: For end users who want to shop
- **Shopkeeper Login**: For store owners who manage their shop
- Easy toggle between user types with visual feedback

### 🔐 Authentication Options
- **Login Mode**: For existing users
- **Register Mode**: For new users
- Seamless switching between login and registration
- Form validation with user-friendly error messages

### 📱 User Experience
- Keyboard-aware design that adjusts for input fields
- Smooth scrolling for smaller screens
- Clear visual hierarchy and intuitive navigation
- Professional branding with your logo

## Screen Flow

1. **Splash Screen** (3 seconds) → Shows your logo and app name
2. **Login Screen** → Main authentication interface
3. **Home Screen** → Success page after authentication

## Key Components

### LoginScreen.tsx
- Main authentication interface
- User type selection (Customer/Shopkeeper)
- Email and password input fields
- Login/Register toggle functionality
- Form validation and error handling

### Features Included:
- ✅ Email input with proper keyboard type
- ✅ Password input with secure text entry
- ✅ User type selection (Customer/Shopkeeper)
- ✅ Login/Register mode toggle
- ✅ Form validation
- ✅ Success/Error alerts
- ✅ Navigation to Home screen
- ✅ Professional styling with shadows and gradients
- ✅ Keyboard avoiding behavior
- ✅ Scrollable content for smaller screens

## Customization Options

### Colors
The app uses a modern color palette:
- Primary Blue: `#3498db`
- Dark Text: `#2c3e50`
- Light Text: `#7f8c8d`
- Background: `#f8f9fa`
- Input Border: `#e1e8ed`

### Styling
- Rounded corners (12px radius)
- Subtle shadows and elevations
- Professional typography
- Consistent spacing and padding

## Next Steps

To complete the authentication system, you'll need to:

1. **Add API Integration**: Replace the console.log statements with actual API calls
2. **Add State Management**: Implement Redux or Context API for user state
3. **Add Secure Storage**: Store authentication tokens securely
4. **Add Password Recovery**: Implement forgot password functionality
5. **Add Social Login**: Integrate Google, Facebook, or Apple Sign-In
6. **Add Biometric Authentication**: Implement fingerprint/face ID login

## Running the App

```bash
# Start the Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

The login screen is now fully functional and ready for your SmartShop application! 