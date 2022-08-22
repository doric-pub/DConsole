Pod::Spec.new do |s|
    s.name             = 'dConsole'
    s.version          = '0.1.6'
    s.summary          = '一个轻量、针对跨平台框架Doric开发者的调试面板。'
  
    s.homepage         = 'https://github.com/doric-pub/DConsole'
    s.license          = { :type => 'Apache-2.0', :file => 'LICENSE' }
    s.author           = { 'Xcoder1011' => 'shangkunwu@msn.com' }
    s.source           = { :git => 'https://github.com/doric-pub/DConsole', :tag => s.version.to_s }
  
    s.ios.deployment_target = '9.0'
  
    s.source_files = 'iOS/Classes/**/*'
    s.resource     =  "dist/**/*"
    s.public_header_files = 'iOS/Classes/**/*.h'
    s.dependency 'DoricCore'
end
