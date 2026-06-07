# Converter URL to APK

A Node.js Telegram bot that converts a website URL into an Android APK (WebView). Send a link to the bot and it will automatically build the APK for you.

![Preview](image/image.png)

---

## Requirements

- Node.js v16+
- Java JDK (can be installed automatically, see steps below)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rezzylrn/Converter-Url-To-Apk.git
cd Converter-Url-To-Apk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Java JDK

You can install it manually, or run the following command to install it automatically:

```bash
node jdk.js
```

### 4. Set Up the APK Template

Run this command to generate the Android project template structure needed to build the APK:

```bash
node template-setup.js
```

### 5. Configure Environment

Copy `example.env` to `.env`:

```bash
cp example.env .env
```

Then fill in your Telegram bot token:

```env
TOKEN_BOT=your_bot_token_here
```

> Get your token from [@BotFather](https://t.me/BotFather) on Telegram.

### 6. Run the Bot

```bash
npm start
```

---

## File Structure

```
Converter-Url-To-Apk/
├── index.js            # Main bot entry point
├── jdk.js              # Java JDK auto-installer
├── template-setup.js   # Android project template setup
├── example.env         # Example environment config
├── package.json        # Node.js dependencies
└── LICENSE             # MIT License
```

---

## Usage

1. Start the bot
2. Open Telegram and find your bot
3. Send a website URL
4. The bot will process it and send back the APK file

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `telegraf` | ^4.15.3 | Telegram Bot framework |
| `dotenv` | ^17.4.2 | Environment variable management |

---

## License

This project is licensed under the [MIT License](LICENSE).

**Author:** Gracious — [@rezzylrn](https://github.com/rezzylrn)

---
---

# Converter URL to APK

Bot Telegram berbasis Node.js yang mengubah URL website menjadi file APK Android (WebView). Cukup kirim link ke bot, dan bot akan otomatis mem-build APK untuk kamu.

![Preview](image/image.png)

---

## Kebutuhan

- Node.js v16+
- Java JDK (bisa di-install otomatis, lihat langkah di bawah)
- Telegram Bot Token (dari [@BotFather](https://t.me/BotFather))

---

## Instalasi & Setup

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

Bisa install manual, atau jalankan perintah berikut untuk install otomatis:

```bash
node jdk.js
```

### 4. Setup Template APK

Jalankan perintah ini untuk membuat struktur template project Android yang dibutuhkan untuk build APK:

```bash
node template-setup.js
```

### 5. Konfigurasi Environment

Salin file `example.env` menjadi `.env`:

```bash
cp example.env .env
```

Lalu isi token bot Telegram kamu:

```env
TOKEN_BOT=isi_token_bot_kamu_di_sini
```

> Dapatkan token dari [@BotFather](https://t.me/BotFather) di Telegram.

### 6. Jalankan Bot

```bash
npm start
```

---

## Struktur File

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

## Cara Penggunaan

1. Jalankan bot
2. Buka Telegram, cari bot kamu
3. Kirim URL website yang ingin dijadikan APK
4. Bot akan memproses dan mengirimkan file APK

---

## Dependensi

| Package | Versi | Kegunaan |
|---------|-------|----------|
| `telegraf` | ^4.15.3 | Framework Telegram Bot |
| `dotenv` | ^17.4.2 | Manajemen environment variable |

---

## Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

**Author:** Gracious — [@rezzylrn](https://github.com/rezzylrn)
