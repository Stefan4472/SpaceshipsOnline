import express from 'express';
import { createServer } from 'http';
import * as path from 'path';
import { Game } from './game';
import { ServerComm } from './server_comm';
/*Note: this script will run from the 'dist/server' directory once built.*/

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8081;

// Get path to the 'dist' folder, which will be the parent of this directory
const dist = path.resolve(path.join(__dirname, '..'));

// Expose 'client' and 'assets' subdirectories
app.use('/client', express.static(path.resolve(dist, 'client')));
app.use('/assets', express.static(path.resolve(dist, 'assets')));

app.get('/', function (req, res) {
    res.sendFile(path.resolve(dist, 'index.html'));
});

const comm = new ServerComm(server);
const game = new Game(comm);
game.startGame();

// Open server
server.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
