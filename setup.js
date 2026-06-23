#!/usr/bin/env node

/**
 * setup.js — System requirements checker & installer
 * Jalanin ini DULU sebelum build:  node setup.js
 */

const { execSync, spawnSync } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ─── Auto-install CLI deps ────────────────────────────────────────────────────
for (const dep of ["chalk", "ora"]) {
  try { require.resolve(dep); }
  catch { execSync(`npm install ${dep}`, { stdio: "inherit" }); }
}

const chalk = require("chalk");
const ora   = require("ora");

// ─── Utils ────────────────────────────────────────────────────────────────────
const PLATFORM = os.platform(); // linux | darwin | win32
const IS_WIN   = PLATFORM === "win32";
const IS_MAC   = PLATFORM === "darwin";
const IS_LIN   = PLATFORM === "linux";

const sep  = chalk.dim("  ─────────────────────────────────────────");
const tick = chalk.green("  ✔");
const cross= chalk.red("  ✖");
const warn = chalk.yellow("  !");
const info = chalk.cyan("  »");

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe" }).toString().trim(); }
  catch { return null; }
}

function header(title) {
  console.log();
  console.log(chalk.bold.white(`  ${title}`));
  console.log(sep);
}

function printStep(label, status, note = "") {
  const icon = status === "ok" ? tick : status === "warn" ? warn : cross;
  const msg  = status === "ok" ? chalk.green(label) : status === "warn" ? chalk.yellow(label) : chalk.red(label);
  console.log(`${icon}  ${msg}${note ? chalk.dim("  — " + note) : ""}`);
}

// ─── Check: Node.js ───────────────────────────────────────────────────────────
function checkNode() {
  header("Node.js");
  const ver = run("node --version");
  const major = ver ? parseInt(ver.replace("v", "").split(".")[0]) : 0;
  if (major >= 16) {
    printStep(`Node ${ver}`, "ok");
    return true;
  }
  printStep("Node.js < 16 or not found", "fail");
  console.log(`${info}  Download: ${chalk.underline("https://nodejs.org/")}`);
  console.log(`${info}  Minimum version required: ${chalk.white("v16")}`);
  return false;
}

// ─── Check: Java ─────────────────────────────────────────────────────────────
function checkJava() {
  header("Java JDK");
  const ver = run("java -version 2>&1");
  if (ver && ver.includes("version")) {
    const match = ver.match(/"([^"]+)"/);
    const jver  = match ? match[1] : "unknown";
    const major = parseInt(jver.split(".")[0]);
    if (major >= 11) {
      printStep(`Java ${jver}`, "ok");
      return true;
    }
    printStep(`Java ${jver} (terlalu lama, butuh >= 11)`, "warn");
  } else {
    printStep("Java tidak ditemukan", "fail");
  }

  console.log();
  console.log(`${info}  Cara install Java JDK 17:`);
  if (IS_WIN) {
    console.log(`${info}  1. Download installer: ${chalk.underline("https://adoptium.net/")}`);
    console.log(`${info}  2. Pilih: ${chalk.white("JDK 17 → Windows → x64 → .msi")}`);
    console.log(`${info}  3. Install, lalu restart terminal`);
    console.log(`${info}  4. Cek: ${chalk.white("java -version")}`);
  } else if (IS_MAC) {
    console.log(`${info}  brew install openjdk@17`);
    console.log(`${info}  echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc`);
    console.log(`${info}  source ~/.zshrc`);
  } else {
    console.log(`${info}  sudo apt update && sudo apt install openjdk-17-jdk -y`);
    console.log(`${info}  # atau untuk Fedora/RHEL:`);
    console.log(`${info}  sudo dnf install java-17-openjdk-devel`);
  }
  console.log(`${info}  Atau jalankan: ${chalk.white("node jdk.js")} (auto-download)`);
  return false;
}

// ─── Check: Android SDK ───────────────────────────────────────────────────────
function checkAndroidSdk() {
  header("Android SDK");

  const sdkEnv = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const defaultPaths = IS_WIN
    ? [path.join(os.homedir(), "AppData", "Local", "Android", "Sdk")]
    : IS_MAC
    ? [path.join(os.homedir(), "Library", "Android", "sdk")]
    : [
        path.join(os.homedir(), "Android", "Sdk"),
        "/opt/android-sdk",
        "/usr/local/android-sdk",
      ];

  const sdkPath = sdkEnv || defaultPaths.find(fs.existsSync);

  if (!sdkPath || !fs.existsSync(sdkPath)) {
    printStep("Android SDK tidak ditemukan", "fail");
    console.log();
    console.log(`${info}  Cara install Android SDK:`);
    console.log(`${info}  1. Download Android Studio: ${chalk.underline("https://developer.android.com/studio")}`);
    console.log(`${info}  2. Install Android Studio, buka, ikuti setup wizard`);
    console.log(`${info}  3. Di SDK Manager, install:`);
    console.log(`${info}     - ${chalk.white("Android SDK Platform 33+")} (atau versi terbaru)`);
    console.log(`${info}     - ${chalk.white("Android SDK Build-Tools")}`);
    console.log(`${info}     - ${chalk.white("Android SDK Command-line Tools")}`);
    console.log();
    console.log(`${info}  4. Set environment variable ANDROID_HOME:`);
    if (IS_WIN) {
      console.log(`${info}     Di System Properties → Environment Variables:`);
      console.log(`${info}     ${chalk.white(`ANDROID_HOME = C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk`)}`);
    } else if (IS_MAC) {
      console.log(`${info}     echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc`);
      console.log(`${info}     echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc`);
      console.log(`${info}     source ~/.zshrc`);
    } else {
      console.log(`${info}     echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc`);
      console.log(`${info}     echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc`);
      console.log(`${info}     source ~/.bashrc`);
    }
    return false;
  }

  printStep(`SDK ditemukan: ${sdkPath}`, "ok");

  // Cek build-tools
  const buildToolsDir = path.join(sdkPath, "build-tools");
  if (fs.existsSync(buildToolsDir)) {
    const versions = fs.readdirSync(buildToolsDir).filter(v => /^\d/.test(v)).sort().reverse();
    if (versions.length > 0) {
      printStep(`Build-tools: ${versions[0]}`, "ok");
    } else {
      printStep("Build-tools tidak ditemukan", "warn");
      console.log(`${info}  Di Android Studio → SDK Manager → SDK Tools → install Android SDK Build-Tools`);
    }
  } else {
    printStep("Build-tools tidak ditemukan", "warn");
  }

  // Cek platform-tools (adb)
  const adb = run(IS_WIN ? "adb version" : "adb version 2>&1");
  if (adb) {
    const adbVer = adb.split("\n")[0];
    printStep(`ADB: ${adbVer}`, "ok");
  } else {
    printStep("ADB tidak ditemukan (platform-tools)", "warn");
    console.log(`${info}  Install via SDK Manager → SDK Tools → Android SDK Platform-Tools`);
  }

  return true;
}

// ─── Check: Node modules ──────────────────────────────────────────────────────
function checkNodeModules() {
  header("Node Modules (npm install)");

  const pkgPath = path.join(__dirname, "package.json");
  if (!fs.existsSync(pkgPath)) {
    printStep("package.json tidak ditemukan", "fail");
    return false;
  }

  const nodeModules = path.join(__dirname, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    printStep("node_modules belum ada", "warn");
    console.log(`${info}  Jalankan: ${chalk.white("npm install")}`);

    const spinner = ora("  Installing npm packages...").start();
    try {
      execSync("npm install", { cwd: __dirname, stdio: "pipe" });
      spinner.succeed("npm install selesai");
      return true;
    } catch (e) {
      spinner.fail("npm install gagal: " + e.message);
      return false;
    }
  }

  printStep("node_modules sudah ada", "ok");
  return true;
}

// ─── Check: .env ──────────────────────────────────────────────────────────────
function checkEnv() {
  header(".env Config");

  const envExample = path.join(__dirname, "example.env");
  const envFile    = path.join(__dirname, ".env");

  if (fs.existsSync(envFile)) {
    printStep(".env sudah ada", "ok");
  } else if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    printStep(".env dibuat dari example.env", "ok");
    console.log(`${info}  Edit .env sesuai kebutuhan sebelum build`);
  } else {
    printStep(".env dan example.env tidak ditemukan", "warn");
    console.log(`${info}  .env akan dibuat otomatis saat build`);
  }
  return true;
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function printSummary(results) {
  header("Ringkasan");

  const allPass = Object.values(results).every(Boolean);

  for (const [key, ok] of Object.entries(results)) {
    printStep(key, ok ? "ok" : "fail");
  }

  console.log();
  if (allPass) {
    console.log(chalk.bold.green("  ✔ Semua requirement terpenuhi!"));
    console.log();
    console.log(`  Sekarang lo bisa build APK:`);
    console.log(chalk.white(`  node cli.js -u https://example.com -n "My App"`));
    console.log();
    console.log(`  Atau lihat semua opsi:`);
    console.log(chalk.white(`  node cli.js --help`));
  } else {
    console.log(chalk.bold.yellow("  ! Ada requirement yang belum terpenuhi."));
    console.log(`  Ikutin instruksi di atas, lalu jalankan ulang: ${chalk.white("node setup.js")}`);
  }
  console.log();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log();
console.log(chalk.bold.magenta("  ╔═══════════════════════════════════╗"));
console.log(chalk.bold.magenta("  ║   Converter URL → APK  •  Setup   ║"));
console.log(chalk.bold.magenta("  ╚═══════════════════════════════════╝"));

const results = {
  "Node.js >= 16"  : checkNode(),
  "Java >= 11"     : checkJava(),
  "Android SDK"    : checkAndroidSdk(),
  "Node Modules"   : checkNodeModules(),
  ".env Config"    : checkEnv(),
};

printSummary(results);
