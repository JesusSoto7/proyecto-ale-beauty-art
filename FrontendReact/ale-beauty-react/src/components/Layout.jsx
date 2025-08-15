import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function LayoutInicio() {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}