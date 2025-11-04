import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black">404</span>
              <span className="text-2xl font-light text-secondary">STYLE</span>
            </div>
            <p className="text-sm text-text-light mb-6">
              Fashion without limits. Style without compromise.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-secondary transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">SHOP</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Men</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Women</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors font-bold">Sale -50%</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">HELP</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">NEWSLETTER</h4>
            <p className="text-sm text-text-light mb-4">
              Stay updated with new arrivals and promotions
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-full bg-primary-light text-accent border-2 border-transparent focus:border-secondary focus:outline-none text-sm"
              />
              <button className="bg-secondary text-primary px-6 py-2 rounded-full font-bold hover:bg-secondary-light transition-all">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-light pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-text-light">
          <p>© 2025 404 Style. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-secondary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
