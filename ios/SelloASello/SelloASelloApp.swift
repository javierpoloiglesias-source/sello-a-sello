import SwiftUI
import WebKit

@main
struct SelloASelloApp: App {
    var body: some Scene {
        WindowGroup {
            WebApp()
                .ignoresSafeArea(edges: .bottom)
                .background(Color(red: 0.95, green: 0.95, blue: 0.97))
        }
    }
}

/// Muestra la web de Sello a Sello incluida en la app (carpeta «web»).
struct WebApp: UIViewRepresentable {
    func makeCoordinator() -> Coordinador { Coordinador() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true
        if let carpeta = Bundle.main.url(forResource: "web", withExtension: nil) {
            let pagina = carpeta.appendingPathComponent("index.html")
            web.loadFileURL(pagina, allowingReadAccessTo: carpeta)
        }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinador: NSObject, WKNavigationDelegate, WKUIDelegate {
        // Las webs oficiales (BOE, SEPE, Seguridad Social…) se abren en Safari
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = action.request.url, url.scheme == "http" || url.scheme == "https" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        // Enlaces con target="_blank"
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url { UIApplication.shared.open(url) }
            return nil
        }
    }
}
