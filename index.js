require('dotenv').config();
const { Telegraf } = require("telegraf");
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require('path');
process.env.JAVA_HOME = path.join(__dirname, 'jdk-17.0.2');
process.env.PATH = `${process.env.JAVA_HOME}/bin:${process.env.PATH}`;
// Pastikan Anda mengatur BOT_TOKEN di environment variable atau file .env
const bot = new Telegraf(process.env.BOT_TOKEN);
const ANDROID_TEMPLATE_DIR = path.join(__dirname, "android-template");
const MAIN_ACTIVITY_PATH = path.join(ANDROID_TEMPLATE_DIR, "app", "src", "main", "java", "com", "example", "webviewapp", "MainActivity.kt");
const PLACEHOLDER = "URL_TARGET_DISINI";
// Fungsi untuk validasi URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}
bot.start((ctx) => ctx.reply("welcome to my bot, u can convert url to apk (webView base)."));
bot.help((ctx) => ctx.reply("send to me url for convert to apk, exampe : !build https://www.google.com"));
bot.command("build", async (ctx) => {
    const messageText = ctx.message.text;
    const args = messageText.split(" ");
    if (args.length !== 2) {
        return ctx.reply("Wrong!! Use: !build <URL>");
    }
    const targetUrl = args[1];
    if (!isValidUrl(targetUrl)) {
        return ctx.reply("URL not valid, Example : https://www.example.com.");
    }
    await ctx.reply(`Menerima URL: ${targetUrl}. Starting build... wait a minutes.`);

    // Jalankan di background, tidak perlu await
    buildAPK(ctx, targetUrl).catch(err => {
        console.error("Background build error:", err);
    });
});

async function buildAPK(ctx, targetUrl) {
    let originalMainActivityContent;
    try {
        // 1. Baca konten MainActivity asli
        originalMainActivityContent = await fs.readFile(MAIN_ACTIVITY_PATH, "utf8");
        // 2. Ganti placeholder dengan URL target
        const modifiedContent = originalMainActivityContent.replace(PLACEHOLDER, targetUrl);
        // 3. Tulis kembali konten yang dimodifikasi ke MainActivity
        await fs.writeFile(MAIN_ACTIVITY_PATH, modifiedContent, "utf8");
        // 4. Jalankan perintah Gradle build
        await ctx.reply("🔨 Menjalankan Gradle build...");
        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(
                "mkdir -p /home/container/.android /home/container/.gradle && chmod +x ./gradlew && ./gradlew assembleDebug",
                {
                    cwd: ANDROID_TEMPLATE_DIR,
                    env: {
                        ...process.env,
                        HOME: "/home/container",
                        ANDROID_USER_HOME: "/home/container/.android",
                        GRADLE_USER_HOME: "/home/container/.gradle",
                    },
                    maxBuffer: 1024 * 1024 * 10,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        return reject(new Error(`Gradle build gagal: ${error.message}\n${stderr}`));
                    }
                    resolve({ stdout, stderr });
                }
            );
        });
        console.log(`Gradle stdout: ${stdout}`);
        if (stderr) console.warn(`Gradle stderr: ${stderr}`);
        // 5. Cari file APK yang dihasilkan
        const apkPath = path.join(
            ANDROID_TEMPLATE_DIR,
            "app", "build", "outputs", "apk", "debug", "app-debug.apk"
        );
        await fs.access(apkPath);
        await ctx.replyWithDocument({
            source: apkPath,
            filename: `app-${new URL(targetUrl).hostname}.apk`,
        });
        await ctx.reply("your application has been completed!");
    } catch (error) {
        console.error("An error occurred in the build process:", error);
        await ctx.reply(`❌ Terjadi kesalahan: ${error.message}`);
    } finally {
        // 6. Kembalikan MainActivity ke kondisi semula
        if (originalMainActivityContent) {
            await fs.writeFile(MAIN_ACTIVITY_PATH, originalMainActivityContent).catch((err) => {
                console.error("Failed to restore MainActivity.kt:", err);
            });
        }
    }
}
bot.launch({
    handlerTimeout: Infinity
});
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));