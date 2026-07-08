import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignIn from "./pages/SignIn";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Backups from "./pages/Backups";
import UserManagement from "./pages/UserManagement";
import RegionalOverview from "./pages/RegionalOverview";
import PropertyInventory from "./pages/PropertyInventory";
import PropertyListings from "./pages/PropertyListings";
import Clients from "./pages/Clients";
import PropertyAnalytics from "./pages/PropertyAnalytics";
import GISMap from "./pages/GISMap";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import TaxManagement from "./pages/TaxManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<RegionalOverview />} />
          <Route path="/properties" element={<PropertyInventory />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/gis-map" element={<GISMap />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/tax-management" element={<TaxManagement />} />
            <Route path="/property-analytics" element={<PropertyAnalytics />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
