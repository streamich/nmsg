module.exports = {
    core: {
        dir: __dirname + '/data',
        data: 'data.json.log',
        error: 'error.json.log',
    },
    cluster: {
        name: 'test',
        me: 'dc1_node1', // Tell this server which node it is.
        nodes: {
            dc1_node1: {
                interface: '0.0.0.0',
                ip: '127.0.0.1',
                port: 1337,
                partition: [[0, 1000]]
            },
            dc2_node1: {
                ip: '127.0.0.1',
                port: 1338,
                partition: [[0, 500]]
            },
            dc2_node2: {
                ip: '127.0.0.1',
                port: 1339,
                partition: [[501, 1000]]
            }
        }
    }
};
