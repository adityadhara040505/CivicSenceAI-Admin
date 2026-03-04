const mongoose = require('mongoose');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Scheme = require('../models/Scheme');
const Admin = require('../models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana'];
  const devices = ['Mobile', 'Desktop', 'Tablet'];
  const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60];
  
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      state: states[Math.floor(Math.random() * states.length)],
      age: ages[Math.floor(Math.random() * ages.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      sessionCount: Math.floor(Math.random() * 50) + 1,
      totalSimulations: Math.floor(Math.random() * 20)
    });
  }
  
  await User.deleteMany({});
  await User.insertMany(users);
  console.log(`✅ Created ${users.length} sample users`);
};

const seedPolicies = async (adminId) => {
  const categories = ['Budget', 'Tax', 'Agriculture', 'MSME', 'Housing', 'Education', 'Sustainability'];
  const policies = [
    {
      name: 'Budget 2026 - Tax Reform Act',
      title: 'Budget 2026 - Tax Reform Act',
      category: 'Tax',
      description: 'Comprehensive tax reform for individuals and businesses',
      fileName: 'budget-2026-tax-reform.pdf',
      fileSize: 2456789,
      filePath: '/uploads/policies/budget-2026-tax-reform.pdf',
      status: 'Active',
      views: 1245,
      uploadDate: new Date('2026-03-01'),
      uploadedBy: adminId
    },
    {
      name: 'MSME Credit Guarantee Scheme',
      title: 'MSME Credit Guarantee Scheme',
      category: 'MSME',
      description: 'Credit guarantee scheme for small and medium enterprises',
      fileName: 'msme-credit-scheme.pdf',
      fileSize: 1856234,
      filePath: '/uploads/policies/msme-credit-scheme.pdf',
      status: 'Active',
      views: 982,
      uploadDate: new Date('2026-03-01'),
      uploadedBy: adminId
    },
    {
      name: 'Pradhan Mantri Awas Yojana 2.0',
      title: 'Pradhan Mantri Awas Yojana 2.0',
      category: 'Housing',
      description: 'Housing for all - updated scheme with enhanced benefits',
      fileName: 'pmay-2.0.pdf',
      fileSize: 3124567,
      filePath: '/uploads/policies/pmay-2.0.pdf',
      status: 'Active',
      views: 2134,
      uploadDate: new Date('2026-02-28'),
      uploadedBy: adminId
    },
    {
      name: 'Green Energy Subsidy Policy',
      title: 'Green Energy Subsidy Policy',
      category: 'Sustainability',
      description: 'Subsidies for renewable energy adoption',
      fileName: 'green-energy-policy.pdf',
      fileSize: 1967834,
      filePath: '/uploads/policies/green-energy-policy.pdf',
      status: 'Active',
      views: 876,
      uploadDate: new Date('2026-02-27'),
      uploadedBy: adminId
    },
    {
      name: 'Agricultural Loan Waiver Scheme',
      title: 'Agricultural Loan Waiver Scheme',
      category: 'Agriculture',
      description: 'Loan waiver program for small and marginal farmers',
      fileName: 'agri-loan-waiver.pdf',
      fileSize: 2234567,
      filePath: '/uploads/policies/agri-loan-waiver.pdf',
      status: 'Active',
      views: 1543,
      uploadDate: new Date('2026-02-25'),
      uploadedBy: adminId
    },
    {
      name: 'National Education Policy Update',
      title: 'National Education Policy Update',
      category: 'Education',
      description: 'Updated guidelines for education sector',
      fileName: 'nep-update.pdf',
      fileSize: 2845123,
      filePath: '/uploads/policies/nep-update.pdf',
      status: 'Archived',
      views: 654,
      uploadDate: new Date('2026-02-24'),
      uploadedBy: adminId
    },
    {
      name: 'Startup India Phase 3',
      title: 'Startup India Phase 3',
      category: 'MSME',
      description: 'Enhanced support for startups and innovation',
      fileName: 'startup-india-phase3.pdf',
      fileSize: 1734567,
      filePath: '/uploads/policies/startup-india-phase3.pdf',
      status: 'Active',
      views: 1876,
      uploadDate: new Date('2026-02-22'),
      uploadedBy: adminId
    },
    {
      name: 'GST Amendment Bill 2026',
      title: 'GST Amendment Bill 2026',
      category: 'Tax',
      description: 'Updates to GST structure and rates',
      fileName: 'gst-amendment-2026.pdf',
      fileSize: 2123456,
      filePath: '/uploads/policies/gst-amendment-2026.pdf',
      status: 'Active',
      views: 2341,
      uploadDate: new Date('2026-02-20'),
      uploadedBy: adminId
    }
  ];
  
  await Policy.deleteMany({});
  await Policy.insertMany(policies);
  console.log(`✅ Created ${policies.length} sample policies`);
};

const seedSchemes = async () => {
  const schemes = [
    {
      name: 'PM-KISAN',
      category: 'Agriculture',
      description: 'Direct income support to farmers',
      eligibilityRate: 89,
      totalApplications: 245000,
      approvedApplications: 218050,
      avgBenefit: 6000
    },
    {
      name: 'Mudra Yojana',
      category: 'MSME',
      description: 'Micro-finance for small businesses',
      eligibilityRate: 76,
      totalApplications: 189000,
      approvedApplications: 143640,
      avgBenefit: 250000
    },
    {
      name: 'Startup India',
      category: 'MSME',
      description: 'Support for startups and innovation',
      eligibilityRate: 68,
      totalApplications: 142000,
      approvedApplications: 96560,
      avgBenefit: 1000000
    },
    {
      name: 'PMAY - Pradhan Mantri Awas Yojana',
      category: 'Housing',
      description: 'Affordable housing scheme',
      eligibilityRate: 82,
      totalApplications: 198000,
      approvedApplications: 162360,
      avgBenefit: 250000
    },
    {
      name: 'Sukanya Samriddhi Yojana',
      category: 'Education',
      description: 'Savings scheme for girl child',
      eligibilityRate: 71,
      totalApplications: 156000,
      approvedApplications: 110760,
      avgBenefit: 150000
    },
    {
      name: 'Ayushman Bharat',
      category: 'Healthcare',
      description: 'Health insurance for economically vulnerable',
      eligibilityRate: 85,
      totalApplications: 312000,
      approvedApplications: 265200,
      avgBenefit: 500000
    },
    {
      name: 'Solar Rooftop Subsidy',
      category: 'Sustainability',
      description: 'Subsidy for solar panel installation',
      eligibilityRate: 73,
      totalApplications: 87000,
      approvedApplications: 63510,
      avgBenefit: 78000
    },
    {
      name: 'MGNREGA',
      category: 'Employment',
      description: 'Rural employment guarantee scheme',
      eligibilityRate: 91,
      totalApplications: 423000,
      approvedApplications: 384930,
      avgBenefit: 45000
    }
  ];
  
  await Scheme.deleteMany({});
  await Scheme.insertMany(schemes);
  console.log(`✅ Created ${schemes.length} sample schemes`);
};

const seedAll = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding database with sample data...\n');
    
    // Get the default admin
    const admin = await Admin.findOne({ userId: 'aditya' });
    if (!admin) {
      console.error('❌ Default admin not found. Please run server.js first to create the default admin.');
      process.exit(1);
    }
    
    await seedUsers();
    await seedPolicies(admin._id);
    await seedSchemes();
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
