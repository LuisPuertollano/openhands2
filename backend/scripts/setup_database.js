const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Creating database...');
    await pool.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'rams_workload'}`);
    await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'rams_workload'}`);
    console.log('Database created successfully!');
    
    await pool.end();

    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'rams_workload',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    console.log('Running schema migration...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../schema.sql'),
      'utf-8'
    );
    
    await dbPool.query(schemaSQL);
    console.log('Schema migration completed successfully!');

    await dbPool.end();
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
