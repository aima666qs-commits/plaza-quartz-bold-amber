package app.mizanx.mizan;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
  static final String HOST = "app.mizanx.mizan";
  static final String ORIGIN = "https://app.mizanx.mizan";

  WebView web;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    if (Build.VERSION.SDK_INT >= 21) {
      Window w = getWindow();
      w.setStatusBarColor(0xFF04100C);
      w.setNavigationBarColor(0xFF04100C);
    }

    web = new WebView(this);
    web.setBackgroundColor(0xFF04100C);
    web.setOverScrollMode(View.OVER_SCROLL_NEVER);
    web.setVerticalScrollBarEnabled(false);
    web.setHorizontalScrollBarEnabled(false);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setAllowFileAccess(true);
    s.setAllowContentAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    s.setSupportZoom(false);
    s.setBuiltInZoomControls(false);
    s.setDisplayZoomControls(false);
    s.setCacheMode(WebSettings.LOAD_DEFAULT);
    s.setUserAgentString(s.getUserAgentString() + " MizanNative/1.0");
    if (Build.VERSION.SDK_INT >= 17) {
      s.setAllowUniversalAccessFromFileURLs(true);
      s.setAllowFileAccessFromFileURLs(true);
    }
    if (Build.VERSION.SDK_INT >= 21) {
      s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }

    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new Client());
    setContentView(web);
    web.loadUrl(ORIGIN + "/");
  }

  @Override
  public void onBackPressed() {
    if (web != null && web.canGoBack()) {
      web.goBack();
    } else {
      super.onBackPressed();
    }
  }

  @Override
  protected void onPause() {
    if (web != null) web.onPause();
    super.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (web != null) web.onResume();
  }

  @Override
  protected void onDestroy() {
    if (web != null) {
      web.loadUrl("about:blank");
      web.destroy();
      web = null;
    }
    super.onDestroy();
  }

  class Client extends WebViewClient {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
      return false;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
      if (request == null || request.getUrl() == null) return null;
      String host = request.getUrl().getHost();
      if (host == null || !HOST.equals(host)) return null;

      String path = request.getUrl().getPath();
      if (path == null || path.length() == 0 || "/".equals(path)) path = "/index.html";
      if (path.indexOf("..") >= 0) return notFound();

      String asset = "www" + path;
      InputStream in = openAsset(asset);
      if (in == null && path.indexOf('.') < 0) {
        in = openAsset("www/index.html");
        path = "/index.html";
      }
      if (in == null) return notFound();

      Map<String, String> headers = new HashMap<String, String>();
      headers.put("Cache-Control", "public, max-age=86400");
      headers.put("Access-Control-Allow-Origin", "*");
      String mime = mimeOf(path);
      if (Build.VERSION.SDK_INT >= 21) {
        return new WebResourceResponse(mime, "utf-8", 200, "OK", headers, in);
      }
      return new WebResourceResponse(mime, "utf-8", in);
    }
  }

  InputStream openAsset(String name) {
    try {
      return getAssets().open(name);
    } catch (Exception e) {
      return null;
    }
  }

  static WebResourceResponse notFound() {
    Map<String, String> headers = new HashMap<String, String>();
    headers.put("Cache-Control", "no-store");
    ByteArrayInputStream empty = new ByteArrayInputStream(new byte[0]);
    if (Build.VERSION.SDK_INT >= 21) {
      return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, empty);
    }
    return new WebResourceResponse("text/plain", "utf-8", empty);
  }

  static String mimeOf(String path) {
    String p = path.toLowerCase();
    if (p.endsWith(".html")) return "text/html";
    if (p.endsWith(".js")) return "application/javascript";
    if (p.endsWith(".css")) return "text/css";
    if (p.endsWith(".json")) return "application/json";
    if (p.endsWith(".svg")) return "image/svg+xml";
    if (p.endsWith(".png")) return "image/png";
    if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
    if (p.endsWith(".webp")) return "image/webp";
    if (p.endsWith(".gif")) return "image/gif";
    if (p.endsWith(".woff2")) return "font/woff2";
    if (p.endsWith(".woff")) return "font/woff";
    if (p.endsWith(".ttf")) return "font/ttf";
    if (p.endsWith(".mp3")) return "audio/mpeg";
    if (p.endsWith(".webmanifest")) return "application/manifest+json";
    if (p.endsWith(".xml")) return "application/xml";
    if (p.endsWith(".txt")) return "text/plain";
    return "application/octet-stream";
  }
}
