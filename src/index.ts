import Approval_react_nativeModule from './Approval_react_nativeModule';
import {
  ApprovalConfig,
  SessionResult,
} from './Approval_react_native.types';

export * from './Approval_react_native.types';

export const CreditChekApproval = {
  /**
   * Starts the CreditChek Approval biometric and identity verification flow.
   *
   * @param config - The session configuration including publicKey and sessionId
   * @returns A promise resolving to a SessionResult (success, cancelled, or error)
   */
  start(config: ApprovalConfig): Promise<SessionResult> {
    if (!config.publicKey || !config.publicKey.trim()) {
      return Promise.reject(new Error('CreditChekApproval: publicKey is required and cannot be empty.'));
    }
    if (!config.sessionId || !config.sessionId.trim()) {
      return Promise.reject(new Error('CreditChekApproval: sessionId is required and cannot be empty.'));
    }

    // Only pass userData if at least one meaningful field is populated
    let cleanUserData: Record<string, string | undefined> | null = null;
    if (config.userData) {
      const { firstName, lastName, bvn, email, dob, phone } = config.userData;
      const hasData = [firstName, lastName, bvn, email, dob, phone].some(
        val => typeof val === 'string' && val.trim().length > 0
      );
      if (hasData) {
        cleanUserData = {
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
          bvn: bvn?.trim() || undefined,
          email: email?.trim() || undefined,
          dob: dob?.trim() || undefined,
          phone: phone?.trim() || undefined,
        };
      }
    }

    return Approval_react_nativeModule.startVerification({
      publicKey: config.publicKey.trim(),
      sessionId: config.sessionId.trim(),
      environment: config.environment ?? 'DEVELOPMENT',
      modules: config.modules ?? ['IDENTITY'],
      userData: cleanUserData,
    });
  },
};

export default CreditChekApproval;
