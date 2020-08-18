/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DefinePlugin } = require('webpack');
const ArcGISPlugin = require('@arcgis/webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: [path.resolve(__dirname, 'src', 'main.js')]
  },
  devtool: 'cheap-eval-modules-source-map',
  mode: process.env.NODE_ENV,
  stats: 'none',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      vue$: 'vue/dist/vue.runtime.esm.js'
    },
    extensions: ['.vue', '.json', '.wasm', '.ts', '.js'],
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ArcGISPlugin({
      useDefaultAssetLoaders: false
    }),
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin({
      vue: true,
      tslint: true,
      formatter: 'codeframe',
      checkSyntacticErrors: false
    }),
    new DefinePlugin({
      'process.env': {
        BASE_URL: '"/"'
      }
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'public'),
        to: path.resolve(__dirname, 'dist'),
        toType: 'dir',
        ignore: ['.DS_Store']
      }
    ]),
    new FriendlyErrorsWebpackPlugin()
  ],
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      {
        test: /\.vue$/,
        use: [
          'cache-loader',
          {
            loader: 'vue-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          'cache-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [/\.vue$/]
            }
          },
          'eslint-loader'
        ],
        exclude: file => /node_modules/.test(file) && !/portland-pattern-lab/.test(file) && !/\.vue\.ts/.test(file)
      },
      {
        test: /\.js$/,
        use: ['cache-loader', 'babel-loader', 'eslint-loader'],
        exclude: file => /node_modules/.test(file) && !/portland-pattern-lab/.test(file) && !/\.vue\.js/.test(file)
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader'
      }
    ]
  },
  externals: [
    (context, request, callback) => {
      if (/pe-wasm$/.test(request)) {
        return callback(null, 'amd ' + request);
      }
      callback();
    }
  ],
  node: {
    process: false,
    global: false,
    fs: 'empty'
  }
};
