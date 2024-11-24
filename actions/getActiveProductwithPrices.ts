// 导入ProductWithPrice类型
import { ProductWithPrice } from "@/types";
// 导入createServerComponentClient函数
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// 导入cookies
import { cookies } from "next/headers";

// 定义异步函数getActiveProductwithPrices，返回ProductWithPrice类型的数组
const getActiveProductwithPrices = async (): Promise<ProductWithPrice[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { foreignTable: "prices" });

  if (error) {
    console.log(error);
  }

  return (data as any) || [];
};

export default getActiveProductwithPrices;
