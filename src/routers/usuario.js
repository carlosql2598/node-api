const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const bcryptjs = require('bcryptjs');
const { check,validationResult } = require('express-validator');


router.post('/insertar', 
    [ 
        check('USU_EMAIL', 'La variable USU_EMAIL no tiene un formato válido.').normalizeEmail().isEmail(),
        check('USU_EMAIL', 'La variable USU_EMAIL debe ser mayor a 13 caracteres.').isLength({min:14}),
        check('USU_DNI', 'La variable USU_DNI debe ser igual a 8 caracteres.').isLength({min:8, max:8}),
        check('USU_ALIAS', 'La variable USU_ALIAS debe ser mayor a 7 caracteres.').isLength({min:8}),
        check('USU_CONTRASENIA', 'La variable USU_CONTRASENIA debe ser mayor a 7 caracteres.').isLength({min:8}),
    ],
    async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }
    
    let contraseniaHash = await bcryptjs.hashSync(req.body.USU_CONTRASENIA, 8);

    const {USU_NOMBRES,USU_DNI, USU_APELLIDOS,USU_EMAIL, USU_ALIAS, USU_DIRECCION,
        USU_SEXO,USU_FECH_NAC } = req.body;
    
    const USU_CONTRASENIA = contraseniaHash;

    const query = `CALL INSERT_USUARIO(?,?,?,?,?,?,?,?,?);`;
    
    mysql.query(query, [USU_NOMBRES,USU_DNI,USU_APELLIDOS, USU_EMAIL,USU_ALIAS,USU_DIRECCION,
        USU_SEXO,USU_FECH_NAC,USU_CONTRASENIA ], (err, rows, fields) => {
            if(!err){
                res.status(201).json({"status":201,"mensaje":"Solicitud exitosa."});
            }else{
                console.log(err);
                res.status(400).json({"status":400,"mensaje":"Hubo un error en la conexión con la BD."});
            }
    } )

});



// Iniciar sesión.
// revisar https://bcrypt-generator.com/
router.post('/login',  
    [ 
        check('USU_ALIAS', 'La variable USU_ALIAS debe ser mayor a 7 caracteres.').isLength({min:8}),
        check('USU_CONTRASENIA', 'La variable USU_CONTRASENIA debe ser mayor a 7 caracteres.').isLength({min:8}),
    ],
    async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const {USU_ALIAS, USU_CONTRASENIA} = req.body;

    let P_ENCRYPTED_CONTRASENIA = ""; // 0 significa que no se encontrarón sus credenciales, por lo tanto no es usuario de la app. 

    //const contraseniaHash = await bcryptjs.hashSync(USU_CONTRASENIA, 8);
    //let contraseniaHash = "$2a$08$QMMwjo4WWKdinZR3XcZP9.YAHkjzbR5mTuGQJoaG/BQSeqTSeg3CS";

    const query = 'CALL VALIDAR_USUARIO(?, @P_ENCRYPTED_CONTRASENIA);';
    const query2 = 'SELECT @P_ENCRYPTED_CONTRASENIA;';

    mysql.query(query, [USU_ALIAS], (err, result) => {
            if(!err){
                mysql.query(query2, (err, result) => {
                    if(!err){
                        console.log('result: ', result);
                        P_ENCRYPTED_CONTRASENIA = result[0]["@P_ENCRYPTED_CONTRASENIA"];
                        
                        // Bcrypt compara la contraseña enviada con la encriptda en la bd
                        if(bcryptjs.compareSync(USU_CONTRASENIA, P_ENCRYPTED_CONTRASENIA) == false){
                            res.status(400).json({"status":400,"mensaje":"Credenciales incorrectas o no existe el usuario."});
                        } else{
                            res.status(200).json({"status":200,"mensaje":"Las credenciales coinciden."});
                        }

                    }else{
                        res.status(500).json({"status":500,"mensaje":"Hubo un error con la consulta en la BD."});
                    }
                } )
            }else{
                res.status(500).json({"status":500,"mensaje":"Hubo un error con la consulta en la BD."});
            }
    } )


});

//LISTAR LOS PRODUCTOS ENTRE UN RANGO DE PRECIOS
router.get('/precios/:val1/:val2', 
    [ 
        check('val1', 'La variable val1 no es un numero').notEmpty().isInt(),
        check('val2', 'La variable val2 no es un numero').notEmpty().isInt()
    ],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        const {val1,val2} = req.params;
        
        const query = `select p.PRO_NOMBRE, p.PRO_PRECIO, p.PRO_STOCK, (select round(avg(c.CA_CALIFICACION),0) FROM calificaciones c where c.IDPRODUCTO = p.IDPRODUCTO) as calificacion 
		from producto p left join calificaciones c on (p.IDPRODUCTO = c.IDPRODUCTO) 
		group by p.IDPRODUCTO having p.PRO_PRECIO >= ? and p.PRO_PRECIO <= ?`;
        /* "select p.PRO_NOMBRE, (select round(avg(c.CA_CALIFICACION),0) FROM calificaciones c where c.IDPRODUCTO = p.IDPRODUCTO) as calificacion 
		    from calificaciones c inner join producto p on (c.IDPRODUCTO = p.IDPRODUCTO) group by p.PRO_NOMBRE"; */
        /* 'SELECT  P.IDPRODUCTO,  P.PRO_NOMBRE, P.PRO_DESCRIPCION, P.PRO_PRECIO, P.PRO_STOCK, '+
        'PRI.PRO_IMG ' +
        'FROM PRODUCTO P INNER JOIN PRODUCTO_IMG PRI ' +
        'ON P.IDPRODUCTO = PRI.IDPRODUCTO ' +
        'INNER JOIN CALIFICACIONES C ' +
        'ON P.IDPRODUCTO = C.IDPRODUCTO ' +
        'WHERE C.CA_CALIFICACION = ?;'; */
        

        mysql.query(query, [val1,val2], (err, rows) => {
            if(!err){
                res.status(200).json(rows);
            }else{
                res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
            }
        } );
        
    }
);

module.exports = router;


/*

await bcryptjs.compare(pass texto, pass hasheada y almacenada en la bd)


//let contraseniaHash = "$2a$08$QMMwjo4WWKdinZR3XcZP9.YAHkjzbR5mTuGQJoaG/BQSeqTSeg3CS";

{
    "USU_ALIAS": "AlexisEdward22",
    "USU_CONTRASENIA": "121213333"
}


*/