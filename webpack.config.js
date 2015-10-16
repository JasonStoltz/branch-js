module.exports = {
  entry: "./src/branch.js",
  output: {
    path: __dirname + '/dist',
    filename: "branch.js",
    // export itself to a global var
    libraryTarget: "var",
    // name of the global var: "Foo"
    library: "branchjs"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel'}
    ]
  }
};