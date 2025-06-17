import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/whereYouAt", "routes/WhereYouAt.tsx"),
] satisfies RouteConfig;
