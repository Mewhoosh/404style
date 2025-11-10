const { User } = require('./models');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...\n');

    const users = [
      {
        firstName: 'Admin',
        lastName: 'Administrator',
        email: 'admin@404style.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        firstName: 'Moderator',
        lastName: 'User',
        email: 'moderator@404style.com',
        password: 'moderator123',
        role: 'moderator'
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@404style.com',
        password: 'user123',
        role: 'user'
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword
      });

      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Users seeded successfully!');
    console.log('\nCredentials:');
    console.log('Admin: admin@404style.com / admin123');
    console.log('Moderator: moderator@404style.com / moderator123');
    console.log('User: user@404style.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
