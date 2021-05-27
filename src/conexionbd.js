const mysql = require('mysql');
const port = require('./constantes');
// mysql://b2de383794b057:b5837737@us-cdbr-east-03.cleardb.com/heroku_f79b6a9307229c1?
const dbconfig = {
    host:  port.hostPro,
    user: port.userProd,
    password: port.passwordProd,
    database: port.databaseProd
};

function connectToDatabase(){

    let coneccion = mysql.createConnection(dbconfig);

    coneccion.connect( error => {
        if(error) throw error;
        console.log('Conexión exitosa con la BD');
    });

    coneccion.on('error', (err) => {
        console.log('Error connecting to the database');
        console.log(err.code + ' : ' + err.message);
        setTimeout(connectToDatabase, 3000);
    });

    return coneccion;
}

let coneccion = connectToDatabase();
module.exports = coneccion;