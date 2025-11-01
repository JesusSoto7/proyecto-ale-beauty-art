import React, { useState } from "react";
import "../../assets/stylesheets/Accordion.css";

const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div className="accordion-item" key={index}>
          <button
            className={`accordion-header ${
              activeIndex === index ? "active" : ""
            }`}
            onClick={() => toggleAccordion(index)}
          >
            {item.title}
            <span className="accordion-icon">
              {activeIndex === index ? "−" : "+"}
            </span>
          </button>
          {activeIndex === index && (
            <div className="accordion-content">
              <p>{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
