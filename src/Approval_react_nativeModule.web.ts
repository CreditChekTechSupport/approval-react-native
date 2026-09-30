import { registerWebModule, NativeModule } from 'expo';
import { SessionResult } from './Approval_react_native.types';

class Approval_react_nativeModule extends NativeModule<{}> {
  async startVerification(_config: Record<string, any>): Promise<SessionResult> {
    throw new Error('CreditChek Approval verification is only supported on native Android and iOS devices.');
  }
}

export default registerWebModule(Approval_react_nativeModule, 'Approval_react_native');
