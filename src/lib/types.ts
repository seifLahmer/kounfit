

export type User = {
  uid: string;
  email: string;
  fullName: string;
  photoURL?: string | null;
  age: number;
  biologicalSex: "male" | "female";
  weight: number; // in kg
  height: number; // in cm
  deliveryAddress?: string;
  region?: string;
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
  mainGoal: "lose_weight" | "maintain" | "gain_muscle";
  calorieGoal: number;
  macroRatio: {
    protein: number;
    carbs: number;
    fat: number;
  };
  favoriteMealIds?: string[];
  role: "client" | "caterer" | "admin";
  createdAt?: any;
  updatedAt?: any;
};

export type Component = {
  id?: string;
  name: string;
  pricePer100g: number; // in DT
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  createdBy: string; // admin UID
};

export interface Meal {
  id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  imageUrl?: string;
  imageRef?: string; // Path to the image in Firebase Storage for deletion
  ingredients: {
    name: string;
    grams: number;
  }[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fibers?: number;
  };
  price: number;
  createdBy: string; // caterer UID
  availability: boolean;
  createdAt: any;
}

export type Caterer = {
  uid: string; // This will be the same as their auth UID
  name: string;
  email: string;
  region: string;
  turnover?: number;
};

export type Order = {
  id: string;
  clientId: string;
  clientName: string;
  clientRegion: string;
  items: {
    mealId: string;
    mealName: string;
    quantity: number;
    unitPrice: number;
    catererId: string;
  }[];
  catererIds: string[]; // List of caterer UIDs involved in the order
  totalPrice: number;
  status: "pending" | "in_preparation" | "delivered" | "cancelled";
  orderDate: any;
  deliveryDate: any;
  deliveryTime?: number; // Estimated delivery time in minutes
  deliveryAddress: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  link?: string;
};


export type DailyPlan = {
    breakfast: Meal[];
    lunch: Meal[];
    snack: Meal[];
    dinner: Meal[];
};
