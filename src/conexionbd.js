const mysql = require('mysql');
// mysql://b2de383794b057:b5837737@us-cdbr-east-03.cleardb.com/heroku_f79b6a9307229c1?
const coneccion = mysql.createConnection({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'b2de383794b057',
    password: 'b5837737',
    database: 'heroku_f79b6a9307229c1'
});

coneccion.connect( error => {
    if(error) throw error;
    console.log('Conexión exitosa con la BD');
})

module.exports = coneccion;