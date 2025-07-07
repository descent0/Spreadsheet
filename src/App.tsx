import { useEffect, useState } from "react";
import "./App.css";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import ProjectSpreadsheet from "./Components/MainSheet";
import Toolbar from "./Components/ToolBar";
import { sheetData } from "./assets/dummyData";

type CellData = {
  value: string;
  customStyle: {
    backgroundColor: string;
    color: string;
    fontSize: string;
  };
};

type SheetData = {
  [cellId: string]: CellData;
};


function App() {
  //local states
  const [activeTab, setActiveTab] = useState("All Orders");
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
const [data, setData] = useState<SheetData>(sheetData);
const [map, setMap] = useState<Map<string, SheetData>>(new Map());
map.set("All Orders", sheetData);

  const [searchQuery, setSearchQuery] = useState<string>("");
  useEffect(()=>{
    document.body.style.fontFamily = "'Work Sans', sans-serif";
  },[]);

  useEffect(() => {
  if (map.has(activeTab)) {
    setData(map.get(activeTab)!);
  } else {
    const newMap = new Map(map);
    newMap.set(activeTab, {});
    setMap(newMap);
    setData({});
    setSelectedCell(null);
    setSelectedCells(new Set());
  }
}, [activeTab,map]);




  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header setSearchQuery={setSearchQuery} />
      <Toolbar
        selectedCells={selectedCells}
        selectedCell={selectedCell}
        data={data}
        setData={setData}
      />
      <div className="flex-1 overflow-hidden">
        <ProjectSpreadsheet
          selectedCell={selectedCell}
          selectedCells={selectedCells}
          onSelectedCellChange={setSelectedCell}
          onSelectedCellsChange={setSelectedCells}
          data={data}
          setData={setData}
          searchQuery={searchQuery}
        />
      </div>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
