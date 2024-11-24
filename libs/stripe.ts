// 导入Stripe模块
import Stripe from "stripe";

// 创建一个Stripe实例，使用环境变量中的STRIPE_SECRET_KEY作为密钥
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
  appInfo: { name: "Music Web App", version: "0.1.0" },
});
