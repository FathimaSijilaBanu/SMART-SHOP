# 🌐 Local Network Setup Guide

## ✅ Configuration Complete!

Your SmartShop app is now configured to work on your physical device using your local network.

---

## 📱 How It Works

Instead of using `localhost` (which only works on the same device), we're using your **computer's local IP address** so your phone can access the Django backend over WiFi.

**Your Computer's IP:** `192.168.20.13`  
**Django Backend URL:** `http://192.168.20.13:8000/api`

---

## 🚀 Setup Steps

### **Step 1: Ensure Both Devices on Same WiFi**

✅ **Computer:** Connected to WiFi  
✅ **Phone:** Connected to **same WiFi network**

### **Step 2: Start Django Backend**

Open a terminal and run:

```bash
cd /home/codilar/Desktop/sajwa/SmartShop/backend
python3 manage.py runserver 0.0.0.0:8000
```

**Important:** Use `0.0.0.0:8000` (not just `runserver`) to allow external connections!

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

### **Step 3: Test Backend is Accessible**

On your phone's browser, visit:
```
http://192.168.20.13:8000/api/
```

You should see the Django REST API page. If you see it, the backend is accessible! ✅

### **Step 4: Rebuild the App**

Since we changed the API URL, we need to rebuild:

```bash
cd /home/codilar/Desktop/sajwa/SmartShop
npm start
```

In another terminal:
```bash
cd /home/codilar/Desktop/sajwa/SmartShop

# Build the APK
cd android && ./gradlew assembleDebug && cd ..
```

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### **Step 5: Install APK on Phone**

**Option A - Manual (Fastest):**
1. Copy `app-debug.apk` to your phone's Downloads folder
2. Open file manager on phone
3. Tap the APK file
4. Tap "Install"

**Option B - ADB (if USB works):**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎉 Test the App

1. **Open SmartShop app** on your phone
2. **Try to login** with:
   - Email: `customer@test.com`
   - Password: `password123`
3. **Browse products** - They should load from Django!
4. **Add to cart** and create an order

---

## 🐛 Troubleshooting

### **Problem: "Network request failed"**

**Solution 1:** Check both devices on same WiFi
```bash
# On computer, verify IP:
hostname -I

# Should show: 192.168.20.13
```

**Solution 2:** Check Django is running with `0.0.0.0`:
```bash
python3 manage.py runserver 0.0.0.0:8000
```

**Solution 3:** Check firewall isn't blocking port 8000:
```bash
sudo ufw allow 8000
```

### **Problem: "Connection refused"**

Django might not be running. Start it:
```bash
cd backend
python3 manage.py runserver 0.0.0.0:8000
```

### **Problem: "Cannot reach server"**

Check your computer's IP hasn't changed:
```bash
hostname -I
```

If it changed, update `services/api.config.ts` with the new IP and rebuild.

---

## 🔄 When Your IP Changes

Your local IP might change when you reconnect to WiFi. If the app stops working:

1. **Check new IP:**
   ```bash
   hostname -I
   ```

2. **Update API config:**
   Edit `services/api.config.ts`:
   ```typescript
   BASE_URL: 'http://YOUR_NEW_IP:8000/api',
   ```

3. **Rebuild app:**
   ```bash
   cd android && ./gradlew assembleDebug && cd ..
   ```

4. **Reinstall APK** on phone

---

## 💡 Pro Tips

### **Keep Django Running**

Use `tmux` or `screen` to keep Django running in background:
```bash
# Install tmux
sudo apt install tmux

# Start tmux session
tmux new -s django

# Run Django
cd backend && python3 manage.py runserver 0.0.0.0:8000

# Detach: Press Ctrl+B, then D
# Reattach: tmux attach -t django
```

### **Auto-start Django on Boot**

Create a systemd service (optional, for convenience):
```bash
# Create service file
sudo nano /etc/systemd/system/smartshop.service
```

Add:
```ini
[Unit]
Description=SmartShop Django Backend
After=network.target

[Service]
User=codilar
WorkingDirectory=/home/codilar/Desktop/sajwa/SmartShop/backend
ExecStart=/usr/bin/python3 manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable smartshop
sudo systemctl start smartshop
```

---

## 🌍 Alternative: Deploy to Cloud (Future)

For production or if local network doesn't work, you can deploy Django to:

### **Free Options:**
- **PythonAnywhere** - Free tier, easy Django deployment
- **Railway** - Free tier, automatic deployments
- **Render** - Free tier, good for Django
- **Heroku** - Free tier (with credit card)

### **Paid Options:**
- **DigitalOcean** - $5/month droplet
- **AWS EC2** - Pay as you go
- **Google Cloud** - Free tier available
- **Azure** - Free tier available

Would you like help deploying to a cloud service? I can guide you through that!

---

## 📊 Current Configuration

✅ **API URL:** `http://192.168.20.13:8000/api`  
✅ **Django ALLOWED_HOSTS:** Updated to accept connections  
✅ **CORS:** Already configured for cross-origin requests  
✅ **JWT Authentication:** Ready to use  

---

## 🎯 Next Steps

1. ✅ Start Django with `python3 manage.py runserver 0.0.0.0:8000`
2. ✅ Rebuild the app (or use existing APK if already built with correct IP)
3. ✅ Install APK on phone
4. ✅ Test login and features
5. 🎉 Enjoy your fully working SmartShop app!

---

**Status:** 🟢 Ready for local network testing!  
**Your IP:** 192.168.20.13  
**Django Port:** 8000
