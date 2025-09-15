
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Loader2, CheckCircle, User, Phone, CalendarDays, BarChartHorizontal, Weight, MapPin, Activity, Target, Users, ChevronRight } from "lucide-react"
import * as React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { MainLayout } from "@/components/main-layout"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, getUserProfile } from "@/lib/services/userService"
import { auth } from "@/lib/firebase"
import { uploadProfileImage } from "@/lib/services/storageService"
import { calculateNutritionalNeeds } from "@/lib/services/nutritionService"
import type { User as UserType } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  phoneNumber: z.string().optional(),
  age: z.coerce.number().min(16, "Vous devez avoir au moins 16 ans.").max(120),
  biologicalSex: z.enum(["male", "female"], {
    required_error: "Veuillez sélectionner votre sexe.",
  }),
  weight: z.coerce.number().min(30, "Le poids doit être un nombre positif."),
  height: z.coerce.number().min(100, "La taille doit être un nombre positif."),
  region: z.string({ required_error: "Veuillez sélectionner une région." }),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"], {
    required_error: "Veuillez sélectionner un niveau d'activité.",
  }),
  mainGoal: z.enum(["lose_weight", "maintain", "gain_muscle"], {
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
  photoURL: z.string().url().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type EditableField = keyof ProfileFormValues;

const ProfileRow = ({ label, value, onClick, icon: Icon }: { label: string, value: string, onClick: () => void, icon: React.ElementType }) => (
    <button onClick={onClick} className="flex w-full items-center justify-between py-4 text-left border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <div className="flex items-center gap-4">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-gray-800">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground max-w-[120px] truncate">{value}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
    </button>
);


export default function ProfilePage() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isMounted = useRef(false);
    const [editingField, setEditingField] = useState<EditableField | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {},
        mode: "onBlur",
    });
    
    useEffect(() => {
        isMounted.current = true;
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userProfile = await getUserProfile(user.uid);
                    if (userProfile && isMounted.current) {
                        form.reset(userProfile as ProfileFormValues);
                        if (userProfile.photoURL) {
                          setProfileImagePreview(userProfile.photoURL);
                        }
                    }
                } catch (error) {
                    toast({
                        title: "Erreur",
                        description: "Impossible de charger votre profil.",
                        variant: "destructive"
                    });
                } finally {
                   if(isMounted.current) setLoading(false);
                }
            } else {
                 router.replace('/welcome');
            }
        });
        return () => {
            unsubscribe();
            isMounted.current = false;
        }
    }, [form, router, toast]);

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || !editingField) return;

        const isValid = await form.trigger(editingField);
        if (!isValid) return;

        setSaveStatus("saving");
        try {
            const fieldData = { [editingField]: form.getValues(editingField) };
            const fullData = form.getValues();

             const nutritionalNeeds = calculateNutritionalNeeds({
                age: fullData.age,
                gender: fullData.biologicalSex,
                weight: fullData.weight,
                height: fullData.height,
                activityLevel: fullData.activityLevel,
                goal: fullData.mainGoal
            });

            const userProfileData: Partial<UserType> = {
                ...fullData,
                ...fieldData, 
                calorieGoal: nutritionalNeeds.calories,
                macroRatio: nutritionalNeeds.macros,
            };

            await updateUserProfile(currentUser.uid, userProfileData);
            setSaveStatus("saved");
            setTimeout(() => {
                setEditingField(null);
                setSaveStatus("idle");
            }, 1000);
        } catch (error) {
            setSaveStatus("idle");
            toast({ title: "Erreur de sauvegarde", description: "Vos modifications n'ont pas pu être enregistrées.", variant: "destructive" });
        }
    };

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const currentUser = auth.currentUser;
        if (file && currentUser) {
          setSaveStatus("saving");
          const reader = new FileReader();
          reader.onloadend = () => setProfileImagePreview(reader.result as string);
          reader.readAsDataURL(file);

          try {
            const photoURL = await uploadProfileImage(currentUser.uid, file);
            form.setValue("photoURL", photoURL, { shouldDirty: true });
            await updateUserProfile(currentUser.uid, { photoURL });
             setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          } catch (error) {
            toast({ title: "Erreur de téléversement", description: "L'image n'a pas pu être sauvegardée.", variant: "destructive" });
            setSaveStatus("idle");
          }
        }
    };
    
    const user = form.watch();

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }
    
    const fieldConfig: Record<EditableField, { label: string; icon: React.ElementType; type: 'text' | 'number' | 'select' | 'radio'; options?: any[] }> = {
      fullName: { label: "Nom complet", icon: User, type: "text" },
      phoneNumber: { label: "Numéro de téléphone", icon: Phone, type: "tel" },
      age: { label: "Âge", icon: CalendarDays, type: "number" },
      biologicalSex: { label: "Sexe biologique", icon: Users, type: "radio", options: [{value: "male", label: "Homme"}, {value: "female", label: "Femme"}] },
      height: { label: "Taille (cm)", icon: BarChartHorizontal, type: "number" },
      weight: { label: "Poids (kg)", icon: Weight, type: "number" },
      region: { label: "Région", icon: MapPin, type: "select", options: ["grand tunis", "nabeul", "sousse", "sfax", "bizerte"] },
      activityLevel: { label: "Niveau d'activité", icon: Activity, type: "select", options: [
          {value: "sedentary", label: "Sédentaire"}, {value: "lightly_active", label: "Légèrement actif"}, 
          {value: "moderately_active", label: "Modérément actif"}, {value: "very_active", label: "Très actif"}, 
          {value: "extremely_active", label: "Extrêmement actif"}
      ] },
      mainGoal: { label: "Objectif Principal", icon: Target, type: "select", options: [
          {value: "lose_weight", label: "Perdre du poids"}, {value: "maintain", label: "Maintien"}, {value: "gain_muscle", label: "Prendre du muscle"}
      ] },
      photoURL: { label: "Photo", icon: Camera, type: "text" },
    };
    
    const renderValue = (fieldName: EditableField) => {
        const value = user[fieldName];
        if (!value) return "Non défini";
        const config = fieldConfig[fieldName];
        if (config.type === 'select' || config.type === 'radio') {
            const option = (config.options as any[]).find(opt => typeof opt === 'string' ? opt === value : opt.value === value);
            return typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option?.label || value;
        }
        return String(value);
    }
    
    return (
        <MainLayout>
            <div className="bg-primary pb-16">
                <div className="p-4 pt-8">
                    <div className="flex justify-between items-center text-white mb-6">
                        <h1 className="text-xl font-bold">MON PROFIL</h1>
                         <div className="h-6 flex items-center justify-center">
                          {saveStatus === "saving" && <div className="flex items-center text-sm text-white/80"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</div>}
                          {saveStatus === "saved" && <div className="flex items-center text-sm text-white"><CheckCircle className="mr-2 h-4 w-4" />Enregistré!</div>}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <button className="relative cursor-pointer group" onClick={handleImageClick}>
                             <Avatar className="h-20 w-20 border-4 border-white/50">
                                <AvatarImage src={profileImagePreview || user.photoURL || ''} alt={user.fullName} />
                                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-white/80 text-sm">{auth.currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                <Card className="rounded-t-3xl mt-6">
                    <CardContent className="p-4">
                        <Form {...form}>
                            {(Object.keys(fieldConfig) as EditableField[]).filter(key => key !== 'photoURL' && key !== 'biologicalSex').map((key) => (
                                <ProfileRow
                                    key={key}
                                    label={fieldConfig[key].label}
                                    value={renderValue(key)}
                                    icon={fieldConfig[key].icon}
                                    onClick={() => setEditingField(key)}
                                />
                            ))}
                        </Form>
                    </CardContent>
                </Card>
            </div>
            
             <Sheet open={!!editingField} onOpenChange={(isOpen) => !isOpen && setEditingField(null)}>
                <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader>
                        <SheetTitle>Modifier: {editingField && fieldConfig[editingField].label}</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                       <Form {...form}>
                         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                             {editingField && fieldConfig[editingField].type === 'select' && (
                                 <FormField
                                    control={form.control}
                                    name={editingField}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>{fieldConfig[editingField].label}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value as string}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {(fieldConfig[editingField].options as any[]).map(option => (
                                                    <SelectItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                                                        {typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             )}
                             {editingField && (fieldConfig[editingField].type === 'text' || fieldConfig[editingField].type === 'tel' || fieldConfig[editingField].type === 'number') && (
                                <FormField
                                    control={form.control}
                                    name={editingField}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>{fieldConfig[editingField].label}</FormLabel>
                                        <FormControl>
                                            <Input type={fieldConfig[editingField].type} {...field as any} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             )}
                              <Button type="submit" className="w-full" disabled={saveStatus === 'saving'}>
                                {saveStatus === 'saving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer'}
                             </Button>
                         </form>
                       </Form>
                    </div>
                </SheetContent>
            </Sheet>
        </MainLayout>
    );
}

    