import { Pool, QueryResult } from 'pg';

// Create a connection pool to the PostgreSQL database using environment variables
const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
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
        throw err; // Throw the error so it's handled by the caller (ex. server.ts)
    }
}

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
        console.error('didnt work bozo:', err);
        throw err; // Throw the error so it's handled by the caller (ex. server.ts)
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