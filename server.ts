import express from 'express'
import socketio from 'socket.io'
import {createServer} from 'http'
import {Game} from './src/server/game'

const app = express();
const server = createServer(app);
const io = new socketio.Server(server);
const port = 8081;

app.use('/src', express.static(__dirname + '/src'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req,res){
  res.sendFile(__dirname+'/index.html');
});

// Listen for new connections on port 8081
server.listen(process.env.PORT || port, function() {
  console.log(`Listening on port ${port}`);
});

let game = new Game(io);

// Handle socket connection
io.on('connection', function(socket) {
  console.log('Got a new connection!');
  game.addPlayer(socket);
});

game.startGame();