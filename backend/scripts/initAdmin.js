const Admin = require('../models/Admin');

const initAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userId: 'aditya' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin
    const admin = new Admin({
      userId: 'aditya',
      password: '123456',
      name: 'Administrator',
      email: 'admin@civicsense.ai',
      role: 'Super Admin',
      status: 'Active'
    });

    await admin.save();
    console.log('✅ Default admin user created successfully');
    console.log('   User ID: aditya');
    console.log('   Password: 123456');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

module.exports = initAdmin;
