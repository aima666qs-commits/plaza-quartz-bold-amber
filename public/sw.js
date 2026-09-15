let lastSabr = null;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/#home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        client.focus();
        client.postMessage({ type: "OPEN", url });
        return;
      }
      return self.clients.openWindow(url);
    }),
  );
});

self.addEventListener("message", (event) => {
  const d = event.data;
  if (d?.type === "SAVE_SABR") {
    lastSabr = { title: d.title, options: d.options };
  }
  if (d?.type === "SABR" && d.title) {
    event.waitUntil(self.registration.showNotification(d.title, d.options || {}));
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "sabr-ayah") return;
  event.waitUntil(
    (async () => {
      if (lastSabr) {
        await self.registration.showNotification(lastSabr.title, lastSabr.options || {});
      }
      const list = await self.clients.matchAll({ type: "window" });
      if (list[0]) list[0].postMessage({ type: "SABR_DUE" });
    })(),
  );
});
