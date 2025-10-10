import { ArrowRight, TrendingUp, Shield, Zap, Shirt, Watch } from 'lucide-react';

export default function Home() {
  const categories = [
    { 
      name: 'MEN', 
      icon: <Shirt size={64} strokeWidth={1.5} />, 
      desc: 'Street & Smart', 
      gradient: 'from-primary to-primary-light' 
    },
    { 
      name: 'WOMEN', 
      icon: <Shirt size={64} strokeWidth={1.5} />, 
      desc: 'Bold & Beautiful', 
      gradient: 'from-secondary to-secondary-light' 
    },
    { 
      name: 'ACCESSORIES', 
      icon: <Watch size={64} strokeWidth={1.5} />, 
      desc: 'Complete the Look', 
      gradient: 'from-primary-light to-secondary' 
    },
  ];

  const features = [
    { icon: <TrendingUp size={32} />, title: 'Latest Trends', desc: 'Updated weekly' },
    { icon: <Shield size={32} />, title: 'Quality Guarantee', desc: '30 days return' },
    { icon: <Zap size={32} />, title: 'Fast Delivery', desc: '24h in cities' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary text-accent overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary opacity-20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - text */}
            <div className="animate-slide-left">
              <div className="inline-block px-4 py-2 bg-secondary text-primary rounded-full text-sm font-bold mb-6">
                NEW COLLECTION 2025
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                FIND
                <br />
                <span className="text-secondary">YOUR</span>
                <br />
                STYLE
              </h1>
              <p className="text-xl mb-8 text-text-light max-w-md">
                Unique fashion for people who aren't afraid to stand out. Because 404 isn't an error - it's your signature.
              </p>
              <div className="flex gap-4">
                <button className="bg-secondary text-primary px-8 py-4 rounded-full font-bold hover:bg-secondary-light transition-all transform hover:scale-105 flex items-center gap-2 group">
                  Explore Collection
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="border-2 border-secondary text-secondary px-8 py-4 rounded-full font-bold hover:bg-secondary hover:text-primary transition-all">
                  View SALE
                </button>
              </div>
            </div>

            {/* Right - visual elements */}
            <div className="hidden md:block animate-slide-right">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-secondary to-secondary-dark rounded-3xl transform rotate-6 hover:rotate-0 transition-transform duration-500"></div>
                <div className="absolute top-8 left-8 w-full h-96 bg-gradient-to-br from-primary-light to-primary rounded-3xl flex items-center justify-center text-8xl font-black">
                  404
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-6 hover:bg-white rounded-xl transition-all group cursor-pointer"
              >
                <div className="text-secondary group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - cards with gradients */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4">
            BROWSE <span className="text-secondary">CATEGORIES</span>
          </h2>
          <p className="text-text-secondary text-lg">Find something perfect for you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`relative h-80 rounded-3xl bg-gradient-to-br ${cat.gradient} p-8 flex flex-col justify-between overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-300`}
            >
              {/* Icon at top */}
              <div className="text-accent opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
                {cat.icon}
              </div>
              
              {/* Content at bottom */}
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-accent mb-2">{cat.name}</h3>
                <p className="text-accent opacity-80 mb-4">{cat.desc}</p>
                <button className="text-accent font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  View More
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-accent py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-6">
            READY FOR <span className="text-secondary">404 STYLE</span>?
          </h2>
          <p className="text-xl mb-8 text-text-light max-w-2xl mx-auto">
            Join thousands of satisfied customers. First purchase with code FIRST404 = -20%
          </p>
          <button className="bg-secondary text-primary px-12 py-5 rounded-full font-bold text-lg hover:bg-secondary-light transition-all transform hover:scale-105">
            Start Shopping
          </button>
        </div>
      </section>
    </div>
  );
}