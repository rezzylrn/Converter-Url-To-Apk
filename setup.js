#!/usr/bin/env node

/**
 * Setup and Environment Verification
 * Checks for Node.js, Java JDK, and Android SDK requirements.
 * Offers interactive installation for missing components.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

// --- Auto-install dependencies ---
const DEPS = ["chalk", "ora"];
for (const dep of DEPS) {
    try {
        require.resolve(dep);
    } catch (e) {
        console.log(`Installing missing dependency: ${dep}...`);
        execSync(`npm install ${dep}`, { stdio: "inherit" });
    }
}

const chalk = require("chalk");
const ora = require("ora");
const { setupGradle } = require("./template-setup");

// --- Utility Functions ---
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

function ok(msg) { console.log(chalk.green("  ✔") + "  " + msg); }
function fail(msg) { console.log(chalk.red("  ✖") + "  " + msg); }
function info(msg) { console.log(chalk.cyan("  »") + "  " + msg); }
function sep() { console.log(chalk.dim("  ────────────────────────────────────")); }

// --- Requirement Checkers ---

function checkNode() {
    const ver = run("node --version");
    const major = ver ? parseInt(ver.replace("v", "")) : 0;
    return { ok: major >= 16, version: ver || null };
}

function checkJava() {
    const out = run("java -version 2>&1");
    if (!out) return { ok: false, version: null };
    const match = out.match(/"([^"]+)"/);
    const ver = match ? match[1] : null;
    const major = ver ? parseInt(ver.split(".")[0]) : 0;
    return { ok: major >= 11, version: ver };
}

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
    const hasBuild = fs.existsSync(buildTools) && fs.readdirSync(buildTools).some(v => /^\d/.test(v));

    return { ok: hasBuild, path: sdkPath };
}

// --- Installers ---

async function installJava() {
    console.log();
    info("Attempting to auto-install Java JDK 17...");
    const jdkPath = path.join(__dirname, "jdk.js");
    if (!fs.existsSync(jdkPath)) {
        fail("jdk.js not found in this project. Please install Java manually.");
        return false;
    }
    const spinner = ora("  Downloading and installing Java...").start();
    try {
        execSync(`node "${jdkPath}"`, { stdio: "inherit" });
        spinner.succeed("Java installed successfully.");
        return true;
    } catch (e) {
        spinner.fail("Failed to install Java: " + e.message);
        return false;
    }
}

async function showAndroidSdkInstallGuide() {
    console.log();
    info("Android SDK needs to be installed manually:");
    sep();
    info(`1. Download Android Studio: ${chalk.underline("https://developer.android.com/studio")}`);
    info("2. Install & open, follow the setup wizard");
    info("3. Open SDK Manager → install:");
    info(`   - ${chalk.white("Android SDK Platform 33+")}`);
    info(`   - ${chalk.white("Android SDK Build-Tools")}`);
    info(`   - ${chalk.white("Android SDK Command-line Tools")}`);
    info(`   - ${chalk.white("Android SDK Platform-Tools")}`);
    info("4. Set ANDROID_HOME environment variable:");
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
    info("5. Then re-run: node setup.js");
    console.log();
}

async function initializeAndroidTemplate() {
    console.log();
    info("Initializing Android project template...");
    const templateSetupPath = path.join(__dirname, "template-setup.js");
    if (!fs.existsSync(templateSetupPath)) {
        fail("template-setup.js not found. Cannot initialize template.");
        return false;
    }
    const spinner = ora("  Running template-setup.js...").start();
    try {
        await setupGradle(); 
        spinner.succeed("Android template initialized successfully.");
        return true;
    } catch (e) {
        spinner.fail("Failed to initialize Android template: " + e.message);
        return false;
    }
}

// --- Main Setup Flow ---
async function main() {
    console.log();
    console.log(chalk.bold.magenta("  ╔══════════════════════════════════════╗"));
    console.log(chalk.bold.magenta("  ║    Converter URL → APK  •  Setup     ║"));
    console.log(chalk.bold.magenta("  ╚══════════════════════════════════════╝"));
    console.log();

    // 1. Node.js Check
    console.log(chalk.bold("  [1/3] Node.js"));
    const node = checkNode();
    if (node.ok) {
        ok(`Node.js ${node.version}`);
    } else {
        fail(`Node.js ${node.version || "not found"} (required >= v16)`);
        abort("Node.js must be installed manually to run this script.");
    }
    console.log();

    // 2. Java JDK Check
    console.log(chalk.bold("  [2/3] Java JDK"));
    let java = checkJava();
    if (java.ok) {
        ok(`Java ${java.version}`);
    } else {
        fail(`Java ${java.version || "not found"} (required >= 11)`);
        const install = await confirm("Do you want to install Java now?");
        if (!install) abort("Java is required to build APKs.");
        const installed = await installJava();
        if (!installed) abort("Java installation failed. Please install manually and re-run setup.");
        java = checkJava();
        if (!java.ok) abort("Java still not detected after installation. Check PATH and restart terminal.");
        ok(`Java ${java.version} (installed)`);
    }
    console.log();

    // 3. Android SDK Check
    console.log(chalk.bold("  [3/3] Android SDK"));
    let sdk = checkAndroidSdk();
    if (sdk.ok) {
        ok(`Android SDK: ${sdk.path}`);
    } else {
        fail(`Android SDK not found`);
        const showGuide = await confirm("Do you want to see the Android SDK installation guide?");
        if (showGuide) {
            await showAndroidSdkInstallGuide();
        }
        abort("Android SDK is required to build APKs. Please install it and re-run setup.");
    }
    console.log();

    // 4. Android Template Initialization (Automatic)
    console.log(chalk.bold("  [Auto] Android Template"));
    if (!fs.existsSync(path.join(__dirname, "android-template"))) {
        const initialized = await initializeAndroidTemplate();
        if (!initialized) abort("Failed to initialize Android template.");
    } else {
        ok("Android template already initialized.");
    }
    console.log();

    // Final Summary
    sep();
    console.log();
    console.log(chalk.bold.green("✅ All requirements met! System is ready to build APKs!"));
    console.log(`Run: ${chalk.cyan("node cli.js -u <url> -n \"<app name>\"")}\n`);
}

main().catch((e) => {
    console.log(chalk.red("\n  Error: " + e.message));
    process.exit(1);
});
