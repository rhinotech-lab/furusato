
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ImageList } from './pages/ImageList';
import { ImageDetail } from './pages/ImageDetail';
import { ImageUpload } from './pages/ImageUpload';
import { MunicipalityList } from './pages/MunicipalityList';
import { MunicipalityForm } from './pages/MunicipalityForm';
import { BusinessList } from './pages/BusinessList';
import { BusinessForm } from './pages/BusinessForm';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import { ProjectList } from './pages/ProjectList';
import { AccountSettings } from './pages/AccountSettings';
import { NotificationList } from './pages/NotificationList';
import { AlertList } from './pages/AlertList';
import { MobileSimPreview } from './pages/MobileSimPreview';
import { ImageRevisionList } from './pages/ImageRevisionList';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/preview/:id/:versionId" element={<MobileSimPreview />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="alerts" element={<AlertList />} />
            <Route path="images" element={<ImageList />} />
            <Route path="revisions" element={<ImageRevisionList />} />
            <Route path="revisions/:id" element={<ImageDetail />} />
            <Route path="images/new" element={<ImageUpload />} />
            <Route path="municipalities" element={<MunicipalityList />} />
            <Route path="municipalities/new" element={<MunicipalityForm />} />
            <Route path="municipalities/:id/edit" element={<MunicipalityForm />} />
            <Route path="businesses" element={<BusinessList />} />
            <Route path="businesses/new" element={<BusinessForm />} />
            <Route path="businesses/:id/edit" element={<BusinessForm />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="users" element={<AccountSettings />} />
          </Route>

          {/* Municipality Routes */}
          <Route path="/municipality" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="alerts" element={<AlertList />} />
            <Route path="images" element={<ImageList />} />
            <Route path="revisions" element={<ImageRevisionList />} />
            <Route path="revisions/:id" element={<ImageDetail />} />
            <Route path="businesses" element={<BusinessList />} />
            <Route path="businesses/new" element={<BusinessForm />} />
            <Route path="businesses/:id/edit" element={<BusinessForm />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="users" element={<AccountSettings />} />
          </Route>

          {/* Business Routes */}
          <Route path="/business" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="images" element={<ImageList />} />
            <Route path="revisions" element={<ImageRevisionList />} />
            <Route path="revisions/:id" element={<ImageDetail />} />
            <Route path="products" element={<ProductList />} />
            <Route path="users" element={<AccountSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
