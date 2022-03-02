let lastOrder = [
    {
        order_id: '#mit64on27',
        order_date: 'July 5, 2021, 5:55 p.m',
        order_kurir: 'J&T Express EZ',
        order_id_tracking: '',
        order_method: 'BCA',
        order_receipt: null,
        order_status: 'RECEIVED',
        buyer_name: 'Randi Mudahar',
        buyer_address: 'Rukan Permata Senayan',
        buyer_telp: '21123456',
        buyer_notes: null,
        product: [],
        total_belanja: 'Rp. 25,000',
        biaya_pengiriman: 'Rp. 9,000',
        kode_unik: 'Rp. 406',
        total_pembayaran: 'Rp. 59,406'
    },
    {
        order_id: '#mit23930',
        order_date: 'July 4, 2021, 2:55 p.m',
        order_kurir: 'Anter Aja',
        order_id_tracking: 'orderid2390',
        order_method: 'BCA',
        order_receipt: 'https://2.bp.blogspot.com/-V2_Yq80NcZ0/V_YY6RWiD6I/AAAAAAAAJWk/AXqPe0li3YQTKbjJ0l5k4S6TAMfRKBwZgCLcB/s1600/AWAS%2521%2521-Penipuan-Berkedok-Transfer-Rekening-BCA-2.jpg',
        order_status: 'DELIVERED',
        buyer_name: 'Irvan Smith',
        buyer_address: 'Pakubuwono Residence',
        buyer_telp: '62823456',
        buyer_notes: 'semoga cepat sampai',
        product: [
            {
                img: '../assets/product1.png',
                name: 'Batiste HairMist',
                size: '250ml',
                variant: 'Apple Green',
                qty: 1,
                harga_satuan: 'Rp. 25,000',
                harga_total: 'Rp. 25,000',
            },
            {
                img: '../assets/product3.png',
                name: 'Batiste HairMist',
                size: '450ml',
                variant: 'Lotus Purple',
                qty: 1,
                harga_satuan: 'Rp. 35,000',
                harga_total: 'Rp. 35,000',
            }
        ],
        total_belanja: 'Rp. 60,000',
        biaya_pengiriman: 'Rp. 9,000',
        kode_unik: 'Rp. 406',
        total_pembayaran: 'Rp. 69,406'
    },
    {
        order_id: '#mit5392',
        order_date: 'July 3, 2021, 3:55 p.m',
        order_kurir: 'J&T Express EZ',
        order_id_tracking: null,
        order_method: 'BCA',
        order_receipt: '',
        order_status: 'CANCELED',
        buyer_name: 'Kate Johnson',
        buyer_address: 'Setiabudi',
        buyer_telp: '',
        buyer_notes: null,
        product:
            [
                {
                    img: '../assets/product1.png',
                    name: 'Batiste HairMist',
                    size: '500ml',
                    variant: 'Apple Green',
                    qty: 2,
                    harga_satuan: 'Rp. 25,000',
                    harga_total: 'Rp. 50,000'
                }
            ],
        total_belanja: 'Rp. 25,000',
        biaya_pengiriman: 'Rp. 9,000',
        kode_unik: 'Rp. 406',
        total_pembayaran: 'Rp. 59,406'
    },
]

// let lastOrder;
// $.ajax({
//     url: '',
//     type: 'POST',
//     async: true,
//     contentType: "application/json; charset=utf-8",
//     data: JSON.stringify({}),
//     dataType: "json",
//     beforeSend: function () {
//         app.dialog.progress('Loading last order..');
//     },
//     success: function (result) {
//         lastOrder = result['data']
//         app.dialog.close()
//     }
// })

function showBukti(orderid) {
    if (lastOrder[orderid].order_receipt == null || lastOrder[orderid].order_receipt == '') {
        app.dialog.alert('Belum ada bukti pembayaran')
    } else {
        app.photoBrowser.create({
            photos: [
                {
                    url: lastOrder[orderid].order_receipt,
                }
            ],
            // theme: 'dark'
        }).open();
    }
}

function downloadBukti(orderid) {
    if (lastOrder[orderid].order_receipt == null || lastOrder[orderid].order_receipt == '') {
        app.dialog.alert('Belum ada bukti pembayaran')
    } else {
        app.popup.close()
        app.dialog.preloader('Downloading image...');
        $$('.popup-order').on('popup:closed', function (e) {   
            let urlToSend = lastOrder[orderid].order_receipt;
            let req = new XMLHttpRequest();
            req.open("GET", urlToSend, true);
            req.responseType = "blob";
            req.onload = function (event) {
                let blob = req.response;
                let fileName = lastOrder[orderid].order_id + '_BuktiPembayaran' //define file name
                let link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
            };

            req.send();
            setTimeout(function () {
                app.dialog.close()
            }, 3000);
        });
    }
}

function getListOrder() {
    $('#lastOrderList').empty();
    for (let ido = 0; ido < lastOrder.length; ido++) {
        $('#lastOrder').show()
        let appendOrder = `<a href="#" id="detailOrder-${ido}" class="order-chip">
                                        <div class="chip chip-outline">
                                            <div class="chip-media">
                                                <i class="bi bi-info-circle-fill text-color-green"></i>
                                            </div>
                                            <div class="chip-label card-details-info" id="orderID">No.Pesanan ${lastOrder[ido].order_id}</div>
                                        </div>
                                    </a>`
        $(appendOrder).appendTo('#lastOrderList');
        $(`#detailOrder-${ido}`).on('click', function () {
            let orderStatus = ''
            if (lastOrder[ido].order_status == 'RECEIVED') {
                orderStatus = 'text-color-blue';
            } else if (lastOrder[ido].order_status == 'DELIVERED') {
                orderStatus = 'text-color-green';
            } else if (lastOrder[ido].order_status == 'CANCELED' || lastOrder[ido].order_status == 'EXPIRED') {
                orderStatus = 'text-color-red';
            } else {
                orderStatus = 'text-color-gray';
            }
            app.popup.create({
                content: `<div class="popup popup-order" style="overflow: auto; width: 800px; left: 45%">
                                    <div class="navbar">
                                        <div class="navbar-bg"></div>
                                        <div class="navbar-inner">
                                            <div class="left">
                                                <div class="title font-nunito-medium">Detail Pesanan</div>
                                            </div>
                                            <div class="right">
                                                <a class="popup-close">
                                                    <i class="bi bi-x-lg"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-color3" style="padding: 10px; margin-top: -16px; height: auto;">
                                        <p style="font-size: 20px">No. Pesanan <span class="text-color-orange">${lastOrder[ido].order_id}</span>
                                        </p>
                                        <p style="margin-top: -15px;" class="text-color-gray">Pesanan pada July 5, 2021, 5:55 p.m</p>
                                    </div>
                                    <div class="block row" style="margin-top: 5px;">
                                        <div class="col-100 large-33">
                                            <p class="font-nunito-bold">NAMA PEMBELI</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${lastOrder[ido].buyer_name}</p>
                                            <p class="font-nunito-bold">ALAMAT PENGIRIMAN</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${(lastOrder[ido].buyer_address == null || lastOrder[ido].buyer_address == '') ? 'Belum diisi' : lastOrder[ido].buyer_address}</p>
                                            <p class="font-nunito-bold">NOMOR TELEPON</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${(lastOrder[ido].buyer_telp == null || lastOrder[ido].buyer_telp == '') ? 'Belum diisi' : lastOrder[ido].buyer_telp}</p>
                                        </div>
                                        <div class="col-100 large-33">
                                            <p class="font-nunito-bold">KURIR PENGIRIMAN</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${lastOrder[ido].order_kurir}</p>
                                            <p class="font-nunito-bold">NOMOR TRACKING</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${(lastOrder[ido].order_id_tracking == null || lastOrder[ido].order_id_tracking == '') ? 'Belum diisi' : lastOrder[ido].order_id_tracking}</p>
                                            <p class="font-nunito-bold">CATATAN PEMBELI</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${(lastOrder[ido].buyer_notes == null || lastOrder[ido].buyer_notes == '') ? 'Belum diisi' : lastOrder[ido].buyer_notes}</p>
                                        </div>
                                        <div class="col-100 large-33">
                                            <p class="font-nunito-bold">METODE PEMBAYARAN</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">${lastOrder[ido].order_method}</p>
                                            <p class="font-nunito-bold">BUKTI PEMBAYARAN</p>
                                            <p style="margin-top: -8px;" class="text-color-gray">
                                                <a class="link text-color-orange" href="#" onclick="javascript:showBukti(${ido})" style="margin-right: 5px;">View</a>
                                                <a class="link" href="#" onclick="javascript:downloadBukti(${ido})">Download</a>
                                            </p>
                                            <p class="font-nunito-bold">STATUS</p>
                                            <p style="margin-top: -8px;" class="${orderStatus}">${lastOrder[ido].order_status}</p>
                                        </div>
                                    </div>

                                    <div class="data-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th class="label-cell">PRODUK</th>
                                                    <th class="numeric-cell">QTY</th>
                                                    <th class="label-cell">HARGA SATUAN</th>
                                                    <th class="numeric-only">HARGA TOTAL</th>
                                                </tr>
                                            <tbody id="listProduct">
                                               
                                            </tbody>
                                        </table>

                                        <div class="listPembayaran" style="height: auto; border: 1px solid #f1f1f1; text-align: right; padding-right: 90px;">
                                            <div class="row">
                                                <div class="col-75">
                                                    <p>TOTAL BELANJA</p>
                                                    <p>BIAYA PENGIRIMAN</p>
                                                    <p>KODE UNIK TRANSFER</p>
                                                </div>
                                                <div class="col-25">
                                                    <p><b>${lastOrder[ido].total_belanja}</b></p>
                                                    <p><b>${lastOrder[ido].biaya_pengiriman}</b></p>
                                                    <p><b>${lastOrder[ido].kode_unik}</b></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row listPembayaran" style="padding-right: 89px; text-align: right;">
                                            <div class="col-75">
                                                <p>TOTAL PEMBAYARAN</p>
                                            </div>
                                            <div class="col-25">
                                                <p class="text-color-blue"><b>${lastOrder[ido].total_pembayaran}</b></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>`,
            }).open();
            $('#listProduct').empty();
            if (lastOrder[ido].product.length != 0) {
                for (let ipr = 0; ipr < lastOrder[ido].product.length; ipr++) {
                    let appendProduct = `<tr>
                    <td class="label-cell">
                    <br>
                    <div class="row">
                    <div class="col-25">
                    <img src="${lastOrder[ido].product[ipr].img}" width="25" alt="">
                    </div>
                    <div class="col-75">
                    <h4 class="text-color-orange">${lastOrder[ido].product[ipr].name}</h4>
                    <p>Size: ${lastOrder[ido].product[ipr].size}</p>
                    <p>Variant: ${lastOrder[ido].product[ipr].variant}</p>
                    </div>
                    </div>
                    <br>
                    </td>
                    <td class="numeric-cell">${lastOrder[ido].product[ipr].qty}</td>
                    <td class="label-cell">${lastOrder[ido].product[ipr].harga_satuan}</td>
                    <td class="label-cell">${lastOrder[ido].product[ipr].harga_total}</td>
                    </tr>`
                    $(appendProduct).appendTo('#listProduct');
                }
            } else {
                $('.listPembayaran').hide()
                let noProduct = `<tr>
                <td>Belum ada produk</td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`
                $(noProduct).appendTo('#listProduct');
            }

        })

    }
    var iconTooltip = app.tooltip.create({
        targetEl: '.order-chip',
        text: 'Click to preview',
    });
}