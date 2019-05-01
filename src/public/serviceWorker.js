self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/bills',
                '/budgets',
                '/piggy',
                '/accounts',
                '/transactions',
            ]);
        })
    );
});

self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Got push: ', data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'http://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png'
    });
});