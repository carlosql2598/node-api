const {Router} = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.json({"mensaje":"Bienvenido al API", "estado":200});
});

module.exports = router;