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

    let P_USUARIO_VALIDO = 0; // 0 significa que no se encontrarón sus credenciales, por lo tanto no es usuario de la app. 

    const contraseniaHash = await bcryptjs.hashSync(USU_CONTRASENIA, 8);

    //let contraseniaHash = "$2a$08$QMMwjo4WWKdinZR3XcZP9.YAHkjzbR5mTuGQJoaG/BQSeqTSeg3CS";



    const query = 'CALL VALIDAR_USUARIO(?,?, @P_USUARIO_VALIDO);';
    const query2 = 'SELECT @P_USUARIO_VALIDO;';

    mysql.query(query, [USU_ALIAS,contraseniaHash], (err, result) => {
            if(!err){
                mysql.query(query2, (err, result) => {
                    if(!err){
                        console.log('result  : ', result);

                        P_USUARIO_VALIDO = result[0]["@P_USUARIO_VALIDO"];
                        if(P_USUARIO_VALIDO == 0){
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



module.exports = router;


/*

await bcryptjs.compare(pass texto, pass hasheada y almacenada en la bd)


//let contraseniaHash = "$2a$08$QMMwjo4WWKdinZR3XcZP9.YAHkjzbR5mTuGQJoaG/BQSeqTSeg3CS";

{
    "USU_ALIAS": "AlexisEdward22",
    "USU_CONTRASENIA": "121213333"
}


*/