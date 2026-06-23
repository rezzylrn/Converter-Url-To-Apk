/**
 * Core build logic for Converter URL to APK.
 * This script handles the modification of the Android template and triggers the Gradle build.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function buildApk(config) {
    const {
        appName,
        packageName,
        targetUrl,
        versionName,
        outputDir,
        darkMode
    } = config;

    const templateDir = path.join(__dirname, 'android-template');

    if (!fs.existsSync(templateDir)) {
        throw new Error("Android template not found. Please run 'node setup.js' first.");
    }

    console.log(`\nBuilding APK for: ${appName} (${packageName})`);

    // 1. Update AndroidManifest.xml
    const manifestPath = path.join(templateDir, 'app/src/main/AndroidManifest.xml');
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    manifest = manifest.replace(/package="[^"]*"/, `package="${packageName}"`);
    manifest = manifest.replace(/android:label="[^"]*"/, `android:label="${appName}"`);
    fs.writeFileSync(manifestPath, manifest);

    // 2. Update build.gradle
    const gradlePath = path.join(templateDir, 'app/build.gradle');
    let gradle = fs.readFileSync(gradlePath, 'utf8');
    gradle = gradle.replace(/namespace '[^']*'/, `namespace '${packageName}'`);
    gradle = gradle.replace(/applicationId "[^"]*"/, `applicationId "${packageName}"`);
    gradle = gradle.replace(/versionName "[^"]*"/, `versionName "${versionName}"`);
    fs.writeFileSync(gradlePath, gradle);

    // 3. Update MainActivity.kt
    const activityPath = path.join(templateDir, 'app/src/main/java/com/example/webviewapp/MainActivity.kt');

    let activity = fs.readFileSync(activityPath, 'utf8');
    activity = activity.replace(/package [^\n]*/, `package ${packageName}`);

    // FIX #4: Escape special characters in URL to prevent Kotlin code injection
    const escapedUrl = targetUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    activity = activity.replace(/loadUrl\("[^"]*"\)/, `loadUrl("${escapedUrl}")`);

    // Dark mode implementation via WebView settings
    if (darkMode === 'true' || darkMode === true) {
        activity = activity.replace(
            'webView.settings.domStorageEnabled = true',
            'webView.settings.domStorageEnabled = true\n        webView.settings.forceDark = WebSettings.FORCE_DARK_ON'
        );
        // Add the import for WebSettings at the top
        if (!activity.includes('import android.webkit.WebSettings')) {
            activity = activity.replace(
                'import android.webkit.WebViewClient',
                'import android.webkit.WebSettings\nimport android.webkit.WebViewClient'
            );
        }
    }

    // FIX #5: Move the MainActivity.kt to the correct folder matching the package name
    const packageFolder = path.join(templateDir, 'app/src/main/java', ...packageName.split('.'));
    fs.mkdirSync(packageFolder, { recursive: true });
    const newActivityPath = path.join(packageFolder, 'MainActivity.kt');
    fs.writeFileSync(newActivityPath, activity);

    // FIX #6: Clean up old template directory to prevent duplicate class errors
    const oldTemplateDir = path.join(templateDir, 'app/src/main/java/com/example/webviewapp');
    if (fs.existsSync(oldTemplateDir) && newActivityPath !== activityPath) {
        try {
            fs.rmSync(oldTemplateDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.warn(`Warning: Could not clean up old template directory: ${cleanupErr.message}`);
        }
    }

    // 4. Run Gradle Build
    console.log("Running Gradle build... (this may take a few minutes)");
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

    try {
        execSync(`${gradlew} assembleDebug`, {
            cwd: templateDir,
            stdio: 'pipe',
            timeout: 600000  // FIX #7: 10 minute timeout to prevent infinite hangs
        });
    } catch (error) {
        // FIX #8: Capture and display actual Gradle error output
        const stderr = error.stderr ? error.stderr.toString() : '';
        const stdout = error.stdout ? error.stdout.toString() : '';
        const errorOutput = (stderr + '\n' + stdout).trim();
        throw new Error(
            "Gradle build failed.\n" +
            "Check your Android SDK and Java setup.\n" +
            (errorOutput ? `\nBuild output:\n${errorOutput.substring(-2000)}` : '')
        );
    }

    // 5. Copy output
    const apkSource = path.join(templateDir, 'app/build/outputs/apk/debug/app-debug.apk');
    if (fs.existsSync(apkSource)) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const destPath = path.join(outputDir, `${appName.replace(/\s+/g, '_')}.apk`);
        fs.copyFileSync(apkSource, destPath);
        return destPath;
    } else {
        throw new Error("APK generated but not found in expected location.");
    }
}

// If called directly via CLI (from cli.js)
if (require.main === module) {
    const config = {
        appName: process.env.APP_NAME,
        packageName: process.env.PACKAGE_NAME,
        targetUrl: process.env.TARGET_URL,
        versionName: process.env.VERSION_NAME || '1.0.0',
        outputDir: process.env.OUTPUT_DIR || './output',
        darkMode: process.env.DARK_MODE === 'true'
    };

    buildApk(config)
        .then(apkPath => console.log(`\nSUCCESS: APK saved to ${apkPath}`))
        .catch(err => {
            console.error(`\nERROR: ${err.message}`);
            process.exit(1);
        });
}

module.exports = { buildApk };