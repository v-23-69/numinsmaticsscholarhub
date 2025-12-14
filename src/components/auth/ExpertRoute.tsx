import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ExpertRouteProps {
    children: React.ReactNode;
}

const ExpertRoute: React.FC<ExpertRouteProps> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [roleCheckLoading, setRoleCheckLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkExpertRole = async () => {
            if (!user) {
                setRoleCheckLoading(false);
                return;
            }

            try {
                // Check profiles.role first
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!profileError && profileData) {
                    const role = profileData.role;
                    if (role === 'admin' || role === 'expert' || role === 'admin_market' || role === 'master_admin') {
                        setIsAuthorized(true);
                        setRoleCheckLoading(false);
                        return;
                    }
                }

                // If not found in profiles, check user_roles table (if it exists)
                try {
                    const { data: userRolesData, error: userRolesError } = await (supabase.from('user_roles' as any) as any)
                        .select('role')
                        .eq('user_id', user.id);

                    if (!userRolesError && userRolesData && userRolesData.length > 0) {
                        const roles = userRolesData.map((r: any) => r.role);
                        if (roles.includes('expert') || roles.includes('admin_market') || roles.includes('master_admin')) {
                            setIsAuthorized(true);
                            setRoleCheckLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    // user_roles table might not exist, that's okay
                    console.log('user_roles table not found (non-blocking)');
                }

                // Not authorized
                toast.error("Access Denied: Experts or Admins only.");
            } catch (error) {
                console.error('Error checking expert role:', error);
            } finally {
                setRoleCheckLoading(false);
            }
        };

        if (!authLoading) {
            checkExpertRole();
        }
    }, [user, authLoading]);

    if (authLoading || roleCheckLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-admin-gold mx-auto mb-4" />
                    <p className="text-admin-gold/80 font-serif animate-pulse">Verifying Expert Credentials...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-admin-surface border border-admin-gold/30 p-8 rounded-xl shadow-2xl">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif text-admin-gold mb-2">Access Denied</h2>
                    <p className="text-gray-400 mb-6">You do not have the required permissions to access the Expert Dashboard.</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded hover:bg-red-500/20 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ExpertRoute;
