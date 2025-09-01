
import Foundation

import FirebaseCore
import FirebaseDataConnect








public extension DataConnect {

  static let exampleConnector: ExampleConnector = {
    let dc = DataConnect.dataConnect(connectorConfig: ExampleConnector.connectorConfig, callerSDKType: .generated)
    return ExampleConnector(dataConnect: dc)
  }()

}

public class ExampleConnector {

  let dataConnect: DataConnect

  public static let connectorConfig = ConnectorConfig(serviceId: "studio", location: "europe-west1", connector: "example")

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect

    // init operations 
    self.createReviewMutation = CreateReviewMutation(dataConnect: dataConnect)
    self.listMealsQuery = ListMealsQuery(dataConnect: dataConnect)
    self.updateOrderMutation = UpdateOrderMutation(dataConnect: dataConnect)
    self.getUserOrdersQuery = GetUserOrdersQuery(dataConnect: dataConnect)
    
  }

  public func useEmulator(host: String = DataConnect.EmulatorDefaults.host, port: Int = DataConnect.EmulatorDefaults.port) {
    self.dataConnect.useEmulator(host: host, port: port)
  }

  // MARK: Operations
public let createReviewMutation: CreateReviewMutation
public let listMealsQuery: ListMealsQuery
public let updateOrderMutation: UpdateOrderMutation
public let getUserOrdersQuery: GetUserOrdersQuery


}
