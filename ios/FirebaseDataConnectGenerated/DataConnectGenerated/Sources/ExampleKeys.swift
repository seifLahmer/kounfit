import Foundation

import FirebaseDataConnect



public struct DietaryPreferenceKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension DietaryPreferenceKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension DietaryPreferenceKey : Equatable {
  public static func == (lhs: DietaryPreferenceKey, rhs: DietaryPreferenceKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension DietaryPreferenceKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension DietaryPreferenceKey : Sendable {}



public struct MealDietaryPreferenceKey {
  
  public private(set) var mealId: UUID
  
  public private(set) var dietaryPreferenceId: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  mealId
    
    case  dietaryPreferenceId
    
  }
}

extension MealDietaryPreferenceKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.mealId = try codecHelper.decode(UUID.self, forKey: .mealId, container: &container)
    
    self.dietaryPreferenceId = try codecHelper.decode(UUID.self, forKey: .dietaryPreferenceId, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(mealId, forKey: .mealId, container: &container)
      
      
      
      try codecHelper.encode(dietaryPreferenceId, forKey: .dietaryPreferenceId, container: &container)
      
      
    }
}

extension MealDietaryPreferenceKey : Equatable {
  public static func == (lhs: MealDietaryPreferenceKey, rhs: MealDietaryPreferenceKey) -> Bool {
    
    if lhs.mealId != rhs.mealId {
      return false
    }
    
    if lhs.dietaryPreferenceId != rhs.dietaryPreferenceId {
      return false
    }
    
    return true
  }
}

extension MealDietaryPreferenceKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.mealId)
    
    hasher.combine(self.dietaryPreferenceId)
    
  }
}

extension MealDietaryPreferenceKey : Sendable {}



public struct MealKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension MealKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension MealKey : Equatable {
  public static func == (lhs: MealKey, rhs: MealKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension MealKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension MealKey : Sendable {}



public struct OrderItemKey {
  
  public private(set) var orderId: UUID
  
  public private(set) var mealId: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  orderId
    
    case  mealId
    
  }
}

extension OrderItemKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.orderId = try codecHelper.decode(UUID.self, forKey: .orderId, container: &container)
    
    self.mealId = try codecHelper.decode(UUID.self, forKey: .mealId, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(orderId, forKey: .orderId, container: &container)
      
      
      
      try codecHelper.encode(mealId, forKey: .mealId, container: &container)
      
      
    }
}

extension OrderItemKey : Equatable {
  public static func == (lhs: OrderItemKey, rhs: OrderItemKey) -> Bool {
    
    if lhs.orderId != rhs.orderId {
      return false
    }
    
    if lhs.mealId != rhs.mealId {
      return false
    }
    
    return true
  }
}

extension OrderItemKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.orderId)
    
    hasher.combine(self.mealId)
    
  }
}

extension OrderItemKey : Sendable {}



public struct OrderKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension OrderKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension OrderKey : Equatable {
  public static func == (lhs: OrderKey, rhs: OrderKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension OrderKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension OrderKey : Sendable {}



public struct ReviewKey {
  
  public private(set) var userId: UUID
  
  public private(set) var mealId: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  userId
    
    case  mealId
    
  }
}

extension ReviewKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.userId = try codecHelper.decode(UUID.self, forKey: .userId, container: &container)
    
    self.mealId = try codecHelper.decode(UUID.self, forKey: .mealId, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(userId, forKey: .userId, container: &container)
      
      
      
      try codecHelper.encode(mealId, forKey: .mealId, container: &container)
      
      
    }
}

extension ReviewKey : Equatable {
  public static func == (lhs: ReviewKey, rhs: ReviewKey) -> Bool {
    
    if lhs.userId != rhs.userId {
      return false
    }
    
    if lhs.mealId != rhs.mealId {
      return false
    }
    
    return true
  }
}

extension ReviewKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.userId)
    
    hasher.combine(self.mealId)
    
  }
}

extension ReviewKey : Sendable {}



public struct UserKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension UserKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension UserKey : Equatable {
  public static func == (lhs: UserKey, rhs: UserKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension UserKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension UserKey : Sendable {}


