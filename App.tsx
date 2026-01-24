import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LicenseForm } from './pages/LicenseForm';
import { Login } from './pages/Login';
import { ViewLicense } from './pages/ViewLicense';
import { PublicVerify } from './pages/PublicVerify';

// Wrapper to conditionally render header
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPublicView = location.pathname.startsWith('/verify/') || location.pathname.startsWith('/license/');
  const isLogin = location.pathname === '/login';

  // We hide the main nav header for specific views (Print view, public verify, login) to keep them clean
  const showHeader = !isPublicView && !isLogin;

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/create" element={<LicenseForm />} />
          <Route path="/admin/edit/:id" element={<LicenseForm />} />
          <Route path="/license/:id" element={<ViewLicense />} />
          <Route path="/verify/:id" element={<PublicVerify />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;