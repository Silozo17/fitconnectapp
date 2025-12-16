// This file now redirects to the new ClientOverview component
// which uses the proper ClientDashboardLayout with sidebar
import ClientOverview from "./client/ClientOverview";

const ClientDashboard = () => {
  return <ClientOverview />;
};

export default ClientDashboard;
