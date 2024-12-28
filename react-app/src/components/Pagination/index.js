import React from "react";
import PropTypes from "prop-types";
import "./style.css";

function Pagination({ setPage, pageNum, pageList }) {
  const handlePageChange = (newPage) => {
    if (newPage !== pageNum && newPage >= 1 && newPage <= Math.max(...pageList)) {
      setPage(newPage);
    }
  };

  return (
    <div className="paginationContainer">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(pageNum - 1)}
        className="paginationButton"
        disabled={pageNum === 1}
        aria-label="Previous page"
      >
        Prev
      </button>

      {/* Page Number Buttons */}
      {pageList.map((item) => (
        <button
          key={item}
          onClick={() => handlePageChange(item)}
          className={`paginationButton ${item === pageNum ? "buttonActive" : ""}`}
          aria-current={item === pageNum ? "page" : undefined}
        >
          {item}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(pageNum + 1)}
        className="paginationButton"
        disabled={pageNum === Math.max(...pageList)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

Pagination.propTypes = {
  setPage: PropTypes.func.isRequired, // Function to set the current page
  pageNum: PropTypes.number.isRequired, // Current page number
  pageList: PropTypes.arrayOf(PropTypes.number).isRequired, // List of page numbers
};

export default Pagination;
