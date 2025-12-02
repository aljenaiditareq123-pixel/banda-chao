import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TableData {
  tableName: string;
  data: any[];
  count: number;
}

async function exportAllTables(): Promise<void> {
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
      
      // Use raw SQL to get all data
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

  // Create backup object
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

  // Save to JSON file
  const jsonFile = 'emergency_backup_v1.json';
  fs.writeFileSync(jsonFile, JSON.stringify(fullBackup, null, 2));
  const fileSize = fs.statSync(jsonFile).size;

  console.log('\n✅ BACKUP COMPLETE!');
  console.log(`📁 File: ${jsonFile}`);
  console.log(`📊 Size: ${(fileSize / 1024).toFixed(2)} KB`);
  console.log(`📦 Total Records: ${totalRecords}`);
  console.log(`📋 Tables: ${Object.keys(backup).length}`);

  // Also create SQL-like export
  console.log('\n📝 Creating SQL export...');
  let sqlContent = `-- Emergency Backup SQL Export\n`;
  sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
  sqlContent += `-- Total Records: ${totalRecords}\n\n`;

  for (const [table, records] of Object.entries(backup)) {
    if (records.length === 0) continue;
    
    sqlContent += `-- Table: ${table} (${records.length} records)\n`;
    sqlContent += `INSERT INTO ${table} VALUES\n`;
    
    const values = records.map((record: any) => {
      const cols = Object.values(record).map((val: any) => {
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        return val;
      });
      return `(${cols.join(', ')})`;
    });
    
    sqlContent += values.join(',\n') + ';\n\n';
  }

  const sqlFile = 'emergency_backup_v1.sql';
  fs.writeFileSync(sqlFile, sqlContent);
  const sqlSize = fs.statSync(sqlFile).size;

  console.log(`✅ SQL Export Complete!`);
  console.log(`📁 File: ${sqlFile}`);
  console.log(`📊 Size: ${(sqlSize / 1024).toFixed(2)} KB`);
}

exportAllTables()
  .catch((error) => {
    console.error('❌ BACKUP FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 Mission Accomplished: Data Secured Locally.');
    process.exit(0);
  });

