require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { S3 } = require('aws-sdk');

const backupDB = async () => {
  try {
    const timestamp = moment().format('YYYY-MM-DD-HH-mm');
    const backupDir = path.join(__dirname, '../../backups');
    const filename = `backup-${timestamp}.gz`;
    const filepath = path.join(backupDir, filename);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // MongoDB dump command
    const cmd = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${filepath}" --gzip`;

    console.log('Starting database backup...');
    
    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });

    // Upload to S3 if configured
    if (process.env.AWS_BUCKET_NAME) {
      const s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `backups/${filename}`,
        Body: fs.createReadStream(filepath)
      }).promise();

      console.log('Backup uploaded to S3');
    }

    console.log(`Backup completed: ${filename}`);
    return filepath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
};

module.exports = backupDB;

// Run directly if called from command line
if (require.main === module) {
  backupDB().catch(console.error);
}