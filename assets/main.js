var socket = io();

var nome = prompt("Seu nome é:");
socket.emit('adicionar-jogador', nome);

socket.on('player conectado', function(data){
  $('#player-1').attr('usarioId', data[0].id);
  $('#player-2').attr('usarioId', data[1].id);

  if (socket.id !== $('#player-1').attr('usarioId')) {
    $('#player-1 button').attr('disabled', true);
  } else {
    $('#player-2 button').attr('disabled', true);
  }

});

socket.on('atualizar nomes', function(data){
  $('#player-1 .nome').html(data[0]);
  $('#player-2 .nome').html(data[1]);
});

$('#player-1 .botoes button').click(function() {
  var jogada = $(this).text().toLowerCase();
  
  socket.emit('jogada-player-1', jogada);
});

$('#player-2 .botoes button').click(function() {
  var jogada = $(this).text().toLowerCase();

  socket.emit('jogada-player-2', jogada);
});

socket.on('resultado', function(data){
  $('#resultado').html(data[0] + ' venceu!');
  $('#player-1 .pontos').html(data[1]);
  $('#player-2 .pontos').html(data[2]);

});

socket.on('player desconectado', function(data){
  $('#player-'+data+' .nome').html('');
});

socket.on('atualizar jogada', function (data) {
  $('#player-'+data[0]+' .jogada').html(data[1]);
});

socket.on('player na lista de espera', function (data) {
  console.log(data);
  var stringPlayers = '';
  data.forEach(function (player){
    stringPlayers += player.nome+", ";
  });
  $('#espera').html(stringPlayers);
});