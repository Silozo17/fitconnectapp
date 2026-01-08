import { Navigate, useParams } from "react-router-dom";

/**
 * Redirect from old singular /dashboard/client/coach/:username 
 * to new plural /dashboard/client/coaches/:username
 */
const ClientCoachRedirect = () => {
  const { username } = useParams<{ username: string }>();
  return <Navigate to={`/dashboard/client/coaches/${username}`} replace />;
};

export default ClientCoachRedirect;
