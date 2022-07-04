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
let remote = require('electron').remote;
let dialog = remote.dialog;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sqlite/salon.db');
'use strict';
// const oracledb = require('oracledb');
// const dbConfig = require('./dbconfig.js');
// async function run() {
//     let connection;
//     try {
//         // Get a non-pooled connection
//         connection = await oracledb.getConnection(dbConfig);
//         let result = await connection.execute(
//             `select name from staff`,
//             [],
//             {
//                 resultSet: true // return a ResultSet (default is false)
//             }
//         );
//         const rs = result.resultSet;
//         let row;
//         while ((row = await rs.getRow())) {
//             var option = document.createElement('option');
//             option.innerHTML = row[0]; 
//             document.getElementById("serviceProvider").appendChild(option);
//         }
//         await rs.close();
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// }
// run();
db.serialize(function(){
    db.all("SELECT name FROM staff ", function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        rows.forEach(element => {
            var option = document.createElement('option');
            option.innerHTML = element.name; 
            document.getElementById("serviceProvider").appendChild(option);
        });
    });
})
var servicePrice = new Array();
var serviceName = new Array();
var totalAmount = 0;
var scnt = 2;
$("#addMore").click(function (){
    var tr = $("#tr-list").clone();
    tr.children('td:first').text(scnt++);
    tr.appendTo("#service-list").find("input").val("");
    $("#service-list").scrollTop(tr.position().top);
    totalAmount = 0;
    $("#totalAmount").html("00");
});
$("#calcTot").click(function (){
    totalAmount = 0;
    $("input.servicesPrice").each(function (index){
        servicePrice[index] =  parseInt($(this).val());
        totalAmount = totalAmount + servicePrice[index];
    });
    $("input.servicesDone").each(function (index){
        serviceName[index] =  $(this).val();
    });
    if(totalAmount>0||!isNaN(totalAmount)){
        $("#totalAmount").html(totalAmount);
    }else{
        totalAmount = 0;
        $("#totalAmount").html("00");
        dialog.showMessageBox({message:"Invalid Quantity or Rate",title:"Error Message"},()=>{});
    }
});
$("#serviceBill").click(function(){
    var serviceProvider = $('#serviceProvider').val();
    var clientName = $('#clientName').val();
    var serDate = $('#serviceDate').val();
    if(clientName===""|| serDate===""|| totalAmount===0){
        dialog.showMessageBox({message:"Please Enter All the Details",title:"Error Message"},()=>{});
    }else{
        var d = new Date(serDate);
        // const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        //     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // var serviceDate = d.getDate()+"-"+monthNames[d.getMonth()]+"-"+d.getFullYear();
        
        var serviceDate = d.getFullYear()+"-"+('0' + (d.getMonth()+1)).slice(-2) +"-"+('0' +(d.getDate())).slice(-2);
        // async function run1() {
        // try {
        //     connection = await oracledb.getConnection(dbConfig);
        //     let result = await connection.execute(
        //         `INSERT INTO SERVICELOG(SERVICE_PROVIDER,CLIENT_NAME,SERVICE_DATE) VALUES (:Sp, :cl,:sd)`,
        //         [serviceProvider, clientName,serviceDate],
        //         { autoCommit: true } 
        //     );
        //     for(var i=0; i<scnt-1; i++){
        //         let result1 = await connection.execute(
        //             `INSERT INTO servicedone VALUES((SELECT max(ID) FROM SERVICELOG),:sn,:sr)`,
        //             [serviceName[i],servicePrice[i]],
        //             { autoCommit: true } 
        //         );
        //     }
        //     var mes = "Thank You! Please don't forget to collect Rs. "+totalAmount+" from "+clientName;
        //     dialog.showMessageBox({message: mes,title:"Successfull Message"},()=>{});
        //     location.reload();
        // } catch (err) {
        //     console.error(err);
        // } finally {
        //     if (connection) {
        //     try {
        //         await connection.close();
        //     } catch (err) {
        //         console.error(err);
        //     }
        //     }
        // }
        // }
        // run1();
        db.serialize(function(){
            db.run("INSERT INTO SERVICELOG(SERVICE_PROVIDER,CLIENT_NAME,SERVICE_DATE) VALUES (?,?,?)",
                [serviceProvider, clientName,serviceDate], function(err) {
                if (err) {
                return console.log(err.message);
                }
                for(var i=0; i<scnt-1; i++){
                    db.run("INSERT INTO servicedone VALUES((SELECT max(ser_ID) FROM SERVICELOG),?,?)",
                    [serviceName[i],servicePrice[i]], function(err) {
                        if (err) {
                        return console.log(err.message);
                        }
                    });
                }
                var mes = "Thank You! Please don't forget to collect Rs. "+totalAmount+" from "+clientName;
                dialog.showMessageBox({message: mes,title:"Successfull Message"},()=>{});
                db.close();
                location.reload();
            });
        });
    }
});
