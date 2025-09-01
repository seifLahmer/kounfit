This Swift package contains the generated Swift code for the connector `example`.

You can use this package by adding it as a local Swift package dependency in your project.

# Accessing the connector

Add the necessary imports

```
import FirebaseDataConnect
import DataConnectGenerated

```

The connector can be accessed using the following code:

```
let connector = DataConnect.exampleConnector

```


## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code, which can be called from the `init` function of your SwiftUI app

```
connector.useEmulator()
```

# Queries

## ListMealsQuery


### Using the Query Reference
```
struct MyView: View {
   var listMealsQueryRef = DataConnect.exampleConnector.listMealsQuery.ref(...)

  var body: some View {
    VStack {
      if let data = listMealsQueryRef.data {
        // use data in View
      }
      else {
        Text("Loading...")
      }
    }
    .task {
        do {
          let _ = try await listMealsQueryRef.execute()
        } catch {
        }
      }
  }
}
```

### One-shot execute
```
DataConnect.exampleConnector.listMealsQuery.execute(...)
```


## GetUserOrdersQuery
### Variables
#### Required
```swift

let userId: UUID = ...
```




### Using the Query Reference
```
struct MyView: View {
   var getUserOrdersQueryRef = DataConnect.exampleConnector.getUserOrdersQuery.ref(...)

  var body: some View {
    VStack {
      if let data = getUserOrdersQueryRef.data {
        // use data in View
      }
      else {
        Text("Loading...")
      }
    }
    .task {
        do {
          let _ = try await getUserOrdersQueryRef.execute()
        } catch {
        }
      }
  }
}
```

### One-shot execute
```
DataConnect.exampleConnector.getUserOrdersQuery.execute(...)
```


# Mutations
## CreateReviewMutation

### Variables

#### Required
```swift

let userId: UUID = ...
let mealId: UUID = ...
let rating: Int = ...
```
 

#### Optional
```swift

let comment: String = ...
```

### One-shot execute
```
DataConnect.exampleConnector.createReviewMutation.execute(...)
```

## UpdateOrderMutation

### Variables

#### Required
```swift

let id: UUID = ...
```
 

#### Optional
```swift

let status: String = ...
```

### One-shot execute
```
DataConnect.exampleConnector.updateOrderMutation.execute(...)
```

