import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { expect } from 'vitest';

interface ImageSnapshotOptions {
    name: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toMatchImageSnapshot(opts: ImageSnapshotOptions): Promise<R>;
        }
    }
}

expect.extend({
    async toMatchImageSnapshot(actual: Buffer, opts: ImageSnapshotOptions) {
        const { testPath, snapshotState } = this;
        const { name: filename } = opts;

        if (!Buffer.isBuffer(actual)) {
            throw new Error(`Invalid image buffer`);
        }

        const snapshotDir = path.resolve(testPath!, `../__image-snapshot__`);
        try {
            await fs.stat(snapshotDir);
        } catch {
            await fs.mkdir(snapshotDir, { recursive: true });
        }

        const actualPath = path.resolve(snapshotDir, `./${filename}-actual.png`);
        const expectedPath = path.resolve(snapshotDir, `./${filename}-expected.png`);

        // Always write the actual image to disk
        await fs.writeFile(actualPath, actual);

        // Load expected snapshot if it exists.
        let expected;
        try {
            expected = await fs.readFile(expectedPath);
        } catch {
            expected = null;
        }

        if (expected === null) {
            // If expected file doesn't exists but got a received content and if the snapshots
            // should be updated, create the new snapshot. Otherwise fails the assertion.
            if (
                (snapshotState as any)._updateSnapshot === 'new' ||
                (snapshotState as any)._updateSnapshot === 'all'
            ) {
                snapshotState.updated++;
                fs.writeFile(expectedPath, actual);

                return {
                    pass: true,
                    message: () => '',
                };
            } else {
                snapshotState.unmatched++;

                return {
                    pass: false,
                    message: () =>
                        `Snapshot output for "${expectedPath}" has not been written. The update` +
                        `flag has to be explicitly passed to write new snapshot output.\n` +
                        `This is likely because this test is run in a continuous integration (CI) ` +
                        `environment in which fixtures are not written by default.`,
                };
            }
        } else {
            // If test run with `--update` flag, bypass snapshot testing and update the expected
            // image. Otherwise check if the actual image is the same as the expected image and
            // return appropriate assertion result.
            if ((snapshotState as any)._updateSnapshot === 'all') {
                snapshotState.updated++;
                fs.writeFile(expectedPath, actual);

                return {
                    pass: true,
                    message: () => '',
                };
            } else {
                const pass = Buffer.compare(actual, expected) === 0;
                if (pass) {
                    return {
                        pass,
                        message: () => '',
                    };
                } else {
                    snapshotState.unmatched++;

                    return {
                        pass: Buffer.compare(actual, expected) === 0,
                        message: () => {
                            return (
                                `Received image for "${expectedPath}" doesn't match expected image.\n` +
                                `Actual image was stored at "${actualPath}".`
                            );
                        },
                    };
                }
            }
        }
    },
});
