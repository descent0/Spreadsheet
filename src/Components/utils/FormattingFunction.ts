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
  data: SheetData,
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
  data: SheetData,
setData: SetDataFn
) => {
  setFontSize(value);
  applyStyleToCells(selectedCells, { fontSize: value }, data, setData);
  console.log('Font size changed to:', value);
};

export const handleFontFamilyChange = (
  value: string,
  setFontFamily: (v: string) => void,
  selectedCells: Set<string>,
 data: SheetData,
setData: SetDataFn
) => {
  setFontFamily(value);
  applyStyleToCells(selectedCells, { fontFamily: value }, data, setData);
};

export const handleFontColorChange = (
  value: string,
  setFontColor: (v: string) => void,
  selectedCells: Set<string>,
  data: SheetData,
setData: SetDataFn
) => {
  setFontColor(value);
  applyStyleToCells(selectedCells, { color: value }, data, setData);
};

export const handleBgColorChange = (
  value: string,
  setBgColor: (v: string) => void,
  selectedCells: Set<string>,
  data: SheetData,
setData: SetDataFn
) => {
  setBgColor(value);
  applyStyleToCells(selectedCells, { backgroundColor: value }, data, setData);
};

export const handleAlign = (
  align: string,
  setTextAlign: (v: string) => void,
  selectedCells: Set<string>,
 data: SheetData,
setData: SetDataFn
) => {
  setTextAlign(align);
  applyStyleToCells(selectedCells, { textAlign: align }, data, setData);
};

export const toggleBold = (
  bold: boolean,
  setBold: (v: boolean) => void,
  selectedCells: Set<string>,
 data: SheetData,
setData: SetDataFn
) => {
  setBold(!bold);
  applyStyleToCells(selectedCells, { fontWeight: bold ? 'normal' : 'bold' }, data, setData);
};

export const toggleItalic = (
  italic: boolean,
  setItalic: (v: boolean) => void,
  selectedCells: Set<string>,
  data: SheetData,
setData: SetDataFn
) => {
  setItalic(!italic);
  applyStyleToCells(selectedCells, { fontStyle: italic ? 'normal' : 'italic' }, data, setData);
};

export const toggleUnderline = (
  underline: boolean,
  setUnderline: (v: boolean) => void,
  selectedCells: Set<string>,
  data: SheetData,
setData: SetDataFn
) => {
  setUnderline(!underline);
  applyStyleToCells(selectedCells, {
    textDecoration: underline ? 'none' : 'underline',
  }, data, setData);
};

export const toggleStrikethrough = (
  strikethrough: boolean,
  setStrikethrough: (v: boolean) => void,
  selectedCells: Set<string>,
 data: SheetData,
setData: SetDataFn
) => {
  setStrikethrough(!strikethrough);
  applyStyleToCells(selectedCells, {
    textDecoration: strikethrough ? 'none' : 'line-through',
  }, data, setData);
};

export const toggleCase = (
  isUppercase: boolean,
  setIsUppercase: (v: boolean) => void,
  selectedCells: Set<string>,
  data: SheetData,
setData: SetDataFn
) => {
  setIsUppercase(!isUppercase);
  applyStyleToCells(selectedCells, {
    textTransform: isUppercase ? 'none' : 'uppercase',
  }, data, setData);
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
  data: SheetData,
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
  }, data, setData);
};


