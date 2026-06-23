#!/usr/bin/env node

/**
 * Converter-Url-To-Apk — Pure CLI
 * 
 * Usage:
 *   node cli.js -u https://example.com -n "My App" -p com.example.app
 *   node cli.js --help
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// ─── Auto-install deps ────────────────────────────────────────────────────────
const DEPS = ["commander", "chalk", "ora"];
for (const dep of DEPS) {
  try { require.resolve(dep); }
  catch { execSync(`npm install ${dep}`, { stdio: "inherit" }); }
}

const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const log = {
  info: (msg) => console.log(chalk.cyan("  info ") + msg),
  ok:   (msg) => console.log(chalk.green("    ok ") + msg),
  warn: (msg) => console.log(chalk.yellow("  warn ") + msg),
  err:  (msg) => console.log(chalk.red("   err ") + msg),
};

function isValidUrl(str) {
  try { new URL(str); return true; }
  catch { return false; }
}

function isValidPkg(str) {
  return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(str);
}

function autoPkg(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".").reverse().join(".") + ".app";
  } catch { return "com.example.app"; }
}

function checkJava() {
  try { execSync("java -version 2>&1"); return true; }
  catch { return false; }
}

// ─── Build ────────────────────────────────────────────────────────────────────
async function build(opts) {
  const {
    url, name, pkg,
    appVersion: version,
    output: outputDir,
    dark: darkMode,
    offline,
  } = opts;

  // Validate
  if (!isValidUrl(url)) {
    log.err(`Invalid URL: "${url}"`);
    process.exit(1);
  }
  if (!isValidPkg(pkg)) {
    log.err(`Invalid package name: "${pkg}" — must be like com.example.app`);
    process.exit(1);
  }

  console.log();
  console.log(chalk.bold("  Converter URL → APK"));
  console.log(chalk.dim("  ─────────────────────────────"));
  log.info(`url      ${chalk.white(url)}`);
  log.info(`name     ${chalk.white(name)}`);
  log.info(`pkg      ${chalk.white(pkg)}`);
  log.info(`version  ${chalk.white(version)}`);
  log.info(`output   ${chalk.white(outputDir)}`);
  log.info(`dark     ${chalk.white(darkMode ? "yes" : "no")}`);
  log.info(`offline  ${chalk.white(offline ? "yes" : "no")}`);
  console.log();

  // Step 1: Java
  let spinner = ora("Checking Java...").start();
  if (!checkJava()) {
    spinner.fail("Java not found. Run: node jdk.js");
    process.exit(1);
  }
  spinner.succeed("Java OK");

  // Step 2: Template setup
  spinner = ora("Running template setup...").start();
  const setupPath = path.join(__dirname, "template-setup.js");
  if (fs.existsSync(setupPath)) {
    try { require(setupPath); }
    catch (e) { spinner.fail("Template setup failed: " + e.message); process.exit(1); }
  }
  spinner.succeed("Template ready");

  // Step 3: Output dir
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 4: Write .env config
  spinner = ora("Writing config...").start();
  const envContent = [
    `APP_NAME="${name}"`,
    `PACKAGE_NAME="${pkg}"`,
    `TARGET_URL="${url}"`,
    `VERSION_NAME="${version}"`,
    `DARK_MODE=${darkMode}`,
    `OFFLINE_MODE=${offline}`,
    `OUTPUT_DIR="${outputDir}"`,
  ].join("\n");
  fs.writeFileSync(path.join(__dirname, ".env"), envContent);
  spinner.succeed("Config written to .env");

  // Step 5: Build
  spinner = ora("Building APK...").start();
  const env = {
    ...process.env,
    APP_NAME: name,
    PACKAGE_NAME: pkg,
    TARGET_URL: url,
    VERSION_NAME: version,
    DARK_MODE: String(darkMode),
    OFFLINE_MODE: String(offline),
    OUTPUT_DIR: outputDir,
  };

  try {
    const indexPath = path.join(__dirname, "index.js");
    if (fs.existsSync(indexPath)) {
      execSync(`node "${indexPath}"`, { env, stdio: "pipe" });
    } else {
      execSync(
        `npx @bubblewrap/cli build --manifest ${url}/manifest.json ` +
        `--packageId ${pkg} --name "${name}" --outputDir "${outputDir}"`,
        { env, stdio: "pipe" }
      );
    }
    spinner.succeed("Build complete");
  } catch (e) {
    spinner.fail("Build failed");
    log.err(e.message);
    process.exit(1);
  }

  // Done
  const apkPath = path.join(outputDir, "app-debug.apk");
  console.log();
  if (fs.existsSync(apkPath)) {
    log.ok(chalk.bold(`APK → ${apkPath}`));
  } else {
    log.warn(`Done. Check output folder: ${outputDir}`);
  }
  console.log();
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
const program = new Command();

program
  .name("url2apk")
  .description("Convert a URL into an Android APK")
  .version("2.0.0")
  .requiredOption("-u, --url <url>",        "Target URL (required)")
  .requiredOption("-n, --name <name>",      "App name (required)")
  .option("-p, --pkg <package>",            "Package name (default: auto from URL)")
  .option("-v, --app-version <version>",    "Version name", "1.0.0")
  .option("-o, --output <dir>",             "Output directory", "./output")
  .option("--dark",                         "Enable dark mode", false)
  .option("--offline",                      "Enable offline cache", false)
  .addHelpText("after", `
Examples:
  node cli.js -u https://example.com -n "My App"
  node cli.js -u https://example.com -n "My App" -p com.example.app
  node cli.js -u https://mysite.com -n "MySite" -p com.mysite.app --dark --offline -o ./dist
  `);

program.parse(process.argv);
const opts = program.opts();

// Auto-generate pkg if not provided
if (!opts.pkg) {
  opts.pkg = autoPkg(opts.url);
  log.info(`Package name auto-set to: ${chalk.white(opts.pkg)}`);
}

build(opts).catch((e) => {
  log.err(e.message);
  process.exit(1);
});
