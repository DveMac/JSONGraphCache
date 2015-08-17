var manager = require('simple-node-logger').createLogManager();
var logger = manager.createConsoleAppender();
logger.setLevel('debug');
module.exports = manager;