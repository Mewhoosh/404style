const { sequelize, Theme } = require('./models');

const seedDefaultTheme = async () => {
  try {
    console.log('🎨 Creating default theme...\n');

    let theme = await Theme.findOne({ where: { isDefault: true } });

    if (theme) {
      console.log('⏭️  Default theme exists, updating colors...');
      await theme.update({
        colorPrimary: '#0a0e27',
        colorSecondary: '#93cf08',
        colorAccent: '#f7f7f7'
      });
    } else {
      theme = await Theme.create({
        name: 'Default',
        colorPrimary: '#0a0e27',
        colorSecondary: '#93cf08',
        colorAccent: '#f7f7f7',
        isDefault: true
      });
      console.log('✅ Default theme created!');
    }

    console.log('\n🎨 Theme details:');
    console.log(`   Name: ${theme.name}`);
    console.log(`   Primary: ${theme.colorPrimary}`);
    console.log(`   Secondary: ${theme.colorSecondary}`);
    console.log(`   Accent: ${theme.colorAccent}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDefaultTheme();