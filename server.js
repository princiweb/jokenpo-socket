var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var playerUm = {
  id: '',
  nome: '',
  jogada: '',
  pontos: 0
};

var playerDois = {
  id: '',
  nome: '',
  jogada: '',
  pontos: 0
};

var listaEspera = [];

io.on('connection', function(socket){

  

  socket.on('jogada-player-1', function(jogada){
    if (socket.id === playerUm.id) {
      playerUm.jogada = jogada;

      verificarResultado();
    }
  });

  socket.on('jogada-player-2', function(jogada){
    if (socket.id === playerDois.id) {
      playerDois.jogada = jogada;

      verificarResultado();
    }
  });

  function verificarResultado() {
    if(playerUm.jogada && playerDois.jogada) {
      var nomeVencedor = '';

      if(playerUm.jogada === playerDois.jogada) {
        nomeVencedor = 'Ninguém';
      } else if (playerUm.jogada === "pedra") {
            if (playerDois.jogada === "tesoura") {
                nomeVencedor = playerUm.id;
                playerUm.pontos++;
            } else {
                nomeVencedor = playerDois.id;
                playerDois.pontos++;
            }
        }
        else if (playerUm.jogada === "papel") {
            if (playerDois.jogada === "pedra") {
                nomeVencedor = playerUm.id;
                playerUm.pontos++;
            } else {
                nomeVencedor = playerDois.id;
                playerDois.pontos++;
            }
        }
        else if (playerUm.jogada === "tesoura") {
            if (playerDois.jogada === "pedra") {
                nomeVencedor = playerDois.id;
                playerDois.pontos++;
            } else {
                nomeVencedor = playerUm.id;
                playerUm.pontos++;
            }
        }

      io.emit('atualizar jogada', [2, playerDois.jogada]);
      io.emit('atualizar jogada', [1, playerUm.jogada]);

      io.emit('resultado', [nomeVencedor, playerUm.pontos, playerDois.pontos]);

      playerUm.jogada = '';
      playerDois.jogada = '';
    }
  }

  socket.on('adicionar-jogador', function(nome){

    if(playerUm.id && playerDois.id) {

      listaEspera.push({
        id: socket.id,
        nome: nome
      });

      io.emit('player na lista de espera', listaEspera);

    }

    if (!playerUm.id){
      playerUm.id = socket.id;
      playerUm.nome = nome;
    } else if(!playerDois.id) {
      playerDois.id = socket.id;
      playerDois.nome = nome;
    }

    io.emit('player conectado', [ playerUm, playerDois ]);
    io.emit('atualizar nomes', [playerUm.nome, playerDois.nome]);

  })

  socket.on('disconnect', function(){
    if(socket.id === playerUm.id){
      playerUm = {
        pontos: 0
      };
      playerUm.nome = listaEspera[0].nome;
      playerUm.id = listaEspera[0].id;
      listaEspera.shift();
      io.emit('player desconectado', 1);
      io.emit('player na lista de espera', listaEspera);
    }
    else if(socket.id === playerDois.id){
      playerDois = {
        pontos: 0
      };
      playerDois.nome = listaEspera[0].nome;
      playerDois.id = listaEspera[0].id;
      listaEspera.shift();
      io.emit('player desconectado', 2);
      io.emit('player na lista de espera', listaEspera);
    }
    else{
      listaEspera = listaEspera.filter(function(element){
        return element.id !== socket.id;
      });
      io.emit('player na lista de espera', listaEspera);
    }

  });


});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use('/assets', express.static('assets'));

http.listen(3000, function(){
  console.log('listening on localhost:3000');
});