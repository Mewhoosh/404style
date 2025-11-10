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
          { imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1622445275576-721325391f1e?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1583496661160-251b32cc5384?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1564422167509-4f7d0fbb5ea7?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=1200&q=90', isPrimary: false }
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
          { imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=90', isPrimary: true },
          { imageUrl: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=1200&q=90', isPrimary: false }
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