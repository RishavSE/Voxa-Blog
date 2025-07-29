import React, { useState } from "react";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $wrapNodes } from "@lexical/selection";

const emojis = ["❤️", "🔥", "🎉", "😊", "😂", "✔️", "👍", "🌟", "📌", "💡", "📷", "🎧", "🎮", "🍕", "✈️"];
const blogTypes = ["Travel", "Tech", "Food", "Fashion", "Health", "Finance", "Education", "Personal"];

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  const applyStyle = (styles) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  };

  const insertEmoji = (emoji) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(emoji);
      }
    });
  };

 const formatBlock = (type) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type);
  };

  const buttonStyle = {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        marginTop: "1.2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        paddingTop: "1rem",
        justifyContent: "center",
      }}
    >
      {/* Blog Type Dropdown */}
      <select style={{ padding: "6px" }}>
        <option value="">Select Blog Type</option>
        {blogTypes.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>

      {/* Text Formatting */}
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} style={buttonStyle}>
        B
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} style={buttonStyle}>
        I
      </button>

      {/* Text Color */}
      <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Text
        <div
          onClick={() => document.getElementById("textColorInput").click()}
          style={{
            width: 20,
            height: 20,
            backgroundColor: textColor,
            borderRadius: 4,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
          title="Pick text color"
        />
        <input
          id="textColorInput"
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            applyStyle({ color: e.target.value });
          }}
          style={{ display: "none" }}
        />
      </label>

      

      {/* Bulleted List */}
      <button
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}
        style={buttonStyle}
      >
        • List
      </button>
       
      {/* Text Alignment */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button onClick={() => formatBlock("left")}>⬅️</button>
      <button onClick={() => formatBlock("center")}>↔️</button>
      <button onClick={() => formatBlock("right")}>➡️</button>
      </div>

      {/* Emoji Box */}
      <details style={{ cursor: "pointer" }}>
        <summary>😊 Emojis</summary>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "6px",
            background: "#f4f4f4",
            borderRadius: "6px",
            marginTop: "4px",
          }}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              style={{
                fontSize: "1.2rem",
                padding: "5px",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
};

export default ToolbarPlugin;
