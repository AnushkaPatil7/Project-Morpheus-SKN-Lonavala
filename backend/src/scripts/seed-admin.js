import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { users } from '../db/schema.js';

async function seedAdmin() {
    const adminEmail = 'admin@morpheus.com';
    const adminPassword = 'Admin@123';
    const adminName = 'System Admin';

    console.log(`Checking for existing admin: ${adminEmail}...`);

    try {
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, adminEmail))
            .limit(1);

        if (existing) {
            console.log('Admin user already exists. Skipping seed.');
            process.exit(0);
        }

        console.log('Admin not found. Creating admin user...');
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        await db.insert(users).values({
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'admin',
            isVerified: true,
        });

        console.log('--- Admin user created successfully ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('---------------------------------------');

    } catch (error) {
        console.error('Failed to seed admin user:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedAdmin();