const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const dir = "android-template";

// FIX #10: Extract file creation into a function (no more side-effect imports)
function createTemplateFiles() {
    const folders = [
        `${dir}/app/src/main/java/com/example/webviewapp`,
        `${dir}/app/src/main/res/values`,
        `${dir}/gradle/wrapper`
    ];

    folders.forEach(f => fs.mkdirSync(f, { recursive: true }));

    const files = {
        [`${dir}/settings.gradle`]: `
pluginManagement { repositories { gradlePluginPortal(); google(); mavenCentral() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name = "WebViewApp"
include ":app"
        `.trim(),

        [`${dir}/gradle.properties`]: `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
        `.trim(),

        [`${dir}/build.gradle`]: `
plugins {
    id "com.android.application" version "8.0.2" apply false
    id "org.jetbrains.kotlin.android" version "1.8.20" apply false
}
        `.trim(),

        [`${dir}/app/build.gradle`]: `
plugins { id "com.android.application"; id "org.jetbrains.kotlin.android" }
android {
    namespace "com.example.webviewapp"
    compileSdk 33
    defaultConfig { applicationId "com.example.webviewapp"; minSdk 21; targetSdk 33; versionCode 1; versionName "1.0" }
    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation "androidx.core:core-ktx:1.10.1"
    implementation "androidx.appcompat:appcompat:1.6.1"
}
        `.trim(),

        [`${dir}/app/src/main/AndroidManifest.xml`]: `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.example.webviewapp">
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:allowBackup="true" android:label="WebView App" android:supportsRtl="true" android:theme="@style/Theme.AppCompat.Light.NoActionBar" android:usesCleartextTraffic="true">
        <activity android:name=".MainActivity" android:exported="true" android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
        `.trim(),

        // FIX #11: Updated MainActivity.kt with modern APIs
        [`${dir}/app/src/main/java/com/example/webviewapp/MainActivity.kt`]: `
package com.example.webviewapp
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)
        webView.webViewClient = WebViewClient()
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.setSupportZoom(true)
        webView.settings.builtInZoomControls = true
        webView.settings.displayZoomControls = false
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.loadUrl("URL_TARGET_DISINI")

        // FIX #12: Use modern OnBackPressedDispatcher instead of deprecated onBackPressed
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressed()
                }
            }
        })
    }
}
        `.trim(),

        // FIX #13: Corrected distributionUrl escaping (single backslash in .properties file)
        [`${dir}/gradle/wrapper/gradle-wrapper.properties`]: `
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.0-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
        `.trim()
    };

    for (const [filePath, content] of Object.entries(files)) {
        fs.writeFileSync(filePath, content);
    }

    console.log("Android template files created.");
}

// FIX #14: Follow HTTP redirects in download
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const request = (urlStr) => {
            const client = urlStr.startsWith('https') ? https : http;
            client.get(urlStr, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    request(response.headers.location);
                    return;
                }
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to get '${urlStr}' (${response.statusCode})`));
                    return;
                }
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on("finish", () => { file.close(); resolve(); });
                file.on("error", (err) => { file.close(); reject(err); });
            }).on("error", (err) => reject(err));
        };
        request(url);
    });
}

async function setupGradle() {
    try {
        // Always recreate template files to ensure clean state
        createTemplateFiles();

        console.log("Downloading Gradle Wrapper...");
        const gradlewPath = path.join(dir, "gradlew");
        const gradlewBatPath = path.join(dir, "gradlew.bat");
        const jarPath = path.join(dir, "gradle/wrapper/gradle-wrapper.jar");

        // FIX #15: Download gradlew from a reliable source
        await downloadFile(
            "https://raw.githubusercontent.com/gradle/gradle/v8.0.0/gradlew",
            gradlewPath
        );
        fs.chmodSync(gradlewPath, 0o755);

        // FIX #16: Also download gradlew.bat for Windows users
        await downloadFile(
            "https://raw.githubusercontent.com/gradle/gradle/v8.0.0/gradlew.bat",
            gradlewBatPath
        );

        await downloadFile(
            "https://raw.githubusercontent.com/gradle/gradle/v8.0.0/gradle/wrapper/gradle-wrapper.jar",
            jarPath
        );

        console.log("Success! Folder 'android-template' successfully set up.");
    } catch (error) {
        console.error("Failed to download Gradle wrapper: ", error.message);
        throw error;
    }
}

// Only run setupGradle if this script is executed directly
if (require.main === module) {
    setupGradle().catch(e => {
        console.error("Error during template setup:", e.message);
        process.exit(1);
    });
}

module.exports = { setupGradle, createTemplateFiles };