const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');




// LISTAR LOS PRODUCTOS POR CATEGORÍA
router.get('/obtenerCategoriaPorId/:id', 
    check('id', 'La variable id no es un numero').notEmpty().isInt(),
    (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {id} = req.params;
        const query = 'SELECT  P.IDPRODUCTO,  P.PRO_NOMBRE, P.PRO_DESCRIPCION, P.PRO_PRECIO, P.PRO_STOCK, ' +
         'PRI.PRO_IMG  FROM PRODUCTO P INNER JOIN PRODUCTO_IMG PRI  ON P.IDPRODUCTO = PRI.IDPRODUCTO ' +
         'WHERE P.IDPRODUCTO IN (SELECT PC.IDPRODUCTO  FROM CATEGORIA C INNER JOIN ' +
         'PRODUCTO_CATEGORIA PC  ON C.IDCATEGORIA = PC.IDCATEGORIA  WHERE C.IDCATEGORIA = ?);'; 

        
        mysql.query(query, [id], (err, rows) => {
          if(!err){
            res.status(200).json(rows);
          }else{
            console.error(err);
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
          }
      } );
    }
);




module.exports = router;

