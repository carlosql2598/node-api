const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');


router.get('/', (req,res)=>{
    // res.json({"mensaje": "si funciona", "estado":200});
    mysql.query('select *from producto', (err,rows,fields)=>{
        if(!err){
            res.status(201).json({"Productos":rows,"status":201,"mensaje":"Solicitud ejecutada exitosamente."});
        }else{
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500, "err": err});
        }
    });
   
});

router.get('/:id', 
    check('id', 'La variable id no es un numero').notEmpty().isInt(),
    (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {id} = req.params;

        const query = 'SELECT  P.IDPRODUCTO,  P.PRO_NOMBRE, P.PRO_DESCRIPCION, P.PRO_PRECIO, P.PRO_STOCK, ' +
        'PRI.PRO_IMG ' +
        'FROM PRODUCTO P INNER JOIN PRODUCTO_IMG PRI ' +
        'ON P.IDPRODUCTO = PRI.IDPRODUCTO ' +
        'WHERE P.IDPRODUCTO = ?;';


        mysql.query(query, [id], (err, rows, fields) => {
        if(!err){
            res.status(200).json(rows);
        }else{
            res.status(500).json({"mensaje":"Hubo un error con la consulta en la BD.", "status":500});
        }
    });
});


//LISTAR LOS PRODUCTOS DE ACUERDO A LA VALORACIÓN
router.get('/valoracion/:val', 
    [ 
        check('val', 'La variable val no es un numero').notEmpty().isInt()
    ],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        const {val} = req.params;
        
        const query = 'SELECT  P.IDPRODUCTO,  P.PRO_NOMBRE, P.PRO_DESCRIPCION, P.PRO_PRECIO, P.PRO_STOCK, '+
        'PRI.PRO_IMG ' +
        'FROM PRODUCTO P INNER JOIN PRODUCTO_IMG PRI ' +
        'ON P.IDPRODUCTO = PRI.IDPRODUCTO ' +
        'INNER JOIN CALIFICACIONES C ' +
        'ON P.IDPRODUCTO = C.IDPRODUCTO ' +
        'WHERE C.CA_CALIFICACION = ?;';
        

        mysql.query(query, [val], (err, rows) => {
            if(!err){
                res.status(200).json(rows);
            }else{
                res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
            }
        } );
        
    }
);


module.exports = router;
