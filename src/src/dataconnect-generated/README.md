# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMeals*](#listmeals)
  - [*GetUserOrders*](#getuserorders)
- [**Mutations**](#mutations)
  - [*CreateReview*](#createreview)
  - [*UpdateOrder*](#updateorder)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMeals
You can execute the `ListMeals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMeals(): QueryPromise<ListMealsData, undefined>;

interface ListMealsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMealsData, undefined>;
}
export const listMealsRef: ListMealsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMeals(dc: DataConnect): QueryPromise<ListMealsData, undefined>;

interface ListMealsRef {
  ...
  (dc: DataConnect): QueryRef<ListMealsData, undefined>;
}
export const listMealsRef: ListMealsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMealsRef:
```typescript
const name = listMealsRef.operationName;
console.log(name);
```

### Variables
The `ListMeals` query has no variables.
### Return Type
Recall that executing the `ListMeals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMealsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMeals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMeals } from '@dataconnect/generated';


// Call the `listMeals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMeals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMeals(dataConnect);

console.log(data.meals);

// Or, you can use the `Promise` API.
listMeals().then((response) => {
  const data = response.data;
  console.log(data.meals);
});
```

### Using `ListMeals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMealsRef } from '@dataconnect/generated';


// Call the `listMealsRef()` function to get a reference to the query.
const ref = listMealsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMealsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.meals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.meals);
});
```

## GetUserOrders
You can execute the `GetUserOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserOrders(vars: GetUserOrdersVariables): QueryPromise<GetUserOrdersData, GetUserOrdersVariables>;

interface GetUserOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserOrdersVariables): QueryRef<GetUserOrdersData, GetUserOrdersVariables>;
}
export const getUserOrdersRef: GetUserOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserOrders(dc: DataConnect, vars: GetUserOrdersVariables): QueryPromise<GetUserOrdersData, GetUserOrdersVariables>;

interface GetUserOrdersRef {
  ...
  (dc: DataConnect, vars: GetUserOrdersVariables): QueryRef<GetUserOrdersData, GetUserOrdersVariables>;
}
export const getUserOrdersRef: GetUserOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserOrdersRef:
```typescript
const name = getUserOrdersRef.operationName;
console.log(name);
```

### Variables
The `GetUserOrders` query requires an argument of type `GetUserOrdersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserOrdersVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserOrdersData {
  orders: ({
    id: UUIDString;
    orderDate: DateString;
    deliveryAddress: string;
    totalAmount: number;
    status: string;
  } & Order_Key)[];
}
```
### Using `GetUserOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserOrders, GetUserOrdersVariables } from '@dataconnect/generated';

// The `GetUserOrders` query requires an argument of type `GetUserOrdersVariables`:
const getUserOrdersVars: GetUserOrdersVariables = {
  userId: ..., 
};

// Call the `getUserOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserOrders(getUserOrdersVars);
// Variables can be defined inline as well.
const { data } = await getUserOrders({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserOrders(dataConnect, getUserOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
getUserOrders(getUserOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `GetUserOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserOrdersRef, GetUserOrdersVariables } from '@dataconnect/generated';

// The `GetUserOrders` query requires an argument of type `GetUserOrdersVariables`:
const getUserOrdersVars: GetUserOrdersVariables = {
  userId: ..., 
};

// Call the `getUserOrdersRef()` function to get a reference to the query.
const ref = getUserOrdersRef(getUserOrdersVars);
// Variables can be defined inline as well.
const ref = getUserOrdersRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserOrdersRef(dataConnect, getUserOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateReview
You can execute the `CreateReview` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createReview(vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface CreateReviewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
}
export const createReviewRef: CreateReviewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createReview(dc: DataConnect, vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface CreateReviewRef {
  ...
  (dc: DataConnect, vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
}
export const createReviewRef: CreateReviewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createReviewRef:
```typescript
const name = createReviewRef.operationName;
console.log(name);
```

### Variables
The `CreateReview` mutation requires an argument of type `CreateReviewVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateReviewVariables {
  userId: UUIDString;
  mealId: UUIDString;
  comment?: string | null;
  rating: number;
}
```
### Return Type
Recall that executing the `CreateReview` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateReviewData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateReviewData {
  review_insert: Review_Key;
}
```
### Using `CreateReview`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createReview, CreateReviewVariables } from '@dataconnect/generated';

// The `CreateReview` mutation requires an argument of type `CreateReviewVariables`:
const createReviewVars: CreateReviewVariables = {
  userId: ..., 
  mealId: ..., 
  comment: ..., // optional
  rating: ..., 
};

// Call the `createReview()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createReview(createReviewVars);
// Variables can be defined inline as well.
const { data } = await createReview({ userId: ..., mealId: ..., comment: ..., rating: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createReview(dataConnect, createReviewVars);

console.log(data.review_insert);

// Or, you can use the `Promise` API.
createReview(createReviewVars).then((response) => {
  const data = response.data;
  console.log(data.review_insert);
});
```

### Using `CreateReview`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createReviewRef, CreateReviewVariables } from '@dataconnect/generated';

// The `CreateReview` mutation requires an argument of type `CreateReviewVariables`:
const createReviewVars: CreateReviewVariables = {
  userId: ..., 
  mealId: ..., 
  comment: ..., // optional
  rating: ..., 
};

// Call the `createReviewRef()` function to get a reference to the mutation.
const ref = createReviewRef(createReviewVars);
// Variables can be defined inline as well.
const ref = createReviewRef({ userId: ..., mealId: ..., comment: ..., rating: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createReviewRef(dataConnect, createReviewVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.review_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.review_insert);
});
```

## UpdateOrder
You can execute the `UpdateOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateOrder(vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface UpdateOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
}
export const updateOrderRef: UpdateOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateOrder(dc: DataConnect, vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface UpdateOrderRef {
  ...
  (dc: DataConnect, vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
}
export const updateOrderRef: UpdateOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateOrderRef:
```typescript
const name = updateOrderRef.operationName;
console.log(name);
```

### Variables
The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateOrderVariables {
  id: UUIDString;
  status?: string | null;
}
```
### Return Type
Recall that executing the `UpdateOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateOrderData {
  order_update?: Order_Key | null;
}
```
### Using `UpdateOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateOrder, UpdateOrderVariables } from '@dataconnect/generated';

// The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`:
const updateOrderVars: UpdateOrderVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateOrder(updateOrderVars);
// Variables can be defined inline as well.
const { data } = await updateOrder({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateOrder(dataConnect, updateOrderVars);

console.log(data.order_update);

// Or, you can use the `Promise` API.
updateOrder(updateOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

### Using `UpdateOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateOrderRef, UpdateOrderVariables } from '@dataconnect/generated';

// The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`:
const updateOrderVars: UpdateOrderVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateOrderRef()` function to get a reference to the mutation.
const ref = updateOrderRef(updateOrderVars);
// Variables can be defined inline as well.
const ref = updateOrderRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateOrderRef(dataConnect, updateOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

