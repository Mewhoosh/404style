const { sequelize, Product, ProductImage, User, Category } = require('./models');

const seedProducts = async () => {
  try {
    console.log('🛍️  Seeding products...\n');

    // Znajdź admina
    let admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.log('⚠️  No admin found, creating test admin...');
      const bcrypt = require('bcryptjs');
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'Store',
        email: 'admin@404style.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
    }

    // Znajdź kategorie (sprawdź co faktycznie istnieje!)
    const categories = await Category.findAll();
    console.log('📂 Available categories:', categories.map(c => c.slug).join(', '));
    
    const catMap = {};
    categories.forEach(cat => {
      catMap[cat.slug] = cat.id;
    });

    // Fallback category (pierwsza dostępna)
    const fallbackCategoryId = categories[0]?.id;

    const products = [
      // MEN - T-Shirts
      {
        name: 'Classic White Tee',
        description: 'Premium cotton white t-shirt. Perfect for everyday wear. Comfortable fit with reinforced stitching.',
        price: 29.99,
        stock: 50,
        categoryId: catMap['t-shirts'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Graphic Print Tee',
        description: 'Bold graphic design on soft cotton. Stand out from the crowd with this eye-catching piece.',
        price: 34.99,
        stock: 35,
        categoryId: catMap['t-shirts'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'V-Neck Basic Tee',
        description: 'Versatile v-neck t-shirt in premium fabric. Available in multiple colors.',
        price: 27.99,
        stock: 60,
        categoryId: catMap['t-shirts'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80', isPrimary: true }
        ]
      },

      // MEN - Jeans
      {
        name: 'Slim Fit Dark Denim',
        description: 'Modern slim fit jeans in dark wash. Stretch denim for comfort and style.',
        price: 79.99,
        stock: 40,
        categoryId: catMap['jeans'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Relaxed Fit Blue Jeans',
        description: 'Classic relaxed fit in medium blue wash. Timeless style for any occasion.',
        price: 69.99,
        stock: 45,
        categoryId: catMap['jeans'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Distressed Black Jeans',
        description: 'Edgy distressed black jeans. Perfect for a modern urban look.',
        price: 89.99,
        stock: 30,
        categoryId: catMap['jeans'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', isPrimary: true }
        ]
      },

      // MEN - Jackets
      {
        name: 'Leather Bomber Jacket',
        description: 'Premium leather bomber jacket. Classic style meets modern comfort.',
        price: 299.99,
        stock: 15,
        categoryId: catMap['jackets'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', iPrimary: true }
        ]
      },
      {
        name: 'Denim Trucker Jacket',
        description: 'Iconic denim trucker jacket. A wardrobe essential for every season.',
        price: 89.99,
        stock: 25,
        categoryId: catMap['jackets'] || catMap['men'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80', isPrimary: true }
        ]
      },

      // WOMEN - Dresses
      {
        name: 'Floral Summer Dress',
        description: 'Light and airy summer dress with beautiful floral print. Perfect for warm days.',
        price: 79.99,
        stock: 40,
        categoryId: catMap['dresses'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Little Black Dress',
        description: 'Elegant black dress suitable for any formal occasion. Timeless and versatile.',
        price: 119.99,
        stock: 30,
        categoryId: catMap['dresses'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Maxi Boho Dress',
        description: 'Flowing maxi dress with bohemian patterns. Comfortable and stylish.',
        price: 94.99,
        stock: 35,
        categoryId: catMap['dresses'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', isPrimary: true }
        ]
      },

      // WOMEN - Tops
      {
        name: 'Silk Blouse',
        description: 'Luxurious silk blouse in elegant design. Perfect for office or evening wear.',
        price: 89.99,
        stock: 28,
        categoryId: catMap['tops'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Casual Striped Top',
        description: 'Comfortable striped cotton top. Great for everyday casual wear.',
        price: 39.99,
        stock: 50,
        categoryId: catMap['tops'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80', isPrimary: true }
        ]
      },

      // WOMEN - Skirts
      {
        name: 'Pleated Midi Skirt',
        description: 'Elegant pleated midi skirt. Versatile piece for any wardrobe.',
        price: 59.99,
        stock: 35,
        categoryId: catMap['skirts'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Denim Mini Skirt',
        description: 'Classic denim mini skirt. Perfect for casual summer days.',
        price: 44.99,
        stock: 40,
        categoryId: catMap['skirts'] || catMap['women'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80', isPrimary: true }
        ]
      },

      // ACCESSORIES - Bags
      {
        name: 'Leather Tote Bag',
        description: 'Spacious leather tote bag. Perfect for work or shopping.',
        price: 149.99,
        stock: 20,
        categoryId: catMap['bags'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Crossbody Messenger',
        description: 'Compact crossbody bag with adjustable strap. Ideal for everyday use.',
        price: 79.99,
        stock: 30,
        categoryId: catMap['bags'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', isPrimary: true }
        ]
      },

      // ACCESSORIES - Watches
      {
        name: 'Minimalist Steel Watch',
        description: 'Sleek minimalist watch with stainless steel band. Timeless elegance.',
        price: 199.99,
        stock: 25,
        categoryId: catMap['watches'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Leather Strap Watch',
        description: 'Classic watch with genuine leather strap. Perfect for formal occasions.',
        price: 179.99,
        stock: 30,
        categoryId: catMap['watches'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80', isPrimary: true }
        ]
      },

      // ACCESSORIES - Sunglasses
      {
        name: 'Aviator Sunglasses',
        description: 'Classic aviator style sunglasses. UV protection with style.',
        price: 129.99,
        stock: 40,
        categoryId: catMap['sunglasses'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Round Frame Sunglasses',
        description: 'Vintage-inspired round frame sunglasses. Retro chic style.',
        price: 99.99,
        stock: 35,
        categoryId: catMap['sunglasses'] || catMap['accessories'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', isPrimary: true }
        ]
      },

      // FOOTWEAR - Sneakers
      {
        name: 'White Canvas Sneakers',
        description: 'Classic white canvas sneakers. Comfortable and versatile for any outfit.',
        price: 69.99,
        stock: 60,
        categoryId: catMap['sneakers'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'High-Top Urban Sneakers',
        description: 'Stylish high-top sneakers for street style. Premium quality construction.',
        price: 119.99,
        stock: 35,
        categoryId: catMap['sneakers'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80', isPrimary: true }
        ]
      },

      // FOOTWEAR - Boots
      {
        name: 'Chelsea Leather Boots',
        description: 'Timeless Chelsea boots in premium leather. Perfect for any season.',
        price: 189.99,
        stock: 25,
        categoryId: catMap['boots'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Combat Boots',
        description: 'Edgy combat boots with durable construction. Make a bold statement.',
        price: 149.99,
        stock: 30,
        categoryId: catMap['boots'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', isPrimary: true }
        ]
      },

      // FOOTWEAR - Sandals
      {
        name: 'Leather Slide Sandals',
        description: 'Comfortable leather slide sandals. Perfect for summer.',
        price: 49.99,
        stock: 50,
        categoryId: catMap['sandals'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80', isPrimary: true }
        ]
      },
      {
        name: 'Strappy Heeled Sandals',
        description: 'Elegant strappy sandals with heel. Ideal for evening wear.',
        price: 89.99,
        stock: 25,
        categoryId: catMap['sandals'] || catMap['footwear'] || fallbackCategoryId,
        status: 'published',
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', isPrimary: true }
        ]
      }
    ];

    // Dodaj produkty do bazy
    let successCount = 0;
    for (const productData of products) {
      const { images, ...productInfo } = productData;
      
      if (!productInfo.categoryId) {
        console.log(`⚠️  Skipping ${productInfo.name} - no category found`);
        continue;
      }

      const product = await Product.create({
        ...productInfo,
        createdBy: admin.id
      });

      // Dodaj zdjęcia
      if (images && images.length > 0) {
        for (const image of images) {
          await ProductImage.create({
            productId: product.id,
            ...image
          });
        }
      }

      console.log(`✅ ${product.name}`);
      successCount++;
    }

    console.log(`\n🎉 Successfully seeded ${successCount} products!`);
    console.log('📸 All images are from Unsplash.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedProducts();