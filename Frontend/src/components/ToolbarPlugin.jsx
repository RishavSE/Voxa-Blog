import React, { useState } from "react";
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isElementNode,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListItemNode,
} from "@lexical/list";
import "./toolbarplugin.css";

const emojiCategories = [
  {
    name: "😀 Faces",
    emojis: [
      "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌",
      "😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓",
      "😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫",
      "😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨",
      "😰","😥","😓","🤗","🤔","🫡","🤭","🤫","🤥","😶","😐","😑","😬","🙄",
      "😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮",
      "🤧","😷","🤒","🤕",
    ],
  },
  {
    name: "❤️ Love",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞",
      "💓","💗","💖","💘","💝","💟","♥️","💋","🥰","😍",
    ],
  },
  {
    name: "👋 Gestures",
    emojis: [
      "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋",
      "🤚","🖐️","🖖","👋","👏","🙌","👐","🤲","🤝","🙏","💪","👊","✊","🤏",
      "✍️","🤳",
    ],
  },
  {
    name: "🧑 People",
    emojis: [
      "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵","🙍","🙎","🙅","🙆",
      "💁","🙋","🧏","🙇","🤦","🤷","👮","👷","💂","🕵️","👩‍⚕️","👨‍⚕️",
      "👩‍🏫","👨‍🏫","👩‍💻","👨‍💻","👩‍🎨","👨‍🎨",
    ],
  },
  {
    name: "🐶 Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸",
      "🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗",
      "🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🕷️","🦂","🐢","🐍","🦎","🦖",
      "🦕","🐙","🦑","🦀","🐠","🐟","🐡","🐬","🐳","🐋","🦈",
    ],
  },
  {
    name: "🍕 Food & Drinks",
    emojis: [
      "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥",
      "🥝","🍅","🥑","🥦","🥬","🥕","🌽","🌶️","🍕","🍔","🍟","🌭","🌮","🌯",
      "🥪","🍿","🍩","🍪","🎂","🍰","🧁","🍫","🍬","🍭","☕","🍵","🥤","🧃",
      "🍺","🍻","🍷",
    ],
  },
  {
    name: "🌱 Nature & Weather",
    emojis: [
      "🌱","🌿","☘️","🍀","🌷","🌹","🌺","🌸","🌻","🌼","🌞","🌝","🌙","⭐",
      "🌟","✨","⚡","🔥","💥","🌈","☀️","🌤️","⛅","🌧️","⛈️","❄️","☃️",
      "🌊","🌍","🌎","🌏","🌋","🏔️","🏝️","🏜️",
    ],
  },
  {
    name: "🎮 Activities & Entertainment",
    emojis: [
      "⚽","🏀","🏈","⚾","🎾","🏐","🏆","🥇","🥈","🥉","🎮","🎯","🎲","🎳",
      "🎨","🎭","🎬","🎤","🎧","🎵","🎶","🎸","🎹","🥁","🎺","🎻","🎷",
    ],
  },
  {
    name: "✈️ Travel & Places",
    emojis: [
      "✈️","🛫","🛬","🚗","🚕","🚌","🚎","🏎️","🚓","🚑","🚒","🚲","🏍️","🚂",
      "🚆","🚇","🚢","⛵","🚀","🗺️","🗽","🗼","🏰","🏠","🏢","🏥","🏫",
    ],
  },
  {
    name: "💻 Technology & Objects",
    emojis: [
      "📱","💻","🖥️","⌨️","🖱️","📷","📸","📹","📺","📻","☎️","📞","💡","🔦",
      "🔋","💾","💿","📀","🔑","🔒","🔓","🔔","📢","📣","📌","📍","✏️","📝",
      "📚","📖","📅","📆","🗂️","📁","📂","🗑️","💰","💳","🎁",
    ],
  },
  {
    name: "✔️ Symbols",
    emojis: [
      "✔️","✅","❌","❗","❓","‼️","⁉️","⚠️","⭕","🚫","💯","🔴","🟠","🟡",
      "🟢","🔵","🟣","⚫","⚪","🔺","🔻","➡️","⬅️","⬆️","⬇️","↗️","↘️",
      "🔄","➕","➖","✖️","➗","♾️","©️","®️","™️",
    ],
  },
  {
    name: "🎉 Celebration",
    emojis: [
      "🎉","🎊","🎈","🎁","🥳","🍾","🥂","🎆","🎇","✨","🌟","💫","🔥","👏","🙌",
    ],
  },
  {
    name: "💎 Miscellaneous",
    emojis: [
      "👀","💎","🧠","💭","💬","🗯️","📣","🚀","🎯","🏅","🏆","🔗","📎","🧩",
      "🔧","⚙️","🛠️","💻","🌐","🔍","🔎","❤️","💕","💡","📌",
    ],
  },
];

const blogTypes = [
  "Travel",
  "Tech",
  "Food",
  "Fashion",
  "Health",
  "Finance",
  "Education",
  "Personal",
];

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const [textColor, setTextColor] = useState("#000000");
  const [showEmojis, setShowEmojis] = useState(false);

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

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatBlock = (alignment) => {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      const nodes = selection.getNodes();
      const formatted = new Set();

      nodes.forEach((node) => {
        let current = node;

        while (current && !$isElementNode(current)) {
          current = current.getParent();
        }

        while (current && current.getType() !== "root") {
          if (
            $isListItemNode(current) ||
            current.getType() === "paragraph" ||
            current.getType() === "heading" ||
            current.getType() === "quote"
          ) {
            const key = current.getKey();

            if (!formatted.has(key)) {
              current.setFormat(alignment);
              formatted.add(key);
            }

            break;
          }

          current = current.getParent();
        }
      });
    });
  };

  return (
    <div className="blog-toolbar">
      <div className="toolbar-controls">
        <div className="toolbar-type-wrapper">
          <select className="blog-type-select" defaultValue="">
            <option value="" disabled>
              Select Blog Type
            </option>

            {blogTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn bold-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText("bold")}
            title="Bold"
          >
            B
          </button>

          <button
            type="button"
            className="toolbar-btn italic-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText("italic")}
            title="Italic"
          >
            I
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="color-control">
          <span className="color-label">Text</span>

          <label className="color-picker" title="Choose text color">
            <span
              className="color-preview"
              style={{ backgroundColor: textColor }}
            />

            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const color = e.target.value;
                setTextColor(color);
                applyStyle({ color });
              }}
            />
          </label>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn list-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
            }
            title="Bulleted list"
          >
            <span className="bullet-symbol">•</span>
            <span>List</span>
          </button>

          <button
            type="button"
            className="toolbar-btn list-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
            }
            title="Numbered list"
          >
            <span>1.</span>
            <span>List</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group alignment-group">
          <button
            type="button"
            className="toolbar-btn alignment-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatBlock("left")}
            title="Align left"
          >
            <span>☰</span>
          </button>

          <button
            type="button"
            className="toolbar-btn alignment-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatBlock("center")}
            title="Align center"
          >
            <span>≡</span>
          </button>

          <button
            type="button"
            className="toolbar-btn alignment-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatBlock("right")}
            title="Align right"
          >
            <span>☷</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="emoji-control">
          <button
            type="button"
            className={`emoji-button ${
              showEmojis ? "emoji-button-active" : ""
            }`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowEmojis((prev) => !prev)}
          >
            <span className="emoji-icon">😊</span>
            <span className="emoji-text">Emojis</span>
            <span className="emoji-arrow">
              {showEmojis ? "▲" : "▼"}
            </span>
          </button>
        </div>
      </div>

      {showEmojis && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <div className="emoji-picker-title">
              <strong>Choose an emoji</strong>
              <span>Click an emoji to insert it into your blog</span>
            </div>

            <button
              type="button"
              className="emoji-close"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowEmojis(false)}
            >
              ×
            </button>
          </div>

          <div className="emoji-picker-content">
            {emojiCategories.map((category) => (
              <div className="emoji-category" key={category.name}>
                <div className="emoji-category-title">
                  {category.name}
                </div>

                <div className="emoji-grid">
                  {category.emojis.map((emoji, index) => (
                    <button
                      key={`${category.name}-${emoji}-${index}`}
                      type="button"
                      className="emoji-item"
                      title={`Insert ${emoji}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        insertEmoji(emoji);
                        setShowEmojis(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolbarPlugin;