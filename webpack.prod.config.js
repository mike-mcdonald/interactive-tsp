const path = require('path');
const merge = require('webpack-merge');
const { DefinePlugin, HashedModuleIdsPlugin, NamedChunksPlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreloadPlugin = require('preload-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const TerserPlugin = require('terser-webpack-plugin');

const base = require('./webpack.common.config');

module.exports = merge(base, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
      // cacheGroups: {
      //   vue: {
      //     test: /[\\/]node_modules[\\/](vue|vuex|vue-router)[\\/]/,
      //     name: 'vue',
      //     chunks: 'all'
      //   },
      //   turf: {
      //     test: /[\\/]node_modules[\\/](@turf)[\\/]/,
      //     name: 'turf',
      //     chunks: 'all'
      //   }
      // }
    },
    minimizer: [
      new TerserPlugin({
        test: /\.m?js(\?.*)?$/i,
        chunkFilter: () => true,
        warningsFilter: () => true,
        extractComments: false,
        sourceMap: true,
        cache: true,
        cacheKeys: defaultCacheKeys => defaultCacheKeys,
        parallel: true,
        include: undefined,
        exclude: undefined,
        minify: undefined,
        terserOptions: {
          output: {
            comments: /^\**!|@preserve|@license|@cc_on/i
          },
          compress: {
            arrows: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,
            conditionals: true,
            dead_code: true,
            evaluate: true
          },
          mangle: {
            safari10: true
          }
        }
      })
    ]
  },
  plugins: [
    new DefinePlugin({
      GRAPHQL_URL: JSON.stringify('http://localhost:4000/graphql')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css'
    }),
    /* config.plugin('hash-module-ids') */
    new HashedModuleIdsPlugin({
      hashDigest: 'hex'
    }),
    /* config.plugin('named-chunks') */
    new NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }

      const hash = require('hash-sum');
      const joinedHash = hash(Array.from(chunk.modulesIterable, m => m.id).join('_'));
      return `chunk-` + joinedHash;
    }),
    new HtmlWebpackPlugin({
      title: 'Transportation System Plan',
      template: 'public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true
      },
      showErrors: true,
      xhtml: true,
      chunksSortMode: 'none'
    }),
    /* config.plugin('preload') */
    new PreloadPlugin({
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    }),
    /* config.plugin('prefetch') */
    new PreloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    }),
    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/'],
      renderer: new Renderer({
        headless: true,
        renderAfterDocumentEvent: 'render-event'
      })
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: './postcss.config.js',
                ctx: {
                  mode: 'production'
                }
              }
            }
          },
          {
            loader: 'resolve-url-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
});
