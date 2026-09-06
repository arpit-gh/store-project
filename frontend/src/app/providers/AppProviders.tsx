import type { PropsWithChildren } from "react";
import { SignupPage } from "../../features/auth/pages/SignupPage";
// import { Renderer } from "../../features/renderer/Renderer";
// import { LoginPage } from "../../features/auth/pages/LoginPage";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      {/* <Renderer storeId="store_abc123" slug="/" /> */}
      {/* {<LoginPage />} */}
      {<SignupPage />}
    </>
  );
};
