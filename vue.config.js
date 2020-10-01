const ENV = require('getenv');
const fs = require('fs');

let httpsConfig = false;
if (ENV.bool('SSL_ENABLED')) {
  httpsConfig = {
    key: fs.readFileSync(ENV.string('SSL_KEY')),
    cert: fs.readFileSync(ENV.string('SSL_CERT'))
  }
}

module.exports = {
  devServer: {
    disableHostCheck: true,
    https: httpsConfig
  }
};