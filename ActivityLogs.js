document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementById('outter-block').style.visibility="hidden";
    } else if (state == 'complete') {
        setTimeout(function(){
            document.getElementById('interactive');
            document.getElementById('load').style.visibility="hidden";
            document.getElementById('outter-block').style.visibility="visible";
        },1000);
    }
}
'use strict';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sqlite/salon.db');
db.serialize(function(){
    var flag=0, flag1=0;
    db.all("select strftime('%Y',sl.SERVICE_DATE) as year, SUM(sd.SERVICE_RATE) as income from servicelog sl, SERVICEDONE sd  WHERE sl.ser_ID = sd.SERLOG_ID  group by strftime('%Y',sl.SERVICE_DATE) order by strftime('%Y',sl.SERVICE_DATE) asc",
        [],function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        rows.forEach((row) => {
            var output ='<tr data-href1><td>'+row.year +'</td><td>&#8377;'+row.income+'</td><tr>'
            $('#year-table').append(output);
            flag=1;
        });
        if(flag==0){
            var error='<span class="no-data">No Data<span>';
            $('#year-table').append(error);
        }
    });
    db.all("select strftime('%Y',pl.PURCHASE_DATE) as year, SUM(pd.PRODUCT_RATE*pd.PRODUCT_QUANTITY) as income from PRODUCTLOG pl, PRODUCTSOLD pd  WHERE pl.pro_ID = pd.PROLOG_ID  group by strftime('%Y',pl.PURCHASE_DATE) order by strftime('%Y',pl.PURCHASE_DATE) asc",
        [],function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        rows.forEach((row) => {
            var output ='<tr data-hrefp1><td>'+row.year+'</td><td>&#8377;'+row.income+'</td><tr>'
            $('#year-table-p').append(output);
            flag1=1;
        });
        if(flag1==0){
            var error='<span class="no-data">No Data<span>';
            $('#year-table-p').append(error);
        }
    });
});
function run1(year) {
    db.serialize(function(){
        db.all("select strftime('%Y-%m',sl.SERVICE_DATE) as month, count(distinct(sl.ser_id)) as clients, SUM(sd.SERVICE_RATE) as income from servicelog sl, SERVICEDONE sd  WHERE sl.ser_ID = sd.SERLOG_ID and strftime('%Y',sl.SERVICE_DATE) = ? group by strftime('%Y-%m',sl.SERVICE_DATE) order by strftime('%Y-%m',sl.SERVICE_DATE)",
            [year],function(err, rows) {
            if (err) {
                return console.error(err.message);
            }
            rows.forEach((row) => {
                var output ='<tr data-href2><td>'+row.month+'</td><td>'+row.clients+'</td><td>&#8377;'+row.income+'</td><tr>'
                $('#month-table').append(output);
            });
        });
    });
}
function runp1(year) {
    db.serialize(function(){
        db.all("select  strftime('%Y-%m',pl.purchase_DATE) as month, count(distinct(pl.pro_id)) as clients, SUM(pd.product_RATE*pd.PRODUCT_QUANTITY) as income from productlog pl, productsold pd  WHERE pl.pro_ID = pd.proLOG_ID and strftime('%Y',pl.purchase_DATE) = ? group by strftime('%Y-%m',pl.purchase_DATE) order by strftime('%Y-%m',pl.purchase_DATE)",
            [year],function(err, rows) {
            if (err) {
                return console.error(err.message);
            }
            rows.forEach((row) => {
                var output ='<tr data-hrefp2><td>'+row.month+'</td><td>'+row.clients+'</td><td>&#8377;'+row.income+'</td><tr>'
                $('#month-table-p').append(output);
            });
        });
    });
}
function run2(month) {
    db.serialize(function(){
        db.all("select strftime('%Y-%m-%d',sl.SERVICE_DATE) as day, count(distinct(sl.ser_id)) as clients, SUM(sd.SERVICE_RATE) as income from servicelog sl, SERVICEDONE sd  WHERE sl.ser_ID = sd.SERLOG_ID and strftime('%Y-%m',sl.SERVICE_DATE) = ? group by strftime('%Y-%m-%d',sl.SERVICE_DATE) order by strftime('%Y-%m-%d',sl.SERVICE_DATE)",
            [month],function(err, rows) {
            if (err) {
                return console.error(err.message);
            }
            rows.forEach((row) => {
                var output ='<tr data-href3><td>'+row.day+'</td><td>'+row.clients+'</td><td>&#8377;'+row.income+'</td><tr>'
                $('#day-table').append(output);
            });
        });
    });
}
function runp2(month) {
    db.all("select  strftime('%Y-%m-%d',pl.PURCHASE_DATE) as day, count(distinct(pl.pro_id)) as clients, SUM(pd.product_RATE*pd.product_quantity) as income from productlog pl, productsold pd  WHERE pl.pro_ID = pd.proLOG_ID and strftime('%Y-%m',pl.PURCHASE_DATE) = ? group by strftime('%Y-%m-%d',pl.PURCHASE_DATE) order by strftime('%Y-%m-%d',pl.PURCHASE_DATE)",
        [month],function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        rows.forEach((row) => {
            var output ='<tr data-hrefp3><td>'+row.day+'</td><td>'+row.clients+'</td><td>&#8377;'+row.income+'</td><tr>'
            $('#day-table-p').append(output);
        });
    });
}
function run3(day) {
    db.all("select sl.ser_id as id, sl.service_provider as serPro, sl.client_name as clnm from servicelog sl WHERE  strftime('%Y-%m-%d',sl.SERVICE_DATE) = ?",
        [day],function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        var flag=0;
        rows.forEach((row) => {
            db.all("select service_name, service_rate from servicedone where serlog_id = ?",
                [row.id],function(err, rows1) {
                if (err) {
                    return console.error(err.message);
                }
                var totalAmount=0;
                var cnt = 0;
                var serviceName= new Array();
                var servicePrice= new Array();
                rows1.forEach((row1) => {
                    serviceName[cnt]= row1.service_name;
                    servicePrice[cnt]= row1.service_rate;
                    totalAmount = totalAmount+row1.service_rate;
                    cnt++;
                });
                var output ='<tr><td>'+row.serPro+'</td><td>'+row.clnm+'</td><td>&#8377;'+totalAmount+'</td><td class="the_dropdown">check here'+
                '<table class="client-service"><tr><th>SERVICE</th><th>RATE</th></tr></td><tr>'
                $('#client-table').append(output);
                for(var i=0;i<cnt;i++){
                    var output2 ='<tr><td>'+serviceName[i]+'</td><td>&#8377;'+servicePrice[i]+'</td></tr>'
                    $('.client-service:last').append(output2);
                }
            });
            flag=1;
        });
        if(flag==0){
            var error='<span class="no-data">No Data For This Day<span>';
            $('#client-table').append(error);
        }
    });
}
function runp3(day) {
    db.all("select pl.pro_id as id, pl.client_name as clnm from productlog pl WHERE  strftime('%Y-%m-%d',pl.purchase_DATE) = ?",
        [day],function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        var flag=0;
        rows.forEach((row) => {
            db.all("select product_name, product_rate, product_quantity from productsold where prolog_id = ?",
                [row.id],function(err, rows1) {
                if (err) {
                    return console.error(err.message);
                }
                var totalAmount=0;
                var productName = new Array();
                var productPrice = new Array();
                var productQuantity = new Array();
                var cnt = 0;
                rows1.forEach((row1) => {
                    productName[cnt]= row1.product_name;
                    productPrice[cnt]= row1.product_rate;
                    productQuantity[cnt]= row1.product_quantity;
                    var subTot = productPrice[cnt]*productQuantity[cnt];
                    totalAmount = totalAmount + subTot;
                    cnt++;
                });
                var output ='<tr><td>'+row.clnm+'</td><td>&#8377;'+totalAmount+'</td><td class="the_dropdown">check here'+
                '<table class="client-service-p"><tr><th>PRODUCT</th><th>RATE</th><th>QUANTITY</th></tr></td><tr>'
                $('#client-table-p').append(output);
                for(var i=0;i<cnt;i++){
                    var output2 ='<tr><td>'+productName[i]+'</td><td>&#8377;'+productPrice[i]+'</td><td>'+productQuantity[i]+'</td></tr>'
                    $('.client-service-p:last').append(output2);
                }
            });
            flag=1;
        });
        if(flag==0){
            var error='<span class="no-data">No Data For This Day<span>';
            $('#client-table-p').append(error);
        }
    });
}
// async function runTot(day) {
//     let connection;
//     let flag=0;
//     var ser_tot=0;
//     var pro_tot=0;
//     var g_tot=0;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         let result = await connection.execute(
//             `select  SUM(sd.SERVICE_RATE) from servicelog sl, SERVICEDONE sd  WHERE sl.ID = sd.SERLOG_ID and to_CHAR(sl.SERVICE_DATE,'YYYY-MM-DD') = :day`,
//             [day],
//             {
//                 resultSet: true // return a ResultSet (default is false)
//             }
//         );
//         const rs = result.resultSet;
//         let row;
//         if ((row = await rs.getRow())) {
//             ser_tot = row[0];
//         }
//         await rs.close();
//         let result1 = await connection.execute(
//             `select  SUM(pd.product_RATE*pd.product_quantity) from productlog pl, productsold pd  WHERE pl.ID = pd.proLOG_ID and to_CHAR(pl.purchase_DATE,'YYYY-MM-DD') = :day`,
//             [day],
//             {
//                 resultSet: true // return a ResultSet (default is false)
//             }
//         );
//         const rs1 = result1.resultSet;
//         let row1;
//         if ((row1 = await rs1.getRow())) {
//             pro_tot = row1[0];
//         }
//         await rs1.close();
//         g_tot=ser_tot+pro_tot;
//         $('#day-tot').html("<span>Total Income: &#8377;"+g_tot+"<span>");
//         $('#outter-block').css("padding-bottom","12px");
//         $('footer p').css("padding-top","13px");
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//         try {
//             await connection.close();
//         } catch (err) {
//             console.error(err);
//         }
//         }
//     }
// }
$(document.body).on("click","tr[data-href1]", function () {
    var year = $(this).find('td:first').html();
    var yearResponse = '<div id="month-list">'+
    '<h1>Services done in Year:'+year+'</h1>'+
    '<div class="table-content"><table class="table-body" id="month-table">'+
    '<tr><th>MONTH</th><th>CLIENTS</th><th>INCOME</th></tr>'+
    '</table></div></div>'
    $('#resp').html(yearResponse);
    run1(year);
});
$(document.body).on("click","tr[data-href2]", function () {
    var month = $(this).find('td:first').html();
    var monthResponse = '<div id="day-list">'+
    '<h1>Services done in month:'+month+'</h1>'+
    '<div class="table-content"><table class="table-body" id="day-table">'+
    '<tr><th>DAY</th><th>CLIENTS</th><th>INCOME</th></tr>'+
    '</table></div></div>'
    $('#resp').html(monthResponse);
    run2(month);
});
$(document.body).on("click","tr[data-href3]", function () {
    var day = $(this).find('td:first').html();
    var dayResponse = '<div id="client-list">'+
    '<h1>Services done on: '+day+'</h1>'+
    '<div class="table-content"><table class="table-body" id="client-table">'+
    '<th>SERVICE PROVIDER</th><th>CLIENT NAME</th><th>TOTAL AMOUNT</th><th>SERVICES DONE</th>'+
    '</table></div></div>'
    $('#resp').html(dayResponse);
    run3(day);
});
$("#serSubmit").click(function () {
    var date = $("#serDate").val();
    if(date===""){
        alert("Please Select a date");
    }else{
        var d = new Date(date);
        var month = ('0' + (d.getMonth()+1)).slice(-2);
        var datee =d.getFullYear()+"-"+month+"-"+('0'+ d.getDate()).slice(-2);
        var dayResponse_s = '<div id="client-list">'+
        '<h1>Services done on: '+datee+'</h1>'+
        '<div class="table-content"><table class="table-body" id="client-table">'+
        '<th>SERVICE PROVIDER</th><th>CLIENT NAME</th><th>TOTAL AMOUNT</th><th>SERVICES DONE</th>'+
        '</table></div></div>'
        var dayResponse_p = '<div id="client-list-p">'+
        '<h1>Products Purchased on: '+datee+'</h1>'+
        '<div class="table-content"><table class="table-body" id="client-table-p">'+
        '<th>CLIENT NAME</th><th>TOTAL AMOUNT</th><th>PRODUCTS SOLD</th>'+
        '</table></div></div>'
        $('#resp').html(dayResponse_s);
        $('#resp-p').html(dayResponse_p);
        run3(datee);
        runp3(datee);
        // runTot(datee);
    }
});
$(document.body).on("click","tr[data-hrefp1]", function () {
    var year = $(this).find('td:first').html();
    var yearResponse = '<div id="month-list-p">'+
    '<h1>Products Sold in Year:'+year+'</h1>'+
    '<div class="table-content"><table class="table-body" id="month-table-p">'+
    '<tr><th>MONTH</th><th>CLIENTS</th><th>INCOME</th></tr>'+
    '</table></div></div>'
    $('#resp-p').html(yearResponse);
    runp1(year);
});
$(document.body).on("click","tr[data-hrefp2]", function () {
    var month = $(this).find('td:first').html();
    var monthResponse = '<div id="day-list-p">'+
    '<h1>Products Sold in month:'+month+'</h1>'+
    '<div class="table-content"><table class="table-body" id="day-table-p">'+
    '<tr><th>DAY</th><th>CLIENTS</th><th>INCOME</th></tr>'+
    '</table></div></div>'
    $('#resp-p').html(monthResponse);
    runp2(month);
});
$(document.body).on("click","tr[data-hrefp3]", function () {
    var day = $(this).find('td:first').html();
    var dayResponse = '<div id="client-list-p">'+
    '<h1>Products Purchased on: '+day+'</h1>'+
    '<div class="table-content"><table class="table-body" id="client-table-p">'+
    '<th>CLIENT NAME</th><th>TOTAL AMOUNT</th><th>PRODUCTS SOLD</th>'+
    '</table></div></div>'
    $('#resp-p').html(dayResponse);
    runp3(day);
});
