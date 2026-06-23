#!/usr/bin/env node

/**
 * URL to APK Converter CLI
 * A professional tool to convert any website into an Android application.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const { buildApk } = require('./index');

const program = new Command();

program
  .name('url-to-apk')
  .description('Professional CLI tool to convert a URL into an Android APK')
  .version('1.0.0');

program
  .requiredOption('-u, --url <url>', 'The website URL to convert')
  .requiredOption('-n, --name <name>', 'Name of your Android application')
  .option('-p, --package <id>', 'Package ID (e.g., com.company.app)')
  .option('--app-version <version>', 'App version name', '1.0.0')
  .option('-o, --output <dir>', 'Output directory for the APK', './output')
  .option('--dark', 'Enable experimental dark mode support', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🚀 URL to APK Converter'));
    console.log(chalk.dim('─────────────────────────────────────────'));

    const spinner = ora('Initializing build process...').start();

    try {
      // FIX #1: Validate URL before anything else
      let parsedUrl;
      try {
        parsedUrl = new URL(options.url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Only HTTP and HTTPS URLs are supported');
        }
      } catch (err) {
        spinner.fail(chalk.bold.red('Invalid URL'));
        console.error(chalk.red(`\n❌ ${err.message}\n`));
        process.exit(1);
      }

      // Auto-generate package ID if not provided
      if (!options.package) {
        const domain = parsedUrl.hostname.replace(/^www\./, '');
        const parts = domain.split('.').filter(Boolean).reverse();
        // Sanitize package name parts (no numbers at start, no special chars)
        const sanitizedParts = parts.map(p => p.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, '_$&'));
        options.package = 'com.' + sanitizedParts.join('.');
        spinner.info(`Auto-generated Package ID: ${chalk.yellow(options.package)}`);
        spinner.start('Preparing build environment...');
      }

      // FIX #2: Validate package name format
      const packageRegex = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;
      if (!packageRegex.test(options.package)) {
        spinner.fail(chalk.bold.red('Invalid Package ID'));
        console.error(chalk.red(`\n❌ Package ID must follow Java package naming: com.example.app (lowercase, dot-separated)\n`));
        process.exit(1);
      }

      // FIX #3: Sanitize app name for use in file paths and XML
      const safeAppName = options.name.replace(/[<>&"']/g, '');

      const config = {
        appName: safeAppName,
        packageName: options.package,
        targetUrl: options.url,
        versionName: options.appVersion,
        outputDir: path.resolve(options.output),
        darkMode: options.dark
      };

      spinner.text = 'Modifying Android template...';
      const apkPath = await buildApk(config);

      spinner.succeed(chalk.bold.green('Build Successful!'));
      console.log(chalk.cyan('\n📦 Artifact Details:'));
      console.log(`${chalk.bold('   Path:')} ${apkPath}`);
      console.log(`${chalk.bold('   App :')} ${options.name}`);
      console.log(`${chalk.bold('   Pkg :')} ${options.package}\n`);

    } catch (error) {
      spinner.fail(chalk.bold.red('Build Failed'));
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

program.parse(process.argv);