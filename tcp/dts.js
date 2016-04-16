require('dts-generator').default({
    name: 'nmsg-tcp',
    project: './src',
    out: 'nmsg-tcp.d.ts',
    excludes: [
        "node_modules/**/*.d.ts",
        "typings/**/*.d.ts",
        "typings/tsd.d.ts"
    ]
});
