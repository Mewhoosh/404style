import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeLoader />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/category/:slug" element={<CategoryPage />} />

              {/* Protected routes */}
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/products/new" element={<ProductForm />} />
              <Route path="/dashboard/products/edit/:id" element={<ProductForm />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;