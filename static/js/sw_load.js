// Service Worker 등록을 페이지 로드 완료 후로 지연하여 모바일 성능 개선
if ("serviceWorker" in navigator) {
    // 페이지 로드 완료 후 서비스 워커 등록 (초기 렌더링 차단 방지)
    window.addEventListener("load", function() {
        // 추가로 2초 지연하여 중요한 리소스가 먼저 로드되도록 함
        setTimeout(function() {
            navigator.serviceWorker
                .register("/sw.min.js?v=3.12.2",
                          { scope: "/" })
                .then(() => {
                    console.info("SW Loaded");
                }, err => console.error("SW error: ", err));

            navigator.serviceWorker
                .ready
                .then(() => {
                    console.info("SW Ready");
                });
        }, 2000);
    });
}
