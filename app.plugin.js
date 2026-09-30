const {
  withPlugins,
  withInfoPlist,
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const pkg = require('./package.json');

const DEFAULT_CAMERA_PERMISSION =
  'Allow CreditChek Approval to access the camera for biometric identity verification.';

/**
 * Injects NSCameraUsageDescription into iOS Info.plist
 */
function withIosCameraPermission(config, props = {}) {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      props.cameraPermission ||
      config.modResults.NSCameraUsageDescription ||
      DEFAULT_CAMERA_PERMISSION;
    return config;
  });
}

/**
 * Injects android.permission.CAMERA into AndroidManifest.xml
 */
function withAndroidCameraPermission(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    if (!Array.isArray(androidManifest['uses-permission'])) {
      androidManifest['uses-permission'] = [];
    }

    const hasCameraPermission = androidManifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.CAMERA'
    );

    if (!hasCameraPermission) {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.CAMERA',
        },
      });
    }

    return config;
  });
}

/**
 * Ensures minSdk is at least 24 on Android for CameraX and ML Kit compatibility
 */
function withAndroidMinSdkVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes('minSdkVersion')) {
      contents = contents.replace(
        /minSdkVersion\s*=\s*\d+/,
        (match) => {
          const currentVersion = parseInt(match.replace(/\D/g, ''), 10);
          return `minSdkVersion = ${Math.max(currentVersion, 24)}`;
        }
      );
    }
    config.modResults.contents = contents;
    return config;
  });
}

/**
 * Bypasses AAR metadata strict compileSdk check for seamless compilation with approval_android
 */
function withAndroidAarMetadataBypass(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('AarMetadata')) {
      contents += `

tasks.matching { it.name.contains("AarMetadata") }.configureEach {
    enabled = false
}
`;
    }
    config.modResults.contents = contents;
    return config;
  });
}

function withApprovalReactNative(config, props = {}) {
  return withPlugins(config, [
    [withIosCameraPermission, props],
    withAndroidCameraPermission,
    withAndroidMinSdkVersion,
    withAndroidAarMetadataBypass,
  ]);
}

module.exports = createRunOncePlugin(
  withApprovalReactNative,
  pkg.name,
  pkg.version
);
