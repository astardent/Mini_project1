// scripts/seedAdmin.js
require('dotenv').config({ path: 'E:/Web Dev/MINIPROJECT/backend/.env' }); // Adjust path to your .env
const mongoose = require('mongoose');
const Admin = require('../models/admin.model'); // Adjust path
const connectDB = require('../config/db'); // Adjust path

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword'; // Use strong password in .env

    try {
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const admin = new Admin({
            username: 'admin', // Or derive from email
            email: adminEmail,
            password: adminPassword, // Password will be hashed by pre-save hook
        });

        await admin.save();
        console.log('Admin user created successfully!');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedAdmin();