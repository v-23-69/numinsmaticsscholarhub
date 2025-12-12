
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, ShieldCheck, Mail, MapPin, Calendar, Check, X, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('joined_at', { ascending: false });

        if (error) {
            toast.error("Failed to fetch users");
        } else {
            console.log("Users:", data);
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = (tab: string) => {
        let list = users;
        if (tab === 'experts') list = users.filter(u => u.role === 'expert');
        if (tab === 'admins') list = users.filter(u => u.role === 'admin');

        if (searchQuery) {
            const lowQ = searchQuery.toLowerCase();
            list = list.filter(u =>
                (u.username?.toLowerCase() || "").includes(lowQ) ||
                (u.display_name?.toLowerCase() || "").includes(lowQ) ||
                (u.id || "").includes(lowQ)
            );
        }
        return list;
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            toast.error("Failed to update role");
        } else {
            toast.success(`User promoted to ${newRole}`);
            fetchUsers();
            if (selectedUser) setSelectedUser({ ...selectedUser, role: newRole });
        }
    };

    const handleVerificationToggle = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: !currentStatus })
            .eq('id', userId);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Verification status updated");
            fetchUsers();
            if (selectedUser) setSelectedUser({ ...selectedUser, is_verified: !currentStatus });
        }
    };

    const UserCard = ({ user }: { user: any }) => (
        <div
            className="flex items-center justify-between p-4 bg-admin-surface border border-admin-border rounded-lg hover:border-admin-gold/30 transition-all cursor-pointer group"
            onClick={() => setSelectedUser(user)}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/50 overflow-hidden flex-shrink-0 border border-white/10">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User className="w-5 h-5" /></div>
                    )}
                </div>
                <div>
                    <h3 className="text-white font-medium flex items-center gap-2">
                        {user.display_name || "Unnamed User"}
                        {user.is_verified && <ShieldCheck className="w-4 h-4 text-green-400" />}
                    </h3>
                    <p className="text-xs text-gray-500">@{user.username || "no_username"}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className={`
                    ${user.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
                        user.role === 'expert' ? 'border-blue-500 text-blue-500 bg-blue-500/10' :
                            'border-gray-500 text-gray-500'}
                 `}>
                    {user.role}
                </Badge>
                <span className="text-xs text-gray-600 hidden md:inline">
                    Score: {user.trust_score || 100}
                </span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">User Management</h2>
                    <p className="text-gray-400 text-sm">Manage user roles, verification, and profiles.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-black/20 border-admin-border text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List */}
                <div className="lg:col-span-2 space-y-4">
                    <Tabs defaultValue="all" className="space-y-4">
                        <TabsList className="bg-admin-surface border border-admin-border">
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="experts">Experts</TabsTrigger>
                            <TabsTrigger value="admins">Admins</TabsTrigger>
                        </TabsList>

                        {['all', 'experts', 'admins'].map(tab => (
                            <TabsContent key={tab} value={tab} className="space-y-2">
                                {loading ? (
                                    <div className="py-8 text-center text-gray-500">Loading...</div>
                                ) : filteredUsers(tab).length === 0 ? (
                                    <div className="py-8 text-center text-gray-500 bg-admin-surface/30 rounded border border-dashed border-white/10">
                                        No users found.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredUsers(tab).map(user => (
                                            <UserCard key={user.id} user={user} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-1">
                    {selectedUser ? (
                        <Card className="bg-admin-surface border-admin-border sticky top-4">
                            <CardHeader className="text-center pb-2">
                                <div className="w-24 h-24 mx-auto rounded-full bg-black overflow-hidden border-2 border-admin-gold mb-3">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User className="w-8 h-8" /></div>
                                    )}
                                </div>
                                <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                                    {selectedUser.display_name}
                                    {selectedUser.is_verified && <ShieldCheck className="w-5 h-5 text-green-400" />}
                                </CardTitle>
                                <p className="text-gray-400">@{selectedUser.username}</p>
                                <div className="flex justify-center gap-2 mt-2">
                                    <Badge variant="outline" className="border-admin-gold/50 text-admin-gold">{selectedUser.role.toUpperCase()}</Badge>
                                    <Badge variant="secondary" className="bg-white/10 text-white">Trust: {selectedUser.trust_score}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-black/20 p-2 rounded">
                                        <p className="text-gray-500 text-xs">Joined</p>
                                        <p className="text-white">{format(new Date(selectedUser.joined_at), 'MMM yyyy')}</p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded">
                                        <p className="text-gray-500 text-xs">Listing Count</p>
                                        <p className="text-white">{selectedUser.listings_count || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-admin-gold border-b border-white/10 pb-1">Actions</h4>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Verified User</span>
                                        <Button
                                            size="sm"
                                            variant={selectedUser.is_verified ? "default" : "outline"}
                                            className={selectedUser.is_verified ? "bg-green-600 hover:bg-green-700" : "border-white/20"}
                                            onClick={() => handleVerificationToggle(selectedUser.id, selectedUser.is_verified)}
                                        >
                                            {selectedUser.is_verified ? "Verified" : "Verify"}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-sm text-gray-300">System Role</span>
                                        <Select
                                            value={selectedUser.role}
                                            onValueChange={(val) => handleRoleUpdate(selectedUser.id, val)}
                                        >
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-admin-surface border-admin-border text-white">
                                                <SelectItem value="user">User - Standard</SelectItem>
                                                <SelectItem value="expert">Expert - Can Authenticate</SelectItem>
                                                <SelectItem value="admin">Admin - Full Access</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-500 font-mono">ID: {selectedUser.id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                            Select a user to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManager;
