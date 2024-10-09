import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Page1 from './page/page1.jsx';
import Page2 from './page/page2.jsx';
import Page3 from "./page/page3.jsx";
import Page4 from "./page/page4.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-200"> {/* พื้นหลังสีเทา */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Page1/> }/>
          <Route path="/Add" element={ <Page4/> }/>
          <Route path="/Edit" element={ <Page2/> }/>
          <Route path="/History" element={ <Page3/> }/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
