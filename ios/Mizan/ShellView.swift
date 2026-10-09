import SwiftUI
import WebKit

/// Same contract as android/src/app/mizanx/mizan/MainActivity.java:
/// live origin https://mizanx.pro, UA token MizanNative/1.0.
enum MizanShell {
    static let live = URL(string: "https://mizanx.pro")!
    static let chrome = UIColor(red: 4/255, green: 16/255, blue: 12/255, alpha: 1)
    static let userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 MizanNative/1.0"
}

struct ShellView: View {
    var body: some View {
        MizanWebView()
            .ignoresSafeArea()
            .background(Color(MizanShell.chrome))
    }
}

struct MizanWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.customUserAgent = MizanShell.userAgent
        web.isOpaque = false
        web.backgroundColor = MizanShell.chrome
        web.scrollView.backgroundColor = MizanShell.chrome
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.load(URLRequest(url: MizanShell.live))
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            if navigationAction.targetFrame == nil {
                webView.load(URLRequest(url: url))
                decisionHandler(.cancel)
                return
            }
            let host = url.host ?? ""
            if url.scheme == "https" || url.scheme == "http" || host == "mizanx.pro" || host.hasSuffix(".mizanx.pro") {
                decisionHandler(.allow)
            } else if url.scheme == "tel" || url.scheme == "mailto" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.cancel)
            }
        }
    }
}
