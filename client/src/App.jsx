import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductForm from './pages/ProductForm.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import CategoryPage from './pages/CategoryPage';
import ThemeLoader from './components/ThemeLoader';
import SliderManager from './components/SliderManager';
import SliderEditor from './pages/SliderEditor';
import ProductDetailPage from './pages/ProductDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeLoader />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/products/new" element={<ProductForm />} />
              <Route path="/dashboard/products/edit/:id" element={<ProductForm />} />
              <Route path="/dashboard/sliders" element={<SliderManager />} />
              <Route path="/dashboard/sliders/:id" element={<ProtectedRoute><SliderEditor /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;