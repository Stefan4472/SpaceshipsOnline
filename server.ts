import express from 'express'
import socketio from 'socket.io'
import {createServer} from 'http'
import {Game} from './js/server/game'

const app = express();
const server = createServer(app);
const io = new socketio.Server(server);
const port = 8081;
console.log(__dirname);
app.use('/js', express.static(__dirname + '/js'));
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