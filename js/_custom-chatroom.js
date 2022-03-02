// Init Left Panel Menu
const panelMenu = app.panel.create({
    el: '.panel-menu',
    visibleBreakpoint: 1024,
})

// Init Right Panel Details
const panelDetails = app.panel.create({
    el: '.panel-details',
    visibleBreakpoint: 1024,
})

const $$ = Dom7;

let messages;
let messagebar;
var responseInProgress = false;
// Init Messages
messages = app.messages.create({
    el: '.messages',

    // First message rule
    firstMessageRule: function (message, previousMessage, nextMessage) {
        // console.log(message, "<---message")
        if (message == null) {
            // console.log('Variable "message" is undefined.');
            return false
        }
        // Skip if title
        if (message.isTitle) return false;
        /* if:
          - there is no previous message
          - or previous message type (send/received) is different
          - or previous message sender name is different
        */
        if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
        return false;
    },
    // Last message rule
    lastMessageRule: function (message, previousMessage, nextMessage) {
        if (message == null) {
            // console.log('Variable "message" is undefined.');
            return false
        }
        // Skip if title
        if (message.isTitle) return false;
        /* if:
          - there is no next message
          - or next message type (send/received) is different
          - or next message sender name is different
        */
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
        return false;
    },
    // Last message rule
    tailMessageRule: function (message, previousMessage, nextMessage) {
        if (message == null) {
            // console.log('Variable "message" is undefined.');
            return false
        }
        // Skip if title
        if (message.isTitle) return false;
        /* if (basically same as lastMessageRule):
        - there is no next message
        - or next message type (send/received) is different
        - or next message sender name is different
      */
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
        return false;
    }
});

// Init Messagebar
messagebar = app.messagebar.create({
    el: '.messagebar'
});


// Agent prop
var agentemail = $('#agentemail').val()
var botname = $('#botname').text()
var chatkey = $('#ck').val()
var messagetype = "text"
var source = $('#src').val()
let externalUserId = agentemail; // You will supply the external user id to the OneSignal SDK

OneSignal.push(function () {
    OneSignal.setExternalUserId(externalUserId);
});

// Create searchbar for quick answers
const searchbar = app.searchbar.create({
    el: '.searchbar',
    searchContainer: '#listAnswer',
    searchIn: '.item-title'
});

// Init popup files
const popupFiles = app.popup.create({
    el: '.popup-files',
    on: {
        close: function () {
            $('#fileInput').val('');
            // $('#captionFile').val('');
            $('.thumbnail-file').hide();
            $('.before-input').show();
        }
    }
});

//Handle input change notes
$('#inputNotes').on('keyup', function () {
    if ($(this).val() != '') {
        $('#saveNotes').removeClass('disabled');
    } else {
        $('#saveNotes').addClass('disabled');
    }
})

//Handle save notes
$('#saveNotes').on('click', function () {
    let getNote = $('#inputNotes').val();
    if (getNote != ''){
        $.ajax({
            url: '/user_info',
            type: 'POST',
            async: true,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                botname: botname,
                agentemail: agentemail,
                chatkey: $('#activeEmail').text(),
                ticket_id: $('#activeTicket').text(),
                data_type: "set_note",
                notes: getNote
            }),
            dataType: "json",
            beforeSend: function () {
                app.dialog.progress('Saving Notes..');

            },
            success: function (result) {
                if (result['status'] == "success"){
                    console.log("Notes saved")
                    toastIcon = app.toast.create({
                        icon: '<i class="bi bi-check2"></i>',
                        text: 'Notes Saved',
                        position: 'center',
                        closeTimeout: 2000,
                      });
                    toastIcon.open()
                }else{
                    console.log("Notes failed to save")
                }
                app.dialog.close()
            }
        })
    }
})


//Handle choose image file
$('.browse-file').on('click', function () {
    $('#fileInput').click()
})

//Handle selected file
$("#fileInput").change(function () {
    readFile(this)
});

$('#sendFile').on('click', function () {
    app.dialog.create({
        title: 'Confirmation',
        text: 'Send this image?',
        buttons: [
            {
                text: 'No',
            },
            {
                text: 'Yes',
                onClick: function () {
                    let fd = new FormData();
                    let files = $('#fileInput')[0].files[0];
                    fd.append('data', files)
                    fd.append('requester', agentemail)
                    fd.append('type', 'image')
                    uploadFile(fd)
                },
            }
        ],
    }).open();
})


// Send Message With Enter
$$('#inputMsg').on('keyup', function (e) {
    if ($$(this).val() != '') {
        $$('.send-link').show();
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            $$('.send-link').click();
        }
    } else {
        $$('.send-link').hide();
    }
})

// Show preloader
// app.dialog.preloader();

// Send Message With Button
$$('.send-link').on('click', function () {
    // console.log('send text')
    let text = messagebar.getValue().replace(/\n/g, '<br>').trim();
    // return if empty message
    if (!text.length) return;
    // Clear area
    messagebar.clear();

    // Return focus to area
    messagebar.focus();

    //hide button send
    $(this).hide();

    // Send message
    sendMessage(text, 'text')
});

//Read selected file for image upload
function readFile(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.before-input').hide();
            $('.thumbnail-file img').attr('src', e.target.result);
            $('.thumbnail-file').show();
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function uploadFile(files) {
    $.ajax({
        url: 'https://open.balesin.id/api/upload-data',
        type: 'POST',
        async: true,
        processData: false,
        contentType: false,
        encType: 'multipart/form-data',
        data: files,
        dataType: "json",
        beforeSend: function () {
            app.popup.close('.popup-files');
            app.dialog.progress('Uploading image...');
        },
        success: function (result) {
            let img_url = result['url'];
            sendMessage(img_url, 'image')
            $('#fileInput').val('');
            // $('#captionFile').val('');
            $('.thumbnail-file').hide();
            $('.before-input').show();
            setTimeout(function () {
                app.dialog.close();
            }, 1000);
        },

    }); //end ajax request
}


//Generate Avatar Image from UI Avatars API
function generateAvatar(value) {
    let theText = value.replace(/\s+/g, '+'); //remove space
    let theUrl = `https://ui-avatars.com/api/?length=1&rounded=true&background=random&color=random&name=${theText}`;
    return theUrl;
}

//Handle get history chat
function getHistoryChat(ck, bn) {
    $.ajax({
        url: '/chathistory',
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname: bn,
            agentemail: agentemail,
            chatkey: ck,
        }),
        dataType: "json",
        beforeSend: function () {
            app.dialog.progress('Loading chat history..');
        },
        success: function (result) {
            var historyChat = result['response']
            for (ihs = historyChat.length - 1; ihs >= 0; ihs--) {
                messages.addMessage({
                    text: historyChat[ihs].text,
                    type: historyChat[ihs].type,
                    name: historyChat[ihs].name,
                    avatar: generateAvatar(historyChat[ihs].name),
                    image: historyChat[ihs].imageURL ? `<img src="${historyChat[ihs].imageURL}" style="max-width: 250px;" />` : null,
                    textFooter: historyChat[ihs].date
                });
            }


            setTimeout(function () {
                app.dialog.close();
                //scroll page
                $$('.page-content').scrollTop($('.messages').get(0).scrollHeight, 600);
            }, 1000);
        }
    });


    //Append date & time for MessageContent
    $(`<div class="messages-title"><b id="dateMsg"></b> <span id="timeMsg"></span></div>`).prependTo('.messages')
}

//Handle new chat based on id on li element
function handleNewChat(idChat, newMsg) {
    if ($('#' + idChat).hasClass('handleMyChats')) {
        $('#' + idChat).parent().prependTo(`#myChatList`);
        $('#' + idChat + ' .chattext')[0].firstChild.data = newMsg;
        $('#' + idChat).find('.indicator').show();
        if ($('#activeTicket').text() === idChat) {
            setTimeout(function () {
                $('#' + idChat).find('.indicator').hide();
            }, 1000);
        }
    } else {
        $('#' + idChat).find('.indicator').show();
        $('#' + idChat + ' .quetext')[0].firstChild.data = newMsg;
    }
    

}

function clearDetailChat() {
    messages.clear();
    $('#detailsFill').hide();
    $('.messagebar').addClass('disabled');
    $('.btn-close-chat').addClass('disabled');
    $('#detailsPlaceholder').show();
    $('#titleChatRoom').text('User Name');
    $('#activeAva').attr('src', '');
    $('#activeName').text('User Name');
    $('#activeEmail').text('email or telephone');
    $('#detailsPhone').text('telephone');
    $('#mapLoc').attr('src', '')
    $('#queue-time').text('')
    $('#source-channel').text('')
}

function handleListChat() {
    $('.handleMyChats').each(function (index) {
        $(this).on('click', function () {
            let chatAva = $(this).find('.chatAva').attr('src');
            let chatName = $(this).find('.userChatName').text();
            let ticketId = $(this).find('.tickettext').text();
            let detailEmail = chatName.replace(/\s+/g, '')
            let chatKey = $(this).find('#ck').val();
            let source = $(this).find('#src').val();
            $('#myChatList').find('.active').removeClass('active');
            $(this).addClass("active");

            setTimeout(function () {
                $(this).find('.indicator').hide();
                // $('#' + ticketId).find('.indicator').hide();
            }, 3000);

            //clear messages before get chathistory
            messages.clear();
            getHistoryChat($(this).find('#ck').val(), botname);

            //get last order
            getListOrder();
            $('.messagebar').removeClass('disabled');
            $('.btn-close-chat').removeClass('disabled');
            $('.btn-close-chat').attr('id', ticketId);
            $('#detailsPlaceholder').hide();
            $('#detailsFill').show();
            $('#activeAva').attr('src', chatAva);
            
            $('#mapLoc').attr('src', '')
            socket.emit('join', { username: agentemail, botname: botname, chatkey: chatKey, type: 'privateroom' })
            getQuickAnswer(chatKey);

            //get userStorage from chatkey or id of user
            let iqd = $(this).attr('id');
            let userDetail = JSON.parse(localStorage.getItem(`userDetail-${iqd}`));

            //show user detail from userStorage
            if(userDetail !== null) {
                $('#titleChatRoom').text(userDetail.name);
                $('#activeName').text(userDetail.name);
                $('#activeTicket').text(userDetail.ticket_id);
                $('#activeEmail').text(userDetail.chatkey);
                $('#detailsPhone').text(userDetail.name);
                $('#source-channel').text(userDetail.source);
            } else {
                $('#titleChatRoom').text(chatName);
                $('#activeName').text(chatName);
                $('#activeTicket').text(ticketId);
                $('#activeEmail').text(chatKey);

                $.ajax({
                    url: '/user_info',
                    type: 'POST',
                    async: true,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({
                        botname: botname,
                        agentemail: agentemail,
                        chatkey: chatKey,
                        ticket_id: ticketId,
                        data_type: "detail_info"
                    }),
                    dataType: "json",
                    beforeSend: function () {
                        app.dialog.progress('Loading user info..');
                    },
                    success: function (result) {
                        console.log(result)
                        $('#commerceList').empty()
                        $('#detailsPhone').text(result['response'].phone)
                        $('#queue-time').text(result['response'].queue_time)
                        $('#source-channel').text(result['response'].source)
                        $('#inputNotes').val(result['response'].notes)
                        if (result['response'].commerce == 1) {
                            let new_src = "https://maps.google.com/maps?q=" + result['response'].address + "&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            $('#mapLoc').attr('src', new_src)
                            let listContent =
                                `<li>
                                <div class="item-inner">
                                    <div class="item-title-row">
                                        <i class="bi bi-bag-check"></i>
                                        <div class="item-title chattitle avgSizeCartTitle">Average Size Cart</div>
                                        <div class="item-after avgSizeCartVal">Rp.${result['response']['result'].avg_size_cart}</div>
                                    </div>    
                                </div>
                            </li>
                            `
                            $(listContent).appendTo('#commerceList');
                            $('.contact-info-card').show();
                            $('#mapLoc').show();
                        }


                        app.dialog.close();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $('.contact-info-card').hide();
                        $('#mapLoc').hide();
                        $('#commerceList').empty()
                        app.dialog.close();
                        console.log(textStatus);
                    }
                });

            }

            


        })
    })
}

// Append List myChat
function getMyChats() {
    $.ajax({
        url: '/queue',
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname: botname,
            agentemail: agentemail,
            queue_status: "pickup",
        }),
        dataType: "json",
        success: function (result) {
            app.dialog.close();
            $('#myChatList').empty();
            $('.my-count-chat').text($('#myChatList > li').length);
            for (let ic = 0; ic < result['response'].length; ic++) {
                if (result['response'][ic].date_prop == result['response'][ic].date_now) {
                    var display_time = result['response'][ic].time_prop
                }
                else {
                    var display_time = result['response'][ic].date_prop
                }
                let listContent = `<li><a href="#" class="item-link item-content item-chat handleMyChats" id="${result['response'][ic].ticket_id}">
                        <div class="item-media">
                            <img class="chatAva" width="50"
                            src="${generateAvatar(result['response'][ic].name)}"
                            alt="">
                        </div>
                        <div class="item-inner">
                            <div class="item-title-row">
                                <div class="item-title chattitle userChatName">${result['response'][ic].name}</div>
                                <div class="item-after clockchat">${display_time}</div>
                            </div>
                            <div class="item-text tickettext">${result['response'][ic].ticket_id}</div>
                            <div class="item-text chattext">${result['response'][ic].user_says} <span class="badge color-red indicator" style="float:right; margin-top: -0px; padding: 8px; font-size: 10px; display: none;">new</span></div>
                            <input type="hidden" id="ck" value="${result['response'][ic].chatkey}">
                            <input type="hidden" id="src" value="${result['response'][ic].source}">
                        </div></a></li>`
                $(listContent).appendTo('#myChatList');


                //count list queued chat
                $('.my-count-chat').text($('#myChatList > li').length);

            }
            //handle when agent click user chat
            handleListChat();

            //handle when agent click close chat
            // $('.btn-close-chat').each(function () {

            // })
        }
    }) // end of ajax post
}


$('.btn-close-chat').on('click', function () {
    let idClose = $(this).attr('id');
    app.dialog.create({
        title: 'Confirmation',
        text: 'Close this chat?',
        buttons: [
            {
                text: 'No',
            },
            {
                text: 'Yes',
                onClick: function () {
                    //start ajax request  
                    $.ajax({
                        url: '/close_ticket',
                        type: 'POST',
                        async: true,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            ticketId: $('#activeTicket').text(),
                            botname: botname,
                            flag: "done",
                        }),
                        dataType: "json",
                        beforeSend: function () {
                            app.dialog.progress('Closing ticket..');

                        },
                        success: function (result) {
                            // app.dialog.alert('');
                            if (result['status'] == 'done') {
                                localStorage.removeItem(`userDetail-${idClose}`);
                                $('#' + idClose).parent().remove();
                                clearDetailChat();
                                getMyChats();
                                // update count que & chat list
                                $('.my-count-chat').text($('#myChatList > li').length);
                                toastIcon = app.toast.create({
                                    icon: '<i class="bi bi-check2"></i>',
                                    text: 'Ticket Closed',
                                    position: 'center',
                                    closeTimeout: 2000,
                                  });
                                toastIcon.open()

                            }
                            app.dialog.close();
                        },
                    }); //end ajax request
                },
            }
        ],
    }).open();
})


// Append List queuedChat
function getQueChats() {
    $.ajax({
        url: '/queue',
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname: botname,
            agentemail: agentemail,
            queue_status: "queue",
        }),
        dataType: "json",
        success: function (result) {
            app.dialog.close();
            $('#myQueList').empty();
            $('.my-count-que').text($('#myQueList > li').length);
            for (let iq = 0; iq < result['response'].length; iq++) {
                if (result['response'][iq].date_prop == result['response'][iq].date_now) {
                    var display_time = result['response'][iq].time_prop
                }
                else {
                    var display_time = result['response'][iq].date_prop
                }
                let listQueContent = `<li><a href="#" id="${result['response'][iq].ticket_id}" class="item-link item-content item-chat">
                        <div class="item-media">
                            <img width="50"
                            src="${generateAvatar(result['response'][iq].name)}"
                            alt="">
                        </div>
                        <div class="item-inner">
                            <div class="item-title-row">
                                <div class="item-title chattitle">${result['response'][iq].name}</div>
                                <div class="item-after clockchat">${display_time}</div>
                            </div>
                            <div class="item-text tickettext">${result['response'][iq].ticket_id}</div>
                            <div class="item-text quetext">${result['response'][iq].user_says} <span class="badge color-red indicator" style="float:right; margin-top: -0px; padding: 8px; font-size: 10px; display: none;">new</span></div>
                            <input type="hidden" id="ck" value="${result['response'][iq].chatkey}">
                            <input type="hidden" id="src" value="${result['response'][iq].source}">
                        </div></a></li>`
                $(listQueContent).appendTo('#myQueList');

                //count list queued chat
                $('.my-count-que').text($('#myQueList > li').length);

                //button handle queued chat
                $('#' + result['response'][iq].ticket_id).on('click', function () {
                    if (!$(this).hasClass('handleMyChats')) {
                        let ique = $(this).attr('id');
                        app.dialog.create({
                            title: 'Confirmation',
                            text: 'Add to My Chats?',
                            buttons: [
                                {
                                    text: 'No',
                                },
                                {
                                    text: 'Yes',
                                    onClick: function () {
                                        // start ajax request
                                        // console.log(result['response'][iq].ticket_id,'<----- ticket id')
                                        $.ajax({
                                            url: '/update_status',
                                            type: 'POST',
                                            async: true,
                                            contentType: "application/json; charset=utf-8",
                                            data: JSON.stringify({
                                                ticket_id: result['response'][iq].ticket_id,
                                            }),
                                            dataType: "json",
                                            success: function (result) {
                                                // console.log(result)
                                                if (result['status'] != 'success') {
                                                    app.dialog.create({
                                                        title: 'Failed',
                                                        text: 'Failed to pickup ticket'
                                                    }).open();
                                                } else {

                                                    //add user detail to localStorage
                                                    localStorage.setItem(`userDetail-${ique}`, JSON.stringify(result['response'][iq]));

                                                    // move selected to listMyChat
                                                    $('#' + ique).find('.quetext').addClass('chattext');
                                                    $('#' + ique).find('.chattext').removeClass('quetext');
                                                    $('#' + ique).parent().prependTo('#myChatList');
                                                    $('#' + ique).addClass('handleMyChats');
                                                    $('#' + ique).find('.chattitle').addClass('userChatName');
                                                    $('#' + ique).find('img').addClass('chatAva');
                                                    $('#' + ique).removeAttr('id');
                                                    //re render list chat
                                                    handleListChat();
                                                    //update count que & chat list
                                                    $('.my-count-que').text($('#myQueList > li').length);
                                                    $('.my-count-chat').text($('#myChatList > li').length);
                                                    getMyChats()
                                                }

                                            }
                                        }) //end ajax request
                                    },
                                }
                            ],
                        }).open();
                    }
                });
            }
        }
    })


}


//Append list quick answers
function getQuickAnswer(chatKey) {
    $('#quickAnswer').empty()
    $.ajax({
        url: '/suggestion_answer',
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            chatkey: chatKey,
            botname: botname,
        }),
        dataType: "json",
        success: function (result) {
            // app.dialog.alert('');
            for (idanswer = 0; idanswer < result['response'].length; idanswer++) {
                $(`<li class="accordion-item accordion-answer" id="listAnswer-${idanswer}"><a href="#" class="item-content item-link">
                                <div class="item-inner">
                                    <div class="item-title">${result['response'][idanswer].title}</div>
                                </div>
                            </a>
                            <div class="accordion-item-content">
                                <div class="block">
                                    <p class="panswer">${result['response'][idanswer].description}</p>
                                    <a id="pickAnswer-${idanswer}" href="#" class="button button-fill button-round bg-color1 text-color-black"
                                        style="height: 35px; padding: 4px;">select this
                                        answer</a>
                                </div>
                                <br>
                            </div>
                    </li>`).appendTo('#quickAnswer');


                $(`#pickAnswer-${idanswer}`).on('click', function () {
                    // Clear input before set the answer
                    messagebar.clear();
                    let setAnswer = $(this).parent().find('.panswer').text();
                    $('#inputMsg').val(setAnswer);
                    app.panel.close('.panel-answer');
                    app.accordion.close('.accordion-answer');

                });
            }
        }
    }); //end ajax request


}

function sendMessage(msg, typeMsg) {
    // console.log($('#captionFile').val(),"<----- caption")
    console.log($('#activeEmail').text())
    socket.emit('msg to user', {
        agentemail: agentemail,
        botname: botname,
        chatkey: $('#activeEmail').text(),
        messagetype: typeMsg,
        msg: msg,
        caption: $('#captionFile').val(),
        source: $('#src').val()
    })
    if (typeMsg == 'image') {
        messages.addMessage({
            text: $('#captionFile').val(),
            type: 'sent',
            name: 'agent',
            avatar: generateAvatar('agent'),
            image: `<img src="${msg}" style="max-width: 250px;" />`,
            textFooter: $('#timeMsg').text()
        })
        $('#captionFile').val('');
        $$('.page-content').scrollTop($('.messages').get(0).scrollHeight, 600);
    }
    else if (typeMsg == 'text') {
        messages.addMessage({
            text: msg,
            name: 'agent',
            avatar: generateAvatar('agent'),
            image: null,
            textFooter: $('#timeMsg').text(),
            isTitle: false
        })
        $('#captionFile').val('');
        $$('.page-content').scrollTop($('.messages').get(0).scrollHeight, 600);
    }

}

socket.on('getQueue', (data) => {
    console.log('initial update')
    getQueChats()
    getMyChats()
})

socket.on('update_user', (data) => {
    console.log('update_user')
    getQueChats()
    // getMyChats()
})

socket.on('notif', (data) => {
    // console.log(data ,"<----notif message")
    handleNewChat(data['ticket_id'], data['msg'])
    if ("vibrate" in navigator) {
        // vibration API supported
        navigator.vibrate([500, 250, 500]);
    }
    audio.play();
})

socket.on('msg2agent', (data) => {
    // console.log(data)
    if (data['uuid'] == $('#activeEmail').text()) {
        var customerName = $('#activeName').text()
        var customerAvatar = $('#activeAva').attr('src')
        messages.addMessage({
            text: data['msg'],
            type: 'received',
            name: customerName,
            avatar: customerAvatar,
            image: null,
            textFooter: $('#timeMsg').text()
        })
        $$('.page-content').scrollTop($('.messages').get(0).scrollHeight, 600);
    }
})

socket.on('msgMedia2agent', (data) => {
    if (data['uuid'] == $('#activeEmail').text()) {
        var customerName = $('#activeName').text()
        var customerAvatar = $('#activeAva').attr('src')
        messages.addMessage({
            text: data['msg'],
            type: 'received',
            name: customerName,
            avatar: customerAvatar,
            image: data['url'] ? `<img src="${data['url']}" style="max-width: 250px;" />` : null,
            textFooter: $('#timeMsg').text()
        })
        $$('.page-content').scrollTop($('.messages').get(0).scrollHeight, 600);
    }
})