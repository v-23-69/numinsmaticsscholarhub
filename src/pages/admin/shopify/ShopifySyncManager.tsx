
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, CheckCircle, AlertCircle, Link as LinkIcon, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Mock Logs since table is missing in current schema iteration
const MOCK_LOGS = [
    { id: 1, status: 'success', message: 'Synced 12 new products from Shopify', time: '2 hours ago' },
    { id: 2, status: 'error', message: 'Failed to update inventory for SKU-112', time: '5 hours ago' },
    { id: 3, status: 'success', message: 'Order #1002 status updated to Fulfilled', time: '1 day ago' },
];

const ShopifySyncManager = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState(MOCK_LOGS);

    const handleConnect = () => {
        // Simulate OAuth flow
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Connecting to Shopify...',
                success: () => {
                    setIsConnected(true);
                    return 'Successfully connected to Shopify Store!';
                },
                error: 'Connection failed',
            }
        );
    };

    const handleSync = () => {
        if (!isConnected) return;

        setIsSyncing(true);
        setProgress(0);

        // Simulate Sync Progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSyncing(false);
                    setLogs(prevLogs => [
                        { id: Date.now(), status: 'success', message: 'Manual sync completed successfully', time: 'Just now' },
                        ...prevLogs
                    ]);
                    toast.success("Sync Completed");
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
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
                                <h3 className="text-2xl font-bold text-white mt-1">1,248</h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-admin-surface border-admin-border">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-xs uppercase font-bold">Pending Orders</p>
                                <h3 className="text-2xl font-bold text-admin-gold mt-1">5</h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-admin-surface border-admin-border">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-xs uppercase font-bold">Last Sync</p>
                                <h3 className="text-lg font-medium text-white mt-1 flex items-center gap-2">
                                    12 mins ago <CheckCircle className="w-4 h-4 text-green-500" />
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

export default ShopifySyncManager;
