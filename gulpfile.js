const { src, dest, series, watch } = require(`gulp`);
const htmlValidator = require(`gulp-html`);
const htmlCompressor = require(`gulp-htmlmin`);
const cssLinter = require(`gulp-stylelint`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
const jsLinter = require(`gulp-eslint`);
const babel = require(`gulp-babel`);
const jsCompressor = require(`gulp-uglify`);
const cssCompressor = require(`gulp-clean-css`);
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
//had issues when trying to do html/*.html` and html/**/*.html
let validateHTML = () => {
    return src([
        `/html/*.html`,
        `/html/**/*.html`])
        .pipe(htmlValidator());
};

let compressHTML = () => {
    return src([`html/*.html`,`html/**/*.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};



let transpileJSForDev = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

let transpileJSForProd = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

let lintCSS = () => {
    return src(`css/*.css`)
        .pipe(cssLinter())
        .pipe(dest(`temp/css`));
};


let transpileCSSForProd = () => {
    return src(`css/*.css`)
        .pipe(cssCompressor())
        .pipe(dest(`prod/css`));
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

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 10,
        browser: browserChoice,
        server: {
            baseDir: [
                `html`,
                `./`,
            ]
        }
    });

    watch(`js/*.js`,
        series(lintJS, transpileJSForDev)
    ).on(`change`, reload);

    watch(`CSS/**/*.css`,
        series(lintCSS)
    ).on(`change`, reload);

    watch(`html/**/*.html`,
        series(validateHTML)
    ).on(`change`, reload);
};

exports.chrome = series(chrome, serve);
exports.edge = series(edge, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.lintCSS = lintCSS;
exports.transpileCSSForProd = transpileCSSForProd;
exports.dev = series(validateHTML, compressHTML, serve);
exports.build = series(compressHTML, transpileJSForProd, transpileCSSForProd);
exports.serve = series(validateHTML,compressHTML,lintCSS,lintJS,serve);
