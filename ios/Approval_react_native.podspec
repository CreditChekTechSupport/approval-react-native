Pod::Spec.new do |s|
  s.name           = 'Approval_react_native'
  s.version        = '0.1.0'
  s.summary        = 'CreditChek Approval React Native Module'
  s.description    = 'Official CreditChek Approval React Native & Expo module for biometric verification'
  s.author         = 'CreditChek'
  s.homepage       = 'https://creditchek.africa'
  s.platforms      = {
    :ios => '15.0'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.vendored_frameworks = 'Frameworks/approval_ios.xcframework'
  s.frameworks = 'UIKit', 'AVFoundation', 'Vision', 'CoreML', 'Combine', 'SwiftUI'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386',
    'OTHER_LDFLAGS' => '$(inherited) -framework approval_ios'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
