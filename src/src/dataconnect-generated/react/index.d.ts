import { CreateReviewData, CreateReviewVariables, ListMealsData, UpdateOrderData, UpdateOrderVariables, GetUserOrdersData, GetUserOrdersVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateReview(options?: useDataConnectMutationOptions<CreateReviewData, FirebaseError, CreateReviewVariables>): UseDataConnectMutationResult<CreateReviewData, CreateReviewVariables>;
export function useCreateReview(dc: DataConnect, options?: useDataConnectMutationOptions<CreateReviewData, FirebaseError, CreateReviewVariables>): UseDataConnectMutationResult<CreateReviewData, CreateReviewVariables>;

export function useListMeals(options?: useDataConnectQueryOptions<ListMealsData>): UseDataConnectQueryResult<ListMealsData, undefined>;
export function useListMeals(dc: DataConnect, options?: useDataConnectQueryOptions<ListMealsData>): UseDataConnectQueryResult<ListMealsData, undefined>;

export function useUpdateOrder(options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;
export function useUpdateOrder(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;

export function useGetUserOrders(vars: GetUserOrdersVariables, options?: useDataConnectQueryOptions<GetUserOrdersData>): UseDataConnectQueryResult<GetUserOrdersData, GetUserOrdersVariables>;
export function useGetUserOrders(dc: DataConnect, vars: GetUserOrdersVariables, options?: useDataConnectQueryOptions<GetUserOrdersData>): UseDataConnectQueryResult<GetUserOrdersData, GetUserOrdersVariables>;
