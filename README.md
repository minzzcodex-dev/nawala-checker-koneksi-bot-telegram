# Nawala Checker Bot (by Minzz CodeX)

Bot Telegram untuk memeriksa apakah domain **terblokir oleh Nawala / ISP Indonesia**, menggunakan API publik dari [Skiddle ID](https://check.skiddle.id).  
Bot ini dirancang untuk berjalan otomatis di **VPS**, melakukan pengecekan berkala, dan mengirim hasilnya langsung ke Telegram.

---

## 🧭 Table of Contents

- [Fitur Utama](#fitur-utama)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Perintah Telegram](#perintah-telegram)
- [Menjalankan 247 PM2](#menjalankan-247-pm2)
- [Update Script](#update-script)
- [Dependencies](#dependencies)
- [Lisensi](#lisensi)

---

## ✅ Fitur Utama

- ✅ Cek status blokir domain via Skiddle API  
- ✅ Cek status DNS domain via Google DNS  
- ✅ Tambah domain langsung lewat Telegram  
- ✅ Pengecekan otomatis setiap beberapa menit  
- ✅ Data domain disimpan ke file `domains.json`  
- ✅ Bisa jalan 24 jam nonstop pakai **PM2**  

---

## ⚙️ Instalasi

### 1️⃣ Login ke VPS
```bash
ssh root@IP_VPS_KAMU
```

### 2️⃣ Install Node.js & Git
```bash
apt update -y
apt install -y nodejs npm git
```

Pastikan sudah terinstal:
```bash
node -v
npm -v
git --version
```

### 3️⃣ Clone Repository
```bash
cd /root
git clone https://github.com/minzzcodex-dev/nawala-checker-koneksi-bot-telegram.git
cd nawala-checker-koneksi-bot-telegram
```

### 4️⃣ Install Dependensi
```bash
npm install
```

### 5️⃣ Edit Token Bot Telegram

Buka file `bot.js` atau `index.js` dan ubah:
```js
const BOT_TOKEN = "ISI_TOKEN_BOTMU";
```
Ganti dengan token dari **@BotFather**

---

## 🛠 Konfigurasi

### .gitignore (Opsional)

Agar file pribadi tidak ikut terupload:
```bash
echo "node_modules/
domains.json
.env
pm2.log
.DS_Store
" > .gitignore
```

---

## 🚀 Penggunaan

### Jalankan Bot Pertama Kali
```bash
node bot.js
```

Lalu, buka Telegram dan kirim perintah `/start` ke bot. Bot akan membalas dengan menu utama.

---

## 📡 Perintah Telegram

| Perintah | Fungsi |
|----------|--------|
| `/start` | Menampilkan menu utama |
| `/domainadd example.com` | Tambah domain ke daftar pengecekan |
| `/domainlist` | Menampilkan daftar domain saat ini |
| `/domainclear` | Hapus semua domain |
| `/setinterval 5` | Ubah interval pengecekan ke 5 menit |
| `/check` | Jalankan pengecekan manual sekarang |

---

## 🔁 Menjalankan 24/7 (PM2)

### Install PM2
```bash
npm install -g pm2
```

### Jalankan Bot
```bash
pm2 start bot.js --name nawala-bot
```

### Cek Status
```bash
pm2 list
```

### Lihat Log
```bash
pm2 logs nawala-bot
```

### Autostart Saat Reboot
```bash
pm2 startup
pm2 save
```

---

## ♻️ Update Script

Jika ada update pada GitHub:
```bash
cd /root/nawala-checker-koneksi-bot-telegram
git pull
pm2 restart nawala-bot
```

---

## 📦 Dependencies

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [PM2](https://pm2.keymetrics.io/)
- [Skiddle API](https://check.skiddle.id)

---

## 📝 Lisensi

Proyek ini dirilis oleh **Minzz CodeX**.  
Lisensi belum ditentukan secara eksplisit — silakan hubungi pengembang jika ingin kontribusi atau distribusi ulang.
