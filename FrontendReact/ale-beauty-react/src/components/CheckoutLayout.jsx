import { Outlet } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader";
import Footer from "./Footer";

function CheckoutLayout() {
  return (
    <>
      <CheckoutHeader />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  )

}

export default CheckoutLayout