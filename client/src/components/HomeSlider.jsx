import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeSlider() {
  const [slider, setSlider] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchActiveSlider();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAutoPlaying && slider && slider.items.length > 0) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, slider, itemsPerView]);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setItemsPerView(1);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(2);
    } else {
      setItemsPerView(3);
    }
  };

  const fetchActiveSlider = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sliders/active');
      if (response.ok) {
        const data = await response.json();
        setSlider(data);
      }
    } catch (error) {
      console.error('Failed to fetch slider:', error);
    }
  };

  const handlePrev = () => {
    if (!slider || slider.items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slider.items.length) % slider.items.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    if (!slider || slider.items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slider.items.length);
  };

  if (!slider || !slider.items || slider.items.length === 0) {
    return null;
  }

  // FIX #3: Nie duplikuj jeśli mniej itemów niż itemsPerView
  const getVisibleItems = () => {
    const items = [];
    const totalItems = slider.items.length;
    const visibleCount = Math.min(itemsPerView, totalItems); // Max tyle ile jest itemów
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % totalItems;
      items.push(slider.items[index]);
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  };

  // FIX #3: Responsive grid - dostosuj kolumny do faktycznej liczby itemów
  const getGridClass = () => {
    const itemCount = visibleItems.length;
    if (itemCount === 1) return 'grid-cols-1';
    if (itemCount === 2) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Pokaż strzałki tylko jeśli jest więcej niż 1 item */}
          {slider.items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                aria-label="Previous"
              >
                <ChevronLeft size={24} className="text-primary" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                aria-label="Next"
              >
                <ChevronRight size={24} className="text-primary" />
              </button>
            </>
          )}

          <div className={`grid gap-6 ${getGridClass()} items-stretch`}>
            {visibleItems.map((item, idx) => {
              const imageUrl = getImageUrl(
                item.customImageUrl || item.product?.images?.[0]?.imageUrl
              );

              const title = item.customTitle || item.product?.name || 'No title';
              const description = item.customDescription || item.product?.description || '';
              const price = item.product?.price;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 flex flex-col h-full"
                >
                  {/* Stała wysokość obrazka */}
                  <div className="h-64 overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Treść bez ograniczenia wysokości - rozciąga się naturalnie */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
                    
                    {/* Opis bez line-clamp i bez max-height - pełna długość */}
                    <div className="text-text-secondary mb-4 flex-grow">
                      <p className="whitespace-pre-wrap">{description}</p>
                    </div>
                    
                    {price && (
                      <p className="text-2xl font-black text-secondary mb-2">${parseFloat(price).toFixed(2)}</p>
                    )}
                    {item.product && (
                      <Link
                        to={`/product/${item.product.id}`}
                        className="w-full bg-secondary text-primary py-3 rounded-lg font-bold hover:bg-secondary-light transition-all flex items-center justify-center"
                      >
                        View Product
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pokaż dots tylko jeśli jest więcej niż 1 item */}
          {slider.items.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {slider.items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-secondary w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
