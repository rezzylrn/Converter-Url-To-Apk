# Converter URL → APK

Convert website apapun jadi APK Android lewat CLI.

---

## Quick Start

```bash
# 1. Clone repo
git clone https://github.com/rezzylrn/Converter-Url-To-Apk.git
cd Converter-Url-To-Apk

# 2. Install Node dependencies
npm install

# 3. Cek & setup system requirements
node setup.js

# 4. Build APK
node cli.js -u https://example.com -n "My App"
```

---

## System Requirements

Yang lo butuhkan sebelum bisa build:

| Requirement     | Versi Minimum | Cara Install |
|----------------|--------------|-------------|
| Node.js        | v16+         | https://nodejs.org |
| Java JDK       | 11+          | https://adoptium.net — atau `node jdk.js` |
| Android SDK    | API 33+      | https://developer.android.com/studio |

> **Tip:** Jalankan `node setup.js` — script ini otomatis ngecek semua requirement dan kasih tau cara install yang kurang.

---

## Setup Detail

### 1. Node.js
Download dari https://nodejs.org (pilih LTS). Setelah install, cek:
```bash
node --version   # harus v16+
npm --version
```

### 2. Java JDK

**Windows:**
1. Download JDK 17 dari https://adoptium.net
2. Pilih: JDK 17 → Windows → x64 → `.msi`
3. Install, restart terminal
4. Cek: `java -version`

**macOS:**
```bash
brew install openjdk@17
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install openjdk-17-jdk -y
```

> Atau pakai auto-installer: `node jdk.js`

### 3. Android SDK

1. Download Android Studio: https://developer.android.com/studio
2. Install dan buka, ikuti setup wizard
3. Buka **SDK Manager** (Tools → SDK Manager), install:
   - Android SDK Platform 33+
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools

4. Set environment variable `ANDROID_HOME`:

**Windows** (Environment Variables di System Properties):
```
ANDROID_HOME = C:\Users\<namauser>\AppData\Local\Android\Sdk
PATH += %ANDROID_HOME%\platform-tools
```

**macOS/Linux:**
```bash
# Tambahkan ke ~/.zshrc atau ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
export ANDROID_HOME=$HOME/Android/Sdk                # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
source ~/.zshrc   # atau ~/.bashrc
```

---

## Cara Build

### Minimal
```bash
node cli.js -u https://example.com -n "My App"
```
Package name akan di-generate otomatis dari URL.

### Lengkap
```bash
node cli.js \
  -u https://example.com \
  -n "My App" \
  -p com.example.myapp \
  -v 1.0.0 \
  -o ./output \
  --dark \
  --offline
```

### Semua opsi
```bash
node cli.js --help
```

```
Options:
  -u, --url <url>            Target URL (wajib)
  -n, --name <name>          Nama app (wajib)
  -p, --pkg <package>        Package name (default: auto dari URL)
  -v, --app-version <ver>    Versi app (default: 1.0.0)
  -o, --output <dir>         Output folder (default: ./output)
  --dark                     Dark mode
  --offline                  Offline cache
  -V, --version              Versi CLI
  -h, --help                 Help
```

---

## Troubleshooting

**`java: command not found`**
→ Java belum terinstall atau belum ada di PATH. Ikuti langkah di atas atau jalankan `node jdk.js`.

**`ANDROID_HOME is not set`**
→ Environment variable belum di-set. Ikuti langkah setup Android SDK di atas.

**`Build failed`**
→ Jalankan `node setup.js` dulu untuk lihat requirement mana yang belum terpenuhi.

---

## File Structure

```
Converter-Url-To-Apk/
├── cli.js            ← Entry point build (jalanin ini)
├── setup.js          ← Cek & guided install requirements
├── index.js          ← Core build logic
├── jdk.js            ← Auto-download Java
├── template-setup.js ← Setup Android project template
├── example.env       ← Contoh config
└── README.md
```
