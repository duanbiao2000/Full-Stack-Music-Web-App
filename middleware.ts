// 导入createMiddlewareClient函数和NextRequest、NextResponse对象
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// 导出一个异步函数middleware，接收一个NextRequest对象作为参数
export async function middleware(req: NextRequest) {
  // 创建一个NextResponse对象，并调用next()方法
  const res = NextResponse.next();
  // 使用createMiddlewareClient函数创建一个supabase对象，传入req和res参数
  const supabase = createMiddlewareClient({ req, res });
  // 调用supabase对象的auth.getSession()方法
  await supabase.auth.getSession();
  return res;
}
