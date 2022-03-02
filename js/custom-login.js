var $$ = Dom7;

function sendData() {
    const XHR = new XMLHttpRequest();

    // Bind the FormData object and the form element
    const FD = new FormData( form );

    // Define what happens on successful data submission
    XHR.addEventListener( "load", function(event) {
    //   console.log( event.target.responseText );
        app.dialog.close();
        var myObj = JSON.parse(event.target.responseText);
        console.log(myObj)
        if(myObj['status'] != "valid"){
            app.dialog.alert(myObj['message']);
        }else{
            window.location.href="/"+myObj['go_to'];
        }
            
    } );

    // Define what happens in case of error
    XHR.addEventListener( "error", function( event ) {
      // alert( 'Oops! Something went wrong.' );
      app.dialog.alert('Oops! Something went wrong.');
    } );

    // Set up our request
    XHR.open( "POST", "/login" );

    // The data sent is what the user provided in the form
    XHR.send( FD );
  }

// Access the form element...
const form = document.getElementById( "authForm" );

// ...and take over its submit event.
form.addEventListener( "submit", function ( event ) {
    app.dialog.preloader('Submit Data ...');
    event.preventDefault();
    sendData();
} );
