/*
Main Client code, which creates and starts the main Game instance.
*/
console.log("Client running main.js");

var canvas = document.getElementById("gameCanvas");

var client = new Client();

// var game = new Game(canvas);
// game.start();
var lobby = new ClientLobby(canvas, client);

client.requestMatchmaking();
