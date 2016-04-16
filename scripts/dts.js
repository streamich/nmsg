require('dts-generator').default({
    name: 'nmsg',
    // main: 'nmsg',
    project: './src',
    out: 'nmsg.d.ts',
    excludes: [
        "node_modules/**/*.d.ts",
        "typings/**/*.d.ts",
        "typings/tsd.d.ts"
    ]
});