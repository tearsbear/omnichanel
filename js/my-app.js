var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'LiveAgent',
    // App id
    id: 'com.liveagent.chat',
    // theme: 'ios',
    pane: {
        swipe: true,
    },
    theme: 'ios',
    // ... other parameters
});

// Init View Main
const mainView = app.views.create('.view-main');

var crTooltip = app.tooltip.create({
    targetEl: '.chatroom-tooltip',
    text: 'Chatrooms',
  });

var anaTooltip = app.tooltip.create({
    targetEl: '.analytic-tooltip',
    text: 'Analytics'
});

const audio = new Audio("/audio/notification.mp3");