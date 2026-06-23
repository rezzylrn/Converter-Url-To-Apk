# 🚀 URL to APK Converter CLI

Professional CLI tool to convert any website into a native Android application using a WebView wrapper. Simple, fast, and efficient.

> *Alat CLI profesional untuk mengubah website apapun menjadi aplikasi Android native menggunakan wrapper WebView. Sederhana, cepat, dan efisien.*

---

## 📋 Features / Fitur

- **Professional CLI**: Clean and interactive command-line interface.
- **Auto-Package ID**: Automatically generates package IDs from URLs.
- **Environment Check**: Built-in setup script to verify requirements.
- **Fast Build**: Optimized Gradle build process.
- **Bilingual Support**: Documentation in English and Indonesian.

---

## 🛠️ Prerequisites / Persyaratan

Before you begin, ensure you have the following installed:
*Sebelum memulai, pastikan Anda telah menginstal:*

| Requirement | Version | Link |
| --- | --- | --- |
| **Node.js** | v16+ | [Download](https://nodejs.org) |
| **Java JDK** | 11+ | [Download](https://adoptium.net) |
| **Android SDK** | API 33+ | [Download](https://developer.android.com/studio) |

> **Note**: Make sure `ANDROID_HOME` environment variable is set.
> *Catatan: Pastikan environment variable `ANDROID_HOME` sudah diatur.*

---

## 🚀 Quick Start / Memulai Cepat

### 1. Clone & Install
```bash
git clone https://github.com/rezzylrn/Converter-Url-To-Apk.git
cd Converter-Url-To-Apk
npm install
```

### 2. Verify Environment / Verifikasi Lingkungan
Run the setup script to check if your system is ready:
*Jalankan skrip setup untuk mengecek kesiapan sistem:*
```bash
node setup.js
```

### 3. Build APK / Membuat APK
Convert your URL to an APK with a single command:
*Ubah URL menjadi APK dengan satu perintah:*
```bash
node cli.js -u https://example.com -n "My Awesome App"
```

---

## 📖 CLI Options / Opsi CLI

| Option | Description | Keterangan |
| --- | --- | --- |
| `-u, --url` | Target website URL (Required) | URL website target (Wajib) |
| `-n, --name` | Name of the app (Required) | Nama aplikasi (Wajib) |
| `-p, --package` | Custom Package ID | ID Paket kustom |
| `-v, --version` | App version name | Nama versi aplikasi |
| `-o, --output` | Output directory | Direktori hasil |
| `--dark` | Enable dark mode | Aktifkan mode gelap |

---

## 📁 Project Structure / Struktur Proyek

```text
Converter-Url-To-Apk/
├── cli.js            # CLI Entry point
├── index.js          # Core build logic
├── setup.js          # Environment checker
├── template-setup.js # Android project initializer
└── README.md         # Documentation
```

---

## 🤝 Contribution / Kontribusi

Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

*Silakan fork proyek ini dan kirim pull request. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.*

---

## 📜 License / Lisensi

Distributed under the MIT License. See `LICENSE` for more information.
*Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.*

Created with ❤️ by [rezzylrn](https://github.com/rezzylrn)
