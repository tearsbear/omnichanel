// Init Left Panel Menu
const panelMenu = app.panel.create({
    el: '.panel-menu',
    visibleBreakpoint: 80,
})

var pickDate = app.calendar.create({
    inputEl: '#analyticsDate',
    rangePicker: true,
    dateFormat:'yyyy-mm-dd',
    footer: true,
});

//pickDate.setValue([new Date(), new Date()])

let agentemail = $('#agentEmail').val();

$('#changeDate').on('click', function () {
    let selectedDate = $('#analyticsDate').val();
    getChartData(selectedDate);
    getAgentProp(selectedDate);
    //change data based on selected date
    // ...
})

// Animate count data for overview
$('.counter-overview').each(function () {
    $(this).prop('Counters', 0).animate({
        Counters: $(this).data('value')
    }, {
        duration: 400,
        easing: 'swing',
        step: function (now) {
            $(this).html(this.Counters.toFixed(0) + ' tickets');
        },
        complete: function() {
            $('.counter-average').each(function () {
                $(this).prop('Counter', 0).animate({
                    Counter: $(this).data('value')
                }, {
                    duration: 400,
                    easing: 'swing',
                    step: function (now) {
                        if ($(this).attr('data-text') == 'hours') {
                            $(this).html(this.Counter.toFixed(2) + ' ' + $(this).attr('data-text'));
                        } else {
                            $(this).html(this.Counter.toFixed(0) + ' ' + $(this).attr('data-text'));
                        }
                    }
                });
            });
          }
    });
});

//Init Apex Chart
var initChart = {
    colors: ['#4cd964', '#ff3b30'],
    series: [],
    chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        zoom: {
            enabled: false
        },
        background: 'transparent'
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    grid: {
        row: {
            opacity: 0.5
        },
    },
    tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        }
    },
    noData: {
        text: 'No Data'
      }
};

var chart = new ApexCharts(document.querySelector("#chart"), initChart);
chart.render();


let botname = $('#botname').text()
let limit = 5; //default minimal limit per page
let start = 0; //default start for pagination
let tableData; //define table data array
let step = 0; //get number of step for next data

//Handler filter search data table
function tableSearch(data, val) {
    return $.grep(data, function (el, i) {
        return ((el.ticket_id != null && el.ticket_id != '' && el.ticket_id.toLowerCase().indexOf(val) != -1) ||
            (el.chatkey != null && el.chatkey != '' && el.chatkey.toLowerCase().indexOf(val) != -1) ||
            (el.queue_time != null && el.queue_time != '' && el.queue_time.toLowerCase().indexOf(val) != -1) ||
            (el.status != null && el.status != '' && el.status.toLowerCase().indexOf(val) != -1) ||
            (el.notes != null && el.notes != '' && el.notes.toLowerCase().indexOf(val) != -1));
    });
}

//Update table for next or previous page
function updateTable(from, perview) {
    $('#dataAgent').empty();
    let start_range = 1 + from;
    let end_range = from + parseInt($("#valPage").val());

    if (end_range > tableData.length) {
        $('#dataRange').text(`${start_range} - ${tableData.length}`)
    } else {
        $('#dataRange').text(`${start_range} - ${end_range}`)
    }
    
    for (let id = 0; id < perview; ++id) {
        try {
            let idt = id + from;
            let appendData = `<tr class="listSearch">
            <td class="label-cell">${(tableData[idt].ticket_id == null || tableData[idt].ticket_id == '') ? '-' : tableData[idt].ticket_id}</td>
            <td class="label-cell">${(tableData[idt].chatkey == null || tableData[idt].chatkey == '') ? '-' : tableData[idt].chatkey}</td>
            <td class="label-cell">${(tableData[idt].queue_time == null || tableData[idt].queue_time == '') ? '-' : tableData[idt].queue_time}</td>
            <td class="label-cell">${(tableData[idt].status == null || tableData[idt].status == '') ? '-' : tableData[idt].status}</td>
            <td class="label-cell">${(tableData[idt].notes == null || tableData[idt].notes == '') ? '-' : tableData[idt].notes}</td>
            </tr>`
            $(appendData).appendTo('#dataAgent');
        } catch (e) {
            console.log('data is less than the selected limit per page')
            break;
        }
    }
}

//Fill table for the first page
function fillTable(number) {
    $('#dataAgent').empty();
    $('#dataTotal').text(tableData.length);
    $("#prevData").addClass('disabled');
    for (idl = 0; idl < number; idl++) {
        try {
            let appendData = `<tr>
            <td class="label-cell">${(tableData[idl].ticket_id == null || tableData[idl].ticket_id == '') ? '-' : tableData[idl].ticket_id}</td>
            <td class="label-cell">${(tableData[idl].chatkey == null || tableData[idl].chatkey == '') ? '-' : tableData[idl].chatkey}</td>
            <td class="label-cell">${(tableData[idl].queue_time == null || tableData[idl].queue_time == '') ? '-' : tableData[idl].queue_time}</td>
            <td class="label-cell">${(tableData[idl].status == null || tableData[idl].status == '') ? '-' : tableData[idl].status}</td>
            <td class="label-cell">${(tableData[idl].notes == null || tableData[idl].notes == '') ? '-' : tableData[idl].notes}</td>
            </tr>`
            $(appendData).appendTo('#dataAgent');
        } catch (e) {
            break;
        }
    }
    

    if (number < tableData.length) {
        $("#nextData").removeClass('disabled');
    } else {
        $("#nextData").addClass('disabled');
    }
}

//get agent data from API
function getAgentData(daterange) {
    $('#dataAgent').empty()
    $.ajax({
        url: '/analytics/' + botname,
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname: botname,
            agentemail: "",
            data_type: "table",
            daterange:daterange
        }),
        dataType: "json",
        beforeSend: function () {
            app.dialog.progress('Loading list ticket..');
        },
        success: function (result) {
            
            tableData = result['data']
            step = tableData.length - limit;
            fillTable(limit)
            if (tableData.length < 5) {
                $('#dataRange').text(`1 - ${tableData.length}`)
            }
            app.dialog.close()
        }
    }); //end ajax request
}

// get chart data
function getChartData(daterange){
    $.ajax({
        url: '/analytics/'+botname,
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname : botname,
            agentemail : "",
            data_type:"chart",
            daterange:daterange
        }),
        dataType: "json",
        beforeSend: function() {
            app.dialog.progress('Loading chart ticket..');
         },
        success: function (result) {
            chart.updateSeries([
                {
                name: 'Solved',
                data: result['data']['solved']
              },
              {
                name: 'Bounced',
                data: result['data']['bounced']
              },
            ])
            getAgentData(daterange)
            app.dialog.close()
        }
    })
}
function getAgentProp(daterange){
    $.ajax({
        url: '/analytics/'+botname,
        type: 'POST',
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            botname : botname,
            agentemail : "",
            data_type:"propdate",
            daterange:daterange
        }),
        dataType: "json",
        beforeSend: function() {
            app.dialog.progress('Loading selected analytics..');
         },
        success: function (result) {
            let result_data = result['data']
            if (result_data['data'].length == 0){
                $('#countTickets').val(0)
                $('#countTickets').text('0 tickets')
                
                $('#countSession').val(0)
                $('#countSession').text('0 hours')
            }else{
                for (idx = 0; idx < result_data['data'].length; idx++) {
                    $('#countTickets').val(result_data['data'][idx]['total_ticket'])
                    $('#countTickets').text(result_data['data'][idx]['total_ticket']+' tickets')
                    
                    $('#countSession').val(result_data['data'][idx]['handle_avg_time'])
                    $('#countSession').text(result_data['data'][idx]['handle_avg_time']+' hours')
                }
            }
            app.dialog.close()
        }
    })
}

getChartData($('#analyticsDate').val())

//Handler if select input per page is changed
$("#valPage").change(function () {
    limit = $("#valPage").val();
    start = 0;
    step = tableData.length - limit;
    if (limit > tableData.length) {
        fillTable(tableData.length)
        $('#dataRange').text(`1 - ${tableData.length}`)
    } else {
        fillTable(limit)
        $('#dataRange').text(`1 - ${limit}`)
    }
});

//Handler search data table on input
$("#searchData").on('input', function () {
    $('.searchbar-disable-button').hide();
    $("#prevData").addClass('disabled');
    $("#nextData").addClass('disabled');
    $("#valPage").addClass('disabled');

    let getVal = $(this).val();
    let result = tableSearch(tableData, getVal)

    if (result.length != 0 && getVal != '') {
        $('.searchbar-not-found').hide();
        $('#dataAgent').empty();
        for (idr = 0; idr < result.length; idr++) {
            try {
                let findData = `<tr>
                <td class="label-cell">${(result[idr].ticket_id == null || result[idr].ticket_id == '') ? '-' : result[idr].ticket_id}</td>
                <td class="label-cell">${(result[idr].chatkey == null || result[idr].chatkey == '') ? '-' : result[idr].chatkey}</td>
                <td class="label-cell">${(result[idr].queue_time == null || result[idr].queue_time == '') ? '-' : result[idr].queue_time}</td>
                <td class="label-cell">${(result[idr].status == null || result[idr].status == '') ? '-' : result[idr].status}</td>
                <td class="label-cell">${(result[idr].notes == null || result[idr].notes == '') ? '-' : result[idr].notes}</td>
                </tr>`
                $(findData).appendTo('#dataAgent');
            } catch(e) {
                $('.searchbar-not-found').show();
                break;
            }
        }
    } else if ($('#searchData').val() == '') {
        $('.searchbar-not-found').hide();
        fillTable(limit)
        $("#nextData").removeClass('disabled');
        $("#valPage").removeClass('disabled');
        $('.searchbar-disable-button').show();
    } else {
        $('#dataAgent').empty();
        $('.searchbar-not-found').show();
    }
});

//Handler if next data pagination is clciked
$("#nextData").on('click', function () {
    start += parseInt($("#valPage").val());
    if (start < step) {
        updateTable(start, limit)
        $("#prevData").removeClass('disabled');
    } else {
        $("#nextData").addClass('disabled');
        $("#prevData").removeClass('disabled');
        updateTable(start, limit)
    }
});

//Handler if previous data pagination is clciked
$("#prevData").click(function () {
    start -= parseInt($("#valPage").val());
    if (start != 0) {
        updateTable(start, limit)
        $("#prevData").removeClass('disabled');
        $("#nextData").removeClass('disabled');
    } else {
        $("#prevData").addClass('disabled');
        $("#valPage").removeClass('disabled');
        $("#nextData").removeClass('disabled');
        updateTable(start, limit)
    }
});

socket.on('notif', (data) => {
    // console.log(data ,"<----notif message")
    // handleNewChat(data['ticket_id'], data['msg'])
    if ("vibrate" in navigator) {
        // vibration API supported
        navigator.vibrate([500, 250, 500]);
    }
    audio.play();
})
