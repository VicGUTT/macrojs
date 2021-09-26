import fs from 'fs';
import path from 'path';
import jsdoc2md from 'jsdoc-to-markdown';
import { exec } from 'child_process';
import { defineConfig } from 'vite';

const lib = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const libName = lib.name.split('/')[1] ?? lib.name;
const year = new Date().getFullYear();

export default defineConfig({
    build: {
        /**
         * @see https://vitejs.dev/config/#build-target
         */
        target: `es${year - 2 < 2021 ? 2021 : year - 2}`,

        /**
         * @see https://vitejs.dev/config/#build-chunksizewarninglimit
         */
        chunkSizeWarningLimit: 10, // 10 kbs

        // manifest: true,
        // minify: false,

        /**
         * @see https://vitejs.dev/config/#build-rollupoptions
         * @see https://rollupjs.org/guide/en/#big-list-of-options
         */
        rollupOptions: {
            input: './src/index.ts',
        },

        /**
         * @see https://vitejs.dev/config/#build-lib
         * @see https://vitejs.dev/guide/build.html#library-mode
         */
        lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            name: libName
                .split('-')
                .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
                .join(''),
            fileName: (format) => `${libName}.${format}.js`,
        },
    },
    plugins: [
        {
            name: 'after-bundling-actions',
            closeBundle: async () => {
                await compileAllTsFiles();
                await generateReadme();
                // await removeAllJsFiles();

                consoleMessage('All done!');
            },
        },
    ],
});

/* Actions
------------------------------------------------*/

async function compileAllTsFiles() {
    consoleMessage('Running `tsc`...');

    await execAsync('tsc', () => null);
}

// async function removeAllJsFiles() {
//     consoleMessage('Removing TS generated JS files...');

//     fs.readdir('./dist', (_, files) => {
//         files.forEach((file) => {
//             if (file.includes('.ts') || file.includes(`${libName}.`)) {
//                 return;
//             }

//             if (!fs.statSync(`./dist/${file}`).isFile()) {
//                 return;
//             }

//             fs.unlinkSync(`./dist/${file}`);
//         });
//     });
// }

async function generateReadme() {
    consoleMessage('Generating `README.md`...');

    const order = [
        'assign.js',
        'macro.js',
        'mixin.js',
        'polyfill.js',
        'macroable.js',
        'defineProperty.js',
        'defineProperties.js',
        'isMacroable.js',
        'isMacroabled.js',
        'isMacroed.js',
        'isMacroedWith.js',
    ];
    const data = (await jsdoc2md.getJsdocData({ files: 'dist/**/*.js' }))
        .filter((item) => item.comment?.trim().length)
        .sort((a, b) => order.indexOf(a.meta.filename) - order.indexOf(b.meta.filename));

    const content = data
        .map((item) => {
            const fileName = item.meta.filename;
            const testFileName = fileName.replace(/\.js$/, '.test.ts');
            const functionName = fileName.replace(/\.js$/, '');
            const methodName = ((val) => (val = val.replace(/^is/, '')) && val.charAt(0).toLowerCase() + val.slice(1))(
                functionName
            );

            const repo = 'https://github.com/VicGUTT/macrojs/blob/main';
            let heading;

            if (fileName.startsWith('is')) {
                heading = `### • **is.${methodName} / ${functionName}** _([Source](${repo}/src/is/${functionName}.ts) | [Tests](${repo}/tests/is/${testFileName}))_`;
            } else if (fileName === 'assign.js') {
                heading = `### • **${functionName}** _([Source](${repo}/src/utils/${functionName}.ts) | [Tests](${repo}/tests/utils/${testFileName}))_`;
            } else {
                heading = `### • **${functionName}** _([Source](${repo}/src/${functionName}.ts) | [Tests](${repo}/tests/${testFileName}))_`;
            }

            const examples = item.examples?.join('\n\n') || '';
            const description = item.description /* ?.replace(/(\r\n|\r|\n)/g, ' ') */ || '';
            const see = item.see?.length
                ? item.see.reduce((acc, current) => (acc += `- [${current}](${current})\n`), `See:\n`).trim()
                : '';
            const alias = {
                value: item.alias || '',
                get target() {
                    return this.value.substring(0, this.value.indexOf(' '));
                },
                get description() {
                    return this.value.substring(this.value.indexOf(' ')).trim();
                },
                get text() {
                    return this.description.replace(
                        `\`${this.target}\``,
                        `[\`${this.target}\`](#-${this.target}-source--tests)`
                    );
                },
            };

            if (alias.value) {
                return `${heading}\n\n${alias.text}\n\n${see}\n\n${examples}`.trim();
            }

            return `${heading}\n\n${description}\n\n${see}\n\n${examples}`.trim();
        })
        .join('\n\n');

    if (!content.trim().length) {
        return;
    }

    const readme = fs.readFileSync('./README.md', 'utf-8');

    const oldContent = readme.substring(
        readme.lastIndexOf('<!-- {{ CONTENT }} -->') + '<!-- {{ CONTENT }} -->'.length,
        readme.lastIndexOf('<!-- /{{ CONTENT }} -->')
    );

    fs.writeFileSync('./README.md', readme.replace(oldContent, `\n${content}\n`));

    consoleMessage('Formatting `README.md`...');

    await execAsync('prettier README.md --write');
    await execAsync('git status', async (_, stdout) => {
        if (!stdout.replace(/\s/g, '').includes('modified:README.md')) {
            return;
        }

        consoleMessage('Committing `README.md`...');

        await execAsync('git add README.md');
        await execAsync('git commit -m "docs: `README.md` update"');
    });
}

/* Helpers
------------------------------------------------*/

async function execAsync(command, callback) {
    return await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            try {
                return error ? reject(error, stdout, stderr) : resolve(callback && callback(error, stdout, stderr));
            } catch (e) {
                return reject(e);
            }
        });
    });
}

function consoleMessage(message) {
    process.stdout.write('\n');

    console.log(message);
}
