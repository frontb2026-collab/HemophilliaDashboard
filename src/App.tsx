import React, { useState } from 'react';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CompaniesManager } from './components/companies/CompaniesManager';
import { FactorsManager } from './components/factors/FactorsManager';
import { PatientsManager } from './components/patients/PatientsManager';
import { PatientVisitsManager } from './components/patients/PatientVisitsManager';
import { DiagnosisPatients } from './components/patients/DiagnosisPatients';
import { TreatmentsManager } from './components/treatments/TreatmentsManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { CellPhoneManager } from './components/cellphone/CellPhoneManager';
import { DistributionManager } from './components/distribution/DistributionManager';
import { DeliveredManager } from './components/distribution/DeliveredManager';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AuthService } from './services/auth';
import { LoginRequest, RegisterRequest, User } from './types/api';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      if (authenticated) {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      AuthService.clearAuth();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const response = await AuthService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', error);
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterRequest) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const response = await AuthService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration error:', error);
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
      case 'patient-list':
        return <PatientsManager />;
      case 'patient-visits':
        return <PatientVisitsManager />;
      case 'diagnosis-patients':
        return <DiagnosisPatients />;
      case 'treatments':
        return <TreatmentsManager />;
      case 'drugs':
        return <FactorsManager />;
      case 'companies':
        return <CompaniesManager />;
      case 'cellphone':
        return <CellPhoneManager />;
      case 'distributed':
        return <DistributionManager />;
      case 'delivered':
        return <DeliveredManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <Dashboard />;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setAuthError(null);
        }}
        loading={authLoading}
        error={authError}
      />
    ) : (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowRegister(true);
          setAuthError(null);
        }}
        loading={authLoading}
        error={authError}
      />
    );
  }
  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
