import Foundation

import FirebaseCore
import FirebaseDataConnect




















// MARK: Common Enums

public enum OrderDirection: String, Codable, Sendable {
  case ASC = "ASC"
  case DESC = "DESC"
  }

public enum SearchQueryFormat: String, Codable, Sendable {
  case QUERY = "QUERY"
  case PLAIN = "PLAIN"
  case PHRASE = "PHRASE"
  case ADVANCED = "ADVANCED"
  }


// MARK: Connector Enums

// End enum definitions









public class CreateReviewMutation{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "CreateReview"

  public typealias Ref = MutationRef<CreateReviewMutation.Data,CreateReviewMutation.Variables>

  public struct Variables: OperationVariable {
  
        
        public var
userId: UUID

  
        
        public var
mealId: UUID

  
        @OptionalVariable
        public var
comment: String?

  
        
        public var
rating: Int


    
    
    
    public init (
        
userId: UUID
,
        
mealId: UUID
,
        
rating: Int

        
        
        ,
        _ optionalVars: ((inout Variables)->())? = nil
        ) {
        self.userId = userId
        self.mealId = mealId
        self.rating = rating
        

        
        if let optionalVars {
            optionalVars(&self)
        }
        
    }

    public static func == (lhs: Variables, rhs: Variables) -> Bool {
      
        return lhs.userId == rhs.userId && 
              lhs.mealId == rhs.mealId && 
              lhs.comment == rhs.comment && 
              lhs.rating == rhs.rating
              
    }

    
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(userId)
  
  hasher.combine(mealId)
  
  hasher.combine(comment)
  
  hasher.combine(rating)
  
}

    enum CodingKeys: String, CodingKey {
      
      case userId
      
      case mealId
      
      case comment
      
      case rating
      
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(userId, forKey: .userId, container: &container)
      
      
      
      try codecHelper.encode(mealId, forKey: .mealId, container: &container)
      
      
      if $comment.isSet { 
      try codecHelper.encode(comment, forKey: .comment, container: &container)
      }
      
      
      try codecHelper.encode(rating, forKey: .rating, container: &container)
      
      
    }

  }

  public struct Data: Decodable, Sendable {



public var 
review_insert: ReviewKey

  }

  public func ref(
        
userId: UUID
,
mealId: UUID
,
rating: Int

        
        ,
        _ optionalVars: ((inout CreateReviewMutation.Variables)->())? = nil
        ) -> MutationRef<CreateReviewMutation.Data,CreateReviewMutation.Variables>  {
        var variables = CreateReviewMutation.Variables(userId:userId,mealId:mealId,rating:rating)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        

        let ref = dataConnect.mutation(name: "CreateReview", variables: variables, resultsDataType:CreateReviewMutation.Data.self)
        return ref as MutationRef<CreateReviewMutation.Data,CreateReviewMutation.Variables>
   }

  @MainActor
   public func execute(
        
userId: UUID
,
mealId: UUID
,
rating: Int

        
        ,
        _ optionalVars: (@MainActor (inout CreateReviewMutation.Variables)->())? = nil
        ) async throws -> OperationResult<CreateReviewMutation.Data> {
        var variables = CreateReviewMutation.Variables(userId:userId,mealId:mealId,rating:rating)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        
        
        let ref = dataConnect.mutation(name: "CreateReview", variables: variables, resultsDataType:CreateReviewMutation.Data.self)
        
        return try await ref.execute()
        
   }
}






public class ListMealsQuery{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "ListMeals"

  public typealias Ref = QueryRefObservation<ListMealsQuery.Data,ListMealsQuery.Variables>

  public struct Variables: OperationVariable {

    
    
  }

  public struct Data: Decodable, Sendable {




public struct Meal: Decodable, Sendable ,Hashable, Equatable, Identifiable {
  


public var 
id: UUID



public var 
name: String



public var 
description: String



public var 
price: Double



public var 
calories: Int



public var 
imageUrl: String?


  
  public var mealKey: MealKey {
    return MealKey(
      
      id: id
    )
  }

  
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(id)
  
}
public static func == (lhs: Meal, rhs: Meal) -> Bool {
    
    return lhs.id == rhs.id 
        
  }

  

  
  enum CodingKeys: String, CodingKey {
    
    case id
    
    case name
    
    case description
    
    case price
    
    case calories
    
    case imageUrl
    
  }

  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
    
    
    self.name = try codecHelper.decode(String.self, forKey: .name, container: &container)
    
    
    
    self.description = try codecHelper.decode(String.self, forKey: .description, container: &container)
    
    
    
    self.price = try codecHelper.decode(Double.self, forKey: .price, container: &container)
    
    
    
    self.calories = try codecHelper.decode(Int.self, forKey: .calories, container: &container)
    
    
    
    self.imageUrl = try codecHelper.decode(String?.self, forKey: .imageUrl, container: &container)
    
    
  }
}
public var 
meals: [Meal]

  }

  public func ref(
        
        ) -> QueryRefObservation<ListMealsQuery.Data,ListMealsQuery.Variables>  {
        var variables = ListMealsQuery.Variables()
        

        let ref = dataConnect.query(name: "ListMeals", variables: variables, resultsDataType:ListMealsQuery.Data.self, publisher: .observableMacro)
        return ref as! QueryRefObservation<ListMealsQuery.Data,ListMealsQuery.Variables>
   }

  @MainActor
   public func execute(
        
        ) async throws -> OperationResult<ListMealsQuery.Data> {
        var variables = ListMealsQuery.Variables()
        
        
        let ref = dataConnect.query(name: "ListMeals", variables: variables, resultsDataType:ListMealsQuery.Data.self, publisher: .observableMacro)
        
        let refCast = ref as! QueryRefObservation<ListMealsQuery.Data,ListMealsQuery.Variables>
        return try await refCast.execute()
        
   }
}






public class UpdateOrderMutation{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "UpdateOrder"

  public typealias Ref = MutationRef<UpdateOrderMutation.Data,UpdateOrderMutation.Variables>

  public struct Variables: OperationVariable {
  
        
        public var
id: UUID

  
        @OptionalVariable
        public var
status: String?


    
    
    
    public init (
        
id: UUID

        
        
        ,
        _ optionalVars: ((inout Variables)->())? = nil
        ) {
        self.id = id
        

        
        if let optionalVars {
            optionalVars(&self)
        }
        
    }

    public static func == (lhs: Variables, rhs: Variables) -> Bool {
      
        return lhs.id == rhs.id && 
              lhs.status == rhs.status
              
    }

    
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(id)
  
  hasher.combine(status)
  
}

    enum CodingKeys: String, CodingKey {
      
      case id
      
      case status
      
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
      if $status.isSet { 
      try codecHelper.encode(status, forKey: .status, container: &container)
      }
      
    }

  }

  public struct Data: Decodable, Sendable {



public var 
order_update: OrderKey?

  }

  public func ref(
        
id: UUID

        
        ,
        _ optionalVars: ((inout UpdateOrderMutation.Variables)->())? = nil
        ) -> MutationRef<UpdateOrderMutation.Data,UpdateOrderMutation.Variables>  {
        var variables = UpdateOrderMutation.Variables(id:id)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        

        let ref = dataConnect.mutation(name: "UpdateOrder", variables: variables, resultsDataType:UpdateOrderMutation.Data.self)
        return ref as MutationRef<UpdateOrderMutation.Data,UpdateOrderMutation.Variables>
   }

  @MainActor
   public func execute(
        
id: UUID

        
        ,
        _ optionalVars: (@MainActor (inout UpdateOrderMutation.Variables)->())? = nil
        ) async throws -> OperationResult<UpdateOrderMutation.Data> {
        var variables = UpdateOrderMutation.Variables(id:id)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        
        
        let ref = dataConnect.mutation(name: "UpdateOrder", variables: variables, resultsDataType:UpdateOrderMutation.Data.self)
        
        return try await ref.execute()
        
   }
}






public class GetUserOrdersQuery{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "GetUserOrders"

  public typealias Ref = QueryRefObservation<GetUserOrdersQuery.Data,GetUserOrdersQuery.Variables>

  public struct Variables: OperationVariable {
  
        
        public var
userId: UUID


    
    
    
    public init (
        
userId: UUID

        
        ) {
        self.userId = userId
        

        
    }

    public static func == (lhs: Variables, rhs: Variables) -> Bool {
      
        return lhs.userId == rhs.userId
              
    }

    
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(userId)
  
}

    enum CodingKeys: String, CodingKey {
      
      case userId
      
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(userId, forKey: .userId, container: &container)
      
      
    }

  }

  public struct Data: Decodable, Sendable {




public struct Order: Decodable, Sendable ,Hashable, Equatable, Identifiable {
  


public var 
id: UUID



public var 
orderDate: LocalDate



public var 
deliveryAddress: String



public var 
totalAmount: Double



public var 
status: String


  
  public var orderKey: OrderKey {
    return OrderKey(
      
      id: id
    )
  }

  
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(id)
  
}
public static func == (lhs: Order, rhs: Order) -> Bool {
    
    return lhs.id == rhs.id 
        
  }

  

  
  enum CodingKeys: String, CodingKey {
    
    case id
    
    case orderDate
    
    case deliveryAddress
    
    case totalAmount
    
    case status
    
  }

  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
    
    
    self.orderDate = try codecHelper.decode(LocalDate.self, forKey: .orderDate, container: &container)
    
    
    
    self.deliveryAddress = try codecHelper.decode(String.self, forKey: .deliveryAddress, container: &container)
    
    
    
    self.totalAmount = try codecHelper.decode(Double.self, forKey: .totalAmount, container: &container)
    
    
    
    self.status = try codecHelper.decode(String.self, forKey: .status, container: &container)
    
    
  }
}
public var 
orders: [Order]

  }

  public func ref(
        
userId: UUID

        ) -> QueryRefObservation<GetUserOrdersQuery.Data,GetUserOrdersQuery.Variables>  {
        var variables = GetUserOrdersQuery.Variables(userId:userId)
        

        let ref = dataConnect.query(name: "GetUserOrders", variables: variables, resultsDataType:GetUserOrdersQuery.Data.self, publisher: .observableMacro)
        return ref as! QueryRefObservation<GetUserOrdersQuery.Data,GetUserOrdersQuery.Variables>
   }

  @MainActor
   public func execute(
        
userId: UUID

        ) async throws -> OperationResult<GetUserOrdersQuery.Data> {
        var variables = GetUserOrdersQuery.Variables(userId:userId)
        
        
        let ref = dataConnect.query(name: "GetUserOrders", variables: variables, resultsDataType:GetUserOrdersQuery.Data.self, publisher: .observableMacro)
        
        let refCast = ref as! QueryRefObservation<GetUserOrdersQuery.Data,GetUserOrdersQuery.Variables>
        return try await refCast.execute()
        
   }
}


