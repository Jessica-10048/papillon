import { Navigate, Outlet } from "react-router";

const PrivateRouter = () => {
  const auth = localStorage.getItem('auth');
  
  //  Vérifier si auth existe avant de le parser
  if (!auth) {
    console.log('❌ Aucune authentification trouvée, redirection vers login');
    return <Navigate to='/login' />;
  }
  
  try {
    const authParsed = JSON.parse(auth);
    console.log('👤 Auth parsed:', authParsed);
    
    //  Vérifier si l'objet authParsed et role existent
    if (!authParsed || !authParsed.role) {
      console.log('❌ Données d\'authentification invalides');
      localStorage.removeItem('auth'); // Nettoyer les données corrompues
      return <Navigate to='/login' />;
    }
    
    //  La logique OR était incorrecte
    const hasAccess = authParsed.role === 'user' || authParsed.role === 'admin';
    
    if (hasAccess) {
      console.log('✅ Accès autorisé pour le rôle:', authParsed.role);
      return <Outlet />;
    } else {
      console.log('❌ Accès refusé pour le rôle:', authParsed.role);
      return <Navigate to='/login' />;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du parsing de localStorage:', error);
    localStorage.removeItem('auth'); // Nettoyer les données corrompues
    return <Navigate to='/login' />;
  }
};

export default PrivateRouter;