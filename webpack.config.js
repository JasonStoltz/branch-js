module.exports = {
  entry: "./src/branch.js",
  output: {
    path: __dirname + '/dist',
    filename: "branch.js",
    libraryTarget: "umd",
    library: "branchjs"
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel'}
    ]
  }
};