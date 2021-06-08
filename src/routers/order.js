const {Router} = require('express');
const router = Router();
const mysql = require('../conexionbd');
const { check,validationResult } = require('express-validator');


router.post('/insertar', 
    (req, res) => {

    let datos = [];

    datos.push(req.body);
    
    
    const IDCLIENTE = req.body[0].IDCLIENTE;
    const MONTO_PAGADO = req.body[0].ORD_MONTO_PAGADO;
    const ORD_DIRECCION =  req.body[0].ORD_DIRECCION;
    const ORD_DET_CANTIDAD = req.body[0].ORD_DET_CANTIDAD;
    
    let P_USUARIO_COUNT_BOOL = 0;
    let P_ORDER_ID;

    const queryA = `CALL INSERT_ORDERS(?,?,?,?,@P_USUARIO_COUNT_BOOL,@P_ORDER_ID);`;

    const queryB= `SELECT @P_USUARIO_COUNT_BOOL;`;
    const queryC = `SELECT @P_ORDER_ID;`;


    mysql.query( queryA, [IDCLIENTE, MONTO_PAGADO, ORD_DIRECCION, ORD_DET_CANTIDAD],  (err, results) => {

        if(err){
            res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
        } else{
            mysql.query( queryB, (err, results) => {

                if(err){
                    res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
                } else{
                    P_USUARIO_COUNT_BOOL = results[0]["@P_USUARIO_COUNT_BOOL"];
                    
                    if(P_USUARIO_COUNT_BOOL = 0){
                        res.status(400).json({"status":400,"mensaje":"No se encontró el usuario solicitado."});
                    }
                }
            } );
        }

    });

    mysql.query(queryC, (err, results) => {
        if(err){
            res.status(400).json({"status":400,"mensaje":"Hubo un error al ejecutar la consulta SQL."});
        } else{
            P_ORDER_ID = results[0]["@P_ORDER_ID"];

            for(let i=0 ; i<datos[0].length;i++){
                let P_PRODUCTO_COUNT_BOOL = 0;
                const query = `CALL INSERT_ORDERS_DETAILS(?,?,?,@P_PRODUCTO_COUNT_BOOL);`;
                const query3 = `SELECT @P_PRODUCTO_COUNT_BOOL;`;
        
                
                const IDPRODUCTO = datos[0][i].IDPRODUCTO;
                const ORD_DET_CANTIDAD= datos[0][i].ORD_DET_CANTIDAD;
        
                mysql.query(query, [P_ORDER_ID,IDPRODUCTO, ORD_DET_CANTIDAD], (err, results) => {
                
                    if(!err){
                        mysql.query(query3, (err, results) => {
                            if(!err){
                                P_PRODUCTO_COUNT_BOOL = results[0]["@P_PRODUCTO_COUNT_BOOL"];

                                if( P_PRODUCTO_COUNT_BOOL== 0 ){
                                    res.status(400).json({"status":400,"mensaje":"No se encontró el producto."});
                                }
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
        }
    } );

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

// MOSTRAR HISTORIAL DE PEDIDOS. 
router.get('/historial/:idUsuario',
    [ 
        check('idUsuario', 'La variable idUsuario no es un número.').notEmpty().isInt()
    ],
    (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const {idUsuario} = req.params;
    
    const query = "SELECT DISTINCT P.PRO_NOMBRE, OD.ORD_DET_CANTIDAD, OD.ORD_DET_PRECIO, O.ORD_MONTO_PAGADO, O.ORD_FECH_REG, PI. PRO_IMG\
    FROM ORDERS_DETAILS OD \
    INNER JOIN PRODUCTO P \
    ON P.IDPRODUCTO = OD.IDPRODUCTO \
    INNER JOIN ORDERS O \
    ON O.IDORDERS = OD.IDORDERS \
    INNER JOIN PRODUCTO_IMG PI \
    ON PI.IDPRODUCTO = P.IDPRODUCTO \
    WHERE O.IDCLIENTE = ? \
    ORDER BY O.ORD_FECH_REG;"


    mysql.query(query, [idUsuario], (err, rows) => {
        if(!err){
            res.status(200).json({"resultado": rows, "status": 200});
        }else{
            res.status(500).json({"mensaje": "Hubo un error en la consulta en la BD.", "status": 500});
        }
    } );

});


module.exports = router;
