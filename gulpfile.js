const { src, dest, series, watch } = require(`gulp`);
const htmlValidator = require(`gulp-html`);
const htmlCompressor = require('gulp-htmlmin');
const cssLinter = require('gulp-stylelint');
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
let browserChoice = `default`;

async function chrome () {
    browserChoice = `google chrome`;
}

async function edge () {
    browserChoice = `microsoft-edge`;
}

async function allBrowsers () {
    browserChoice = [
        `google chrome`,
        `microsoft-edge`
    ];
}

let validateHTML = () => {
    return src([
        `dev/html/*.html`,
        `dev/html/**/*.html`])
        .pipe(htmlValidator());
};

let compressHTML = () => {
    return src([`dev/html/*.html`,`dev/html/**/*.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let lintCSS = () => {
    return src(`dev/css/*.css`)
    .pipe(cssLinter())
    .pipe(dest(`temp/css`));
};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 10,
        browser: browserChoice,
        server: {
            baseDir: [
                `temp`,
                `dev`,
                `dev/html`
            ]
        }
    });

    watch(`src/js/*.js`,
        series(lintJS, transpileJSForDev)
    ).on(`change`, reload);

    watch(`src/CSS/**/*.css`,
        series(lintCSS)
    ).on(`change`, reload);

    watch(`src/html/**/*.html`,
        series(validateHTML, compressHTML)
    ).on(`change`, reload);
};

let lintJS = () => {
    return src(`js/*.js`)
        .pipe(jsLinter({
            parserOptions: {
                ecmaVersion: 2017,
                sourceType: `module`
            },
            rules: {
                indent: [2, 4, {SwitchCase: 1}],
                quotes: [2, `backtick`],
                semi: [2, `always`],
                'linebreak-style': [2, `unix`],
                'max-len': [1, 85, 4]
            },
            env: {
                es6: true,
                node: true,
                browser: true
            },
            extends: `eslint:recommended`
        }))
        .pipe(jsLinter.formatEach(`compact`, process.stderr));
};

exports.chrome = series(chrome, serve);
exports.edge = series(edge, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.lintCSS = lintCSS;
exports.serve = series(validateHTML,compressHTML,lintJS, lintCSS, serve);

