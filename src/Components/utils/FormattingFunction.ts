type CellData = {
  value: string;
  customStyle:Partial<React.CSSProperties>
};

type SheetData = {
  [cellId: string]: CellData;
};

type SetDataFn = React.Dispatch<React.SetStateAction<SheetData>>


export const applyStyleToCells = (
  selectedCells: Set<string>,
  style: object,
  setData: SetDataFn
) => {
  setData((prevData) => {
    const newData = { ...prevData };
    selectedCells.forEach((cellId) => {
      if (newData[cellId]) {
        newData[cellId] = {
          ...newData[cellId],
          customStyle: {
            ...(newData[cellId].customStyle || {}),
            ...style,
          },
        };
      } else {
        newData[cellId] = {
          value: '',
          customStyle: { ...style },
        };
      }
    });
    console.log('Updated data:', newData);
    return newData;
  });
};

export const handleFontSizeChange = (
  value: string,
  setFontSize: (v: string) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setFontSize(value);
  applyStyleToCells(selectedCells, { fontSize: value },  setData);
  console.log('Font size changed to:', value);
};

export const handleFontFamilyChange = (
  value: string,
  setFontFamily: (v: string) => void,
  selectedCells: Set<string>,
 
setData: SetDataFn
) => {
  setFontFamily(value);
  applyStyleToCells(selectedCells, { fontFamily: value },  setData);
};

export const handleFontColorChange = (
  value: string,
  setFontColor: (v: string) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setFontColor(value);
  applyStyleToCells(selectedCells, { color: value }, setData);
};

export const handleBgColorChange = (
  value: string,
  setBgColor: (v: string) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setBgColor(value);
  applyStyleToCells(selectedCells, { backgroundColor: value },  setData);
};

export const handleAlign = (
  align: string,
  setTextAlign: (v: string) => void,
  selectedCells: Set<string>,
 
setData: SetDataFn
) => {
  setTextAlign(align);
  applyStyleToCells(selectedCells, { textAlign: align },  setData);
};

export const toggleBold = (
  bold: boolean,
  setBold: (v: boolean) => void,
  selectedCells: Set<string>,
 
setData: SetDataFn
) => {
  setBold(!bold);
  applyStyleToCells(selectedCells, { fontWeight: bold ? 'normal' : 'bold' },  setData);
};

export const toggleItalic = (
  italic: boolean,
  setItalic: (v: boolean) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setItalic(!italic);
  applyStyleToCells(selectedCells, { fontStyle: italic ? 'normal' : 'italic' },  setData);
};

export const toggleUnderline = (
  underline: boolean,
  setUnderline: (v: boolean) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setUnderline(!underline);
  applyStyleToCells(selectedCells, {
    textDecoration: underline ? 'none' : 'underline',
  }, setData);
};

export const toggleStrikethrough = (
  strikethrough: boolean,
  setStrikethrough: (v: boolean) => void,
  selectedCells: Set<string>,
 
setData: SetDataFn
) => {
  setStrikethrough(!strikethrough);
  applyStyleToCells(selectedCells, {
    textDecoration: strikethrough ? 'none' : 'line-through',
  },  setData);
};

export const toggleCase = (
  isUppercase: boolean,
  setIsUppercase: (v: boolean) => void,
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setIsUppercase(!isUppercase);
  applyStyleToCells(selectedCells, {
    textTransform: isUppercase ? 'none' : 'uppercase',
  },  setData);
};

export const handleClearFormatting = (
  setters: {
    setFontColor: (v: string) => void;
    setBgColor: (v: string) => void;
    setTextAlign: (v: string) => void;
    setBold: (v: boolean) => void;
    setItalic: (v: boolean) => void;
    setUnderline: (v: boolean) => void;
    setStrikethrough: (v: boolean) => void;
    setIsUppercase: (v: boolean) => void;
    setFontFamily: (v: string) => void;
  },
  selectedCells: Set<string>,
  
setData: SetDataFn
) => {
  setters.setFontColor('#000000');
  setters.setBgColor('#ffffff');
  setters.setTextAlign('');
  setters.setBold(false);
  setters.setItalic(false);
  setters.setUnderline(false);
  setters.setStrikethrough(false);
  setters.setIsUppercase(false);
  setters.setFontFamily('');

  applyStyleToCells(selectedCells, {
    fontSize: '',
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: '',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    fontFamily: '',
  }, setData);
};


