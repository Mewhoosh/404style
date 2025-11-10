import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Loader, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategoryData();
  }, [slug, sortBy]);

  const fetchCategoryData = async () => {
    setLoading(true);
    
    try {
      // Find category by slug
      const categoriesRes = await fetch('http://localhost:5000/api/categories');
      if (categoriesRes.ok) {
        const allCategories = await categoriesRes.json();
        const foundCategory = findCategoryBySlug(allCategories, slug);
        
        if (foundCategory) {
          setCategory(foundCategory);
          
          // Fetch breadcrumbs
          const breadcrumbsRes = await fetch(`http://localhost:5000/api/categories/${foundCategory.id}/breadcrumbs`);
          if (breadcrumbsRes.ok) {
            const breadcrumbsData = await breadcrumbsRes.json();
            setBreadcrumbs(breadcrumbsData);
          }
          
          // Fetch products
          const productsRes = await fetch(
            `http://localhost:5000/api/products?categoryId=${foundCategory.id}&status=published`
          );

          console.log('🔗 Fetch URL:', `http://localhost:5000/api/products?categoryId=${foundCategory.id}&status=published`);

          if (productsRes.ok) {
            let productsData = await productsRes.json();
            console.log('📦 Products response:', productsData);
            
            // Sort products
            productsData = sortProducts(productsData, sortBy);
            setProducts(productsData);
          } else {
            console.error('❌ Fetch failed:', productsRes.status);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortBy) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-desc':
        return [...products].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const findCategoryBySlug = (categories, targetSlug) => {
    for (const cat of categories) {
      if (cat.slug === targetSlug) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryBySlug(cat.children, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary mb-4">Category Not Found</h1>
          <Link to="/" className="text-secondary font-bold hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-text-secondary hover:text-secondary">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-text-secondary" />
              <Link 
                to={`/category/${crumb.slug}`}
                className={`${
                  idx === breadcrumbs.length - 1 
                    ? 'text-primary font-bold' 
                    : 'text-text-secondary hover:text-secondary'
                }`}
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-primary mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-xl text-text-secondary">{category.description}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Subcategories */}
          {category.children && category.children.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 sticky top-24">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Subcategories
                </h3>
                <ul className="space-y-2">
                  {category.children.map(subcat => (
                    <li key={subcat.id}>
                      <Link
                        to={`/category/${subcat.slug}`}
                        className="block px-4 py-2 rounded-lg hover:bg-secondary hover:text-primary transition-all font-medium"
                      >
                        {subcat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={category.children && category.children.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Filters Bar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border-2 border-gray-200">
              <p className="text-text-secondary">
                <span className="font-bold text-primary">{products.length}</span> products found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-primary mb-2">No Products Yet</h3>
                <p className="text-text-secondary">Products will be added soon to this category.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
