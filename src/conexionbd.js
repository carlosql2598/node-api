const mysql = require('mysql');

const coneccion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bdcapstone'
});

coneccion.connect( error => {
    if(error) throw error;
    console.log('Conexión exitosa con la BD');
})

module.exports = coneccion;