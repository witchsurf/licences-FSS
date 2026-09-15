import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LicenseForm } from './pages/LicenseForm';
import { Login } from './pages/Login';
import { ViewLicense } from './pages/ViewLicense';
import { PublicVerify } from './pages/PublicVerify';
import { FederalOfficials } from './pages/FederalOfficials';
import { FederalOfficialForm } from './pages/FederalOfficialForm';
import { Setup } from './pages/Setup';
import { Locked } from './pages/Locked';
import { SetupService } from './services/setupService';

// Guard component that checks initial configuration and hardware lock
const SystemGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [lockedReason, setLockedReason] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSystem() {
      try {
        // 1. Check activation / hardware lock
        const act = await SetupService.getActivationStatus();
        if (!act.valid) {
          if (isMounted) {
            setLockedReason(act.reason || 'Cette installation est verrouillée sur une autre machine.');
            setChecked(true);
          }
          return;
        }

        // 2. Check entity setup
        const setup = await SetupService.getStatus();
        if (!setup.isSetup && location.pathname !== '/setup') {
          navigate('/setup');
        }
      } catch (e) {
        console.error('System gate check failed:', e);
      } finally {
        if (isMounted) setChecked(true);
      }
    }

    checkSystem();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  if (lockedReason) {
    return <Locked reason={lockedReason} />;
  }

  return <>{children}</>;
};

// Wrapper to conditionally render header
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPublicView = location.pathname.startsWith('/verify/') || location.pathname.startsWith('/license/');
  const isStandalone = location.pathname === '/login' || location.pathname === '/setup' || location.pathname === '/locked';

  const showHeader = !isPublicView && !isStandalone;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <SystemGate>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/locked" element={<Locked />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/create" element={<LicenseForm />} />
            <Route path="/admin/edit/:id" element={<LicenseForm />} />
            <Route path="/admin/cadres-federaux" element={<FederalOfficials />} />
            <Route path="/admin/cadres-federaux/nouveau" element={<FederalOfficialForm />} />
            <Route path="/admin/cadres-federaux/:id/modifier" element={<FederalOfficialForm />} />
            <Route path="/license/:id" element={<ViewLicense />} />
            <Route path="/verify/:id" element={<PublicVerify />} />
          </Routes>
        </Layout>
      </SystemGate>
    </HashRouter>
  );
};

export default App;
