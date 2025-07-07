import React, { useState } from "react";
import FormattingToolbar from "./FormattingToolbar";
import { applyStyleToCells } from "./utils/FormattingFunction";


type ToolbarProps = {
  selectedCells: Set<string>;
   selectedCell: string | null;
  data: any;
  setData: (updater: any) => void;
};

const Toolbar: React.FC<ToolbarProps> = ({ selectedCells, selectedCell, data, setData }) => {
  const [expanded, setExpanded] = useState(false);
  const [hideFields, setHideFields] = useState<Set<string>>(new Set());


  const handleHideFields = async () => {
   
    if(selectedCells.size === 0) {
  alert("Please select cells to hide field.");
  return;
}
  await applyStyleToCells(selectedCells, { visibility: "hidden" }, data, setData);

  setHideFields((prev) => {
    const updated = new Set(prev);
    selectedCells.forEach((cell) => updated.add(cell));
    return updated;
  });

};

  const handleUnHideFields = async () => {
    await applyStyleToCells(hideFields,
      {
      visibility: "visible",
    },
      data,
      setData
    );
   setHideFields(new Set());
  }


const handleSort = () => {
  console.log("Sorting function triggered");

  if (selectedCells.size === 0) {
    alert("Please select cells to sort.");
    return;
  }

  const selectedCellsArray = Array.from(selectedCells);
  const [firstCol] = selectedCellsArray[0];
  console.log(`Sorting based on column: ${firstCol}`);

  const columnCells = Object.keys(data)
    .filter((key) => key.startsWith(firstCol) && key !== `${firstCol}1`); // skip header

  const sortable = columnCells.map((key) => {
    const html = data[key]?.value || "";
    const text = html.replace(/<[^>]*>/g, "").trim(); 
    return { key, row: key.slice(1), text };
  });


  sortable.sort((a, b) => a.text.localeCompare(b.text));

  console.log("Sorted order of rows:", sortable.map((s) => s.key));

  const newData = { ...data };
  const rows = sortable.map((item) => item.row);

  const columns = Object.keys(data)
    .filter((key) => key.match(/^[A-Z]1$/)) 
    .map((key) => key[0]);

  columns.forEach((col) => {
    rows.forEach((rowIndex, i) => {
      const fromKey = `${col}${rowIndex}`;
      const toKey = `${col}${i + 2}`;
      newData[toKey] = { ...data[fromKey] };
    });
  });

  setData(newData);
};



const handleFilter = () => {
  console.log("Filter function triggered");
  alert("Filter function triggered.");
}

const handleCellView = () => {
  alert("Cell View triggered.");
  console.log("Cell View triggered");
};


const handleImport=()=>{
  alert("kindly import the file from the file explorer");
  console.log("Import function triggered");
}
const handleExport = () => {
  console.log("Export function triggered");

  // Parse keys and organize by rows and columns
  const cellMap: Record<string, Record<string, string>> = {};
  const rows = new Set<number>();
  const cols = new Set<string>();

  for (const key in data) {
    const col = key[0];
    const row = key.slice(1);
    rows.add(parseInt(row));
    cols.add(col);

    const rawValue = data[key]?.value || '';
    const plainText = rawValue.replace(/<[^>]*>/g, '').replace(/,/g, ' ').trim();

    if (!cellMap[row]) cellMap[row] = {};
    cellMap[row][col] = plainText;
  }

  // Sort rows and columns
  const sortedRows = Array.from(rows).sort((a, b) => a - b);
  const sortedCols = Array.from(cols).sort();

  // Generate CSV string
  const csv = [
    ',' + sortedCols.join(','), // header row
    ...sortedRows.map(row =>
      [row, ...sortedCols.map(col => cellMap[row]?.[col] || '')].join(',')
    ),
  ].join('\n');

  // Export
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sheet_export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};




   const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: "Check out this page!",
          url: window.location.href,
        })
        .then(() => console.log("Successfully shared"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard (Share not supported in this browser).");
    }
  };

  const handleNewAction=()=>{
    alert("New Action triggered.");
    console.log("New action triggered");
  }

  return (
    <div className="w-full transition-all duration-300">
      <div className="flex flex-wrap justify-between items-center gap-2 p-2 border-b bg-[#FFFFFF] border-t border-[#EEEEEE]">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className="text-sm text-[#121212] flex items-center gap-2 px-2 py-1 rounded"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <p className="content-center p-0">Tool bar </p>
            <div className={` ${!expanded?" ":"rotate-90"} pt-1`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.91665 3.31766C7.07259 3.16117 7.32585 3.16072 7.48234 3.31665L11.8699 7.68864C12.0425 7.86059 12.0425 8.14004 11.8699 8.312L7.48234 12.684C7.32585 12.8399 7.07259 12.8395 6.91665 12.683C6.76072 12.5265 6.76117 12.2732 6.91766 12.1173L11.0493 8.00032L6.91766 3.88334C6.76117 3.72741 6.76072 3.47415 6.91665 3.31766ZM3.71665 3.31766C3.87259 3.16117 4.12585 3.16072 4.28234 3.31665L8.66993 7.68864C8.8425 7.86059 8.8425 8.14004 8.66993 8.312L4.28234 12.684C4.12585 12.8399 3.87259 12.8395 3.71665 12.683C3.56072 12.5265 3.56117 12.2732 3.71766 12.1173L7.84933 8.00032L3.71766 3.88334C3.56117 3.72741 3.56072 3.47415 3.71665 3.31766Z"
                  fill="#121212"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.21175 3.38749C4.09439 3.27054 3.90444 3.27088 3.78749 3.38824C3.67054 3.50561 3.67088 3.69556 3.78825 3.81251L7.91991 7.92948C7.93874 7.94825 7.94933 7.97373 7.94933 8.00032C7.94933 8.0269 7.93874 8.05239 7.91991 8.07115L3.78825 12.1881C3.67088 12.3051 3.67054 12.495 3.78749 12.6124C3.90444 12.7298 4.09439 12.7301 4.21175 12.6131L8.59934 8.24116C8.73269 8.10829 8.73269 7.89235 8.59934 7.75947L4.21175 3.38749ZM3.64582 3.24708C3.84073 3.05147 4.15731 3.0509 4.35292 3.24582L8.74051 7.6178C8.9523 7.82884 8.9523 8.1718 8.74051 8.38283L4.35292 12.7548C4.15731 12.9497 3.84073 12.9492 3.64582 12.7536C3.4509 12.558 3.45147 12.2414 3.64708 12.0465L7.70765 8.00032L3.64708 3.95418C3.45147 3.75927 3.4509 3.44269 3.64582 3.24708ZM7.41175 3.38749C7.29439 3.27054 7.10444 3.27088 6.98749 3.38824C6.87054 3.50561 6.87088 3.69556 6.98825 3.81251L11.1199 7.92948C11.1387 7.94825 11.1493 7.97373 11.1493 8.00032C11.1493 8.0269 11.1387 8.05239 11.1199 8.07115L6.98825 12.1881C6.87088 12.3051 6.87054 12.495 6.98749 12.6124C7.10444 12.7298 7.29439 12.7301 7.41175 12.6131L11.7993 8.24116C11.9327 8.10829 11.9327 7.89235 11.7993 7.75947L7.41175 3.38749ZM6.84582 3.24708C7.04073 3.05147 7.35731 3.0509 7.55292 3.24582L11.9405 7.6178C12.1523 7.82884 12.1523 8.1718 11.9405 8.38283L7.55292 12.7548C7.35731 12.9497 7.04073 12.9492 6.84582 12.7536C6.6509 12.558 6.65147 12.2414 6.84708 12.0465L10.9077 8.00032L6.84708 3.95418C6.65147 3.75927 6.6509 3.44269 6.84582 3.24708Z"
                  fill="#121212"
                />
              </svg>
            </div>
          </button>
          <div className="w-px h-6 bg-[#EEEEEE] mx-2" />
          <button
            onClick={() => handleHideFields()}
            className="flex items-center gap-1 text-sm text-[#121212] px-2 py-1 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.84972 1.84973C1.62784 2.07162 1.60766 2.41883 1.78921 2.66351L1.84972 2.73361L5.21187 6.09575C3.61021 7.22031 2.41315 8.89994 1.91574 10.887C1.83191 11.2218 2.03541 11.5612 2.37026 11.6451C2.7051 11.7289 3.0445 11.5254 3.12832 11.1905C3.56955 9.4279 4.65926 7.94956 6.1118 6.99544L7.61983 8.50354C7.03023 9.10482 6.66667 9.92855 6.66667 10.8372C6.66667 12.6781 8.15905 14.1705 10 14.1705C10.9086 14.1705 11.7324 13.807 12.3336 13.2174L17.2664 18.1503C17.5105 18.3944 17.9062 18.3944 18.1503 18.1503C18.3722 17.9284 18.3923 17.5812 18.2108 17.3365L18.1503 17.2664L13.0557 12.1712L13.0567 12.17L12.0566 11.1718L9.66498 8.78065L9.66667 8.78L7.26564 6.38152L7.26667 6.38L6.32226 5.43791L2.73361 1.84973C2.48953 1.60565 2.0938 1.60565 1.84972 1.84973ZM8.50339 9.3879L11.4493 12.3338C11.0743 12.697 10.5633 12.9205 10 12.9205C8.84941 12.9205 7.91667 11.9878 7.91667 10.8372C7.91667 10.2739 8.1402 9.76287 8.50339 9.3879ZM10 4.58333C9.16645 4.58333 8.35762 4.70673 7.59258 4.9375L8.62339 5.96766C9.06989 5.87943 9.53033 5.83333 10 5.83333C13.2692 5.83333 16.0916 8.06689 16.8726 11.1943C16.9563 11.5292 17.2955 11.7329 17.6304 11.6492C17.9653 11.5656 18.169 11.2263 18.0854 10.8914C17.1661 7.2106 13.8463 4.58333 10 4.58333ZM10.1622 7.50773L13.33 10.675C13.2452 8.9609 11.8727 7.5897 10.1622 7.50773Z"
                  fill="#121212"
                />
              </svg>
            </span>{" "}
            Hide fields
          </button>
           {
            hideFields.size > 0 ? (
               <button
            onClick={() => handleUnHideFields()}
            className="flex items-center gap-1 text-sm text-[#121212] px-2 py-1 rounded cursor-pointer"
          >
            <span>
           
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 4.58333C13.8463 4.58333 17.1661 7.2106 18.0854 10.8914C18.169 11.2263 17.9653 11.5656 17.6304 11.6492C17.2955 11.7329 16.9563 11.5292 16.8726 11.1943C16.0916 8.06689 13.2692 5.83333 10 5.83333C6.73077 5.83333 3.90842 8.06689 3.12742 11.1943C3.04369 11.5292 2.7045 11.7329 2.36956 11.6492C2.03472 11.5656 1.83099 11.2263 1.91462 10.8914C2.83391 7.2106 6.15369 4.58333 10 4.58333Z" fill="#121212"/>
  <path d="M10 7.91667C11.6108 7.91667 12.9167 9.22256 12.9167 10.8333C12.9167 12.4441 11.6108 13.75 10 13.75C8.38919 13.75 7.08333 12.4441 7.08333 10.8333C7.08333 9.22256 8.38919 7.91667 10 7.91667Z" fill="#121212"/>
</svg>
            </span>{" "}
            UnHide fields
          </button>
            ) : null
          }
          <button
            onClick={() => handleSort()}
            className="flex items-center gap-1 text-sm text-[#121212] px-2 py-1 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.3757 3.33333L14.2909 3.33904C13.9858 3.38042 13.7507 3.64192 13.7507 3.95833L13.75 14.535L11.0668 11.8537L10.9966 11.7932C10.7519 11.6117 10.4047 11.632 10.1829 11.854C9.9389 12.0982 9.93906 12.4939 10.1832 12.7379L13.9364 16.4879L14.0065 16.5484C14.2513 16.7298 14.5985 16.7095 14.8203 16.4875L18.5671 12.7375L18.6276 12.6674C18.8091 12.4227 18.7887 12.0755 18.5668 11.8537L18.4966 11.7932C18.2519 11.6117 17.9047 11.632 17.6829 11.854L15 14.5383L15.0007 3.95833L14.995 3.87352C14.9536 3.56846 14.6921 3.33333 14.3757 3.33333ZM5.17868 3.5164L1.43304 7.26228L1.37253 7.33238C1.19099 7.57707 1.21118 7.92429 1.43307 8.14617L1.50317 8.20668C1.74786 8.38822 2.09507 8.36803 2.31696 8.14614L4.9975 5.46426L4.99805 16.0458L5.00376 16.1306C5.04514 16.4357 5.30664 16.6708 5.62305 16.6708L5.70786 16.6651C6.01292 16.6237 6.24805 16.3622 6.24805 16.0458L6.2475 5.46592L8.93322 8.14663L9.00338 8.20707C9.24826 8.38835 9.59545 8.3678 9.8171 8.14567C10.0609 7.90133 10.0605 7.5056 9.81614 7.26179L6.06209 3.51591L5.99198 3.45551C5.7473 3.27433 5.40039 3.29467 5.17868 3.5164Z"
                  fill="#121212"
                />
              </svg>
            </span>
            Sort
          </button>
          <button
            onClick={() => handleFilter()}
            className="flex items-center gap-1 text-sm text-[#121212] px-2 py-1 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.25 13.3333C11.5952 13.3333 11.875 13.6132 11.875 13.9583C11.875 14.3035 11.5952 14.5833 11.25 14.5833H8.75C8.40482 14.5833 8.125 14.3035 8.125 13.9583C8.125 13.6132 8.40482 13.3333 8.75 13.3333H11.25ZM13.75 9.16667C14.0952 9.16667 14.375 9.44649 14.375 9.79167C14.375 10.1368 14.0952 10.4167 13.75 10.4167H6.25C5.90482 10.4167 5.625 10.1368 5.625 9.79167C5.625 9.44649 5.90482 9.16667 6.25 9.16667H13.75ZM16.25 5C16.5952 5 16.875 5.27982 16.875 5.625C16.875 5.97018 16.5952 6.25 16.25 6.25H3.75C3.40482 6.25 3.125 5.97018 3.125 5.625C3.125 5.27982 3.40482 5 3.75 5H16.25Z"
                  fill="#121212"
                />
              </svg>
            </span>{" "}
            Filter
          </button>
          <button
            onClick={() => handleCellView()}
            className="flex items-center gap-1 text-sm text-[#121212] px-2 py-1 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0164 5.65096C10.7945 5.42907 10.7743 5.08185 10.9559 4.83717L11.0164 4.76708L12.9893 2.79199C13.094 2.61834 13.3024 2.5 13.5424 2.5C13.7525 2.5 13.9384 2.59072 14.0517 2.72982L14.0956 2.79227L16.0683 4.76708L16.1288 4.83717C16.2902 5.05466 16.2922 5.35318 16.1348 5.57267L16.0683 5.65096L15.9982 5.71147C15.7807 5.87285 15.4822 5.87484 15.2627 5.71745L15.1844 5.65096L14.1667 4.63333V7.78653L14.161 7.86073C14.1195 8.12766 13.858 8.33333 13.5416 8.33333C13.2252 8.33333 12.9637 8.12754 12.9224 7.8606L12.9167 7.78639V4.63333L11.9003 5.65096L11.8302 5.71147C11.5855 5.89302 11.2383 5.87285 11.0164 5.65096ZM11.0188 14.349C11.2407 14.1272 11.5879 14.107 11.8326 14.2885L11.9027 14.349L12.9191 15.3667V12.2136C12.9191 11.9116 13.1989 11.6667 13.544 11.6667C13.8604 11.6667 14.122 11.8723 14.1634 12.1393L14.1691 12.2135V15.3667L15.1869 14.349C15.4088 14.1272 15.756 14.107 16.0007 14.2885L16.0708 14.349C16.2926 14.5709 16.3128 14.9181 16.1313 15.1628L16.0708 15.2329L14.0981 17.2077C13.9934 17.3815 13.785 17.5 13.5449 17.5C13.3049 17.5 13.0964 17.3817 12.9917 17.208L11.0188 15.2329C10.7748 14.9888 10.7748 14.5931 11.0188 14.349ZM5.20834 3.32682C4.17281 3.32682 3.33334 4.16629 3.33334 5.20182V14.7852C3.33334 15.8207 4.17281 16.6602 5.20834 16.6602H8.54168C8.88686 16.6602 9.16668 16.3803 9.16668 16.0352C9.16668 15.69 8.88686 15.4102 8.54168 15.4102H5.20834C4.86317 15.4102 4.58334 15.1303 4.58334 14.7852V5.20182C4.58334 4.85664 4.86317 4.57682 5.20834 4.57682H8.54168C8.88686 4.57682 9.16668 4.297 9.16668 3.95182C9.16668 3.60664 8.88686 3.32682 8.54168 3.32682H5.20834Z"
                  fill="#121212"
                />
              </svg>
            </span>{" "}
            Cell view
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleImport()}
            className="flex items-center gap-1 border border-[#EEEEEE] text-sm text-[#545454] px-3 py-1.5 rounded cursor-pointer"
          >
            <span>
              <svg
                width="13"
                height="18"
                viewBox="0 0 13 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.2082 16.0833C12.5533 16.0832 12.8333 16.363 12.8333 16.7082C12.8333 17.0533 12.5537 17.3332 12.2085 17.3333L1.37518 17.3365C1.03 17.3366 0.75 17.0568 0.75 16.7117C0.75 16.3665 1.02964 16.0866 1.37482 16.0865L12.2082 16.0833ZM6.70686 0.676493L6.79167 0.670788C7.10808 0.670788 7.36958 0.905916 7.41096 1.21098L7.41667 1.29579L7.41583 12.7L10.5173 9.59968C10.7393 9.37781 11.0865 9.35768 11.3311 9.53925L11.4012 9.59977C11.6231 9.82168 11.6432 10.1689 11.4617 10.4136L11.4011 10.4837L7.23643 14.6475C7.01465 14.8692 6.66766 14.8895 6.423 14.7082L6.3529 14.6478L2.18336 10.4839C1.93912 10.24 1.93885 9.84427 2.18276 9.60003C2.40449 9.37799 2.7517 9.35758 2.9965 9.53896L3.06664 9.59942L6.16583 12.6941L6.16667 1.29579C6.16667 0.979375 6.40179 0.717879 6.70686 0.676493L6.79167 0.670788L6.70686 0.676493Z"
                  fill="#545454"
                />
              </svg>
            </span>{" "}
            Import
          </button>
          <button
            onClick={() => handleExport()}
            className="flex items-center gap-1 border border-[#EEEEEE] text-sm text-[#545454] px-3 py-1.5 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.2082 2.92392C15.5533 2.92402 15.8333 2.64428 15.8333 2.29911C15.8333 1.95393 15.5537 1.67402 15.2085 1.67392L4.37518 1.67079C4.03 1.67069 3.75 1.95043 3.75 2.29561C3.75 2.64078 4.02964 2.92069 4.37482 2.92079L15.2082 2.92392ZM9.70686 18.3308L9.79167 18.3365C10.1081 18.3365 10.3696 18.1013 10.411 17.7963L10.4167 17.7115L10.4158 6.3073L13.5173 9.40758C13.7393 9.62944 14.0865 9.64958 14.3311 9.46801L14.4012 9.40749C14.6231 9.18558 14.6432 8.83835 14.4617 8.5937L14.4011 8.5236L10.2364 4.35976C10.0146 4.13802 9.66766 4.11776 9.423 4.29907L9.3529 4.3595L5.18336 8.52335C4.93912 8.76726 4.93885 9.16299 5.18276 9.40723C5.40449 9.62927 5.7517 9.64968 5.9965 9.4683L6.06664 9.40783L9.16583 6.31314L9.16667 17.7115C9.16667 18.0279 9.40179 18.2894 9.70686 18.3308Z"
                  fill="#545454"
                />
              </svg>
            </span>{" "}
            Export
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 border border-[#EEEEEE] text-sm text-[#545454] px-3 py-1.5 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.62231 3.33333H8.50915C8.85433 3.33333 9.13415 3.61316 9.13415 3.95833C9.13415 4.27475 8.89902 4.53624 8.59396 4.57763L8.50915 4.58333H5.62231C4.62993 4.58333 3.81761 5.3543 3.75164 6.32996L3.74731 6.45833V14.375C3.74731 15.3674 4.51828 16.1797 5.49394 16.2457L5.62231 16.25H13.5396C14.532 16.25 15.3443 15.479 15.4103 14.5034L15.4146 14.375V13.9602C15.4146 13.615 15.6944 13.3352 16.0396 13.3352C16.356 13.3352 16.6175 13.5703 16.6589 13.8754L16.6646 13.9602V14.375C16.6646 16.0452 15.3543 17.4094 13.7056 17.4957L13.5396 17.5H5.62231C3.9521 17.5 2.58792 16.1897 2.50165 14.541L2.49731 14.375V6.45833C2.49731 4.78812 3.80762 3.42394 5.45635 3.33767L5.62231 3.33333H8.50915H5.62231ZM12.084 5.43321V3.125C12.084 2.60503 12.673 2.32496 13.0731 2.6165L13.1416 2.67395L18.1371 7.46562C18.3703 7.68924 18.3915 8.04843 18.2008 8.29673L18.1372 8.36765L13.1417 13.1609C12.7665 13.5209 12.1565 13.2897 12.0899 12.7991L12.084 12.7099V10.4388L11.7977 10.4639C9.79799 10.6725 7.88129 11.5732 6.0356 13.1811C5.60301 13.558 4.93374 13.2017 5.00488 12.6324C5.55888 8.19942 7.8771 5.75608 11.8345 5.44959L12.084 5.43321V3.125V5.43321ZM13.334 4.59054V6.04167C13.334 6.38685 13.0542 6.66667 12.709 6.66667C9.48114 6.66667 7.48062 8.06344 6.61625 10.9643L6.55037 11.1965L6.84386 10.9991C8.7076 9.781 10.6654 9.16667 12.709 9.16667C13.0254 9.16667 13.2869 9.4018 13.3283 9.70686L13.334 9.79167V11.244L16.8017 7.91674L13.334 4.59054Z"
                  fill="#545454"
                />
              </svg>
            </span>{" "}
            Share
          </button>
          <button
            onClick={() => handleNewAction()}
            className="flex items-center gap-1 bg-[#4B6A4F] text-[#FFFFFF] text-sm px-4 py-1.5 rounded cursor-pointer"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0001 2.5C10.3452 2.5 10.6251 2.77982 10.6251 3.125V7.91667H12.7046C13.9702 7.91667 14.9963 8.94268 14.9963 10.2083V15.368L16.4334 13.9328C16.6777 13.6888 17.0734 13.6891 17.3173 13.9334C17.5612 14.1776 17.5609 14.5733 17.3167 14.8172L14.8129 17.3177C14.5688 17.5615 14.1733 17.5613 13.9293 17.3174L11.4289 14.8169C11.1848 14.5729 11.1848 14.1771 11.4289 13.9331C11.673 13.689 12.0687 13.689 12.3128 13.9331L13.7463 15.3665V10.2083C13.7463 9.63304 13.2799 9.16667 12.7046 9.16667H7.29165C6.71635 9.16667 6.24998 9.63304 6.24998 10.2083V15.3665L7.68346 13.9331C7.92754 13.689 8.32327 13.689 8.56734 13.9331C8.81142 14.1771 8.81142 14.5729 8.56734 14.8169L6.06692 17.3174C5.82285 17.5614 5.42712 17.5614 5.18304 17.3174L2.68257 14.8169C2.43849 14.5729 2.43849 14.1771 2.68257 13.9331C2.92664 13.689 3.32237 13.689 3.56645 13.9331L4.99998 15.3666V10.2083C4.99998 8.94268 6.026 7.91667 7.29165 7.91667H9.37506V3.125C9.37506 2.77982 9.65488 2.5 10.0001 2.5Z"
                  fill="white"
                />
              </svg>
            </span>{" "}
            New Action
          </button>
        </div>
      </div>
      {/* Expanded area below, styled like the toolbar, not affecting the upper div */}
      {expanded && (
       <FormattingToolbar selectedCells={selectedCells} selectedCell={selectedCell} data={data} setData={setData}/>
      )}
    </div>
  );
};

export default Toolbar;
