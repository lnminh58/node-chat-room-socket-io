const socket = io();

function scrollToBottom() {
  const messages = $('#messages');
  const newMessage = messages.children('li:last-child');

  const clientHeight = messages.prop('clientHeight');
  const scrollTop = messages.prop('scrollTop');
  const scrollHeight = messages.prop('scrollHeight');
  const newMessageHeight = newMessage.innerHeight();
  const lassMessageHeight = newMessage.prev().innerHeight();
  if (
    clientHeight + scrollTop + newMessageHeight + lassMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

$('#logout').on('click',() => {
  localStorage.removeItem('user');
  window.location.href='/'
})

socket.on('updateUserList', users => {
  console.log('user list:::::::', users);
  let ol = $(
    '<ul class=" main-shadow transparent-background border border-info rounded p-0" style="height: 555px; overflow-y: auto"></ul>'
  );

  ol.append(
    $(
      '<li class="lead bg-info text-white text-center list-unstyled border-bottom border-info p-2 mb-2"></li>'
    ).text(`${users.length} users online`));

  users.forEach(user => {
    console.log(user);
    ol.append(
      $(
        '<li class="float-left lead text-white text-center list-unstyled border border-info p-2 mb-2 mx-2 rounded"></li>'
      ).text(user)
    );
  });
  $('#users').html(ol);
});

socket.on('connect', () => {
  const params = JSON.parse(localStorage.getItem('user'));
  if(!params) {
    alert('user not found, login first');
    window.location.href = '/';
    return
  }
  console.log(params);
  socket.emit('join', params, err => {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      $('#room-name').text(`room name: ${params.room}`)
      $('#room-password').text(`PASSWORD: ${params.password}`)
      console.log('No err');
    }
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from Server');
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm:ss a');

  var template =
    message.userId === socket.id
      ? $('#my-message-template').html()
      : $('#another-message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm:ss a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

$('#message-form').on('submit', function(e) {
  e.preventDefault();
  socket.emit(
    'createMessage',
    {
      text: $('[name=message]').val()
    },
    () => {
      $('[name=message]').val('');
    }
  );
});

const locationButton = $('#send-location');
locationButton.on('click', function() {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported!');
  }
  navigator.geolocation.getCurrentPosition(
    function(position) {
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      alert('Unable to find your location');
    }
  );
});
