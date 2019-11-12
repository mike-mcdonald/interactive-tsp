const path = require('path');
const globby = require('globby');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ArcGISPlugin = require('@arcgis/webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HotModuleReplacementPlugin = require('webpack')
  .HotModuleReplacementPlugin;
const ProgressPlugin = require('webpack').ProgressPlugin;
const PreloadPlugin = require('preload-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  mode: process.env.NODE_ENV,
  entry: {
    main: ['@dojo/framework/shim/Promise', './src/main.ts']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    globalObject: "(typeof self !== 'undefined' ? self : this)"
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8888
  },
  node: {
    setImmediate: false,
    global: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      vue$: 'vue/dist/vue.runtime.esm.js'
    },
    extensions: [
      '.mjs',
      '.js',
      '.jsx',
      '.vue',
      '.json',
      '.wasm',
      '.ts',
      '.tsx'
    ],
    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'node_modules/@vue/cli-service/node_modules')
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(
        __dirname,
        'node_modules/@vue/cli-plugin-typescript/node_modules'
      ),
      path.resolve(
        __dirname,
        'node_modules/@vue/cli-plugin-babel/node_modules'
      ),
      'node_modules',
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'node_modules/@vue/cli-service/node_modules')
    ]
  },
  watchOptions: {
    ignored: [path.resolve(__dirname, 'node_modules')]
  },
  plugins: [
    new ArcGISPlugin({
      useDefaultAssetLoaders: false,
      features: {
        '3d': false,
        has: {
          'esri-native-promise': true
        }
      }
    }),
    new VueLoaderPlugin(),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
        BASE_URL: '"/"'
      }
    }),
    new CaseSensitivePathsPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new HotModuleReplacementPlugin(),
    new ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    }),
    new PreloadPlugin({
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    }),
    new PreloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'public'),
        to: path.resolve(__dirname, 'dist'),
        toType: 'dir',
        ignore: ['.DS_Store']
      }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: false,
              appendTsxSuffixTo: ['\\.vue$']
            }
          }
        ]
      },
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
                  mode: argv.mode
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
  ]
});
