require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execAsync = promisify(exec);

const restoreDB = async (backupPath) => {
  try {
    if (!backupPath) {
      // If no specific backup is specified, use the latest one
      const backupDir = path.join(__dirname, '../../backups');
      const files = fs.readdirSync(backupDir);
      const latestBackup = files
        .filter(f => f.endsWith('.gz'))
        .sort()
        .pop();
      
      if (!latestBackup) {
        throw new Error('No backup files found');
      }
      
      backupPath = path.join(backupDir, latestBackup);
    }

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    console.log('Starting database restore...');
    console.log(`Using backup file: ${backupPath}`);

    // MongoDB restore command
    const cmd = `mongorestore --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;

    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      console.warn('Restore warnings:', stderr);
    }

    console.log('Database restore completed successfully');
    console.log(stdout);

  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
};

// Allow running from command line with optional backup path
if (require.main === module) {
  const backupPath = process.argv[2];
  restoreDB(backupPath).catch(console.error);
}

module.exports = restoreDB;