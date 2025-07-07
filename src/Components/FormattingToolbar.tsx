import React, { useState, useEffect } from 'react';
import WebFont from 'webfontloader';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
  Droplet,
  Eraser,
  ArrowUpAZ,
  ArrowDownAZ
} from 'lucide-react';
import TooltipWrapper from './utils/ToolTip';

import {
  handleFontFamilyChange,
  handleFontColorChange,
  handleBgColorChange,
  handleAlign,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleCase,
  handleClearFormatting,
} from './utils/FormattingFunction';

type CellData = {
  value: string;
  customStyle: Partial<React.CSSProperties>;
};

type SheetData = {
  [cellId: string]: CellData;
};

type SetDataFn =React.Dispatch<React.SetStateAction<SheetData>>

type FormatbarProps = {
  selectedCells: Set<string>;
  selectedCell: string | null;
  data: SheetData;
  setData: SetDataFn;
};

const FormattingToolbar: React.FC<FormatbarProps> = ({ selectedCells, selectedCell, data, setData }) => {
  const [fontFamily, setFontFamily] = useState('');
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);

  useEffect(() => {
    WebFont.load({
      google: {
        families: [
          'Roboto',
          'Open Sans',
          'Poppins',
          'Lato',
          'Montserrat',
          'Inter',
          'Playfair Display'
        ]
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCell || !data[selectedCell]) return;

    const cell = data[selectedCell];
    const style: Partial<React.CSSProperties> = cell.customStyle || {};

    setFontFamily(style.fontFamily || '');
    setFontColor(style.color || '#000000');
    setBgColor(style.backgroundColor || '#ffffff');
    setTextAlign(style.textAlign || '');

    setBold(style.fontWeight?.toString().toLowerCase() === 'bold');
    setItalic(style.fontStyle?.toString().toLowerCase() === 'italic');

    const decoration =
      typeof style.textDecoration === 'string'
        ? style.textDecoration.toLowerCase()
        : '';
    setUnderline(decoration.includes('underline'));
    setStrikethrough(decoration.includes('line-through'));

    setIsUppercase(style.textTransform?.toString().toLowerCase() === 'uppercase');
  }, [selectedCell, data]);

  const iconBtn = (active: boolean) =>
    `px-2 py-1.5 border border-[#EEEEEE] text-sm text-[#545454] rounded cursor-pointer flex items-center justify-center ${
      active ? 'bg-[#EEEEEE]' : ''
    }`;

  return (
    <div className="w-full flex flex-wrap items-center gap-2 px-2 pb-2 border-b bg-white border-[#EEEEEE] mt-2 rounded">

      {/* Font Family */}
      <TooltipWrapper tooltip="Font Family">
        <select
          value={fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value, setFontFamily, selectedCells, setData)}
          className="px-2 py-1.5 border border-[#EEEEEE] text-sm text-[#545454] rounded cursor-pointer"
        >
          <option value="">Font</option>
          {[
            'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia',
            'Tahoma', 'Trebuchet MS', 'Segoe UI', 'Roboto', 'Open Sans',
            'Lato', 'Montserrat', 'Inter', 'Playfair Display'
          ].map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </TooltipWrapper>

      {/* Font Color */}
      <TooltipWrapper tooltip="Text colour">
        <label className="flex items-center gap-1 px-1 cursor-pointer">
          <Droplet size={16} className="text-[#545454]" />
          <input
            type="color"
            value={fontColor}
            onChange={(e) => handleFontColorChange(e.target.value, setFontColor, selectedCells, setData)}
            className="w-6 h-6 border border-[#EEEEEE] rounded cursor-pointer"
          />
        </label>
      </TooltipWrapper>

      {/* Background Color */}
      <TooltipWrapper tooltip="Fill colour">
        <label className="flex items-center gap-1 px-1 cursor-pointer">
          <PaintBucket size={16} className="text-[#545454]" />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value, setBgColor, selectedCells,  setData)}
            className="w-6 h-6 border border-[#EEEEEE] rounded cursor-pointer"
          />
        </label>
      </TooltipWrapper>

      {/* Align Buttons */}
      <TooltipWrapper tooltip="Align Left">
        <button onClick={() => handleAlign('left', setTextAlign, selectedCells, setData)} className={iconBtn(textAlign === 'left')}>
          <AlignLeft size={18} />
        </button>
      </TooltipWrapper>

      <TooltipWrapper tooltip="Align Center">
        <button onClick={() => handleAlign('center', setTextAlign, selectedCells,  setData)} className={iconBtn(textAlign === 'center')}>
          <AlignCenter size={18} />
        </button>
      </TooltipWrapper>

      <TooltipWrapper tooltip="Align Right">
        <button onClick={() => handleAlign('right', setTextAlign, selectedCells,  setData)} className={iconBtn(textAlign === 'right')}>
          <AlignRight size={18} />
        </button>
      </TooltipWrapper>

      {/* Style Toggles */}
      <TooltipWrapper tooltip="Bold">
        <button onClick={() => toggleBold(bold, setBold, selectedCells, setData)} className={iconBtn(bold)}>
          <Bold size={18} />
        </button>
      </TooltipWrapper>

      <TooltipWrapper tooltip="Italic">
        <button onClick={() => toggleItalic(italic, setItalic, selectedCells,  setData)} className={iconBtn(italic)}>
          <Italic size={18} />
        </button>
      </TooltipWrapper>

      <TooltipWrapper tooltip="Underline">
        <button onClick={() => toggleUnderline(underline, setUnderline, selectedCells, setData)} className={iconBtn(underline)}>
          <Underline size={18} />
        </button>
      </TooltipWrapper>

      <TooltipWrapper tooltip="Strikethrough">
        <button onClick={() => toggleStrikethrough(strikethrough, setStrikethrough, selectedCells,  setData)} className={iconBtn(strikethrough)}>
          <Strikethrough size={18} />
        </button>
      </TooltipWrapper>

      {/* Toggle Case */}
      <TooltipWrapper tooltip="Toggle Case">
        <button onClick={() => toggleCase(isUppercase, setIsUppercase, selectedCells, setData)} className={iconBtn(isUppercase)}>
          {isUppercase ? <ArrowUpAZ size={18} /> : <ArrowDownAZ size={18} />}
        </button>
      </TooltipWrapper>

      {/* Clear Formatting */}
      <TooltipWrapper tooltip="Clear Formatting">
        <button
          onClick={() => handleClearFormatting({
            setFontColor,
            setBgColor,
            setTextAlign,
            setBold,
            setItalic,
            setUnderline,
            setStrikethrough,
            setIsUppercase,
            setFontFamily,
          }, selectedCells,  setData)}
          className={iconBtn(false)}
        >
          <Eraser size={18} />
        </button>
      </TooltipWrapper>
    </div>
  );
};

export default FormattingToolbar;
