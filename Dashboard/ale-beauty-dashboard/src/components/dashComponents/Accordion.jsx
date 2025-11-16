import React, { useState } from "react";
import "../../assets/stylesheets/Accordion.css";

const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };


};

export default Accordion;
