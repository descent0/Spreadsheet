import React, { useState } from "react";
import { Plus } from "lucide-react";

interface FooterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab }) => {
  const [tabs, setTabs] = useState([
    "All Orders",
    "Pending",
    "Reviewed",
    "Arrived",
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [name,setName]=useState(0);

  const addNewTab = (name:number) => {
    const newTabName = `Sheet (${name})`;
    if (!tabs.includes(newTabName)) {
      setTabs([...tabs, newTabName]);
      setActiveTab(newTabName);
      setName((name)=>name+1);
    }
  };

  const handleRename = (index: number) => {
    if (editValue.trim() && !tabs.includes(editValue.trim())) {
      const updatedTabs = [...tabs];
      updatedTabs[index] = editValue.trim();
      setTabs(updatedTabs);
      setActiveTab(editValue.trim());
    }
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div className="flex flex-wrap items-center border-t border-[#EEEEEE] bg-[#FFFFFF] text-sm font-medium px-4 gap-4">
      {tabs.map((tab, index) => (
        <div key={tab}>
          {editingIndex === index ? (
            <input
              autoFocus
              className="px-2 py-1 text-sm border rounded"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRename(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(index);
                if (e.key === "Escape") {
                  setEditingIndex(null);
                  setEditValue("");
                }
              }}
            />
          ) : (
            <button
              onClick={() => setActiveTab(tab)}
              onDoubleClick={() => {
                setEditingIndex(index);
                setEditValue(tab);
              }}
              className={`px-3 py-2 border-t-2 ${
                activeTab === tab
                  ? "text-[#3E5741] border-[#4B6A4F] bg-[#E8F0E9] font-semibold"
                  : "text-[#757575] border-transparent hover:text-black"
              }`}
            >
              {tab}
            </button>
          )}
        </div>
      ))}

     <button className="text-[#757575] hover:text-black p-1" onClick={() => addNewTab(name)}>
  <Plus className="w-4 h-4" />
</button>

    </div>
  );
};

export default Footer;
