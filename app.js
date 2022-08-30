const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const jwt = require("koa-jwt");
const jsonwebtoken = require("jsonwebtoken");
const cors = require("koa2-cors");
const { loadRouters } = require("./src/routes");
// 配置 process.env
require("dotenv").config();

// 使用 cors 处理跨域
app.use(cors());

// 错误处理
onerror(app);

// 中间件
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));
app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// 初始化自动加载路由
loadRouters(app);

// 中间件
// 使用 koa-jwt 中间件 未拦截客户端在调用接口时 如果请求头中没有设置 token 则返回 401
app.use((ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        status: 401,
        message: "没有访问权限",
      };
    } else {
      throw err;
    }
  });
});
// 设置哪些接口不需要 token
app.use(
  jwt({ secret: process.env.JWT_SECRET_KEY }).unless({
    path: [/^\/public/, /^\/users\/register/, /^\/users\/login/],
  })
);

// 解析 token 数据
app.use((ctx, next) => {
  ctx.request.docodeToken = jsonwebtoken.decode(
    ctx.request.headers?.authorization?.slice(7)
  );
  return next();
});

// 日志记录
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 错误处理
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
