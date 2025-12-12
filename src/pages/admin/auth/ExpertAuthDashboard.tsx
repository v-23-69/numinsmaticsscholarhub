
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, User, DollarSign, XCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ExpertAuthDashboard = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [experts, setExperts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [assignExpertId, setAssignExpertId] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        // Fetch auth requests with user details
        const { data, error } = await supabase
            .from('auth_requests')
            .select(`
                *,
                user:profiles(display_name, avatar_url, username)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching requests:', error);
            toast.error("Failed to load requests");
        } else {
            console.log("Fetched requests:", data);
            setRequests(data || []);
        }
        setLoading(false);
    };

    const fetchExperts = async () => {
        // In a real app, filtering by role 'expert'
        // For now, fetching all profiles and assuming some are experts or admin selects manually
        const { data, error } = await supabase
            .from('profiles')
            .select('*'); // Should filter by role if available

        if (!error && data) {
            setExperts(data);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchExperts();
    }, []);

    const handleAssignExpert = async () => {
        if (!selectedRequest || !assignExpertId) {
            toast.error("Please select an expert");
            return;
        }

        const { error } = await supabase
            .from('auth_requests')
            .update({
                assigned_expert_id: assignExpertId,
                status: 'in_review'
            })
            .eq('id', selectedRequest.id);

        if (error) {
            toast.error("Assignment failed");
        } else {
            toast.success("Expert assigned successfully");
            setSelectedRequest(null);
            fetchRequests();
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Expert Authentication</h2>
                    <p className="text-gray-400 text-sm">Manage expert verification requests and assignments.</p>
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
                                    <div key={req.id} className="bg-admin-surface border border-admin-border p-4 rounded-lg flex flex-col md:flex-row gap-4 hover:border-admin-gold/30 transition-all">
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
                                                        <StatusBadge status={req.status} />
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
                                                                    {req.images && (req.images as any[]).map((img: string, idx: number) => (
                                                                        <img key={idx} src={img} className="w-full h-32 object-cover rounded bg-black/50" />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <Label className="text-gray-400">User Description</Label>
                                                                    <p className="text-sm mt-1">{req.description || "No description provided."}</p>
                                                                </div>

                                                                <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                                                                    <h4 className="font-medium text-admin-gold">Expert Assignment</h4>
                                                                    {req.assigned_expert_id ? (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                                            Assigned to Expert ID: {req.assigned_expert_id.slice(0, 8)}...
                                                                            {/* Ideally would fetch expert name */}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <Label>Select Expert</Label>
                                                                            <Select onValueChange={setAssignExpertId}>
                                                                                <SelectTrigger className="bg-admin-bg border-white/10">
                                                                                    <SelectValue placeholder="Choose an expert" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="bg-admin-surface border-admin-border">
                                                                                    {experts.map(exp => (
                                                                                        <SelectItem key={exp.id} value={exp.id}>
                                                                                            {exp.display_name || exp.username || "Unknown Expert"}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Button
                                                                                className="w-full bg-admin-gold text-black hover:bg-admin-gold2"
                                                                                onClick={() => {
                                                                                    setSelectedRequest(req);
                                                                                    handleAssignExpert();
                                                                                }}
                                                                            >
                                                                                Assign Selected Expert
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>


                                            </div>
                                        </div>
                                    </div>
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
