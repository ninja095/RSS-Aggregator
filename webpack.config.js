// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from "path";
import url from "url"
import HtmlWebpackPlugin from "html-webpack-plugin";
import { GenerateSW } from "workbox-webpack-plugin";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};

export default () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new GenerateSW());
  } else {
    config.mode = "development";
  }
  return config;
};
