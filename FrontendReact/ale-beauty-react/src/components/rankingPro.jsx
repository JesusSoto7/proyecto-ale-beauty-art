import React from "react";
import "../assets/stylesheets/RankingPro.css";

function RankingPro() {
    const imgPru = "https://localhost:4000/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MTAsInB1ciI6ImJsb2JfaWQifX0=--173ca73ad1d6a4ac78e98dece201d0635ac77d6c/Brillo%20labial%20melu.png"
  return (
    <section className="topSection">
      <div className="Cardtop" >
        <div className="circle">
            <img src={imgPru} alt="" />
        </div>
        <h1>Top 1</h1>
      </div>
      <div className="Cardtop" style={{ height: "325px" }}>
        <div className="circle" style={{ height: "240px" }}>
            <img src={imgPru} alt="" />
        </div>
        <h1>Top 2</h1>
      </div>
      <div className="Cardtop" style={{ height: "300px" }}>
        <div className="circle" style={{ height: "240px" }}>
            <img src={imgPru} alt="" />
        </div>
        <h1>Top 3</h1>
      </div>
    </section>
  );
}

export default RankingPro;
