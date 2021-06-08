const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');

//LISTAR PRODUCTOS
router.get('/', (req,res)=>{
    mysql.query('SELECT * FROM producto', (err,rows,fields)=>{
        if(!err){
            res.status(200).json({"Productos":rows,"status":200,"mensaje":"Solicitud ejecutada exitosamente."});
        }else{
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
        }
    });
   
});

// MOSTRAR LOS 6 PRODUCTOS MÁS VALORADOS POR CADA CATEGORÍA
router.get('/mejor_valorados', (req,res)=>{
    const query = 'SELECT P.IDPRODUCTO, P.PRO_NOMBRE, P.PRO_DESCRIPCION, P. PRO_PRECIO, P.PRO_STOCK, C.CAT_NOMBRE, AVG(CA.CA_CALIFICACION) PROMEDIO_CALIFICACION, CA.CA_COMENTARIO, PI.PRO_IMG \
    FROM PRODUCTO P \
    INNER JOIN PRODUCTO_CATEGORIA PC \
    ON P.IDPRODUCTO = PC.IDPRODUCTO \
    INNER JOIN CATEGORIA C \
    ON PC.IDCATEGORIA = C.IDCATEGORIA \
    INNER JOIN CALIFICACIONES CA \
    ON CA.IDPRODUCTO = P.IDPRODUCTO \
    INNER JOIN PRODUCTO_IMG PI \
    ON PI.IDPRODUCTO = P.IDPRODUCTO \
    GROUP BY P.IDPRODUCTO \
    ORDER BY AVG(CA.CA_CALIFICACION) DESC;'
    

    mysql.query(query, (err, rows)=>{
        let productos = {};
        
        let nombre_categoria = '';

        if(!err){
            for(indice in rows) {
                nombre_categoria = rows[indice].CAT_NOMBRE;
                if(productos[nombre_categoria]) {
                    if(productos[nombre_categoria].length < 6) {
                        productos[nombre_categoria].push(rows[indice]);
                    }
                }
                else {
                    productos[nombre_categoria] = [rows[indice]];
                }
            }

            res.status(201).json({"resultado": productos, "status": 201, "mensaje": "Solicitud ejecutada exitosamente."});
        }
        else {
            res.status(500).json({"mensaje": "Hubo un error en la consulta en la BD.", "status": 500});
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
        'FROM producto P INNER JOIN producto_img PRI ' +
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
        'FROM producto P INNER JOIN producto_img PRI ' +
        'ON P.IDPRODUCTO = PRI.IDPRODUCTO ' +
        'INNER JOIN calificaciones C ' +
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
