
"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUp, ArrowDown, Star, Loader2 } from "lucide-react"
import { getOrdersByCaterer } from "@/lib/services/orderService"
import { getMealsByCaterer, addMealRating } from "@/lib/services/mealService"
import { auth } from "@/lib/firebase"
import type { Order, Meal } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, getWeek, parseISO } from "date-fns"
import { fr } from 'date-fns/locale'

type Timeframe = "month" | "week";
type RevenueDataPoint = { name: string; value: number };
type PopularMeal = { id: string; name: string; count: number; image: string };

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--destructive))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>['config'];

const calculateRevenueStats = (orders: Order[]) => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
    const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;

    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    deliveredOrders.forEach(order => {
        const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
        if (orderDate >= startOfCurrentMonth && orderDate <= endOfCurrentMonth) {
            currentMonthRevenue += order.totalPrice;
        }
        if (orderDate >= startOfPreviousMonth && orderDate <= endOfPreviousMonth) {
            previousMonthRevenue += order.totalPrice;
        }
    });

    const percentageChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : currentMonthRevenue > 0 ? 100 : 0;

    return { currentMonthRevenue, percentageChange };
};

const getChartData = (orders: Order[], timeframe: Timeframe): RevenueDataPoint[] => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const now = new Date();

    if (timeframe === "month") {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const weeksInMonth: { [week: number]: number } = {};

        deliveredOrders.forEach(order => {
            const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
            if(orderDate >= start && orderDate <= end) {
                const weekNumber = getWeek(orderDate);
                if (!weeksInMonth[weekNumber]) weeksInMonth[weekNumber] = 0;
                weeksInMonth[weekNumber] += order.totalPrice;
            }
        });
        
        return Object.entries(weeksInMonth).map(([week, revenue]) => ({
            name: `Sem ${week}`,
            value: revenue,
        })).sort((a,b) => a.name.localeCompare(b.name));
    }

    if (timeframe === "week") {
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });
        const dailyRevenue: { [day: string]: number } = {};

        days.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            dailyRevenue[dayKey] = 0;
        });

        deliveredOrders.forEach(order => {
            const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
            if(orderDate >= start && orderDate <= end) {
                const dayKey = format(orderDate, 'yyyy-MM-dd');
                dailyRevenue[dayKey] += order.totalPrice;
            }
        });
        
        return Object.entries(dailyRevenue).map(([date, revenue]) => ({
            name: format(parseISO(date), 'eee', { locale: fr }),
            value: revenue
        }));
    }

    return [];
};

const getMostOrderedMeals = (orders: Order[], allMeals: Meal[]): PopularMeal[] => {
    const mealCounts: { [id: string]: number } = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (mealCounts[item.mealId]) {
                mealCounts[item.mealId] += item.quantity;
            } else {
                mealCounts[item.mealId] = item.quantity;
            }
        });
    });

    const sortedMealIds = Object.keys(mealCounts).sort((a, b) => mealCounts[b] - mealCounts[a]).slice(0, 5);
    
    return sortedMealIds.map(id => {
        const mealDetails = allMeals.find(m => m.id === id);
        return {
            id,
            name: mealDetails?.name || 'Repas inconnu',
            image: mealDetails?.imageUrl || "https://placehold.co/40x40.png",
            count: mealCounts[id],
        };
    });
};

const getBestRatedMeals = (meals: Meal[]): Meal[] => {
    return [...meals]
        .filter(meal => meal.ratings && meal.ratings.count > 0)
        .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
        .slice(0, 5);
}

export default function StatsPage() {
    const [timeframe, setTimeframe] = useState<Timeframe>("month");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueChange, setRevenueChange] = useState(0);
    const [mostOrderedMeals, setMostOrderedMeals] = useState<PopularMeal[]>([]);
    const [bestRatedMeals, setBestRatedMeals] = useState<Meal[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);


    useEffect(() => {
        const fetchStats = async () => {
            const user = auth.currentUser;
            if (!user) {
                toast({ title: "Erreur", description: "Utilisateur non connecté.", variant: "destructive" });
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [fetchedOrders, fetchedMeals] = await Promise.all([
                    getOrdersByCaterer(user.uid),
                    getMealsByCaterer(user.uid)
                ]);

                setOrders(fetchedOrders);
                setMeals(fetchedMeals);
                
                const { currentMonthRevenue, percentageChange } = calculateRevenueStats(fetchedOrders);
                setTotalRevenue(currentMonthRevenue);
                setRevenueChange(percentageChange);

                setMostOrderedMeals(getMostOrderedMeals(fetchedOrders, fetchedMeals));
                setBestRatedMeals(getBestRatedMeals(fetchedMeals));

            } catch (error) {
                toast({ title: "Erreur", description: "Impossible de charger les statistiques.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [toast]);
    
    useEffect(() => {
       setRevenueData(getChartData(orders, timeframe));
    }, [orders, timeframe]);


    const totalOrderedMealsCount = useMemo(() => {
        return mostOrderedMeals.reduce((sum, meal) => sum + meal.count, 0);
    }, [mostOrderedMeals]);

    if (loading) {
        return (
             <div className="flex justify-center items-center h-screen bg-background">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
        );
    }
  
  return (
    <div className="bg-primary">
       <header className="p-4 pt-8 text-white bg-gradient-to-br from-primary via-primary to-background/30">
        <Image src="/kounfit-white.png" alt="Kounfit Logo" width={100} height={25} />
        <h1 className="text-3xl font-bold font-serif mt-2">Statistiques</h1>
      </header>

      <main className="bg-background rounded-t-3xl p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Chiffre d'affaires</CardTitle>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
                    <Button 
                        size="sm" 
                        variant={timeframe === 'week' ? 'default' : 'ghost'} 
                        onClick={() => setTimeframe('week')}
                        className="rounded-full h-8 px-4"
                    >
                        7 jours
                    </Button>
                    <Button 
                        size="sm" 
                        variant={timeframe === 'month' ? 'default' : 'ghost'} 
                        onClick={() => setTimeframe('month')}
                        className="rounded-full h-8 px-4"
                    >
                        Mois
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
               <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip
                          content={<ChartTooltipContent hideIndicator />}
                          cursor={{ stroke: 'hsl(var(--destructive))', strokeWidth: 2, strokeDasharray: "3 3" }}
                       />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
               </ChartContainer>
            </div>
            <div className="flex items-baseline gap-4 mt-4">
                <p className="text-3xl font-bold">{totalRevenue.toFixed(2)} DT</p>
                 {revenueChange !== 0 && (
                     <div className={`flex items-center font-semibold ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                         {revenueChange >= 0 ? <ArrowUp className="w-4 h-4"/> : <ArrowDown className="w-4 h-4"/>}
                         <span>{Math.abs(revenueChange).toFixed(1)}%</span>
                     </div>
                 )}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Repas les plus commandés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mostOrderedMeals.length > 0 ? mostOrderedMeals.map(meal => (
                    <div key={meal.name} className="flex items-center gap-4">
                        <Image src={meal.image} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="caterer meal" />
                        <div className="flex-1">
                            <p className="font-medium">{meal.name}</p>
                            <Progress value={(meal.count / (totalOrderedMealsCount || 1)) * 100} className="h-2 mt-1" indicatorClassName="bg-primary" />
                        </div>
                        <p className="font-semibold">{meal.count}</p>
                    </div>
                )) : <p className="text-muted-foreground text-sm">Aucune commande pour le moment.</p>}
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Repas les mieux notés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {bestRatedMeals.length > 0 ? bestRatedMeals.map(meal => (
                    <div key={meal.id} className="flex items-center gap-4">
                        <Image src={meal.imageUrl!} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="caterer meal" />
                        <p className="flex-1 font-medium">{meal.name}</p>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < (meal.ratings?.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                )) : <p className="text-muted-foreground text-sm">Vos repas n'ont pas encore été notés.</p>}
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
