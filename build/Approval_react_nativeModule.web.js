import { registerWebModule, NativeModule } from 'expo';
class Approval_react_nativeModule extends NativeModule {
    async startVerification(_config) {
        throw new Error('CreditChek Approval verification is only supported on native Android and iOS devices.');
    }
}
export default registerWebModule(Approval_react_nativeModule, 'Approval_react_native');
//# sourceMappingURL=Approval_react_nativeModule.web.js.map