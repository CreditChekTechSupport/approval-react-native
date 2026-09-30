import ExpoModulesCore
import UIKit
import approval_ios

public class Approval_react_nativeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Approval_react_native")

    AsyncFunction("startVerification") { (configDict: [String: Any], promise: Promise) in
      guard let publicKey = configDict["publicKey"] as? String,
            !publicKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
        promise.reject("INVALID_CONFIG", "publicKey is required and cannot be blank")
        return
      }

      guard let sessionId = configDict["sessionId"] as? String,
            !sessionId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
        promise.reject("INVALID_CONFIG", "sessionId is required and cannot be blank")
        return
      }

      let envString = (configDict["environment"] as? String ?? "DEVELOPMENT").uppercased()
      let environment: ApprovalEnv = (envString == "PRODUCTION") ? .production : .development

      var userData: AUserData? = nil
      if let userDict = configDict["userData"] as? [String: Any] {
        let firstName = (userDict["firstName"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let lastName = (userDict["lastName"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let bvn = (userDict["bvn"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let nin = (userDict["nin"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let email = (userDict["email"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let dob = ((userDict["dob"] as? String) ?? (userDict["dateOfBirth"] as? String))?.trimmingCharacters(in: .whitespacesAndNewlines)
        let phone = (userDict["phone"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)

        let hasData = !firstName.isEmpty || !lastName.isEmpty || !bvn.isEmpty || !nin.isEmpty ||
          !email.isEmpty || !(dob?.isEmpty ?? true) || !(phone?.isEmpty ?? true)

        if hasData {
          userData = AUserData(
            firstName: firstName,
            lastName: lastName,
            bvn: bvn,
            nin: nin,
            email: email,
            dateOfBirth: dob,
            phone: phone
          )
        }
      }

      let rawModules = configDict["modules"] as? [String] ?? ["IDENTITY"]
      let modules: [ApprovalModule] = rawModules.compactMap { key in
        ApprovalModule(rawValue: key.lowercased())
      }
      let finalModules = modules.isEmpty ? [.identity] : modules

      let config = ApprovalConfig(
        publicKey: publicKey.trimmingCharacters(in: .whitespacesAndNewlines),
        modules: finalModules,
        userData: userData,
        sessionId: sessionId.trimmingCharacters(in: .whitespacesAndNewlines),
        environment: environment
      )

      DispatchQueue.main.async {
        CreditChekApproval.start(config: config) { sessionResult in
          switch sessionResult {
          case .success(let sessionId, let message):
            promise.resolve([
              "status": "success",
              "sessionId": sessionId,
              "message": message
            ])
          case .cancelled:
            promise.resolve([
              "status": "cancelled"
            ])
          case .error(let code, let message):
            promise.resolve([
              "status": "error",
              "code": code,
              "message": message
            ])
          }
        }
      }
    }
  }
}
