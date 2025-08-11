
"use client";

import { MainLayout } from "@/components/main-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/userService";
import type { User } from "@/lib/types";
import { BarChart, Heart, Loader2, LogOut, Moon, Settings, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar } from "recharts";
import {
  BarChart as RechartsBarChart,
} from "recharts";

const chartData = [
  { day: "M", kcal: 1800, target: 2200 },
  { day: "T", kcal: 2300, target: 2200 },
  { day: "W", kcal: 2050, target: 2200 },
  { day: "T", kcal: 2400, target: 2200 },
  { day: "F", kcal: 1900, target: 2200 },
  { day: "S", kcal: 2250, target: 2200 },
];


export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    setUser(userProfile);
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                } finally {
                    setLoading(false);
                }
            } else {
                router.replace('/welcome');
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }
    
    if (!user) {
        return (
             <MainLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Could not load user profile.</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="bg-primary">
                <div className="p-4 pt-8">
                    <div className="flex justify-between items-center text-white mb-6">
                        <h1 className="text-xl font-bold">KOUNFIT</h1>
                        <Button variant="ghost" size="icon" className="text-white" onClick={() => router.push('/profile/edit')}>
                            <Settings />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-white/50">
                            <AvatarImage src={user.photoURL || ''} alt={user.fullName} />
                            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-white/80 text-sm">
                                {user.height} cm • {user.weight} kg • {user.age} ans
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="rounded-t-3xl mt-6">
                    <CardContent className="p-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <Card className="p-3">
                                <Heart className="mx-auto text-primary mb-1"/>
                                <p className="font-bold">56 jours</p>
                                <p className="text-xs text-muted-foreground">actifs</p>
                            </Card>
                             <Card className="p-3">
                                <Star className="mx-auto text-yellow-400 mb-1"/>
                                <p className="font-bold">18</p>
                                <p className="text-xs text-muted-foreground">succès</p>
                            </Card>
                        </div>
                        
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">PROGRÈS HEBDOMADAIRE</h3>
                            </CardHeader>
                            <CardContent>
                               <div className="h-[150px]">
                                <ChartContainer config={{
                                    kcal: { label: "Kcal", color: "hsl(var(--primary))" },
                                    over: { label: "Over", color: "hsl(var(--destructive))" },
                                }}>
                                    <RechartsBarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, left: -30, bottom: 0 }}>
                                        <Bar dataKey={(bar) => bar.kcal > bar.target ? bar.kcal : null} fill="var(--color-over)" radius={[4, 4, 0, 0]} name="Over Target"/>
                                        <Bar dataKey={(bar) => bar.kcal <= bar.target ? bar.kcal : null} fill="var(--color-kcal)" radius={[4, 4, 0, 0]} name="Avg"/>
                                    </RechartsBarChart>
                                </ChartContainer>
                               </div>
                            </CardContent>
                        </Card>


                        <div>
                            <h3 className="font-bold mb-2">SUCCÈS</h3>
                            <Card>
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-full">
                                           <ShieldCheck className="text-primary"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Choix Sain</p>
                                            <p className="text-sm text-muted-foreground">Terminer un défi</p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex flex-col items-center justify-center">
                                        <p className="font-bold text-lg">4</p>
                                        <p className="text-xs font-semibold">54 PTS</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">RÉGLAGES DU COMPTE</h3>
                            <Card>
                               <CardContent className="divide-y">
                                    <div className="flex justify-between items-center p-3">
                                        <p>Notifications</p>
                                        <Switch />
                                    </div>
                                    <div className="flex justify-between items-center p-3">
                                        <p>Se déconnecter</p>
                                        <Button variant="ghost" size="icon">
                                            <LogOut className="text-destructive"/>
                                        </Button>
                                    </div>
                               </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
