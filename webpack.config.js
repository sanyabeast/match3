const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './ts/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Faster compilation, no type checking during development
            compilerOptions: {
              sourceMap: true,
            },
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'eval-source-map', // Better source maps for development
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    watchFiles: ['./ts/**/*.ts', './css/**/*.css', './*.html'], // Explicitly watch these files
    liveReload: true, // Enable live reload
    client: {
      overlay: true, // Show errors as overlay
      progress: true, // Show compilation progress
    },
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000, // Check for changes every second
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'static/index.html',
      inject: 'body',
      scriptLoading: 'defer',
    }),
  ],
};
