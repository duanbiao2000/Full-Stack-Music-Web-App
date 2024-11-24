import { Price } from "@/types";

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";

  // 如果url中包含'http'，则直接使用url，否则在url前加上'https://'
  url = url.includes("http") ? url : `https://${url}`;

  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

// 导出一个异步函数postData，用于发送POST请求
export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  // 打印发送请求的url和数据
  console.log("posting,", url, data);

  const res: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    // 设置跨域请求的凭据
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.log("Error in postData", { url, data, res });

    throw Error(res.statusText);
  }

  return res.json();
};

// 导出一个函数toDateTime，用于将秒数转换为日期时间
export const toDateTime = (secs: number) => {
  // 创建一个日期对象，初始时间为1970-01-01T00:30:00Z
  var t = new Date("1970-01-01T00:30:00Z");
  t.setSeconds(secs);
  return t;
};
