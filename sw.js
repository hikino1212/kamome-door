// かもめのはばたき：通知を受けとる係（Service Worker）
// サーバー（Apps Script）が Firebase Cloud Messaging で送った知らせを受けとり、iPhone に通知を出して、アイコンの数字を変える。
// 成績・写真・名前は受けとらない（タイトル・ひとこと・数字だけ）。
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { var j = e.data ? e.data.json() : {}; d = j.data || j || {}; } catch (x) { d = {}; }
  var title = String(d.title || 'かもめのはばたき').slice(0, 60);
  var body = String(d.body || '').slice(0, 120);
  var n = parseInt(d.badge, 10);
  var jobs = [self.registration.showNotification(title, {
    body: body, icon: 'apple-touch-icon.png', tag: String(d.tag || 'kamome'), data: { link: './' }
  })];
  if (self.navigator && 'setAppBadge' in self.navigator && n >= 0) {
    jobs.push((n > 0 ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge()).catch(function () {}));
  }
  e.waitUntil(Promise.all(jobs));
});

// 通知をタップしたら、かもめのアプリを開く
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow('./');
  }));
});
