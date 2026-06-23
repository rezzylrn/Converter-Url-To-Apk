#!/usr/bin/env node

/**
 * setup.js — Check requirements, offer to install, then build
 * Usage: node setup.js -u https://example.com -n "My App"
 */

const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");
const os   = require("os");
const readline = require("readline");

// ─── Auto-install CLI deps ────────────────────────────────────────────────────
for (const dep of ["chalk", "ora"]) {
  try { require.resolve(dep); }
  catch { execSync(`npm install ${dep}`, { stdio: "inherit" }); }
}

const chalk = require("chalk");
const ora   = require("ora");

// ─── Utils ────────────────────────────────────────────────────────────────────
const IS_WIN = os.platform() === "win32";
const IS_MAC = os.platform() === "darwin";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe" }).toString().trim(); }
  catch { return null; }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function confirm(msg) {
  const ans = await ask(`${chalk.yellow("  ?")} ${msg} ${chalk.dim("(y/n)")} `);
  return ans === "y" || ans === "yes";
}

function abort(reason) {
  console.log();
  console.log(chalk.red("  ✖ Proses dibatalkan.") + (reason ? chalk.dim(` (${reason})`) : ""));
  console.log();
  process.exit(0);
}

function ok(msg)   { console.log(chalk.green("  ✔") + "  " + msg); }
function fail(msg) { console.log(chalk.red("  ✖") + "  " + msg); }
function info(msg) { console.log(chalk.cyan("  »") + "  " + msg); }
function sep()     { console.log(chalk.dim("  ────────────────────────────────────")); }

// ─── Checkers ─────────────────────────────────────────────────────────────────

// Node.js
function checkNode() {
  const ver = run("node --version");
  const major = ver ? parseInt(ver.replace("v", "")) : 0;
  return { ok: major >= 16, version: ver || null };
}

// Java
function checkJava() {
  const out = run("java -version 2>&1");
  if (!out) return { ok: false, version: null };
  const match = out.match(/"([^"]+)"/);
  const ver   = match ? match[1] : null;
  const major = ver ? parseInt(ver.split(".")[0]) : 0;
  return { ok: major >= 11, version: ver };
}

// Android SDK
function checkAndroidSdk() {
  const sdkEnv = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const defaults = IS_WIN
    ? [path.join(os.homedir(), "AppData", "Local", "Android", "Sdk")]
    : IS_MAC
    ? [path.join(os.homedir(), "Library", "Android", "sdk")]
    : [path.join(os.homedir(), "Android", "Sdk"), "/opt/android-sdk"];

  const sdkPath = sdkEnv || defaults.find(fs.existsSync);
  if (!sdkPath || !fs.existsSync(sdkPath)) return { ok: false, path: null };

  const buildTools = path.join(sdkPath, "build-tools");
  const hasBuild   = fs.existsSync(buildTools) && fs.readdirSync(buildTools).some(v => /^\d/.test(v));

  return { ok: hasBuild, path: sdkPath };
}

// Node modules
function checkNodeModules() {
  return fs.existsSync(path.join(__dirname, "node_modules"));
}

// ─── Installers ───────────────────────────────────────────────────────────────

async function installJava() {
  console.log();
  info("Cara install Java JDK 17:");
  sep();
  if (IS_WIN) {
    info(`1. Buka: ${chalk.underline("https://adoptium.net/")}`);
    info(`2. Pilih: ${chalk.white("JDK 17 → Windows → x64 → .msi")}`);
    info("3. Install, lalu restart terminal");
    info(`4. Atau jalankan: ${chalk.white("node jdk.js")} (auto-download)`);
    console.log();
    const useScript = await confirm("Mau auto-install pakai node jdk.js?");
    if (useScript) {
      const jdkPath = path.join(__dirname, "jdk.js");
      if (!fs.existsSync(jdkPath)) {
        fail("jdk.js tidak ditemukan di project ini.");
        return false;
      }
      const spinner = ora("  Mendownload Java...").start();
      try {
        execSync(`node "${jdkPath}"`, { stdio: "inherit" });
        spinner.succeed("Java berhasil diinstall.");
        return true;
      } catch {
        spinner.fail("Gagal install Java.");
        return false;
      }
    }
    info("Silakan install manual, lalu jalankan ulang setup.js");
    return false;
  } else if (IS_MAC) {
    info("brew install openjdk@17");
    info(`echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc`);
    info("source ~/.zshrc");
    console.log();
    const useScript = await confirm("Mau coba auto-install via node jdk.js?");
    if (useScript) {
      const jdkPath = path.join(__dirname, "jdk.js");
      if (!fs.existsSync(jdkPath)) { fail("jdk.js tidak ditemukan."); return false; }
      try { execSync(`node "${jdkPath}"`, { stdio: "inherit" }); return true; }
      catch { fail("Gagal install Java."); return false; }
    }
    return false;
  } else {
    // Linux — bisa auto
    const useScript = await confirm("Mau auto-install via node jdk.js?");
    if (useScript) {
      const jdkPath = path.join(__dirname, "jdk.js");
      if (!fs.existsSync(jdkPath)) { fail("jdk.js tidak ditemukan."); return false; }
      const spinner = ora("  Mendownload Java...").start();
      try {
        execSync(`node "${jdkPath}"`, { stdio: "inherit" });
        spinner.succeed("Java berhasil diinstall.");
        return true;
      } catch {
        spinner.fail("Gagal install Java.");
        return false;
      }
    }
    info("Install manual: sudo apt install openjdk-17-jdk -y");
    info("Lalu jalankan ulang: node setup.js");
    return false;
  }
}

async function installAndroidSdk() {
  console.log();
  info("Android SDK perlu diinstall manual:");
  sep();
  info(`1. Download Android Studio: ${chalk.underline("https://developer.android.com/studio")}`);
  info("2. Install & buka, ikuti setup wizard");
  info("3. Buka SDK Manager → install:");
  info(`   - ${chalk.white("Android SDK Platform 33+")}`);
  info(`   - ${chalk.white("Android SDK Build-Tools")}`);
  info(`   - ${chalk.white("Android SDK Platform-Tools")}`);
  info("4. Set ANDROID_HOME di environment variable:");
  if (IS_WIN) {
    info(`   ${chalk.white(`ANDROID_HOME = C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk`)}`);
    info(`   PATH += ${chalk.white(`%ANDROID_HOME%\\platform-tools`)}`);
  } else if (IS_MAC) {
    info(`   ${chalk.white("export ANDROID_HOME=$HOME/Library/Android/sdk")}`);
    info(`   ${chalk.white("export PATH=$PATH:$ANDROID_HOME/platform-tools")}`);
  } else {
    info(`   ${chalk.white("export ANDROID_HOME=$HOME/Android/Sdk")}`);
    info(`   ${chalk.white("export PATH=$PATH:$ANDROID_HOME/platform-tools")}`);
  }
  info("5. Jalankan ulang: node setup.js");
  console.log();
}

async function installNodeModules() {
  const spinner = ora("  npm install...").start();
  try {
    execSync("npm install", { cwd: __dirname, stdio: "pipe" });
    spinner.succeed("npm install selesai.");
    return true;
  } catch (e) {
    spinner.fail("npm install gagal: " + e.message);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log();
  console.log(chalk.bold.magenta("  ╔══════════════════════════════════════╗"));
  console.log(chalk.bold.magenta("  ║    Converter URL → APK  •  Setup     ║"));
  console.log(chalk.bold.magenta("  ╚══════════════════════════════════════╝"));
  console.log();

  // ── 1. Node.js ──────────────────────────────────────────────────────────────
  console.log(chalk.bold("  [1/4] Node.js"));
  const node = checkNode();
  if (node.ok) {
    ok(`Node.js ${node.version}`);
  } else {
    fail(`Node.js ${node.version || "tidak ditemukan"} (butuh >= v16)`);
    info(`Download: ${chalk.underline("https://nodejs.org/")}`);
    // Node is required to even run this script, so we just inform and abort
    abort("Node.js harus diinstall manual dulu");
  }
  console.log();

  // ── 2. Java ─────────────────────────────────────────────────────────────────
  console.log(chalk.bold("  [2/4] Java JDK"));
  let java = checkJava();
  if (java.ok) {
    ok(`Java ${java.version}`);
  } else {
    fail(`Java ${java.version || "tidak ditemukan"} (butuh >= 11)`);
    const install = await confirm("Mau install Java sekarang?");
    if (!install) abort("Java diperlukan untuk build APK");
    const installed = await installJava();
    if (!installed) abort("Java gagal diinstall, install manual lalu jalankan ulang");
    // Re-check
    java = checkJava();
    if (!java.ok) abort("Java masih belum terdeteksi setelah install, cek PATH lalu restart terminal");
    ok(`Java ${java.version} (terinstall)`);
  }
  console.log();

  // ── 3. Android SDK ──────────────────────────────────────────────────────────
  console.log(chalk.bold("  [3/4] Android SDK"));
  let sdk = checkAndroidSdk();
  if (sdk.ok) {
    ok(`Android SDK: ${sdk.path}`);
  } else {
    fail(`Android SDK tidak ditemukan`);
    const install = await confirm("Mau lihat cara installnya?");
    if (!install) abort("Android SDK diperlukan untuk build APK");
    await installAndroidSdk();
    abort("Install Android SDK dulu, lalu jalankan ulang: node setup.js");
  }
  console.log();

  // ── 4. Node Modules ─────────────────────────────────────────────────────────
  console.log(chalk.bold("  [4/4] Node Modules"));
  let modules = checkNodeModules();
  if (modules) {
    ok("node_modules sudah ada");
  } else {
    fail("node_modules belum ada");
    const install = await confirm("Mau jalankan npm install sekarang?");
    if (!install) abort("npm install diperlukan");
    const installed = await installNodeModules();
    if (!installed) abort("npm install gagal");
  }
  console.log();

  // ── Semua OK → lanjut build ─────────────────────────────────────────────────
  sep();
  console.log();
  console.log(chalk.bold.green("  ✔ Semua requirement terpenuhi!"));
  console.log();

  // Forward semua argumen ke cli.js
  const args = process.argv.slice(2);
  if (args.length === 0) {
    info(`Jalankan build dengan:`);
    info(chalk.white(`node cli.js -u <url> -n <nama app>`));
    info(chalk.white(`node cli.js --help`) + chalk.dim(" untuk lihat semua opsi"));
    console.log();
    process.exit(0);
  }

  // Kalau argumen sudah ada, langsung terusin ke cli.js
  console.log(`  Melanjutkan ke build...`);
  console.log();
  const cliPath = path.join(__dirname, "cli.js");
  if (!fs.existsSync(cliPath)) {
    fail("cli.js tidak ditemukan");
    process.exit(1);
  }
  try {
    execSync(`node "${cliPath}" ${args.map(a => `"${a}"`).join(" ")}`, { stdio: "inherit" });
  } catch {
    process.exit(1);
  }
}

main().catch((e) => {
  console.log(chalk.red("\n  Error: " + e.message));
  process.exit(1);
});
