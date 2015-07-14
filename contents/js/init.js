function supportsImports() {
  return 'import' in document.createElement('link');
}

if (supportsImports()) {
  // 지원하므로 그대로 진행합니다.
} else {
  // 파일을 로딩하기 위한 다른 라이브러리나 require 시스템들을 사용하세요.
}