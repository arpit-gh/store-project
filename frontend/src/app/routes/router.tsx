import { createBrowserRouter } from "react-router";
import { RootLayout } from "../../app/layouts/RootLayout.tsx";
import { LoginPage } from "../../features/auth/pages/LoginPage.tsx";

export const router = createBrowserRouter([
  { path: "/", element: <RootLayout /> },
  { path: "/login", element: <LoginPage /> },
]);
