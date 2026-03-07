import { onRequestOptions as __api_webhook_ig_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/webhook/ig.js"
import { onRequestPost as __api_webhook_ig_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/webhook/ig.js"
import { onRequestDelete as __api_content__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/content/[id].js"
import { onRequestPut as __api_content__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/content/[id].js"
import { onRequestGet as __api_frontend_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/frontend.js"
import { onRequestOptions as __api_frontend_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/frontend.js"
import { onRequestGet as __api_posts_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/posts.js"
import { onRequestOptions as __api_posts_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/posts.js"
import { onRequestPost as __api_publish_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/publish.js"
import { onRequestPost as __api_translate_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/translate.js"

export const routes = [
    {
      routePath: "/api/webhook/ig",
      mountPath: "/api/webhook",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_webhook_ig_js_onRequestOptions],
    },
  {
      routePath: "/api/webhook/ig",
      mountPath: "/api/webhook",
      method: "POST",
      middlewares: [],
      modules: [__api_webhook_ig_js_onRequestPost],
    },
  {
      routePath: "/api/content/:id",
      mountPath: "/api/content",
      method: "DELETE",
      middlewares: [],
      modules: [__api_content__id__js_onRequestDelete],
    },
  {
      routePath: "/api/content/:id",
      mountPath: "/api/content",
      method: "PUT",
      middlewares: [],
      modules: [__api_content__id__js_onRequestPut],
    },
  {
      routePath: "/api/frontend",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_frontend_js_onRequestGet],
    },
  {
      routePath: "/api/frontend",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_frontend_js_onRequestOptions],
    },
  {
      routePath: "/api/posts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_posts_js_onRequestGet],
    },
  {
      routePath: "/api/posts",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_posts_js_onRequestOptions],
    },
  {
      routePath: "/api/publish",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_publish_js_onRequestPost],
    },
  {
      routePath: "/api/translate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_translate_js_onRequestPost],
    },
  ]