/**
 * Helper function to generate WGSL shader source code. It strips out the unnecessary indentation
 * and automatically join array values with a line return.
 *
 * Inspired by: https://github.com/tamino-martinius/node-ts-dedent/blob/70e153460de0141afd09ff402b50047103a4c409/src/index.ts
 */
export function wgsl(tmpls: string | TemplateStringsArray, ...values: unknown[]): string {
    // Using Array.from() to make the array mutable. TemplateStringsArray is immutable.
    let strings = Array.from(typeof tmpls === 'string' ? tmpls : tmpls.raw);

    // Remove trailing whitespace.
    strings[strings.length - 1] = strings[strings.length - 1].trimEnd();

    // Calculate minimum indentation length.
    let minIdent: number | null = null;
    for (const str of strings) {
        const matches = str.match(/\n([\t ]+|(?!\s).)/g);
        if (matches) {
            for (const match of matches) {
                const indent = match.match(/[\t ]/g)?.length ?? 0;
                if (minIdent === null || indent < minIdent) {
                    minIdent = indent;
                }
            }
        }
    }

    // Remove common indentation from all the strings.
    if (minIdent !== null) {
        const pattern = new RegExp(`\n[\t ]{${minIdent}}`, 'g');
        strings = strings.map((str) => str.replace(pattern, '\n'));
    }

    // Remove leading whitespace.
    strings[0] = strings[0].trimStart();

    // Perform string interpolation.
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        const currentIdentMatch = result.match(/(?:^|\n)( *)$/);
        const currentIdent = currentIdentMatch ? currentIdentMatch[1] : '';

        let interpolatedValue = Array.isArray(value) ? value.join('\n') : String(value);

        // Reindent the interpolated value if needed.
        if (interpolatedValue.includes('\n')) {
            interpolatedValue = interpolatedValue
                .split('\n')
                .map((line) => `${currentIdent}${line}`)
                .join('\n');
        }

        result += interpolatedValue + strings[i + 1];
    }

    return result.trim();
}
