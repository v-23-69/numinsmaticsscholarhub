
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, User, DollarSign, XCircle, Search, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createCometChatUser } from "@/lib/cometchat";

const ExpertAuthDashboard = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchRequests = async () => {
        setLoading(true);
        // Fetch auth requests with user details
        // Use explicit foreign key specification to avoid ambiguity
        // Since auth_requests has both user_id and assigned_expert_id referencing profiles, we need to specify
        const { data, error } = await supabase
            .from('auth_requests')
            .select(`
                *,
                user:profiles!user_id(display_name, avatar_url, username)
            `)
            .order('created_at', { ascending: false });
        
        // Update status to 'ongoing' for active sessions
        if (data) {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            data.forEach((req: any) => {
                if (req.status === 'in_review' && req.session_started_at) {
                    const sessionAge = now - new Date(req.session_started_at).getTime();
                    if (sessionAge >= fiveMinutes) {
                        // Auto-complete expired sessions
                        supabase
                            .from('auth_requests')
                            .update({ status: 'completed' })
                            .eq('id', req.id)
                            .then(() => fetchRequests()); // Refresh list
                    }
                }
            });
        }

        if (error) {
            console.error('Error fetching requests:', error);
            toast.error("Failed to load requests");
        } else {
            console.log("Fetched requests:", data);
            setRequests(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();

        // Set up real-time subscription for live request updates
        const channel = supabase
            .channel('auth_requests_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'auth_requests'
                },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    // Show toast notification for new requests
                    if (payload.eventType === 'INSERT') {
                        toast.success("New authentication request received!", {
                            description: "A new request has been added to the queue."
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const newData = payload.new as any;
                        if (newData.assigned_expert_id === user?.id && newData.status === 'in_review') {
                            toast.success("Request assigned to you!", {
                                description: "You can now open the chat."
                            });
                        }
                    }
                    // Refresh requests when any change occurs
                    fetchRequests();
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleAcceptRequest = async (request: any) => {
        if (!user) {
            toast.error("You must be logged in to accept requests");
            return;
        }

        try {
            // 1. Update auth request - assign current expert, set status to 'in_review', and set session start time
            const sessionStartTime = new Date().toISOString();
            const { data: updatedRequest, error: updateError } = await supabase
                .from('auth_requests')
                .update({ 
                    assigned_expert_id: user.id, 
                    status: 'in_review',
                    session_started_at: sessionStartTime
                } as any)
                .eq('id', request.id)
                .select();

            if (updateError) {
                console.error("Update error:", updateError);
                toast.error(`Failed to accept request: ${updateError.message || updateError.code}`);
                return;
            }

            // Check if any rows were updated (RLS might block it)
            if (!updatedRequest || updatedRequest.length === 0) {
                console.error("No rows updated - RLS policy may be blocking the update. Current user:", user.id);
                toast.error("Permission denied. Please ensure you have expert role and RLS policies allow experts to accept requests.");
                return;
            }

            const updated = updatedRequest[0];

            // 2. Verify the update was successful
            if (updated.assigned_expert_id !== user.id) {
                console.error("Assignment verification failed:", {
                    expected: user.id,
                    got: updated.assigned_expert_id
                });
                toast.error("Failed to verify assignment. Please try again.");
                return;
            }

            // 3. Create CometChat users if they don't exist
            try {
                // Get current expert profile
                const { data: expertProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (expertProfile) {
                    const expertName = expertProfile.display_name || expertProfile.username || 'Expert';
                    await createCometChatUser(user.id, expertName);
                }

                // Get user profile
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', request.user_id)
                    .maybeSingle();

                if (userProfile) {
                    const userName = userProfile.display_name || userProfile.username || 'User';
                    await createCometChatUser(request.user_id, userName);
                }
            } catch (cometError) {
                console.error("CometChat user creation error (non-blocking):", cometError);
                // Don't block acceptance if CometChat fails
            }

            toast.success("Request accepted! Opening chat...");
            
            // 4. Refresh requests list
            await fetchRequests();
            
            // 5. Wait a bit longer to ensure database consistency, then navigate
            // Also verify one more time before navigating
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Double-check the assignment before navigating
            const { data: verifyData, error: verifyError } = await supabase
                .from('auth_requests')
                .select('assigned_expert_id')
                .eq('id', request.id)
                .single();

            if (verifyError || !verifyData || verifyData.assigned_expert_id !== user.id) {
                console.error("Final verification failed:", verifyError);
                toast.error("Assignment verification failed. Please refresh and try opening chat manually.");
                return;
            }

            // 6. Navigate to chat - use expert route for independent page
            // Check if current user is admin or expert to determine route
            let isAdmin = false;
            
            // Check profiles.role
            const { data: currentUserProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();
            
            const profileRole = currentUserProfile?.role as any;
            if (profileRole === 'admin' || profileRole === 'admin_market' || profileRole === 'master_admin') {
                isAdmin = true;
            }
            
            // Also check user_roles table for admin roles
            if (!isAdmin) {
                try {
                    const { data: userRolesData } = await (supabase.from('user_roles' as any) as any)
                        .select('role')
                        .eq('user_id', user.id);
                    
                    if (userRolesData && userRolesData.length > 0) {
                        const roles = userRolesData.map((r: any) => r.role);
                        if (roles.includes('admin_market') || roles.includes('master_admin')) {
                            isAdmin = true;
                        }
                    }
                } catch (error) {
                    // user_roles table might not exist, that's okay
                }
            }
            
            if (isAdmin) {
                // Admin can access via admin route
                navigate(`/admin/expert-chat/${request.id}`);
            } else {
                // Expert uses independent expert route
                navigate(`/expert/chat/${request.id}`);
            }
        } catch (error: any) {
            console.error("Accept request error:", error);
            toast.error(error.message || "Failed to accept request");
        }
    };

    const handleOpenChat = async (requestId: string) => {
        if (!user) return;
        
        // Check user role to determine correct route
        let isAdmin = false;
        
        // Check profiles.role
        const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        
        const profileRole = currentUserProfile?.role as any;
        if (profileRole === 'admin' || profileRole === 'admin_market' || profileRole === 'master_admin') {
            isAdmin = true;
        }
        
        // Also check user_roles table for admin roles
        if (!isAdmin) {
            try {
                const { data: userRolesData } = await (supabase.from('user_roles' as any) as any)
                    .select('role')
                    .eq('user_id', user.id);
                
                if (userRolesData && userRolesData.length > 0) {
                    const roles = userRolesData.map((r: any) => r.role);
                    if (roles.includes('admin_market') || roles.includes('master_admin')) {
                        isAdmin = true;
                    }
                }
            } catch (error) {
                // user_roles table might not exist, that's okay
            }
        }
        
        if (isAdmin) {
            // Admin can access via admin route
            navigate(`/admin/expert-chat/${requestId}`);
        } else {
            // Expert uses independent expert route
            navigate(`/expert/chat/${requestId}`);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">Pending</Badge>;
            case 'in_review': return <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/10">In Review</Badge>;
            case 'completed': return <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">Completed</Badge>;
            case 'rejected': return <Badge variant="outline" className="border-red-500 text-red-500 bg-red-500/10">Rejected</Badge>;
            default: return <Badge variant="outline" className="text-gray-400">{status}</Badge>;
        }
    };

    const filteredRequests = (status: string) => requests.filter(r =>
        status === 'all' ? true : r.status === status
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-serif text-admin-text font-bold">Expert Authentication</h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-400 font-medium">Live</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Manage expert verification requests and assignments. Updates appear in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <Input placeholder="Search Request ID..." className="bg-black/20 border-admin-border w-full md:w-64" />
                    <Button size="icon" variant="outline" className="border-admin-gold/30"><Search className="w-4 h-4 text-admin-gold" /></Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-admin-surface border-admin-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Total Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">{requests.filter(r => r.status === 'pending').length}</div></CardContent>
                </Card>
                <Card className="bg-admin-surface border-admin-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">In Review</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-400">{requests.filter(r => r.status === 'in_review').length}</div></CardContent>
                </Card>
                <Card className="bg-admin-surface border-admin-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Completed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-400">{requests.filter(r => r.status === 'completed').length}</div></CardContent>
                </Card>
                <Card className="bg-admin-surface border-admin-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-admin-gold">₹{requests.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0)}</div></CardContent>
                </Card>
            </div>

            {/* Request List Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="bg-admin-surface border border-admin-border">
                    <TabsTrigger value="pending">Pending Queue</TabsTrigger>
                    <TabsTrigger value="in_review">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">History</TabsTrigger>
                </TabsList>

                {['pending', 'in_review', 'completed'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading requests...</div>
                        ) : filteredRequests(tabValue).length === 0 ? (
                            <div className="text-center py-16 bg-admin-surface/30 rounded border border-dashed border-white/10 text-gray-500">
                                No {tabValue.replace('_', ' ')} requests found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredRequests(tabValue).map((req) => (
                                    <motion.div 
                                        key={req.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-admin-surface border border-admin-border p-4 rounded-lg flex flex-col md:flex-row gap-4 hover:border-admin-gold/30 transition-all shadow-lg hover:shadow-gold/10"
                                    >
                                        {/* Image Preview */}
                                        <div className="w-full md:w-32 h-32 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden">
                                            {req.images && req.images[0] ? (
                                                <img src={req.images[0]} alt="Coin" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Img</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-white font-medium text-lg">Request #{req.id.slice(0, 8)}</h3>
                                                        <StatusBadge status={req.status} sessionStartedAt={(req as any).session_started_at} />
                                                        {req.paid && <Badge className="bg-admin-gold text-black hover:bg-admin-gold">PAID</Badge>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                        <User className="w-3 h-3" />
                                                        {req.user?.display_name || "Unknown User"}
                                                        <span className="text-gray-600">•</span>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(req.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-admin-gold font-bold text-lg">₹{req.paid_amount || 0}</div>
                                                    <div className="text-xs text-gray-500">Fee Paid</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-4">
                                                {/* Accept Request Button - Show for pending requests without assigned expert */}
                                                {req.paid && !req.assigned_expert_id && req.status === 'pending' && (
                                                    <Button 
                                                        onClick={() => handleAcceptRequest(req)}
                                                        className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Accept Request
                                                    </Button>
                                                )}
                                                
                                                {/* Chat Button - Show if paid, expert assigned, and current user is the assigned expert, and session is not completed */}
                                                {req.paid && req.assigned_expert_id && req.assigned_expert_id === user?.id && req.status !== 'completed' && (
                                                    <Button 
                                                        onClick={() => handleOpenChat(req.id)}
                                                        className="bg-admin-gold text-black hover:bg-admin-gold2 flex items-center gap-2"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        {req.status === 'in_review' ? 'Continue Chat' : 'Open Chat'}
                                                    </Button>
                                                )}
                                                
                                                {/* View Details Dialog */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="border-admin-gold/30 text-admin-gold hover:bg-admin-gold hover:text-black">
                                                            View Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-admin-surface border-admin-border text-white max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Authentication Request Details</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {req.images && Array.isArray(req.images) && req.images.map((img: string, idx: number) => (
                                                                        <img key={idx} src={img} className="w-full h-32 object-cover rounded bg-black/50" alt={`Coin image ${idx + 1}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <Label className="text-gray-400">User Description</Label>
                                                                    <p className="text-sm mt-1">{req.description || "No description provided."}</p>
                                                                </div>

                                                                <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                                                                    <h4 className="font-medium text-admin-gold">Request Status</h4>
                                                                    {req.assigned_expert_id ? (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                                                <span>Request Accepted</span>
                                                                            </div>
                                                                            {req.assigned_expert_id === user?.id && (
                                                                                <p className="text-xs text-gray-400">You are assigned to this request</p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-gray-400">
                                                                            <Clock className="w-4 h-4 inline mr-2" />
                                                                            Waiting for expert to accept
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default ExpertAuthDashboard;
