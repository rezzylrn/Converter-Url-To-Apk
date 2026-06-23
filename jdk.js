const { execSync } = require('child_process');

try {
    console.log("starting download java sdk, wait a minuetes...");
    execSync('curl -L -o java.tar.gz https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz', { stdio: 'inherit' });
    
    console.log("Success, Extracking file...");
    execSync('tar -xzf java.tar.gz', { stdio: 'inherit' });
    
    console.log("removing the trash...");
    execSync('rm java.tar.gz');
    
    console.log("done.");
} catch (err) {
    console.error("error:", err.message);
}
