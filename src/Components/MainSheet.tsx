import React, { useState, useEffect, useRef, useCallback } from "react";

// Type definitions
interface CellData {
  value: string;
  formula?: string;
  customStyle?: React.CSSProperties;
}

interface SpreadsheetData {
  [key: string]: CellData;
}

const getColumnName = (index: number): string => {
  let result = "";
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
};

const getCellKey = (col: number, row: number): string => {
  return `${getColumnName(col)}${row}`;
};

const parseColumnIndex = (columnName: string): number => {
  let result = 0;
  for (let i = 0; i < columnName.length; i++) {
    result = result * 26 + (columnName.charCodeAt(i) - 64);
  }
  return result - 1;
};

const parseCellKey = (
  cellKey: string
): { colName: string; colIndex: number; rowIndex: number } => {
  const index = [...cellKey].findIndex((char) => !isNaN(Number(char)));
  const colName = cellKey.slice(0, index).toUpperCase();
  const rowIndex = parseInt(cellKey.slice(index), 10) - 1;
  const colIndex = parseColumnIndex(colName);
  return { colName, colIndex, rowIndex };
};

type SheetProps = {
  selectedCell: string | null;
  selectedCells: Set<string>;
  onSelectedCellChange: (cell: string | null) => void;
  onSelectedCellsChange: (cells: Set<string>) => void;
  data: SpreadsheetData;
  setData: React.Dispatch<React.SetStateAction<SpreadsheetData>>;
  searchQuery?: string;
};

const ProjectSpreadsheet: React.FC<SheetProps> = ({
  selectedCell,
  selectedCells,
  onSelectedCellChange,
  onSelectedCellsChange,
  data,
  setData,
  searchQuery,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [visibleRows, setVisibleRows] = useState<number>(100);
  const [visibleCols, setVisibleCols] = useState<number>(11);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelecting = useRef<boolean>(false);
  const anchorCell = useRef<string | null>(null);

  const scrollToCell = (
    containerRef: React.RefObject<HTMLDivElement>,
    colIndex: number,
    rowIndex: number
  ) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cellWidth = colIndex === 0 ? 256 : 124; // First data column is wider
    const cellHeight = 32;

    // Calculate cell position
    const cellLeft = 32 + (colIndex === 0 ? 0 : 256 + (colIndex - 1) * 124); // Account for row header and first column
    const cellTop = (rowIndex + 1) * cellHeight; // +1 because we skip the colored header row

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate center positions
    const cellCenterX = cellLeft + cellWidth / 2;
    const cellCenterY = cellTop + cellHeight / 2;

    // Calculate scroll positions to center the cell
    const newScrollLeft = cellCenterX - containerWidth / 2;
    const newScrollTop = cellCenterY - containerHeight / 2;

    // Scroll to the calculated position (centered)
    container.scrollTo({
      left: Math.max(0, newScrollLeft),
      top: Math.max(0, newScrollTop),
      behavior: "smooth",
    });
  };
  const findMatchingCell = useCallback(
    (query: string): string | null => {
      if (!query.trim()) return null;

      const lowerQuery = query.toLowerCase();

      for (const [cellKey, cellData] of Object.entries(data)) {
        // Parse the cell key to get row information
        const { rowIndex } = parseCellKey(cellKey);

        // Skip rows 0 and 1 (rowIndex -1 means row 0, rowIndex 0 means row 1)
        if (rowIndex <= 0) {
          continue;
        }

        if (
          cellData.value &&
          cellData.value.toLowerCase().startsWith(lowerQuery)
        ) {
          return cellKey;
        } else if (cellData.value) {
          const plainText = cellData.value.replace(/<[^>]*>/g, "");
          if (plainText.toLowerCase().includes(lowerQuery)) {
            return cellKey;
          }
        }
      }

      return null;
    },
    [data]
  );

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      const matchingCell = findMatchingCell(searchQuery);
      if (matchingCell) {
        // Set the found cell as active
        onSelectedCellChange(matchingCell);
        onSelectedCellsChange(new Set([matchingCell]));

        // Parse cell position
        const { colIndex, rowIndex } = parseCellKey(matchingCell);

        // Ensure the cell is visible by expanding visible rows/cols if needed
        if (rowIndex >= visibleRows - 10) {
          setVisibleRows(Math.max(visibleRows, rowIndex + 20));
        }
        if (colIndex >= visibleCols - 2) {
          setVisibleCols(Math.max(visibleCols, colIndex + 5));
        }

        // Scroll to the cell after a short delay to ensure DOM is updated
        setTimeout(() => {
          scrollToCell(containerRef, colIndex, rowIndex);
        }, 100);
      }
    }
  }, [
    searchQuery,
    findMatchingCell,
    onSelectedCellChange,
    onSelectedCellsChange,
    visibleRows,
    visibleCols,
  ]);
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleRows((prev) => prev + 50);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  //keyboard navigation

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard navigation if we're editing a cell
      if (editingCell) return;

      // Don't handle if no cell is selected
      if (!selectedCell) return;

      const { colIndex, rowIndex } = parseCellKey(selectedCell);
      let newColIndex = colIndex;
      let newRowIndex = rowIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          newRowIndex = Math.max(1, rowIndex - 1); // Don't go above row 1 (index 0)
          break;
        case "ArrowDown":
          e.preventDefault();
          newRowIndex = Math.min(visibleRows - 1, rowIndex + 1);
          // Expand visible rows if needed
          if (newRowIndex >= visibleRows - 10) {
            setVisibleRows((prev) => prev + 20);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          newColIndex = Math.max(0, colIndex - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          newColIndex = Math.min(visibleCols - 2, colIndex + 1);
          // Expand visible cols if needed
          if (newColIndex >= visibleCols - 3) {
            setVisibleCols((prev) => prev + 5);
          }
          break;
        case "Enter":
          e.preventDefault();
          // Start editing the current cell
          setEditingCell(selectedCell);
          setEditValue(data[selectedCell]?.value || "");
          break;
        case "Delete":
          e.preventDefault();
          // Clear the selected cell(s)
          setData((prev) => {
            const newData = { ...prev };
            selectedCells.forEach((cellKey) => {
              if (newData[cellKey]) {
                newData[cellKey] = { ...newData[cellKey], value: "" };
              }
            });
            return newData;
          });
          break;
        case "Tab":
          e.preventDefault();
          // Move right (or left if Shift+Tab)
          if (e.shiftKey) {
            newColIndex = Math.max(0, colIndex - 1);
          } else {
            newColIndex = Math.min(visibleCols - 2, colIndex + 1);
            if (newColIndex >= visibleCols - 3) {
              setVisibleCols((prev) => prev + 5);
            }
          }
          break;
        case "Escape":
          // Clear selection
          onSelectedCellChange(null);
          onSelectedCellsChange(new Set());
          return;
        default:
          return;
      }

      if (newColIndex !== colIndex || newRowIndex !== rowIndex) {
        const newCellKey = getCellKey(newColIndex, newRowIndex + 1);
        onSelectedCellChange(newCellKey);
        onSelectedCellsChange(new Set([newCellKey]));
        anchorCell.current = newCellKey;

        // Scroll to the new cell after a short delay
        setTimeout(() => {
          scrollToCell(containerRef, newColIndex, newRowIndex);
        }, 50);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedCell,
    selectedCells,
    editingCell,
    data,
    visibleRows,
    visibleCols,
    onSelectedCellChange,
    onSelectedCellsChange,
    setData,
  ]);

  const handleCellClick = (cellKey: string): void => {
    if (editingCell) setEditingCell(null);
    onSelectedCellChange(cellKey);
    onSelectedCellsChange(new Set([cellKey]));
    anchorCell.current = cellKey;
    setEditValue(data[cellKey]?.value || "");
  };

  const handleCellDoubleClick = (cellKey: string): void => {
    setEditingCell(cellKey);
    setEditValue(data[cellKey]?.value || "");
  };

  const handleMouseDown = (cellKey: string) => {
    isSelecting.current = true;
    anchorCell.current = cellKey;
    onSelectedCellChange(cellKey);
    onSelectedCellsChange(new Set([cellKey]));
  };

  const handleMouseOver = (cellKey: string) => {
    if (!isSelecting.current || !anchorCell.current) return;
    const start = parseCellKey(anchorCell.current);
    const end = parseCellKey(cellKey);

    const range = new Set<string>();
    for (
      let r = Math.min(start.rowIndex, end.rowIndex);
      r <= Math.max(start.rowIndex, end.rowIndex);
      r++
    ) {
      for (
        let c = Math.min(start.colIndex, end.colIndex);
        c <= Math.max(start.colIndex, end.colIndex);
        c++
      ) {
        range.add(getCellKey(c, r + 1));
      }
    }
    onSelectedCellsChange(range);
  };

  useEffect(() => {
    const up = () => (isSelecting.current = false);
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, []);

  const handleInputChange = (value: string): void => setEditValue(value);

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Enter") {
      saveCellValue();

      if (selectedCell) {
        const { colIndex, rowIndex } = parseCellKey(selectedCell);
        const newRowIndex = Math.min(visibleRows - 1, rowIndex + 1);
        if (newRowIndex >= visibleRows - 10) {
          setVisibleRows((prev) => prev + 20);
        }
        const newCellKey = getCellKey(colIndex, newRowIndex + 1);
        onSelectedCellChange(newCellKey);
        onSelectedCellsChange(new Set([newCellKey]));
        anchorCell.current = newCellKey;
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      saveCellValue();
      // Move right after Tab (or left if Shift+Tab)
      if (selectedCell) {
        const { colIndex, rowIndex } = parseCellKey(selectedCell);
        let newColIndex;
        if (e.shiftKey) {
          newColIndex = Math.max(0, colIndex - 1);
        } else {
          newColIndex = Math.min(visibleCols - 2, colIndex + 1);
          if (newColIndex >= visibleCols - 3) {
            setVisibleCols((prev) => prev + 5);
          }
        }
        const newCellKey = getCellKey(newColIndex, rowIndex + 1);
        onSelectedCellChange(newCellKey);
        onSelectedCellsChange(new Set([newCellKey]));
        anchorCell.current = newCellKey;
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const saveCellValue = (): void => {
    if (editingCell) {
      setData((prev: SpreadsheetData) => ({
        ...prev,
        [editingCell]: { ...(prev[editingCell] || {}), value: editValue },
      }));
      setEditingCell(null);
    }
  };

  const getMergedStyle = (
    cellKey: string,
    col: number,
    row: number
  ): React.CSSProperties | undefined => {
    let custom = data[cellKey]?.customStyle || {};
    const isSelected = selectedCells.has(cellKey);
    const isEditing = editingCell === cellKey;
    const fontSize = custom?.fontSize || "12px";
    custom = {
      ...custom,
      fontSize,
    };
    // Only apply selection background if selected and not editing
    if (isSelected && !isEditing && col > 0 && row > 0) {
      return {
        ...custom,
      };
    }
    return custom;
  };

  const getCellStyle = (col: number, row: number): string => {
    const cellKey = getCellKey(col - 1, row);
    const isSelected = selectedCells.has(cellKey);
    const isEditing = editingCell === cellKey;
    const isActive = selectedCell === cellKey;
    const { rowIndex } = parseCellKey(selectedCell ?? "A1");

    let baseStyle = `border-r border-b border-[#F6F6F6] h-[32px] flex items-center px-2 cursor-cell select-none`;

    if (isSelected && !isEditing) {
      baseStyle += " bg-[#e3f3e9]";
      if (isActive) {
        baseStyle +=
          " bg-transparent shadow-[inset_0_0_0_1px_#6C8B70,_0_1px_1px_rgba(0,0,0,0.1)]";
      }
    } else if (col === 0) {
      if (row == 1) {
        baseStyle += " bg-[#EEEEEE] font-medium text-gray-700";
      } else if (row === rowIndex + 1) {
        baseStyle += " bg-[#c7d7c9] font-medium text-gray-700";
      }
    } else {
      const custom = data[cellKey]?.customStyle ?? "";
      if (!custom || !("backgroundColor" in custom)) {
        baseStyle += " bg-white";
      }
    }

    return baseStyle;
  };

  const getCellContent = (col: number, row: number): React.ReactNode => {
    if (col === 0) {
      const label = row === 0 ? "" : row === 1 ? "#" : `${row - 1}`;
      return <span className="text-center w-full text-xs">{label}</span>;
    }

    const cellKey = getCellKey(col - 1, row);
    const cellData = data[cellKey];
    const isEditing = editingCell === cellKey;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={saveCellValue}
          onKeyDown={handleInputKeyDown}
          className="w-full h-full border-0 outline-0 bg-transparent px-0"
          autoFocus
        />
      );
    }

    // Handle stringified elements (HTML/JSX as string)
    if (
      typeof cellData?.value === "string" &&
      cellData.value.trim().startsWith("<") &&
      cellData.value.trim().endsWith(">")
    ) {
      return (
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: cellData.value }}
        />
      );
    }

    // Default: plain string
    return <span className="truncate w-full">{cellData?.value || ""}</span>;
  };

  return (
    <div className="h-auto bg-white overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ height: "calc(100vh - 60px)" }}
      >
        <div className="inline-block min-w-full">
          {Array.from({ length: visibleRows }, (_, rowIndex) => {
            const row = rowIndex;
            // Render colored row as the first row (row 1)
            if (row === 0) {
              return (
                <div key={row} className="flex">
                  {/* Sticky row label cell */}
                  <div className="sticky left-0 z-0 w-[32px] min-w-[32px] border-r border-b border-[#F6F6F6] bg-[#FFFFFF]" />
                  <div className="w-[628px] min-w-[628px] h-[32px] border-r border-b px-[8px] border-[#F6F6F6] bg-[#E2E2E2] py-[2px] flex gap-2 items-center">
                    <div className="bg-[#EEEEEE] w-[158px] h-full flex items-center gap-1 px-1 rounded">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.16668 4.66666C6.44282 4.66666 6.66668 4.89052 6.66668 5.16666C6.66668 5.4177 6.48167 5.62553 6.24056 5.66124L6.16668 5.66666H4.66668C3.37801 5.66666 2.33334 6.71133 2.33334 8C2.33334 9.24264 3.30473 10.2584 4.52958 10.3294L4.66668 10.3333H6.16668C6.44282 10.3333 6.66668 10.5572 6.66668 10.8333C6.66668 11.0844 6.48167 11.2922 6.24056 11.3279L6.16668 11.3333H4.66668C2.82573 11.3333 1.33334 9.84095 1.33334 8C1.33334 6.21483 2.73665 4.75743 4.50031 4.67074L4.66668 4.66666H6.16668ZM11.3333 4.66666C13.1743 4.66666 14.6667 6.15905 14.6667 8C14.6667 9.78516 13.2634 11.2426 11.4997 11.3293L11.3333 11.3333H9.83334C9.5572 11.3333 9.33334 11.1095 9.33334 10.8333C9.33334 10.5823 9.51835 10.3745 9.75946 10.3388L9.83334 10.3333H11.3333C12.622 10.3333 13.6667 9.28866 13.6667 8C13.6667 6.75736 12.6953 5.74159 11.4704 5.67062L11.3333 5.66666H9.83334C9.5572 5.66666 9.33334 5.44281 9.33334 5.16666C9.33334 4.91563 9.51835 4.7078 9.75946 4.67209L9.83334 4.66666H11.3333ZM4.66668 7.5H11.3333C11.6095 7.5 11.8333 7.72385 11.8333 8C11.8333 8.25313 11.6452 8.46232 11.4012 8.49543L11.3333 8.5H4.66668C4.39053 8.5 4.16668 8.27614 4.16668 8C4.16668 7.74687 4.35478 7.53767 4.59883 7.50456L4.66668 7.5H11.3333H4.66668Z"
                          fill="#1A8CFF"
                        />
                      </svg>

                      <p className="h-full text-[12px] content-center text-[#545454]">
                        Q3 Financial Overview
                      </p>
                    </div>
                    <div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.8337 3.45341C10.6662 3.67298 10.7085 3.98673 10.9281 4.15419C12.1203 5.06343 12.8333 6.47214 12.8333 8C12.8333 10.4907 10.9494 12.5413 8.52887 12.8047L8.97978 12.3536C9.17504 12.1583 9.17504 11.8417 8.97978 11.6464C8.80227 11.4689 8.52449 11.4528 8.32875 11.598L8.27267 11.6464L6.93934 12.9798C6.76183 13.1573 6.74569 13.4351 6.89092 13.6308L6.93934 13.6869L8.27267 15.0202C8.46793 15.2155 8.78451 15.2155 8.97978 15.0202C9.15729 14.8427 9.17343 14.5649 9.02819 14.3692L8.97978 14.3131L8.47962 13.8139C11.4769 13.57 13.8333 11.0602 13.8333 8C13.8333 6.15685 12.9721 4.45548 11.5345 3.35905C11.3149 3.19159 11.0012 3.23384 10.8337 3.45341ZM7.02022 0.979782C6.82495 1.17504 6.82495 1.49163 7.02022 1.68689L7.51971 2.18616C4.52272 2.4304 2.16666 4.94006 2.16666 8C2.16666 9.76297 2.95417 11.3983 4.2872 12.4994C4.5001 12.6753 4.81526 12.6452 4.99112 12.4323C5.16699 12.2194 5.13696 11.9043 4.92406 11.7284C3.81862 10.8153 3.16666 9.46147 3.16666 8C3.16666 5.50958 5.05021 3.45908 7.47046 3.19535L7.02022 3.64645C6.82495 3.84171 6.82495 4.15829 7.02022 4.35356C7.21548 4.54882 7.53206 4.54882 7.72732 4.35356L9.06066 3.02022C9.25592 2.82496 9.25592 2.50838 9.06066 2.31312L7.72732 0.979782C7.53206 0.78452 7.21548 0.78452 7.02022 0.979782Z"
                          fill="#FA6736"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="w-[124px] min-w-[124px] h-[32px] border-r border-b border-[#F6F6F6] " />
                  <div className="w-[124px] min-w-[124px] h-[32px] border-r border-b border-[#F6F6F6] bg-[#D2E0D4]  flex items-center gap-2 justify-center">
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.50001 2C8.77616 2 9.00001 2.22386 9.00001 2.5V6.33333H10.6636C11.6762 6.33333 12.497 7.15414 12.497 8.16667V12.2944L13.6467 11.1462C13.8421 10.9511 14.1587 10.9513 14.3538 11.1467C14.5489 11.3421 14.5487 11.6587 14.3533 11.8538L12.3503 13.8541C12.155 14.0492 11.8386 14.0491 11.6434 13.8539L9.64308 11.8536C9.44782 11.6583 9.44782 11.3417 9.64308 11.1464C9.83834 10.9512 10.1549 10.9512 10.3502 11.1464L11.497 12.2932V8.16667C11.497 7.70643 11.1239 7.33333 10.6636 7.33333H6.33328C5.87304 7.33333 5.49995 7.70643 5.49995 8.16667V12.2932L6.64673 11.1464C6.84199 10.9512 7.15858 10.9512 7.35384 11.1464C7.5491 11.3417 7.5491 11.6583 7.35384 11.8536L5.3535 13.8539C5.15824 14.0492 4.84166 14.0492 4.6464 13.8539L2.64602 11.8536C2.45076 11.6583 2.45076 11.3417 2.64602 11.1465C2.84128 10.9512 3.15786 10.9512 3.35312 11.1464L4.49995 12.2932V8.16667C4.49995 7.15414 5.32076 6.33333 6.33328 6.33333H8.00001V2.5C8.00001 2.22386 8.22387 2 8.50001 2Z"
                        fill="#A3ACA3"
                      />
                    </svg>

                    <div className="font-medium text-[#505450]">ABC</div>
                    <svg
                      width="11"
                      height="4"
                      viewBox="0 0 11 4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.66665 2C2.66665 2.64433 2.14431 3.16667 1.49998 3.16667C0.855647 3.16667 0.333313 2.64433 0.333313 2C0.333313 1.35567 0.855647 0.833336 1.49998 0.833336C2.14431 0.833336 2.66665 1.35567 2.66665 2ZM6.66665 2C6.66665 2.64433 6.14431 3.16667 5.49998 3.16667C4.85565 3.16667 4.33331 2.64433 4.33331 2C4.33331 1.35567 4.85565 0.833336 5.49998 0.833336C6.14431 0.833336 6.66665 1.35567 6.66665 2ZM9.49998 3.16667C10.1443 3.16667 10.6666 2.64433 10.6666 2C10.6666 1.35567 10.1443 0.833336 9.49998 0.833336C8.85565 0.833336 8.33331 1.35567 8.33331 2C8.33331 2.64433 8.85565 3.16667 9.49998 3.16667Z"
                        fill="#AFAFAF"
                      />
                    </svg>
                  </div>
                  <div className="w-[248px] min-w-[248px] h-[32px] border-r border-b border-[#F6F6F6] bg-[#DCCFFC] flex justify-center gap-2 items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.00001 2C8.27616 2 8.50001 2.22386 8.50001 2.5V6.33333H10.1636C11.1762 6.33333 11.997 7.15414 11.997 8.16667V12.2944L13.1467 11.1462C13.3421 10.9511 13.6587 10.9513 13.8538 11.1467C14.0489 11.3421 14.0487 11.6587 13.8533 11.8538L11.8503 13.8541C11.655 14.0492 11.3386 14.0491 11.1434 13.8539L9.14308 11.8536C8.94782 11.6583 8.94782 11.3417 9.14308 11.1464C9.33834 10.9512 9.65492 10.9512 9.85018 11.1464L10.997 12.2932V8.16667C10.997 7.70643 10.6239 7.33333 10.1636 7.33333H5.83328C5.37304 7.33333 4.99995 7.70643 4.99995 8.16667V12.2932L6.14673 11.1464C6.34199 10.9512 6.65858 10.9512 6.85384 11.1464C7.0491 11.3417 7.0491 11.6583 6.85384 11.8536L4.8535 13.8539C4.65824 14.0492 4.34166 14.0492 4.1464 13.8539L2.14602 11.8536C1.95076 11.6583 1.95076 11.3417 2.14602 11.1465C2.34128 10.9512 2.65786 10.9512 2.85312 11.1464L3.99995 12.2932V8.16667C3.99995 7.15414 4.82076 6.33333 5.83328 6.33333H7.50001V2.5C7.50001 2.22386 7.72387 2 8.00001 2Z"
                        fill="white"
                      />
                    </svg>

                    <div className="text-[#463E59] font-medium">
                      Answer a question
                    </div>
                    <svg
                      width="12"
                      height="4"
                      viewBox="0 0 12 4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.16665 2C3.16665 2.64433 2.64431 3.16667 1.99998 3.16667C1.35565 3.16667 0.833313 2.64433 0.833313 2C0.833313 1.35567 1.35565 0.833336 1.99998 0.833336C2.64431 0.833336 3.16665 1.35567 3.16665 2ZM7.16665 2C7.16665 2.64433 6.64431 3.16667 5.99998 3.16667C5.35565 3.16667 4.83331 2.64433 4.83331 2C4.83331 1.35567 5.35565 0.833336 5.99998 0.833336C6.64431 0.833336 7.16665 1.35567 7.16665 2ZM9.99998 3.16667C10.6443 3.16667 11.1666 2.64433 11.1666 2C11.1666 1.35567 10.6443 0.833336 9.99998 0.833336C9.35565 0.833336 8.83331 1.35567 8.83331 2C8.83331 2.64433 9.35565 3.16667 9.99998 3.16667Z"
                        fill="#AFAFAF"
                      />
                    </svg>
                  </div>

                  <div className="w-[124px] min-w-[124px] h-[32px] border-r border-b border-[#F6F6F6] bg-[#FAC2AF] flex justify-center items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.00001 2C8.27616 2 8.50001 2.22386 8.50001 2.5V6.33333H10.1636C11.1762 6.33333 11.997 7.15414 11.997 8.16667V12.2944L13.1467 11.1462C13.3421 10.9511 13.6587 10.9513 13.8538 11.1467C14.0489 11.3421 14.0487 11.6587 13.8533 11.8538L11.8503 13.8541C11.655 14.0492 11.3386 14.0491 11.1434 13.8539L9.14308 11.8536C8.94782 11.6583 8.94782 11.3417 9.14308 11.1464C9.33834 10.9512 9.65492 10.9512 9.85018 11.1464L10.997 12.2932V8.16667C10.997 7.70643 10.6239 7.33333 10.1636 7.33333H5.83328C5.37304 7.33333 4.99995 7.70643 4.99995 8.16667V12.2932L6.14673 11.1464C6.34199 10.9512 6.65858 10.9512 6.85384 11.1464C7.0491 11.3417 7.0491 11.6583 6.85384 11.8536L4.8535 13.8539C4.65824 14.0492 4.34166 14.0492 4.1464 13.8539L2.14602 11.8536C1.95076 11.6583 1.95076 11.3417 2.14602 11.1465C2.34128 10.9512 2.65786 10.9512 2.85312 11.1464L3.99995 12.2932V8.16667C3.99995 7.15414 4.82076 6.33333 5.83328 6.33333H7.50001V2.5C7.50001 2.22386 7.72387 2 8.00001 2Z"
                        fill="white"
                      />
                    </svg>
                    <div className="font-medium text-[#695149]">Extract</div>
                    <svg
                      width="12"
                      height="4"
                      viewBox="0 0 12 4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.16665 2C3.16665 2.64433 2.64431 3.16667 1.99998 3.16667C1.35565 3.16667 0.833313 2.64433 0.833313 2C0.833313 1.35567 1.35565 0.833336 1.99998 0.833336C2.64431 0.833336 3.16665 1.35567 3.16665 2ZM7.16665 2C7.16665 2.64433 6.64431 3.16667 5.99998 3.16667C5.35565 3.16667 4.83331 2.64433 4.83331 2C4.83331 1.35567 5.35565 0.833336 5.99998 0.833336C6.64431 0.833336 7.16665 1.35567 7.16665 2ZM9.99998 3.16667C10.6443 3.16667 11.1666 2.64433 11.1666 2C11.1666 1.35567 10.6443 0.833336 9.99998 0.833336C9.35565 0.833336 8.83331 1.35567 8.83331 2C8.83331 2.64433 9.35565 3.16667 9.99998 3.16667Z"
                        fill="#AFAFAF"
                      />
                    </svg>
                  </div>

                  <div
                    onClick={() => {
                      setVisibleCols((prev) => prev + 1);
                    }}
                    className="w-[124px] min-w-[124px] h-[32px] border-r border-b border-[#F6F6F6] bg-[#EEEEEE] text-center content-center flex items-center justify-center"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.79153 2.5C10.1079 2.5 10.3695 2.73501 10.4109 3.04007L10.4167 3.12487L10.4177 9.16667H16.4619C16.8071 9.16667 17.0869 9.44649 17.0869 9.79167C17.0869 10.1081 16.8518 10.3696 16.5467 10.411L16.4619 10.4167H10.4177L10.4194 16.4576C10.4194 16.8028 10.1397 17.0827 9.7945 17.0827C9.47808 17.0827 9.21654 16.8477 9.17509 16.5427L9.16937 16.4578L9.16766 10.4167H3.12683C2.78165 10.4167 2.50183 10.1368 2.50183 9.79167C2.50183 9.47525 2.73696 9.21376 3.04202 9.17237L3.12683 9.16667H9.16766L9.16666 3.12513C9.16659 2.77995 9.44635 2.5 9.79153 2.5Z"
                        fill="#04071E"
                      />
                    </svg>
                  </div>
                  {Array.from({ length: visibleCols - 11 }, (_, col) => {
                    col = col + 11;
                    const isDataCell = col > 0;
                    const cellKey = isDataCell ? getCellKey(col - 1, row) : "";
                    return (
                      <div
                        key={`${col}-${row}`}
                        className={`
                        ${getCellStyle(col, row)}
                        ${
                          col === 0
                            ? "sticky left-0 z-0 w-[32px] min-w-[32px]"
                            : col === 1
                            ? "w-[256px] min-w-[256px]"
                            : "w-[124px] min-w-[124px]"
                        }
                      `}
                        style={
                          isDataCell
                            ? getMergedStyle(cellKey, col, row)
                            : undefined
                        }
                        onClick={() => isDataCell && handleCellClick(cellKey)}
                        onDoubleClick={() =>
                          isDataCell && handleCellDoubleClick(cellKey)
                        }
                        onMouseDown={() =>
                          isDataCell && handleMouseDown(cellKey)
                        }
                        onMouseOver={() =>
                          isDataCell && handleMouseOver(cellKey)
                        }
                      >
                        {getCellContent(col, row)}
                      </div>
                    );
                  })}
                </div>
              );
            }
            return (
              <div key={row} className="flex">
                {Array.from({ length: visibleCols }, (_, col) => {
                  const isDataCell = col > 0 && row >= 0;
                  const cellKey = isDataCell ? getCellKey(col - 1, row) : "";
                  return (
                    <div
                      key={`${col}-${row}`}
                      className={`
                        ${getCellStyle(col, row)}
                        ${
                          col === 0
                            ? `sticky left-0 z-10 ${
                                row != 1 ? "bg-[#ffffff]" : ""
                              } w-[32px] min-w-[32px]`
                            : col === 1
                            ? "w-[256px] min-w-[256px]"
                            : "w-[124px] min-w-[124px]"
                        }
                      `}
                      style={
                        isDataCell
                          ? getMergedStyle(cellKey, col, row)
                          : undefined
                      }
                      onClick={() => isDataCell && handleCellClick(cellKey)}
                      onDoubleClick={() =>
                        isDataCell && handleCellDoubleClick(cellKey)
                      }
                      onMouseDown={() => isDataCell && handleMouseDown(cellKey)}
                      onMouseOver={() => isDataCell && handleMouseOver(cellKey)}
                    >
                      {getCellContent(col, row)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectSpreadsheet;
