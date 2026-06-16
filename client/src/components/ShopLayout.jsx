import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function ShopLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
