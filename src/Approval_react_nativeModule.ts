import { NativeModule, requireNativeModule } from 'expo';
import { SessionResult } from './Approval_react_native.types';

declare class Approval_react_nativeModule extends NativeModule<{}> {
  startVerification(config: Record<string, any>): Promise<SessionResult>;
}

export default requireNativeModule<Approval_react_nativeModule>('Approval_react_native');
