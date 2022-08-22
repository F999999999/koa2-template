
const router = require("koa-router")();

const { index } = require("../controller/index");

// 前缀
router.prefix("/");

// 首页
router.get("/", index);


module.exports = router;