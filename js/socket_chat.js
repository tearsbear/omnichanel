// const socket = io.connect('http://0.0.0.0:3326/chat',{transports: ['websocket']}) // local
// const socket = io.connect('https://staging.balesin.id/chat',{path: "/chatsocket"}) // staging
const socket = io.connect('https://faq.balesin.id/chat',{path: "/chatsocket",transports: ['websocket']}) // prod

socket.on('connect', () => {
    socket.emit('join', {username:agentemail, botname:botname, type:'agent'})
    var chatKey = $('#activeEmail').text();
    if (chatKey != ''){
      console.log("connect to private room")
      socket.emit('join', {username:agentemail, botname:botname, chatkey:chatKey, type:'privateroom'})
    }
    socket.emit('my event', { data: 'I\'m connected from new dashboard agent', username:agentemail })
  })

socket.on('my_response', (data) => {
  console.log(data['data'],data['count'])
  socket.emit('online', {username:agentemail, botname:botname, type:'agent'})

  // Today date time init
  let today_ = new Date();

  //Get Date & Time
  let getDate_ = (today_.getMonth() + 1) + '/' + today_.getDate() + '/' + today_.getFullYear();
  let getTime_ = today_.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })

  //Append date & time for MessageContent
  $('#dateMsg').text(getDate_);
  $('#timeMsg').text(getTime_);
})


// get location agent
if(!navigator.geolocation) {
  status.textContent = 'Geolocation is not supported by your browser';
} else {
  status.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(latitude)
  console.log(longitude)
  // status.textContent = '';
  // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
  // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
}

function error() {
  console.log('Unable to retrieve your location')
}
