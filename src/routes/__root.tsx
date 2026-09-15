import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Мизан — закят, Коран, Хисн, Иткан";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Закят с источниками, Коран Кулиева, Крепость мусульманина, арабский и программа Иткан.",
      },
      { name: "theme-color", content: "#04100c" },
      { name: "color-scheme", content: "dark" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", href: "/quran/mushaf.json", as: "fetch", crossOrigin: "anonymous" },
      { rel: "preload", href: "/hisn/book.json", as: "fetch", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Amiri+Quran&family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500&family=Lateef:wght@400;700&family=Literata:opsz,wght@7..72,400;7..72,600&family=Manrope:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,600&family=Noto+Naskh+Arabic:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;700&family=Reem+Kufi:wght@400;500&family=Scheherazade+New:wght@400;700&display=swap",
      },
      { rel: "stylesheet", href: "/mizan.css" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{margin:0;min-height:100dvh;background:#04100c;color:#f8f4e9;font-family:Georgia,system-ui,sans-serif}img{max-width:100%;height:auto}",
          }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
