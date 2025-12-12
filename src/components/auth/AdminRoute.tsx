
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [roleCheckLoading, setRoleCheckLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAdminRole = async () => {
            if (!user) {
                setRoleCheckLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data?.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    toast.error("Access Denied: Admins only.");
                }
            } catch (error) {
                console.error('Error checking admin role:', error);
            } finally {
                setRoleCheckLoading(false);
            }
        };

        if (!authLoading) {
            checkAdminRole();
        }
    }, [user, authLoading]);

    if (authLoading || roleCheckLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-admin-gold mx-auto mb-4" />
                    <p className="text-admin-gold/80 font-serif animate-pulse">Verifying Royal Credentials...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to auth page, but remember we tried to go to admin
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        // User is logged in but not admin
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-admin-surface border border-admin-gold/30 p-8 rounded-xl shadow-2xl">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif text-admin-gold mb-2">Access Denied</h2>
                    <p className="text-gray-400 mb-6">You do not have the required permissions to access the Royal Archive (Admin Dashboard).</p>
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

export default AdminRoute;
