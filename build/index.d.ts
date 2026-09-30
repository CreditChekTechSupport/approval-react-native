import { ApprovalConfig, SessionResult } from './Approval_react_native.types';
export * from './Approval_react_native.types';
export declare const CreditChekApproval: {
    /**
     * Starts the CreditChek Approval biometric and identity verification flow.
     *
     * @param config - The session configuration including publicKey and sessionId
     * @returns A promise resolving to a SessionResult (success, cancelled, or error)
     */
    start(config: ApprovalConfig): Promise<SessionResult>;
};
export default CreditChekApproval;
//# sourceMappingURL=index.d.ts.map