/**
 * Minimal ambient type definitions for Expo module bindings during library compilation.
 * Prevents tsc from traversing into raw uncompiled TypeScript sources inside node_modules/expo.
 */
export class NativeModule<TEventsMap extends Record<string, any> = Record<string, any>> {
  [key: string]: any;
}

export function requireNativeModule<T = any>(moduleName: string): T;

export function registerWebModule<T = any>(module: any, moduleName: string): T;
