/*
Main Client code, which creates and starts the main Game instance.
*/
console.log("Client running main.js");

// var canvas = document.getElementById("gameCanvas");

var client = new Client();
client.echo('Hello world')
client.joinGame();
