package expo.modules.approval_react_native

import com.creditchek.approval_android.CreditChekApproval
import com.creditchek.approval_android.core.session.ApprovalConfig
import com.creditchek.approval_android.core.session.ApprovalEnv
import com.creditchek.approval_android.core.session.ApprovalModule
import com.creditchek.approval_android.core.session.AUserData
import com.creditchek.approval_android.core.session.SessionResult
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class Approval_react_nativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Approval_react_native")

    AsyncFunction("startVerification") { configMap: Map<String, Any?>, promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) {
        promise.reject("NO_ACTIVITY", "Cannot launch verification flow: Activity is null or in background", null)
        return@AsyncFunction
      }

      val publicKey = configMap["publicKey"] as? String ?: ""
      if (publicKey.isBlank()) {
        promise.reject("INVALID_CONFIG", "publicKey is required and cannot be blank", null)
        return@AsyncFunction
      }

      val sessionId = configMap["sessionId"] as? String ?: ""
      if (sessionId.isBlank()) {
        promise.reject("INVALID_CONFIG", "sessionId is required and cannot be blank", null)
        return@AsyncFunction
      }

      val envString = (configMap["environment"] as? String) ?: "DEVELOPMENT"
      val environment = if (envString.equals("PRODUCTION", ignoreCase = true)) {
        ApprovalEnv.PRODUCTION
      } else {
        ApprovalEnv.DEVELOPMENT
      }

      val userMap = configMap["userData"] as? Map<String, Any?>
      val userData = if (userMap != null) {
        val firstName = (userMap["firstName"] as? String)?.trim() ?: ""
        val lastName = (userMap["lastName"] as? String)?.trim() ?: ""
        val bvn = (userMap["bvn"] as? String)?.trim() ?: ""
        val email = (userMap["email"] as? String)?.trim() ?: ""
        val dob = ((userMap["dob"] as? String) ?: (userMap["dateOfBirth"] as? String))?.trim()
        val phone = (userMap["phone"] as? String)?.trim()

        val hasMeaningfulData = firstName.isNotEmpty() || lastName.isNotEmpty() ||
          bvn.isNotEmpty() || email.isNotEmpty() || !dob.isNullOrEmpty() || !phone.isNullOrEmpty()

        if (hasMeaningfulData) {
          AUserData(
            firstName = firstName,
            lastName = lastName,
            bvn = bvn,
            email = email,
            dob = dob,
            phone = phone
          )
        } else null
      } else null

      val rawModules = configMap["modules"] as? List<String> ?: listOf("IDENTITY")
      val modules = rawModules.mapNotNull { name ->
        try {
          ApprovalModule.valueOf(name.uppercase())
        } catch (e: Exception) {
          null
        }
      }.ifEmpty { listOf(ApprovalModule.IDENTITY) }

      val config = ApprovalConfig(
        publicKey = publicKey,
        modules = modules,
        userData = userData,
        sessionId = sessionId,
        environment = environment
      )

      CreditChekApproval.start(
        context = activity,
        config = config
      ) { sessionResult ->
        when (sessionResult) {
          is SessionResult.Success -> {
            promise.resolve(
              mapOf(
                "status" to "success",
                "sessionId" to sessionResult.sessionId,
                "message" to sessionResult.message
              )
            )
          }
          is SessionResult.Cancelled -> {
            promise.resolve(
              mapOf(
                "status" to "cancelled"
              )
            )
          }
          is SessionResult.Error -> {
            promise.resolve(
              mapOf(
                "status" to "error",
                "code" to sessionResult.code,
                "message" to sessionResult.message
              )
            )
          }
        }
      }
    }
  }
}
