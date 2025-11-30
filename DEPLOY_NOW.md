# 🚀 Deploy SmartShop Backend NOW - Quick Guide

## ✅ Files Created for Deployment

I've created all the necessary files for deployment:

1. ✅ `backend/requirements-prod.txt` - Production dependencies
2. ✅ `backend/build.sh` - Build script for Render
3. ✅ `backend/smartshop_backend/settings_prod.py` - Production settings
4. ✅ `render.yaml` - Render configuration (optional, for Blueprint)

---

## 🎯 Deploy to Render (5 Minutes)

### **Option 1: Quick Deploy (Recommended)**

1. **Go to Render:** https://dashboard.render.com/register

2. **Sign up/Login** (use GitHub for easier setup)

3. **Click "New +" → "Web Service"**

4. **Connect GitHub:**
   - Click "Connect account" → Authorize Render
   - Or use "Public Git repository" and paste your repo URL

5. **Configure Service:**
   ```
   Name: smartshop-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   
   Build Command:
   pip install -r requirements-prod.txt && python manage.py collectstatic --no-input && python manage.py migrate
   
   Start Command:
   gunicorn smartshop_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

6. **Environment Variables** (Click "Advanced"):
   ```
   SECRET_KEY = <generate a new one>
   DEBUG = False
   ALLOWED_HOSTS = .onrender.com
   DJANGO_SETTINGS_MODULE = smartshop_backend.settings_prod
   ```

7. **Click "Create Web Service"**

8. **Wait 5-10 minutes** for deployment

9. **Your backend URL will be:**
   ```
   https://smartshop-backend-XXXX.onrender.com
   ```

---

## 🔑 Generate SECRET_KEY

Run this to generate a secure secret key:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and use it as `SECRET_KEY` in Render environment variables.

---

## 📱 Update React Native App

Once deployed, update your app to use the production URL:

### Edit `services/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://smartshop-backend-XXXX.onrender.com/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

Replace `XXXX` with your actual Render URL.

### Rebuild the app:

```bash
cd /home/codilar/Desktop/sajwa/SmartShop
cd android && ./gradlew assembleDebug && cd ..
```

### Install new APK on phone:

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ✅ Verify Deployment

1. **Visit your backend URL in browser:**
   ```
   https://smartshop-backend-XXXX.onrender.com/api/
   ```
   You should see the Django REST API page.

2. **Test registration endpoint:**
   ```bash
   curl -X POST https://smartshop-backend-XXXX.onrender.com/api/accounts/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "phone": "1234567890",
       "user_type": "customer",
       "password": "testpass123",
       "password2": "testpass123"
     }'
   ```

3. **Test on your phone:**
   - Open SmartShop app
   - Try to register/login
   - Browse products
   - Create an order

---

## 💡 Alternative: Railway (Even Easier!)

If Render doesn't work, try Railway:

1. **Go to:** https://railway.app
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select SmartShop repository**
5. **Railway auto-detects Django!**
6. **Add environment variables:**
   ```
   DJANGO_SETTINGS_MODULE=smartshop_backend.settings_prod
   SECRET_KEY=<your-secret-key>
   ```
7. **Done!** Railway gives you a URL like:
   ```
   https://smartshop-production.up.railway.app
   ```

---

## 🐛 Troubleshooting

### **Build fails on Render:**

**Check build logs** - Common issues:
- Missing dependencies → Check `requirements-prod.txt`
- Python version → Render uses Python 3.10 by default
- Build command → Verify it's correct

**Solution:**
```bash
# Build Command should be:
pip install -r requirements-prod.txt && python manage.py collectstatic --no-input && python manage.py migrate
```

### **App crashes after deployment:**

**Check application logs** in Render dashboard.

Common issues:
- `SECRET_KEY` not set → Add it in environment variables
- `ALLOWED_HOSTS` wrong → Should include `.onrender.com`
- Database not configured → Use SQLite for now (default)

### **CORS errors in mobile app:**

Update `CORS_ALLOWED_ORIGINS` in Render environment variables:
```
CORS_ALLOWED_ORIGINS=*
```

Or for better security:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### **Static files not loading:**

Run collectstatic in Render shell:
```bash
python manage.py collectstatic --no-input
```

---

## 📊 What Gets Deployed

✅ **Django REST API** with all endpoints  
✅ **JWT Authentication** working  
✅ **PostgreSQL Database** (optional, can use SQLite)  
✅ **Static files** served via WhiteNoise  
✅ **HTTPS** automatically enabled  
✅ **CORS** configured for mobile app  

---

## 💰 Cost

**Render Free Tier:**
- ✅ 750 hours/month free
- ✅ Automatic HTTPS
- ✅ Automatic deployments
- ⚠️ Spins down after 15 min inactivity (first request takes 30-60s)

**Railway Free Tier:**
- ✅ $5 free credit/month
- ✅ No spin-down
- ✅ Faster than Render

---

## 🎉 You're Almost Done!

1. ✅ Backend code is ready for deployment
2. ✅ All configuration files created
3. ✅ Just need to push to GitHub and deploy on Render/Railway
4. ✅ Update mobile app with production URL
5. ✅ Test and enjoy!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!

**Ready to deploy?** Start with Render - it's the easiest! 🚀
