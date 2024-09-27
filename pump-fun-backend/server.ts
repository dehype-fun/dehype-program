import { createServer } from 'http'
import app from './src/app'
import socketio from './src/sockets/'
import { logger } from './src/sockets/logger';

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from the .env file

// Socket communication
const server = createServer(app);
socketio(server);

/**
 * start Express server
 */
server.listen(app.get('port'), () => {
  logger.info('  App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
})

export default server;