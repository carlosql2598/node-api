const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');

router.post('/insertar', 
    [ 
        check('IDPRODUCTO', 'La variable IDPRODUCTO no es un número.').notEmpty().isInt(),
        check('CA_CALIFICACION', 'La variable CA_CALIFICACION no es un numero.').notEmpty().isInt(),
        check('CA_CALIFICACION', 'La variable CA_CALIFICACION debe estar entre 0 y 5.').isLength({min:0,max:5}),
        check('CA_COMENTARIO', 'La variable CA_COMENTARIO debe estar entre 0 y 120 caracteres.').isLength({min:5,max:120}),
        check('IDCLIENTE', 'La variable IDCLIENTE no es un número.').notEmpty().isInt()
    ],
    (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    
    const query = 'INSERT INTO CALIFICACIONES(IDPRODUCTO, CA_CALIFICACION, CA_COMENTARIO,IDCLIENTE) VALUES (?,?,?,?)';
    
    const {IDPRODUCTO,CA_CALIFICACION, CA_COMENTARIO,IDCLIENTE} = req.body;

    mysql.query(query, [IDPRODUCTO, CA_CALIFICACION, CA_COMENTARIO, IDCLIENTE  ], (err, rows) => {
        if(!err){
            res.status(201).json({"status":201,"mensaje":"Solicitud ejecutada exitosamente."});
        }else{
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
        }
    } );

    

});


//LISTAR TODOS LOS COMENTARIOS CON RESPECTO A UN PRODUCTO.

router.get('/obtenerComentariosProductos/:id', 
    [
        check('id', 'La variable id no es un número').notEmpty().isInt()
    ],
    (req, res)=> {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }
    
        const {id} = req.params;
    
        const query = 'SELECT *FROM calificaciones WHERE IDPRODUCTO = ?;';
    
    
        mysql.query(query, [id], (err, rows) => {
            if(!err){
                res.status(200).json(rows);
            }else{
                res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
            }
        } );

    }

);




//LISTAR LOS COMENTARIOS HECHA POR UN USUARIO.
router.get('/obtenerComentarios/:id', 
    [ 
        check('id', 'La variable id no es un número').notEmpty().isInt()
    ],
    (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const {id} = req.params;

    const query = 'SELECT U.USU_NOMBRES, U.USU_APELLIDOS, C.CA_CALIFICACION, C.CA_COMENTARIO, C.CA_FECHA  FROM USUARIOS U  INNER JOIN CALIFICACIONES C ON U.IDCLIENTE = C.IDCLIENTE  WHERE C.IDCLIENTE= ?;';


    mysql.query(query, [id], (err, rows) => {
        if(!err){
            res.status(200).json(rows);
        }else{
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
        }
    } );
    
});




module.exports = router;
