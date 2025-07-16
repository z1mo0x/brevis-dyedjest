import React from "react";
import News from "./components/News/News";
import './App.css'
import Header from "./components/Header/Header";

function App() {
  return (
    <div className="container">
      <Header />
      <News />
    </div>
  )
}

export default App;
