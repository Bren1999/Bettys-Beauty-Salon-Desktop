let remote = require('electron').remote;
let dialog = remote.dialog;
'use strict';
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
$(document).ready(function () {
    async function run() {
        let connection;
        var flag=0;
        try {
            // Get a non-pooled connection
            connection = await oracledb.getConnection(dbConfig);
            let result = await connection.execute(
                `select head from service group by head`,
                [],
                {
                    resultSet: true // return a ResultSet (default is false)
                }
            );
            const rs = result.resultSet;
            let row;
            while ((row = await rs.getRow())) {
                $('#ser-category').append('<option>'+row[0]+'</option>');
                var op='<h2 style="margin:2px">'+row[0]+'</h2><table class="listt"></table>';
                $('#ser-list').append(op);
                let result1 = await connection.execute(
                    `select name, rate from service where head = :hd`,
                    [row[0]],
                    {
                        resultSet: true // return a ResultSet (default is false)
                    }
                );
                const rs1 = result1.resultSet;
                let row1;
                while ((row1 = await rs1.getRow())) {
                    op1='<tr><td>'+row1[0]+'</td><td>&#8377;'+row1[1]+'</td><td class="btn edit-btn">Edit</td><td class="btn del-btn">Delete</td></tr>';
                    $('.listt:last').append(op1);
                }
                flag=1;
            }
            if(flag==0) {
                var op='<p id="empty-list">No Services Added!<br> Add Services</p>';
                $('#ser-list').html(op);
            }
            await rs.close();
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
            }
        }
    }
    run();
    $('#add-btn').click(function(){
        var head = $('#hdInp').val().capitalize();
        var name = $('#serInp').val().capitalize();
        var rate = $('#rteInp').val();
        if(head==""||name==""||rate==""){
            dialog.showMessageBox({message: "Empty Details",title:"Error!"},()=>{});
        }else{
            async function run1() {
                try {
                    connection = await oracledb.getConnection(dbConfig);
                    let result = await connection.execute(
                        `INSERT INTO service(head,name,rate) VALUES (:hd,:sr,:rt)`,
                        [head, name, rate],
                        {autoCommit: true} 
                    );
                    var mes = "Service Added!";
                    dialog.showMessageBox({message: mes,title:"Successfull Message"},()=>{});
                    location.reload();
                } catch (err) {
                    console.error(err);
                } finally {
                    if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                        console.error(err);
                    }
                    }
                }
            }
            run1();
        }
    });
    $(document.body).on("click",'.del-btn', function (){
        var head = $(this).parent().parent().prev().html();
        var name = $(this).siblings().html();
        async function run3() {
            try {
                connection = await oracledb.getConnection(dbConfig);
                let result = await connection.execute(
                    `DELETE FROM SERVICE WHERE HEAD = :HD AND NAME = :NM`,
                    [head, name],
                    {autoCommit: true} 
                );
                var mes = "Service Deleted!";
                dialog.showMessageBox({message: mes,title:"Successfull Message"},()=>{});
                location.reload();
            } catch (err) {
                console.error(err);
            } finally {
                if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
                }
            }
        }
        run3();
    });
    $(document.body).on("click",'.edit-btn', function (){
        var head = $(this).parent().parent().prev().html();
        var name = $(this).siblings().html();
        var number = $(this).prev().html().replace(/[^0-9]/gi, ''); 
        var op = '<h2>Edit Service</h2>'+
                '<form id="add-service">'+
                '<lable>Service:</lable>'+
                '<input id="ser" value='+name+' type="text">'+
                '<lable>Rate:</lable>'+
                '<input id="rte" value='+number+' type="number">'+
                '<span id="ed-btn" class="btn">Edit</span>'+
                '</form>'
        $('#block1').html(op);
        $(document.body).on("click",'#ed-btn', function (){
            var name1 = $('#ser').val();
            var rate1 = $('#rte').val();
            async function run4() {
                try {
                    connection = await oracledb.getConnection(dbConfig);
                    let result = await connection.execute(
                        `UPDATE SERVICE SET NAME = :NM, RATE = :RT WHERE HEAD = :HDM AND NAME = :NMM`,
                        [name1, rate1, head, name],
                        {autoCommit: true} 
                    );
                    var mes = "Service Edited!";
                    dialog.showMessageBox({message: mes,title:"Successfull Message"},()=>{});
                    location.reload();
                } catch (err) {
                    console.error(err);
                } finally {
                    if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                        console.error(err);
                    }
                    }
                }
            }
            run4();
        });
    });
});