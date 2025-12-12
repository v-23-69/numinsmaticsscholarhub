
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Shield, Coins, Bell, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: "Numismatics Scholar Hub",
        supportEmail: "support@nsh.com",
        maintenanceMode: false,
        nshCoinRate: 83.50, // INR per Coin
        minWithdrawal: 500,
        enableNotifications: true,
        enableNewRegistrations: true
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Settings saved successfully");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Platform Settings</h2>
                    <p className="text-gray-400 text-sm">Configure global application preferences.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="bg-admin-gold text-black hover:bg-admin-gold2">
                    {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-admin-surface border border-admin-border">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="economy">Economy</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general">
                    <Card className="bg-admin-surface border-admin-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2"><Globe className="w-5 h-5 text-admin-gold" /> General Information</CardTitle>
                            <CardDescription>Basic site identity and contact info.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Application Name</Label>
                                <Input
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Email</Label>
                                <Input
                                    value={settings.supportEmail}
                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                            <Separator className="bg-white/10 my-4" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-gray-500">Disable customer access for temporary updates.</p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ECONOMY SETTINGS */}
                <TabsContent value="economy">
                    <Card className="bg-admin-surface border-admin-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2"><Coins className="w-5 h-5 text-admin-gold" /> Economy & Payments</CardTitle>
                            <CardDescription>Manage currency rates and limits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>NSH Coin Exchange Rate (INR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <Input
                                            type="number"
                                            value={settings.nshCoinRate}
                                            onChange={(e) => setSettings({ ...settings, nshCoinRate: parseFloat(e.target.value) })}
                                            className="pl-8 bg-black/20 border-white/10"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">1 NSH Coin = ₹{settings.nshCoinRate}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Withdrawal Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <Input
                                            type="number"
                                            value={settings.minWithdrawal}
                                            onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                            className="pl-8 bg-black/20 border-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY SETTINGS */}
                <TabsContent value="security">
                    <Card className="bg-admin-surface border-admin-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-admin-gold" /> Access Control</CardTitle>
                            <CardDescription>Manage registration and authentication rules.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Allow New Registrations</Label>
                                    <p className="text-sm text-gray-500">If disabled, only existing users can log in.</p>
                                </div>
                                <Switch
                                    checked={settings.enableNewRegistrations}
                                    onCheckedChange={(c) => setSettings({ ...settings, enableNewRegistrations: c })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Force Expert 2FA</Label>
                                    <p className="text-sm text-gray-500">Require Two-Factor Auth for Expert accounts.</p>
                                </div>
                                <Switch defaultChecked={true} disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettings;
