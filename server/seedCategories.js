const { sequelize, Category } = require('./models');

const categoriesData = [
  // MEN
  {
    name: 'Men',
    description: 'Men\'s clothing and fashion',
    children: [
      { name: 'T-Shirts', description: 'Casual t-shirts' },
      { name: 'Shirts', description: 'Formal and casual shirts' },
      { name: 'Jeans', description: 'Denim jeans' },
      { name: 'Jackets', description: 'Outerwear jackets' },
      { name: 'Shoes', description: 'Men\'s footwear' }
    ]
  },

  // WOMEN
  {
    name: 'Women',
    description: 'Women\'s clothing and fashion',
    children: [
      { name: 'Dresses', description: 'All types of dresses' },
      { name: 'Tops', description: 'Blouses and shirts' },
      { name: 'Jeans', description: 'Denim jeans' },
      { name: 'Skirts', description: 'Various styles of skirts' },
      { name: 'Shoes', description: 'Women\'s footwear' }
    ]
  },

  // ACCESSORIES
  {
    name: 'Accessories',
    description: 'Fashion accessories',
    children: [
      { name: 'Bags', description: 'Handbags and backpacks' },
      { name: 'Hats', description: 'Caps and hats' },
      { name: 'Jewelry', description: 'Rings, necklaces, bracelets' },
      { name: 'Sunglasses', description: 'Eyewear' }
    ]
  }
];

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createCategories = async (categoriesArray, parentId = null) => {
  for (const catData of categoriesArray) {
    const slug = generateSlug(catData.name);
    
    // Check if category already exists
    let category = await Category.findOne({ where: { slug } });
    
    if (!category) {
      category = await Category.create({
        name: catData.name,
        slug: slug,
        description: catData.description || '',
        parentId: parentId
      });
      console.log(`✅ Created: ${catData.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${catData.name}`);
    }

    // Create children
    if (catData.children && catData.children.length > 0) {
      await createCategories(catData.children, category.id);
    }
  }
};

const seedCategories = async () => {
  try {
    console.log('🌱 Starting category seeding...\n');
    
    await createCategories(categoriesData);
    
    console.log('\n✅ Category seeding completed!');
    console.log('📊 Created: 3 main categories + subcategories');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedCategories();