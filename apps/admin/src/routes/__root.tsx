import { createRootRoute, createRoute, Outlet, Link } from "@tanstack/react-router";
import { niemKinhRoutes } from "./noi-dung/niem-kinh/index.js";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold">PMTL Admin</span>
          <Link
            to="/"
            className="text-sm hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-medium"
          >
            Tổng quan
          </Link>
          <Link
            to="/noi-dung/niem-kinh/moi-truong-thoi-gian"
            className="text-sm hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-medium"
          >
            Niệm kinh
          </Link>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  ),
});

// Export rootRoute so niem-kinh routes can reference it
export { rootRoute };

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <p className="mt-2 text-gray-600">Chào mừng đến admin panel.</p>
    </div>
  ),
});

export const routeTree = rootRoute.addChildren([indexRoute, niemKinhRoutes]);
