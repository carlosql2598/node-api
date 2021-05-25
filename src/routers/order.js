const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');


router.post('/insertar', 
    (req, res) => {

    let datos = [];

    datos.push(req.body);

    for(let i=0 ; i<datos[0].length;i++){
        let P_USUARIO_COUNT_BOOL = 0;
        let P_PRODUCTO_COUNT_BOOL = 0;
        const query = `CALL INSERT_ORDER(?,?,?,?,?,@P_USUARIO_COUNT_BOOL,@P_PRODUCTO_COUNT_BOOL);`;
        const query2 = `SELECT @P_USUARIO_COUNT_BOOL;`;
        const query3 = `SELECT @P_PRODUCTO_COUNT_BOOL;`;

        const {IDCLIENTE,ORD_MONTO_PAGADO,ORD_DIRECCION, IDPRODUCTO, ORD_DET_CANTIDAD } = datos[0][i];

        mysql.query(query, [IDCLIENTE,ORD_MONTO_PAGADO, ORD_DIRECCION,IDPRODUCTO,ORD_DET_CANTIDAD], (err, results) => {
        
            if(!err){
                mysql.query(
                    query2, (err, results) => {
                        if(!err){
    
                            P_USUARIO_COUNT_BOOL = results[0]["@P_USUARIO_COUNT_BOOL"];
                            mysql.query(query3, (err, results) => {
                                    if(!err){
                                        P_PRODUCTO_COUNT_BOOL = results[0]["@P_PRODUCTO_COUNT_BOOL"];
                                        if(P_USUARIO_COUNT_BOOL== 0 || P_PRODUCTO_COUNT_BOOL== 0 ){
                                            res.status(400).json({"status":400,"mensaje":"No se encontró el usuario o el producto."});
                                        }
    
                                    }else{
                                            res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
                                    }
                                }
                            );
                        }else{
                            res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
                        }
                    }
                );
            }else{
                res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
            }
        } );
    }

    res.status(201).json({"status":201,"mensaje":"Solicitud ejecutada exitosamente."});
});




//LISTAR LAS ORDENES HECHAS POR UN USUARIO. 
router.get('/obtenerOrden/:idUsuario',  
    [ 
        check('idUsuario', 'La variable idUsuario no es un número.').notEmpty().isInt()
    ],
    (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const {idUsuario} = req.params;
    
    const query = 'SELECT O.IDORDERS, U.USU_NOMBRES, U.USU_APELLIDOS, O.ORD_FECH_REG, O.ORD_MONTO_PAGADO, OD.ORD_DET_PRECIO, OD.ORD_DET_CANTIDAD, P.PRO_NOMBRE FROM ORDERS O INNER JOIN USUARIOS U ON O.IDCLIENTE = U.IDCLIENTE INNER JOIN ORDERS_DETAILS OD  ON OD.IDORDERS = O.IDORDERS INNER JOIN PRODUCTO P ON P.IDPRODUCTO = OD.IDPRODUCTO WHERE U.IDCLIENTE= ?;';


    mysql.query(query, [idUsuario], (err, rows) => {
        if(!err){
            res.status(200).json(rows);
        }else{
            res.status(500).json({"mensaje":"Hubo un error en la consulta en la BD.", "status":500});
        }
    } );

});


module.exports = router;
