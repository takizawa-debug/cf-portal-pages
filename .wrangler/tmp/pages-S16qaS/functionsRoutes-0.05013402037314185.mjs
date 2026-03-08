import { onRequestPost as __api_auth_login_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/auth/login.js"
import { onRequestPost as __api_auth_logout_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/auth/logout.js"
import { onRequestGet as __api_auth_me_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/auth/me.js"
import { onRequestOptions as __api_webhook_ig_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/webhook/ig.js"
import { onRequestPost as __api_webhook_ig_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/webhook/ig.js"
import { onRequestDelete as __api_apples__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/apples/[id].js"
import { onRequestPut as __api_apples__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/apples/[id].js"
import { onRequestDelete as __api_categories__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/categories/[id].js"
import { onRequestPut as __api_categories__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/categories/[id].js"
import { onRequestDelete as __api_content__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/content/[id].js"
import { onRequestPut as __api_content__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/content/[id].js"
import { onRequestDelete as __api_keywords__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/keywords/[id].js"
import { onRequestPut as __api_keywords__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/keywords/[id].js"
import { onRequestDelete as __api_knowledge__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/knowledge/[id].js"
import { onRequestPut as __api_knowledge__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/knowledge/[id].js"
import { onRequestDelete as __api_users__id__js_onRequestDelete } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/users/[id].js"
import { onRequestPut as __api_users__id__js_onRequestPut } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/users/[id].js"
import { onRequestGet as __api_apples_index_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/apples/index.js"
import { onRequestPost as __api_apples_index_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/apples/index.js"
import { onRequestGet as __api_categories_index_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/categories/index.js"
import { onRequestPost as __api_categories_index_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/categories/index.js"
import { onRequestGet as __api_frontend_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/frontend.js"
import { onRequestOptions as __api_frontend_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/frontend.js"
import { onRequestPost as __api_generate_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/generate.js"
import { onRequestGet as __api_keywords_index_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/keywords/index.js"
import { onRequestPost as __api_keywords_index_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/keywords/index.js"
import { onRequestGet as __api_knowledge_index_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/knowledge/index.js"
import { onRequestPost as __api_knowledge_index_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/knowledge/index.js"
import { onRequestGet as __api_posts_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/posts.js"
import { onRequestOptions as __api_posts_js_onRequestOptions } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/posts.js"
import { onRequestPost as __api_publish_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/publish.js"
import { onRequestPost as __api_translate_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/translate.js"
import { onRequestGet as __api_users_index_js_onRequestGet } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/users/index.js"
import { onRequestPost as __api_users_index_js_onRequestPost } from "/Users/takizawahiroki/Desktop/Cloudflaretest/functions/api/users/index.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_js_onRequestPost],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_js_onRequestGet],
    },
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
      routePath: "/api/apples/:id",
      mountPath: "/api/apples",
      method: "DELETE",
      middlewares: [],
      modules: [__api_apples__id__js_onRequestDelete],
    },
  {
      routePath: "/api/apples/:id",
      mountPath: "/api/apples",
      method: "PUT",
      middlewares: [],
      modules: [__api_apples__id__js_onRequestPut],
    },
  {
      routePath: "/api/categories/:id",
      mountPath: "/api/categories",
      method: "DELETE",
      middlewares: [],
      modules: [__api_categories__id__js_onRequestDelete],
    },
  {
      routePath: "/api/categories/:id",
      mountPath: "/api/categories",
      method: "PUT",
      middlewares: [],
      modules: [__api_categories__id__js_onRequestPut],
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
      routePath: "/api/keywords/:id",
      mountPath: "/api/keywords",
      method: "DELETE",
      middlewares: [],
      modules: [__api_keywords__id__js_onRequestDelete],
    },
  {
      routePath: "/api/keywords/:id",
      mountPath: "/api/keywords",
      method: "PUT",
      middlewares: [],
      modules: [__api_keywords__id__js_onRequestPut],
    },
  {
      routePath: "/api/knowledge/:id",
      mountPath: "/api/knowledge",
      method: "DELETE",
      middlewares: [],
      modules: [__api_knowledge__id__js_onRequestDelete],
    },
  {
      routePath: "/api/knowledge/:id",
      mountPath: "/api/knowledge",
      method: "PUT",
      middlewares: [],
      modules: [__api_knowledge__id__js_onRequestPut],
    },
  {
      routePath: "/api/users/:id",
      mountPath: "/api/users",
      method: "DELETE",
      middlewares: [],
      modules: [__api_users__id__js_onRequestDelete],
    },
  {
      routePath: "/api/users/:id",
      mountPath: "/api/users",
      method: "PUT",
      middlewares: [],
      modules: [__api_users__id__js_onRequestPut],
    },
  {
      routePath: "/api/apples",
      mountPath: "/api/apples",
      method: "GET",
      middlewares: [],
      modules: [__api_apples_index_js_onRequestGet],
    },
  {
      routePath: "/api/apples",
      mountPath: "/api/apples",
      method: "POST",
      middlewares: [],
      modules: [__api_apples_index_js_onRequestPost],
    },
  {
      routePath: "/api/categories",
      mountPath: "/api/categories",
      method: "GET",
      middlewares: [],
      modules: [__api_categories_index_js_onRequestGet],
    },
  {
      routePath: "/api/categories",
      mountPath: "/api/categories",
      method: "POST",
      middlewares: [],
      modules: [__api_categories_index_js_onRequestPost],
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
      routePath: "/api/generate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_js_onRequestPost],
    },
  {
      routePath: "/api/keywords",
      mountPath: "/api/keywords",
      method: "GET",
      middlewares: [],
      modules: [__api_keywords_index_js_onRequestGet],
    },
  {
      routePath: "/api/keywords",
      mountPath: "/api/keywords",
      method: "POST",
      middlewares: [],
      modules: [__api_keywords_index_js_onRequestPost],
    },
  {
      routePath: "/api/knowledge",
      mountPath: "/api/knowledge",
      method: "GET",
      middlewares: [],
      modules: [__api_knowledge_index_js_onRequestGet],
    },
  {
      routePath: "/api/knowledge",
      mountPath: "/api/knowledge",
      method: "POST",
      middlewares: [],
      modules: [__api_knowledge_index_js_onRequestPost],
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
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "GET",
      middlewares: [],
      modules: [__api_users_index_js_onRequestGet],
    },
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "POST",
      middlewares: [],
      modules: [__api_users_index_js_onRequestPost],
    },
  ]