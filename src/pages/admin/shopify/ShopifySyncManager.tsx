
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, CheckCircle, AlertCircle, Link as LinkIcon, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface SyncLog {
    id: number;
    status: 'success' | 'error';
    message: string;
    time: string;
}

const ShopifySyncManager = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [shopifyProductCount, setShopifyProductCount] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

    // Check connection status and fetch stats on mount
    useEffect(() => {
        checkConnection();
        fetchStats();
    }, []);

    const checkConnection = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('shopify-sync', {
                body: { action: 'test_connection' }
            });

            if (error) throw error;
            
            if (data?.success) {
                setIsConnected(true);
            }
        } catch (error: any) {
            console.error('Connection check failed:', error);
            setIsConnected(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase
                .from('coin_listings')
                .select('id, updated_at', { count: 'exact', head: false })
                .eq('is_shopify_product', true);

            if (!error && data) {
                setShopifyProductCount(data.length);
                if (data.length > 0) {
                    const latest = data.sort((a, b) => 
                        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                    )[0];
                    setLastSyncTime(latest.updated_at);
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleConnect = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('shopify-sync', {
                body: { action: 'test_connection' }
            });

            if (error) throw error;

            if (data?.success) {
                setIsConnected(true);
                toast.success('Successfully connected to Shopify Store!');
            } else {
                throw new Error('Connection failed');
            }
        } catch (error: any) {
            toast.error('Connection failed: ' + (error.message || 'Unknown error'));
            console.error('Connection error:', error);
        }
    };

    const handleSync = async () => {
        if (!isConnected) {
            toast.error('Please connect to Shopify first');
            return;
        }

        setIsSyncing(true);
        setProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 90));
            }, 200);

            const { data, error } = await supabase.functions.invoke('shopify-sync', {
                body: { action: 'sync_products' }
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (error) throw error;

            if (data?.success) {
                const message = data.message || `Synced ${data.synced_count || 0} products`;
                setLogs(prevLogs => [
                    { 
                        id: Date.now(), 
                        status: 'success', 
                        message: message,
                        time: 'Just now' 
                    },
                    ...prevLogs.slice(0, 9) // Keep last 10 logs
                ]);
                
                toast.success(message);
                setLastSyncTime(new Date().toISOString());
                await fetchStats();
            } else {
                throw new Error(data?.error || 'Sync failed');
            }
        } catch (error: any) {
            const errorMsg = error.message || 'Sync failed';
            setLogs(prevLogs => [
                { 
                    id: Date.now(), 
                    status: 'error', 
                    message: errorMsg,
                    time: 'Just now' 
                },
                ...prevLogs.slice(0, 9)
            ]);
            toast.error('Sync failed: ' + errorMsg);
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Shopify Integration</h2>
                    <p className="text-gray-400 text-sm">Manage inventory and order synchronization.</p>
                </div>
                <div className="flex items-center gap-2">
                    {isConnected && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50 px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-2" /> Connected
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <Card className="bg-admin-surface border-admin-border lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <ShoppingBag className="w-5 h-5 text-admin-gold" /> Store Connection
                        </CardTitle>
                        <CardDescription>Status of your Shopify link</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-lg border border-white/5 space-y-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/30 text-gray-500'}`}>
                                <LinkIcon className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-medium">{isConnected ? "Store Linked" : "No Store Connected"}</h3>
                                <p className="text-xs text-gray-400 mt-1">{isConnected ? "nsh-coins.myshopify.com" : "Connect your store to start syncing"}</p>
                            </div>
                            <Button
                                className={`w-full ${isConnected ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-admin-gold text-black hover:bg-admin-gold2'}`}
                                onClick={isConnected ? () => setIsConnected(false) : handleConnect}
                            >
                                {isConnected ? "Disconnect Store" : "Connect Shopify"}
                            </Button>
                        </div>

                        {isConnected && (
                            <div className="bg-admin-surface border border-admin-border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Sync Inventory</span>
                                    <Button size="sm" onClick={handleSync} disabled={isSyncing} className="bg-white/10 hover:bg-white/20">
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                                    </Button>
                                </div>
                                {isSyncing && <Progress value={progress} className="h-1 bg-black" />}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Logs & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-admin-surface border-admin-border">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-xs uppercase font-bold">Products Synced</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{shopifyProductCount.toLocaleString()}</h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-admin-surface border-admin-border">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-xs uppercase font-bold">Store Status</p>
                                <h3 className="text-lg font-medium text-white mt-1 flex items-center gap-2">
                                    {isConnected ? (
                                        <>
                                            Connected <CheckCircle className="w-4 h-4 text-green-500" />
                                        </>
                                    ) : (
                                        <>
                                            Not Connected <AlertCircle className="w-4 h-4 text-red-500" />
                                        </>
                                    )}
                                </h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-admin-surface border-admin-border">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-xs uppercase font-bold">Last Sync</p>
                                <h3 className="text-lg font-medium text-white mt-1 flex items-center gap-2">
                                    {lastSyncTime ? (
                                        <>
                                            {formatTimeAgo(lastSyncTime)} <CheckCircle className="w-4 h-4 text-green-500" />
                                        </>
                                    ) : (
                                        <>
                                            Never <Clock className="w-4 h-4 text-gray-500" />
                                        </>
                                    )}
                                </h3>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sync Log Table */}
                    <Card className="bg-admin-surface border-admin-border h-full">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Sync Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                        <div className={`mt-1 ${log.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                            {log.status === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-200">{log.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-500" />
                                                <span className="text-xs text-gray-500">{log.time}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-600">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

export default ShopifySyncManager;
