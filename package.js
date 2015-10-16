Package.describe({
    name: 'gerbrand:eth-events',
    version: '0.0.1',
    summary: 'Ethereum server-side event handlign in Meteor',
    git: 'https://github.com/gerbrand/eth-events',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');

    api.use(['mongo', 'aldeed:simple-schema']);
    api.use('ethereum:web3', 'server');

    api.addFiles('eth-events.js', 'server');
    api.export('web3', 'server');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('gerbrand:eth-events');
});
