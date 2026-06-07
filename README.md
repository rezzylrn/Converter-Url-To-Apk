# 📦 Converter URL to APK

Bot Telegram berbasis Node.js yang bisa mengubah URL website menjadi file APK Android (WebView). Cukup kirim link ke bot, dan bot akan otomatis mem-build APK untuk kamu.

---

## ✨ Fitur

- Konversi URL website menjadi APK Android secara otomatis
- Berbasis WebView — cocok untuk membungkus website menjadi aplikasi Android
- Dijalankan via Telegram Bot, mudah digunakan siapa saja
- Support Java JDK auto-install

---

## 🛠️ Requirements

- Node.js (v16+)
- Java JDK (bisa di-install otomatis, lihat langkah di bawah)
- Telegram Bot Token (dari [@BotFather](https://t.me/BotFather))

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/rezzylrn/Converter-Url-To-Apk.git
cd Converter-Url-To-Apk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Java JDK

Kamu bisa install manual, atau jalankan perintah berikut untuk install otomatis:

```bash
node jdk.js
```

### 4. Konfigurasi Environment

Salin file `example.env` menjadi `.env`:

```bash
cp example.env .env
```

Lalu isi token bot Telegram kamu di dalam file `.env`:

```env
TOKEN_BOT=isi_token_bot_kamu_di_sini
```

> Dapatkan token bot dari [@BotFather](https://t.me/BotFather) di Telegram.

### 5. Jalankan Bot

```bash
npm start
```

atau

```bash
node index.js
```

---

## 📁 Struktur File

```
Converter-Url-To-Apk/
├── index.js            # Entry point utama bot
├── jdk.js              # Script auto-install Java JDK
├── template-setup.js   # Setup template project Android
├── example.env         # Contoh konfigurasi environment
├── package.json        # Dependensi Node.js
└── LICENSE             # Lisensi MIT
```

---

## 📖 Cara Penggunaan

1. Jalankan bot
2. Buka Telegram, cari bot kamu
3. Kirim URL website yang ingin dijadikan APK
4. Bot akan memproses dan mengirimkan file APK ke kamu

---

## 📦 Dependencies

| Package | Versi | Kegunaan |
|---------|-------|----------|
| `telegraf` | ^4.15.3 | Framework Telegram Bot |
| `dotenv` | ^17.4.2 | Manajemen environment variable |

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

---

## 👤 Author

**Gracious** — [@rezzylrn](https://github.com/rezzylrn)
