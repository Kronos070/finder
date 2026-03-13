import type { Config } from "@react-router/dev/config";

// скачивания файлов для билда (статика)
export default {
  // async prerender() {
  //   let posts = await axiosInstance.get<PostI[]>("/posts")
  //   return [
  //     ...posts.data.map(post => `/post/${post.id}`),
  //     '/posts'
  //   ]
  // },
  ssr: true,
} satisfies Config;
