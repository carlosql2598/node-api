const mysql = require('mysql');
const port = require('./constantes');
// mysql://b2de383794b057:b5837737@us-cdbr-east-03.cleardb.com/heroku_f79b6a9307229c1?
const coneccion = mysql.createConnection({
    host:  port.hostPro,
    user: port.userProd,
    password: port.passwordProd,
    database: port.databaseProd
});

coneccion.connect( error => {
    if(error) throw error;
    console.log('Conexión exitosa con la BD');
})

module.exports = coneccion;