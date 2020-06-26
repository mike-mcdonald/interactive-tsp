const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin, HotModuleReplacementPlugin, ProgressPlugin } = require('webpack');

const base = require('./webpack.common.config');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    host: '0.0.0.0'
  },
  output: {
    filename: '[name].js'
  },
  plugins: [
    new DefinePlugin({
      GRAPHQL_URL: JSON.stringify('http://localhost:4000/graphql')
    }),
    new HtmlWebpackPlugin({
      title: 'Transportation System Plan',
      template: 'public/index.html',
      hash: false,
      inject: true,
      compile: true,
      favicon: false,
      minify: false,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      xhtml: true,
      chunksSortMode: 'none'
    }),
    /* config.plugin('hmr') */
    new HotModuleReplacementPlugin(),
    /* config.plugin('progress') */
    new ProgressPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc)ss$/,
        use: [
          {
            loader: 'vue-style-loader',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: './postcss.config.js',
                ctx: {
                  mode: 'development'
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
      },
      {
        test: /\.css$/,
        use: [
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
          }
        ]
      }
    ]
  }
});
