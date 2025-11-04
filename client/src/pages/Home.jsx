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
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-accent py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-7xl font-black mb-6 leading-tight">
              DISCOVER YOUR
              <span className="block text-secondary">UNIQUE STYLE</span>
            </h1>
            <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              Premium fashion for the modern individual. Express yourself with confidence.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/category/men"
                className="bg-secondary text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-secondary-light transition-all transform hover:scale-105 shadow-xl"
              >
                EXPLORE COLLECTION
              </Link>
              <Link
                to="/category/women"
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all transform hover:scale-105"
              >
                NEW ARRIVALS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOME SLIDER */}
      <HomeSlider />

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-primary mb-4">
              FEATURED PRODUCTS
            </h2>
            <div className="w-24 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover our handpicked selection of premium products
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-text-secondary">No products available yet.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/category/men"
                  className="inline-flex items-center gap-2 bg-white border-2 border-primary text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary hover:text-white transition-all"
                >
                  VIEW ALL PRODUCTS <ChevronRight size={24} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map(category => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group bg-gray-50 hover:bg-primary rounded-2xl p-8 transition-all hover:shadow-xl border-2 border-transparent hover:border-secondary"
              >
                <h3 className="text-2xl font-black text-primary group-hover:text-white mb-2 transition-colors">
                  {category.name.toUpperCase()}
                </h3>
                <p className="text-text-secondary group-hover:text-white/80 transition-colors flex items-center gap-2">
                  Explore <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-6xl font-black text-white mb-6">
              EXCLUSIVE DEALS
            </h2>
            <div className="w-32 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-2xl text-white/90 mb-10">
              Limited time offer on selected items. Up to 50% off premium collections.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/category/men"
                className="bg-secondary text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-secondary-light transition-all transform hover:scale-105 shadow-lg"
              >
                SHOP NOW
              </Link>
              <Link
                to="/category/women"
                className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                VIEW COLLECTIONS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-black text-primary mb-4">
              STAY UPDATED
            </h3>
            <p className="text-text-secondary mb-6">
              Subscribe to our newsletter for exclusive offers and style updates
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
              />
              <button className="bg-secondary text-primary px-8 py-3 rounded-xl font-bold hover:bg-secondary-light transition-all">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}