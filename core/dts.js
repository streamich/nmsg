require('dts-generator').default({
    name: 'nmsg-core',
    project: '.',
    out: 'nmsg-core.d.ts',
    excludes: [
        "node_modules/**/*.d.ts",
        "typings/**/*.d.ts",
        "typings/tsd.d.ts"
    ]
});