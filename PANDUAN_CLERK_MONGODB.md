# 🔗 Panduan Menghubungkan Clerk dengan MongoDB

## ✅ Status Saat Ini
- ✅ MongoDB terhubung dengan baik
- ✅ Clerk API berfungsi
- ✅ Webhook endpoint tersedia
- ✅ Konfigurasi environment sudah benar

## 🎯 Langkah-langkah Setup Webhook Clerk

### 1. Konfigurasi Webhook di Clerk Dashboard

1. **Buka Clerk Dashboard**
   - Pergi ke [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Login dengan akun Anda
   - Pilih project yang sesuai

2. **Setup Webhook**
   - Di sidebar, klik **"Webhooks"**
   - Klik **"Add Endpoint"**
   - Masukkan URL: `http://localhost:3000/api/clerk`
   - Pilih events:
     - ✅ `user.created`
     - ✅ `user.updated` 
     - ✅ `user.deleted`
   - Copy **Signing Secret** yang diberikan

3. **Update Environment Variable**
   - Buka file `server/.env`
   - Pastikan `CLERK_WEBHOOK_SECRET` sama dengan signing secret dari dashboard
   - Contoh: `CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`

### 2. Untuk Production/Deployment

Jika aplikasi sudah di-deploy, ganti URL webhook dengan URL production:
```
https://yourdomain.com/api/clerk
```

### 3. Untuk Development dengan ngrok (Opsional)

Jika ingin test webhook di development:

1. Install ngrok: `npm install -g ngrok`
2. Jalankan: `ngrok http 3000`
3. Copy URL yang diberikan (contoh: `https://abc123.ngrok.io`)
4. Update webhook URL di Clerk dashboard: `https://abc123.ngrok.io/api/clerk`

## 🧪 Test Koneksi

### 1. Jalankan Server
```bash
cd server
npm start
# atau
node server.js
```

### 2. Test dengan Script
```bash
# Test koneksi Clerk-MongoDB
node testClerkMongoDB.js

# Test database
node testDatabase.js
```

### 3. Test Registrasi User Baru

1. **Buka aplikasi frontend**
2. **Daftar user baru** melalui Clerk
3. **Cek log server** - harus muncul:
   ```
   Webhook received: user.created for user user_xxxxx
   Creating new user: { _id: 'user_xxxxx', ... }
   User created successfully: user_xxxxx
   ```
4. **Verifikasi di database**:
   ```bash
   node testDatabase.js
   ```

## 🔍 Troubleshooting

### Jika User Tidak Masuk ke Database:

1. **Cek Log Server**
   - Apakah webhook diterima?
   - Apakah ada error saat membuat user?

2. **Cek Webhook Configuration**
   - URL webhook benar?
   - Secret key sama?
   - Events sudah dipilih?

3. **Cek Network**
   - Server berjalan di port 3000?
   - Firewall tidak memblokir?

### Error Common:

1. **"User validation failed"**
   - ✅ Sudah diperbaiki di model User

2. **"Webhook verification failed"**
   - Cek CLERK_WEBHOOK_SECRET di .env
   - Pastikan sama dengan di dashboard

3. **"User not found in database"**
   - User belum terdaftar via webhook
   - Coba daftar user baru

## 📝 File yang Sudah Dikonfigurasi

1. ✅ `server/.env` - Environment variables
2. ✅ `client/.env` - Frontend configuration  
3. ✅ `server/controllers/clerkWebhooks.js` - Webhook handler
4. ✅ `server/models/Users.js` - User model
5. ✅ `server/middleware/authMiddleware.js` - Authentication
6. ✅ `server/server.js` - Server setup

## 🎉 Verifikasi Akhir

Setelah setup webhook, test dengan:

1. **Daftar user baru** di frontend
2. **Cek log server** untuk webhook
3. **Jalankan test**:
   ```bash
   node testClerkMongoDB.js
   ```
4. **Verifikasi user** ada di MongoDB

Jika semua langkah diikuti, user yang login/daftar di Clerk akan otomatis tersimpan di MongoDB! 🚀
