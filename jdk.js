const { execSync } = require('child_process');

try {
    console.log("Mulai download Java 17 Portable (Sabar bontot, ukurannya sekitar 180MB)...");
    // Kita pake curl karena wget di server lu nggak ada
    execSync('curl -L -o java.tar.gz https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz', { stdio: 'inherit' });
    
    console.log("Download kelar! Lagi ekstrak file...");
    execSync('tar -xzf java.tar.gz', { stdio: 'inherit' });
    
    console.log("Beres-beres file sampah...");
    execSync('rm java.tar.gz');
    
    console.log("MANTAP! Java udah nongkrong di folder jdk-17.0.2");
} catch (err) {
    console.error("Waduh error:", err.message);
}