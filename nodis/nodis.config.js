module.exports = {
    transport: {
        host: '0.0.0.0',    // Listen to all hosts.
        port: 1337
    },
    persistance: {
        dir: __dirname + '/data',
        log: 'data.json.log'
    }
};