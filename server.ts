import express from 'express'
import {createServer} from 'http'
import {Game} from './src/server/game'
import {ServerComm} from './src/server/server_comm'

const app = express();
const server = createServer(app);
const port = 8081;

app.use('/src', express.static(__dirname + '/src'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req,res){
  res.sendFile(__dirname+'/index.html');
});

let comm = new ServerComm(server);
let game = new Game(comm);
game.startGame();

// Open server
server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});