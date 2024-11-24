// 导入Song类型
import { Song } from "@/types";
// 导入createServerComponentClient函数
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// 导入cookies
import { cookies } from "next/headers";

// 定义异步函数getLikedSongs，返回Song类型的Promise
const getLikedSongs = async (): Promise<Song[]> => {
  // 创建supabase实例
  const supabase = createServerComponentClient({
    cookies: cookies,
  });
  // 获取session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 从liked_songs表中查询数据
  const { data, error } = await supabase
    .from("liked_songs")
    .select("*, songs(*)")
    .eq("user_id", session?.user?.id)
    .order("created_at", { ascending: false });

  // 如果查询出错，打印错误信息并返回空数组
  if (error) {
    console.log(error);
    return [];
  }
  // 如果查询结果为空，返回空数组
  if (!data) {
    return [];
  }

  // 返回查询结果
  return data.map((item) => ({ ...item.songs }));
};

// 导出getLikedSongs函数
export default getLikedSongs;
