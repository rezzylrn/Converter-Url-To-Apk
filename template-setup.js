const fs = require("fs");
const path = require("path");
const https = require("https"); // Use https module for downloading

const dir = "android-template";

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
rootProject.name = "BotWebView"
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
    <application android:allowBackup="true" android:label="Bot APK" android:supportsRtl="true" android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
    `.trim(),

    [`${dir}/app/src/main/java/com/example/webviewapp/MainActivity.kt`]: `
package com.example.webviewapp
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)
        webView.webViewClient = WebViewClient()
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.loadUrl("URL_TARGET_DISINI")
    }
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) { webView.goBack() } else { super.onBackPressed() }
    }
}
    `.trim(),

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

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get \'${url}\' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on("finish", () => resolve());
            file.on("error", (err) => reject(err));
        }).on("error", (err) => reject(err));
    });
}

async function setupGradle() {
    try {
        console.log("Downloading Gradle Wrapper...");
        const gradlewPath = path.join(dir, "gradlew");
        const jarPath = path.join(dir, "gradle/wrapper/gradle-wrapper.jar");
        
        await downloadFile("https://raw.githubusercontent.com/gradle/gradle/v8.0.0/gradlew", gradlewPath);
        fs.chmodSync(gradlewPath, 0o755); 
        
        await downloadFile("https://raw.githubusercontent.com/gradle/gradle/v8.0.0/gradle/wrapper/gradle-wrapper.jar", jarPath);
        
        console.log("Success! Folder \'android-template\' successfully set up.");
    } catch (error) {
        console.error("Failed to download Gradle wrapper: ", error.message);
        throw error; // Re-throw to indicate failure
    }
}

// Only run setupGradle if this script is executed directly
if (require.main === module) {
    setupGradle().catch(e => {
        console.error("Error during template setup:", e.message);
        process.exit(1);
    });
}

module.exports = { setupGradle };
