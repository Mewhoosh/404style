import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HomeSlider from '../components/HomeSlider';
import { ChevronRight, Loader } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsRes = await fetch('http://localhost:5000/api/products?status=published');
      if (productsRes.ok) {
        const data = await productsRes.json();
        setFeaturedProducts(data.slice(0, 8));
      }

      const categoriesRes = await fetch('http://localhost:5000/api/categories');
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-accent py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-black mb-4">
            DISCOVER YOUR STYLE
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Premium fashion for the modern individual
          </p>
          <Link
            to="/category/men"
            className="inline-block bg-secondary text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary-light transition-all transform hover:scale-105"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* HOME SLIDER */}
      <HomeSlider />

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary mb-8 text-center">
            SHOP BY CATEGORY
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 group-hover:opacity-80 transition-all"></div>
                <div className="absolute inset-0 flex items-end p-8">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 group-hover:text-secondary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white opacity-90 flex items-center gap-2">
                      Shop Now <ChevronRight size={20} />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-primary">
              FEATURED PRODUCTS
            </h2>
            <Link
              to="/category/men"
              className="text-secondary font-bold hover:underline flex items-center gap-2"
            >
              View All <ChevronRight size={20} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-text-secondary">No products available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-primary mb-4">
            SALE UP TO 50% OFF
          </h2>
          <p className="text-xl text-primary mb-8">
            Limited time offer on selected items
          </p>
          <Link
            to="/sale"
            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all transform hover:scale-105"
          >
            SHOP SALE
          </Link>
        </div>
      </section>
    </div>
  );
}