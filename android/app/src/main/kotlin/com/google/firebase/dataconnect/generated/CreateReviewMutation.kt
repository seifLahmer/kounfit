
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



public interface CreateReviewMutation :
    com.google.firebase.dataconnect.generated.GeneratedMutation<
      ExampleConnector,
      CreateReviewMutation.Data,
      CreateReviewMutation.Variables
    >
{
  
    @kotlinx.serialization.Serializable
  public data class Variables(
  
    val userId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val mealId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val comment: com.google.firebase.dataconnect.OptionalVariable<String?>,
    val rating: Int
  ) {
    
    
      
      @kotlin.DslMarker public annotation class BuilderDsl

      @BuilderDsl
      public interface Builder {
        public var userId: java.util.UUID
        public var mealId: java.util.UUID
        public var comment: String?
        public var rating: Int
        
      }

      public companion object {
        @Suppress("NAME_SHADOWING")
        public fun build(
          userId: java.util.UUID,mealId: java.util.UUID,rating: Int,
          block_: Builder.() -> Unit
        ): Variables {
          var userId= userId
            var mealId= mealId
            var comment: com.google.firebase.dataconnect.OptionalVariable<String?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var rating= rating
            

          return object : Builder {
            override var userId: java.util.UUID
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { userId = value_ }
              
            override var mealId: java.util.UUID
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { mealId = value_ }
              
            override var comment: String?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { comment = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var rating: Int
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { rating = value_ }
              
            
          }.apply(block_)
          .let {
            Variables(
              userId=userId,mealId=mealId,comment=comment,rating=rating,
            )
          }
        }
      }
    
  }
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    @kotlinx.serialization.SerialName("review_insert") val key: ReviewKey
  ) {
    
    
  }
  

  public companion object {
    public val operationName: String = "CreateReview"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Variables> =
      kotlinx.serialization.serializer()
  }
}

public fun CreateReviewMutation.ref(
  
    userId: java.util.UUID,mealId: java.util.UUID,rating: Int,
  
    block_: CreateReviewMutation.Variables.Builder.() -> Unit = {}
  
): com.google.firebase.dataconnect.MutationRef<
    CreateReviewMutation.Data,
    CreateReviewMutation.Variables
  > =
  ref(
    
      CreateReviewMutation.Variables.build(
        userId=userId,mealId=mealId,rating=rating,
  
    block_
      )
    
  )

public suspend fun CreateReviewMutation.execute(
  
    userId: java.util.UUID,mealId: java.util.UUID,rating: Int,
  
    block_: CreateReviewMutation.Variables.Builder.() -> Unit = {}
  
  ): com.google.firebase.dataconnect.MutationResult<
    CreateReviewMutation.Data,
    CreateReviewMutation.Variables
  > =
  ref(
    
      userId=userId,mealId=mealId,rating=rating,
  
    block_
    
  ).execute()



// The lines below are used by the code generator to ensure that this file is deleted if it is no
// longer needed. Any files in this directory that contain the lines below will be deleted by the
// code generator if the file is no longer needed. If, for some reason, you do _not_ want the code
// generator to delete this file, then remove the line below (and this comment too, if you want).

// FIREBASE_DATA_CONNECT_GENERATED_FILE MARKER 42da5e14-69b3-401b-a9f1-e407bee89a78
// FIREBASE_DATA_CONNECT_GENERATED_FILE CONNECTOR example
