import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateReviewData {
  review_insert: Review_Key;
}

export interface CreateReviewVariables {
  userId: UUIDString;
  mealId: UUIDString;
  comment?: string | null;
  rating: number;
}

export interface DietaryPreference_Key {
  id: UUIDString;
  __typename?: 'DietaryPreference_Key';
}

export interface GetUserOrdersData {
  orders: ({
    id: UUIDString;
    orderDate: DateString;
    deliveryAddress: string;
    totalAmount: number;
    status: string;
  } & Order_Key)[];
}

export interface GetUserOrdersVariables {
  userId: UUIDString;
}

export interface ListMealsData {
  meals: ({
    id: UUIDString;
    name: string;
    description: string;
    price: number;
    calories: number;
    imageUrl?: string | null;
  } & Meal_Key)[];
}

export interface MealDietaryPreference_Key {
  mealId: UUIDString;
  dietaryPreferenceId: UUIDString;
  __typename?: 'MealDietaryPreference_Key';
}

export interface Meal_Key {
  id: UUIDString;
  __typename?: 'Meal_Key';
}

export interface OrderItem_Key {
  orderId: UUIDString;
  mealId: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Review_Key {
  userId: UUIDString;
  mealId: UUIDString;
  __typename?: 'Review_Key';
}

export interface UpdateOrderData {
  order_update?: Order_Key | null;
}

export interface UpdateOrderVariables {
  id: UUIDString;
  status?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
  operationName: string;
}
export const createReviewRef: CreateReviewRef;

export function createReview(vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;
export function createReview(dc: DataConnect, vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface ListMealsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMealsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMealsData, undefined>;
  operationName: string;
}
export const listMealsRef: ListMealsRef;

export function listMeals(): QueryPromise<ListMealsData, undefined>;
export function listMeals(dc: DataConnect): QueryPromise<ListMealsData, undefined>;

interface UpdateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  operationName: string;
}
export const updateOrderRef: UpdateOrderRef;

export function updateOrder(vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;
export function updateOrder(dc: DataConnect, vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface GetUserOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserOrdersVariables): QueryRef<GetUserOrdersData, GetUserOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserOrdersVariables): QueryRef<GetUserOrdersData, GetUserOrdersVariables>;
  operationName: string;
}
export const getUserOrdersRef: GetUserOrdersRef;

export function getUserOrders(vars: GetUserOrdersVariables): QueryPromise<GetUserOrdersData, GetUserOrdersVariables>;
export function getUserOrders(dc: DataConnect, vars: GetUserOrdersVariables): QueryPromise<GetUserOrdersData, GetUserOrdersVariables>;

