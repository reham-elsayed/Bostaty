
import { Client } from 'pg';
import 'dotenv/config';

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not defined');
        return;
    }
    console.log(`Testing connection to: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Common fix for some environments, though Supabase usually has valid certs
    });

    try {
        await client.connect();
        console.log('Successfully connected to database!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

testConnection();
