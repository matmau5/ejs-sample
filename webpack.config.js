const webpack = require('webpack');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const path = require('path');

const ejsEntry = glob.sync('**/*.ejs', { cwd: './src/template' }).reduce((list, file) => {
    list[`${path.parse(file).dir}/${path.parse(file).name}`] = path.resolve(__dirname, './src/template', file);
    return list;
}, {});

const htmlConfig = {
    entry: ejsEntry,
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].js',
    },
    optimization: {
        runtimeChunk: false,
    },
    module: {
        rules: [
            {
                test: /\.ejs$/,
                use: ['html-loader', 'ejs-html-loader'],
            },
        ],
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin({
            extensions: ['ejs'],
        }),
        new CopyWebpackPlugin([{ from: `${__dirname}/src`, ignore: ['component/**/*'] }], {
            ignore: Object.keys({ ejs: 'html', scss: 'scss' }).map(ext => `*.${ext}`),
        }),
    ].concat(
        Object.entries(ejsEntry).map(([file, absPath]) => {
            return new HtmlWebpackPlugin({
                filename: `template/${file}.html`,
                template: absPath,
            });
        }),
    ),
};

module.exports = [htmlConfig];
