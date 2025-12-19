import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfileComplete = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  // Cache profile completion in sessionStorage to prevent repeated checks
  const getCachedProfileComplete = (): boolean | null => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(`profile_complete_${user?.id}`);
    return cached === null ? null : cached === 'true';
  };
  
  const setCachedProfileComplete = (value: boolean) => {
    if (typeof window === 'undefined' || !user?.id) return;
    sessionStorage.setItem(`profile_complete_${user.id}`, String(value));
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      // Check cache first
      const cached = getCachedProfileComplete();
      if (cached === true) {
        // If cache says complete, trust it and skip database check for faster navigation
        setProfileComplete(true);
        setCachedProfileComplete(true); // Ensure cache is set
        setCheckingProfile(false);
        console.log('Profile complete (from cache), allowing access to:', location.pathname);
        return; // Exit early - cache says complete, no need to verify
      }
      
      // If cache says false or null, we need to check database
      console.log('Cache check result:', cached, 'for path:', location.pathname);

      // Cache says incomplete or doesn't exist - verify with database
      try {
        // Check if profile exists and has required fields
        // Try multiple approaches to handle different schema variations
        let profileData: any = null;
        
        // Approach 1: Try with user_id first (most common schema)
        // Don't select user_id in SELECT clause to avoid potential conflicts
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('display_name, phone, location, id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!error && profile) {
            profileData = profile;
          } else if (error) {
            // Check error type
            if (error.code === 'PGRST116' || error.message?.includes('No rows') || error.message?.includes('not found')) {
              // Profile doesn't exist, that's okay
              profileData = null;
            } else if (error.code === '400' || error.message?.includes('Bad Request')) {
              // 400 error - might be schema issue, try next approach
              console.log('Query with user_id returned 400, trying with id field');
            } else {
              // Other error, log and try next approach
              console.warn('Profile query error:', error.code, error.message);
            }
          }
        } catch (err: any) {
          // If error, try next approach
          console.log('Exception in user_id query, trying id field:', err.message);
        }

        // Approach 2: Try with id field (if user_id approach failed)
        if (!profileData) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('display_name, phone, location, id')
              .eq('id', user.id)
              .maybeSingle();
            
            if (!error && data) {
              profileData = data;
            }
          } catch (err: any) {
            console.warn('Both query approaches failed:', err);
          }
        }

        // Approach 3: Try selecting all columns (fallback)
        if (!profileData) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (!error && data) {
              profileData = data;
            } else if (!error && !data) {
              // Try with id
              const { data: dataById } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
              if (dataById) {
                profileData = dataById;
              }
            }
          } catch (err: any) {
            console.warn('Fallback query also failed:', err);
          }
        }

        // Check if profile is complete
        // Only require display_name - phone and location are optional
        const isComplete = profileData && 
          profileData.display_name && 
          profileData.display_name.trim() !== '';

        const finalResult = isComplete || false;
        setProfileComplete(finalResult);
        setCachedProfileComplete(finalResult);
        
        // Log for debugging
        if (!finalResult) {
          console.log('Profile incomplete:', {
            hasProfile: !!profileData,
            hasDisplayName: !!profileData?.display_name,
            displayName: profileData?.display_name
          });
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!loading && user) {
      checkProfile();
    } else if (!loading && !user) {
      setCheckingProfile(false);
    }
  }, [user, loading]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If profile completion is required and profile is not complete, redirect to setup
  if (requireProfileComplete && profileComplete === false) {
    // Don't redirect if already on profile setup page, profile page, expert chat, or session details
    const allowedPaths = ['/profile/setup', '/profile', '/expert-chat', '/session'];
    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
    
    // Also don't redirect if coming from profile setup (user just completed it)
    const fromSetup = location.state?.from === '/profile/setup' || 
                       document.referrer.includes('/profile/setup');
    
    // Check cache one more time - might have been updated since check started
    const lastChanceCache = getCachedProfileComplete();
    if (lastChanceCache === true) {
      // Cache says complete, trust it and don't redirect
      console.log('Profile complete (last-chance cache check), allowing access');
      return <>{children}</>;
    }
    
    // Only redirect if not on allowed paths and not coming from setup
    if (!isAllowedPath && !fromSetup) {
      console.log('Profile incomplete, redirecting to setup. Path:', location.pathname);
      return <Navigate to="/profile/setup" replace />;
    }
  }
  
  // Profile is complete or check passed, allow access
  if (requireProfileComplete && profileComplete === true) {
    console.log('Profile complete, allowing access to:', location.pathname);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
