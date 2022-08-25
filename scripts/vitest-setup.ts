Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID() {
            return Math.random().toString(36).substring(2);
        },
    },
    writable: true,
});
