import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function emergencyBackup() {
  console.log('🚨 EMERGENCY BACKUP: Starting database export...\n');

  const tables = [
    'users',
    'makers',
    'products',
    'videos',
    'orders',
    'order_items',
    'comments',
    'posts',
    'product_likes',
    'video_likes',
    'post_likes',
    'comment_likes',
    'follows',
    'messages',
    'notifications',
    'reports',
    'group_buys',
  ];

  const backup: Record<string, any[]> = {};
  let totalRecords = 0;

  for (const table of tables) {
    try {
      console.log(`📦 Exporting ${table}...`);
      
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`);
      backup[table] = data as any[];
      const count = (data as any[]).length;
      totalRecords += count;
      console.log(`   ✅ ${table}: ${count} records`);
    } catch (error: any) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
      backup[table] = [];
    }
  }

  // Export schema
  console.log('\n📋 Exporting schema...');
  const schema = await prisma.$queryRawUnsafe(`
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  const fullBackup = {
    timestamp: new Date().toISOString(),
    schema: schema,
    data: backup,
    summary: {
      totalTables: tables.length,
      totalRecords: totalRecords,
      tables: Object.keys(backup).map(table => ({
        table,
        count: backup[table].length,
      })),
    },
  };

  // Save JSON
  const jsonFile = path.join(__dirname, '../../emergency_backup_v1.json');
  fs.writeFileSync(jsonFile, JSON.stringify(fullBackup, null, 2));
  const jsonSize = fs.statSync(jsonFile).size;

  // Save SQL
  let sqlContent = `-- Emergency Backup SQL Export\n`;
  sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
  sqlContent += `-- Total Records: ${totalRecords}\n\n`;

  for (const [table, records] of Object.entries(backup)) {
    if (records.length === 0) continue;
    
    sqlContent += `-- Table: ${table} (${records.length} records)\n`;
    sqlContent += `TRUNCATE TABLE ${table} CASCADE;\n`;
    
    if (records.length > 0) {
      const firstRecord = records[0];
      const columns = Object.keys(firstRecord).join(', ');
      
      sqlContent += `INSERT INTO ${table} (${columns}) VALUES\n`;
      
      const values = records.map((record: any) => {
        const cols = Object.values(record).map((val: any) => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          return val;
        });
        return `(${cols.join(', ')})`;
      });
      
      sqlContent += values.join(',\n') + ';\n\n';
    }
  }

  const sqlFile = path.join(__dirname, '../../emergency_backup_v1.sql');
  fs.writeFileSync(sqlFile, sqlContent);
  const sqlSize = fs.statSync(sqlFile).size;

  console.log('\n✅ BACKUP COMPLETE!');
  console.log(`📁 JSON: ${jsonFile} (${(jsonSize / 1024).toFixed(2)} KB)`);
  console.log(`📁 SQL: ${sqlFile} (${(sqlSize / 1024).toFixed(2)} KB)`);
  console.log(`📦 Total Records: ${totalRecords}`);
  console.log(`📋 Tables: ${Object.keys(backup).length}`);
}

emergencyBackup()
  .catch((error) => {
    console.error('❌ BACKUP FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 Mission Accomplished: Data Secured Locally.');
    process.exit(0);
  });

