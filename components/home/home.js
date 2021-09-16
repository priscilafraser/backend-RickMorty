const express = require("express");
const router = express.Router();

//Middleware especifica que é esse router que a gente utilizar a 'router'
router.use(function timelog(req, res, next) {
  next();
  console.log("Time: ", Date.now()); //registra a data de acesso
});

router.get("/", async (req, res) => {
  res.send({ info: "Olá, Blue!"});
});

module.exports = router;
