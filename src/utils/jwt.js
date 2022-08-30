// 引入 jwt
const jwt = require("jsonwebtoken");

// 解码token数据
module.exports.decodeToken = async (token) => {
  try {
    return await jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    throw err;
  }
};

// 刷新token有效期
module.exports.refreshToken = async (
  token,
  validityTime = 60 * 60 * 24 * 7
) => {
  try {
    // 校验并解密 token
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // token 有效期小于有效期的1/2时重新生成新的 token
    if (decode.exp - new Date().getTime() / 1000 < validityTime / 2) {
      // 删除 jwt 标准注册的声明
      delete decode.iss; // jwt签发者
      delete decode.sub; // jwt所面向的用户
      delete decode.aud; // 接收jwt的一方
      delete decode.nbf; // 定义在什么时间之前 该jwt都是不可用的
      delete decode.jti; // jwt的唯一身份标识 主要用来作为一次性token 从而回避重放攻击
      delete decode.iat; // jwt的签发时间
      delete decode.exp; // jwt的过期时间 这个过期时间必须要大于签发时间

      return await jwt.sign(decode, process.env.JWT_SECRET_KEY, {
        expiresIn: validityTime,
      });
    } else {
      return token;
    }
  } catch (err) {
    throw err;
  }
};
