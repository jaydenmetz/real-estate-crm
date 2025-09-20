const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.config = {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT || '5432',
      user: process.env.DATABASE_USER || 'postgres',
      database: process.env.DATABASE_NAME || 'railway',
      password: process.env.DATABASE_PASSWORD
    };

    // Validate required environment variables
    if (!this.config.password || !this.config.host) {
      logger.error('⚠️ Database credentials not configured in environment variables');
      logger.error('Please set DATABASE_HOST and DATABASE_PASSWORD in Railway environment');
    }

    this.backupDir = path.join(process.cwd(), 'backups');
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create backup directory:', error);
    }
  }

  async createBackup() {
    await this.ensureBackupDirectory();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${this.config.database}_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    const command = `PGPASSWORD="${this.config.password}" pg_dump \
      -h ${this.config.host} \
      -p ${this.config.port} \
      -U ${this.config.user} \
      -d ${this.config.database} \
      --no-owner \
      --no-privileges \
      --if-exists \
      --clean \
      --file="${filepath}"`;

    try {
      logger.info('Starting database backup...');
      await execAsync(command);

      // Compress the backup
      await execAsync(`gzip "${filepath}"`);
      const compressedPath = `${filepath}.gz`;

      // Get file stats
      const stats = await fs.stat(compressedPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(`✅ Backup completed: ${filename}.gz (${sizeInMB} MB)`);

      // Clean up old backups (keep last 30 days)
      await this.cleanupOldBackups();

      return {
        success: true,
        filename: `${filename}.gz`,
        path: compressedPath,
        size: sizeInMB,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      for (const file of files) {
        if (file.startsWith('backup_') && file.endsWith('.sql.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime.getTime() < thirtyDaysAgo) {
            await fs.unlink(filePath);
            logger.info(`Deleted old backup: ${file}`);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups:', error);
    }
  }

  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      const files = await fs.readdir(this.backupDir);

      const backups = [];
      for (const file of files) {
        if (file.startsWith('backup_') && file.endsWith('.sql.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);

          backups.push({
            filename: file,
            size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
            created: stats.mtime,
            path: filePath
          });
        }
      }

      // Sort by date, newest first
      backups.sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      logger.error('Failed to list backups:', error);
      return [];
    }
  }

  async restoreBackup(filename) {
    const filepath = path.join(this.backupDir, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new Error(`Backup file not found: ${filename}`);
    }

    const command = filename.endsWith('.gz')
      ? `gunzip < "${filepath}" | PGPASSWORD="${this.config.password}" psql \
          -h ${this.config.host} \
          -p ${this.config.port} \
          -U ${this.config.user} \
          -d ${this.config.database}`
      : `PGPASSWORD="${this.config.password}" psql \
          -h ${this.config.host} \
          -p ${this.config.port} \
          -U ${this.config.user} \
          -d ${this.config.database} \
          < "${filepath}"`;

    try {
      logger.info(`Restoring from backup: ${filename}`);
      await execAsync(command);
      logger.info('✅ Database restored successfully');

      return {
        success: true,
        message: 'Database restored successfully',
        filename
      };
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  // Get backup status for health check
  async getBackupStatus() {
    const backups = await this.listBackups();
    const latestBackup = backups[0];

    if (!latestBackup) {
      return {
        status: 'warning',
        message: 'No backups found',
        lastBackup: null
      };
    }

    const hoursSinceBackup = (Date.now() - latestBackup.created) / (1000 * 60 * 60);

    if (hoursSinceBackup < 24) {
      return {
        status: 'healthy',
        message: 'Backup is up to date',
        lastBackup: latestBackup,
        hoursSinceBackup: hoursSinceBackup.toFixed(1)
      };
    } else if (hoursSinceBackup < 48) {
      return {
        status: 'warning',
        message: 'Backup is over 24 hours old',
        lastBackup: latestBackup,
        hoursSinceBackup: hoursSinceBackup.toFixed(1)
      };
    } else {
      return {
        status: 'critical',
        message: 'Backup is over 48 hours old!',
        lastBackup: latestBackup,
        hoursSinceBackup: hoursSinceBackup.toFixed(1)
      };
    }
  }
}

module.exports = new BackupService();