// This is the database connection configuration file.

import { Pool, QueryResult } from 'pg';

// Retrieve database connection parameters from environment variables
const env = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
}

if (!env.host) { throw new Error('Hostname missing from environment variables!')}
if (!env.database) { throw new Error('Database name missing from environment variables!')}
if (!env.user) { throw new Error('User missing from environment variables!')}
if (!env.password) { throw new Error('Password missing from environment variables!')}

// Create a connection pool to the PostgreSQL database using environment variables
const pool = new Pool({
    host: env.host,
    port: env.port,
    database: env.database,
    user: env.user,
    password: env.password
});

// Handle errors on the pool (e.g., if the database connection is lost)
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
});

// Export a query function that can be used to execute SQL queries against the database
export const query = (text: string, params?: any[]): Promise<QueryResult<any>> => 
    pool.query(text, params);

// Test database connection by executing a simple query
export const testConnection = async () => {
    try {
        // Simple postgreSQL query to test the connection
        const response = await query('SELECT NOW()');
        console.log('Database connection successful. Current time:', response.rows[0].now);
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

// Test query for retrieving data; may be adjusted or removed later
export const testData = async () => {
      try {
        const response = await query('SELECT name FROM people WHERE id = $1', [0]);
        console.log('Database connection successful');
        if (response.rowCount === 0) {
            console.warn('Test query returned no results. Make sure the "people" table exists and has a record with id=0.');
        } else {
            console.log('Test query result:', response.rows[0].name);
        }
    } catch (err) {
        console.error('Oops! Why\'s this showing? Error:', err);
        throw err; 
    }
}

// Shutdown the pool gracefully when the application is terminated
export const shutdownPool = async () => {
    try {
        await pool.end();
    } catch (err) {
        console.error('Error shutting down pool:', err);
    }
};