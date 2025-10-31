import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Loader, Truck, Shield, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import CartToast from '../components/CartToast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const primary = data.images.find(img => img.isPrimary) || data.images[0];
          setSelectedImage(primary.imageUrl);
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (stock < 20) {
      return { text: 'Last Items', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (stock < 100) {
      return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    
    addToCart(product, quantity);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      {showToast && (
        <CartToast 
          product={product} 
          onClose={() => setShowToast(false)} 
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-text-secondary hover:text-secondary">
              Home
            </Link>
            {product.breadcrumbs?.map((crumb) => (
              <div key={crumb.id} className="flex items-center gap-2">
                <ChevronRight size={16} className="text-text-secondary" />
                <Link 
                  to={`/category/${crumb.slug}`}
                  className="text-text-secondary hover:text-secondary"
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
            <ChevronRight size={16} className="text-text-secondary" />
            <span className="text-primary font-bold">{product.name}</span>
          </nav>

          {/* Product Details - Kompaktowy Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Images Gallery */}
            <div>
              {/* Main Image */}
              <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 mb-3">
                <img
                  src={selectedImage ? `http://localhost:5000${selectedImage}` : 'https://via.placeholder.com/600x600'}
                  alt={product.name}
                  className="w-full h-[500px] object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className={`bg-white rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img.imageUrl 
                          ? 'border-secondary' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${img.imageUrl}`}
                        alt={`${product.name} ${img.id}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Kompaktowy */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 h-fit">
              <h1 className="text-3xl font-black text-primary mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                <span className="text-4xl font-black text-secondary">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <span className={`${stockStatus.bgColor} ${stockStatus.color} px-3 py-1 rounded-full text-sm font-bold`}>
                  {stockStatus.text}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-4 pb-4 border-b-2 border-gray-200">
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              {product.stock > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-primary mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-secondary text-primary py-3 rounded-lg font-bold hover:bg-secondary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                <ShoppingCart size={20} strokeWidth={3} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Truck className="text-secondary" size={20} />
                  <div>
                    <p className="font-bold text-xs">Free Shipping</p>
                    <p className="text-xs text-text-secondary">Over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="text-secondary" size={20} />
                  <div>
                    <p className="font-bold text-xs">Secure Payment</p>
                    <p className="text-xs text-text-secondary">Protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Placeholder */}
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-primary">Customer Reviews</h2>
              <button className="bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:bg-secondary-light transition-all">
                Write a Review
              </button>
            </div>

            {/* Average Rating Placeholder */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">0.0</div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-gray-300" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">No reviews yet</p>
              </div>
            </div>

            {/* Reviews List - Placeholder */}
            <div className="text-center py-12 text-text-secondary">
              <p className="text-lg font-semibold mb-2">No reviews yet</p>
              <p className="text-sm">Be the first to review this product!</p>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-primary mb-6">
                Similar Products
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}