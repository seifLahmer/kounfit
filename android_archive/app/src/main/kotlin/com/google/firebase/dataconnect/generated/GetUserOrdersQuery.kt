
@file:kotlin.Suppress(
  "KotlinRedundantDiagnosticSuppress",
  "LocalVariableName",
  "MayBeConstant",
  "RedundantVisibilityModifier",
  "RemoveEmptyClassBody",
  "SpellCheckingInspection",
  "LocalVariableName",
  "unused",
)

package com.google.firebase.dataconnect.generated


import kotlinx.coroutines.flow.filterNotNull as _flow_filterNotNull
import kotlinx.coroutines.flow.map as _flow_map


public interface GetUserOrdersQuery :
    com.google.firebase.dataconnect.generated.GeneratedQuery<
      ExampleConnector,
      GetUserOrdersQuery.Data,
      GetUserOrdersQuery.Variables
    >
{
  
    @kotlinx.serialization.Serializable
  public data class Variables(
  
    val userId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID
  ) {
    
    
  }
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val orders: List<OrdersItem>
  ) {
    
      
        @kotlinx.serialization.Serializable
  public data class OrdersItem(
  
    val id: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val orderDate: com.google.firebase.dataconnect.LocalDate,
    val deliveryAddress: String,
    val totalAmount: Double,
    val status: String
  ) {
    
    
  }
      
    
    
  }
  

  public companion object {
    public val operationName: String = "GetUserOrders"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Variables> =
      kotlinx.serialization.serializer()
  }
}

public fun GetUserOrdersQuery.ref(
  
    userId: java.util.UUID,
  
  
): com.google.firebase.dataconnect.QueryRef<
    GetUserOrdersQuery.Data,
    GetUserOrdersQuery.Variables
  > =
  ref(
    
      GetUserOrdersQuery.Variables(
        userId=userId,
  
      )
    
  )

public suspend fun GetUserOrdersQuery.execute(
  
    userId: java.util.UUID,
  
  
  ): com.google.firebase.dataconnect.QueryResult<
    GetUserOrdersQuery.Data,
    GetUserOrdersQuery.Variables
  > =
  ref(
    
      userId=userId,
  
    
  ).execute()


  public fun GetUserOrdersQuery.flow(
    
      userId: java.util.UUID,
  
    
    ): kotlinx.coroutines.flow.Flow<GetUserOrdersQuery.Data> =
    ref(
        
          userId=userId,
  
        
      ).subscribe()
      .flow
      ._flow_map { querySubscriptionResult -> querySubscriptionResult.result.getOrNull() }
      ._flow_filterNotNull()
      ._flow_map { it.data }


// The lines below are used by the code generator to ensure that this file is deleted if it is no
// longer needed. Any files in this directory that contain the lines below will be deleted by the
// code generator if the file is no longer needed. If, for some reason, you do _not_ want the code
// generator to delete this file, then remove the line below (and this comment too, if you want).

// FIREBASE_DATA_CONNECT_GENERATED_FILE MARKER 42da5e14-69b3-401b-a9f1-e407bee89a78
// FIREBASE_DATA_CONNECT_GENERATED_FILE CONNECTOR example
