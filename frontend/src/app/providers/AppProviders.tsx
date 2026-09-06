import type { PropsWithChildren } from "react";
import { LoginPage } from "../../features/auth/pages/LoginPage";
// import { Renderer } from "../../features/renderer/Renderer";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      {/* <Renderer storeId="store_abc123" slug="/" /> */}
      {<LoginPage />}
    </>
  );
};
