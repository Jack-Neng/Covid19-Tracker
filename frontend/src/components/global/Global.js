import React, { useState } from "react";
import Graph from "./Graph";
import Table from "./Table";

export default function Global() {
  const [view, setView] = useState("Map");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            padding: "5px",
            cursor: "pointer",
            textDecoration: view === "Map" ? "underline" : "",
          }}
          onClick={(e) => setView("Map")}
        >
          Map
        </span>
        <span
          style={{
            padding: "5px",
            cursor: "pointer",
            textDecoration: view === "List" ? "underline" : "",
          }}
          onClick={(e) => setView("List")}
        >
          List
        </span>
      </div>

      {view === "Map" ? <Graph /> : <Table />}
    </>
  );
}
