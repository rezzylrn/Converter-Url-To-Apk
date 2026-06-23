#!/usr/bin/env node

/**
 * URL to APK Converter CLI
 * A professional tool to convert any website into an Android application.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');
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
  .option('-v, --version-name <version>', 'App version name', '1.0.0')
  .option('-o, --output <dir>', 'Output directory for the APK', './output')
  .option('--dark', 'Enable experimental dark mode support', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🚀 URL to APK Converter'));
    console.log(chalk.dim('─────────────────────────────────────────'));

    const spinner = ora('Initializing build process...').start();

    try {
      // Auto-generate package ID if not provided
      if (!options.package) {
        const domain = new URL(options.url).hostname.replace('www.', '');
        options.package = `com.${domain.split('.').reverse().join('.')}`;
        spinner.info(`Auto-generated Package ID: ${chalk.yellow(options.package)}`);
        spinner.start('Preparing build environment...');
      }

      const config = {
        appName: options.name,
        packageName: options.package,
        targetUrl: options.url,
        versionName: options.versionName,
        outputDir: options.output,
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
