// Database Backup Script
// Usage: node scripts/backup-database.js
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.POSTGRES_URL);

async function backup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupDir = path.join(__dirname, '..', 'backups', timestamp);

    console.log('📦 Starting database backup...');
    console.log('📁 Backup directory:', backupDir);

    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });

    // List of tables to backup
    const tables = ['users', 'contracts', 'transactions', 'notification_list'];

    let totalRows = 0;

    for (const table of tables) {
      try {
        // Export table data
        const result = await sql`SELECT * FROM ${sql(table)}`;
        const data = result.rows;

        // Save to JSON file
        const filename = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        totalRows += data.length;
        console.log(`✅ ${table}: ${data.length} rows → ${filename}`);
      } catch (tableError) {
        console.error(`❌ Error backing up ${table}:`, tableError.message);
      }
    }

    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      tables: tables,
      totalRows: totalRows,
      backupDir: backupDir,
    };

    const metadataFile = path.join(backupDir, '_metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    console.log('\n✅ Backup complete!');
    console.log(`📊 Total rows backed up: ${totalRows}`);
    console.log(`📁 Backup location: ${backupDir}`);

    // Create a "latest" symlink/copy
    const latestDir = path.join(__dirname, '..', 'backups', 'latest');
    if (fs.existsSync(latestDir)) {
      fs.rmSync(latestDir, { recursive: true });
    }
    fs.cpSync(backupDir, latestDir, { recursive: true });
    console.log(`📁 Latest backup: ${latestDir}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
