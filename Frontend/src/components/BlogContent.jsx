import React from "react";
import { getReadableTextColor } from "../utils/textColor";

const formatStyles = (format = 0) => {
  const decorations = [
    ...(format & 4 ? ["line-through"] : []),
    ...(format & 8 ? ["underline"] : []),
  ];

  return {
    ...(format & 1 ? { fontWeight: "bold" } : {}),
    ...(format & 2 ? { fontStyle: "italic" } : {}),
    ...(decorations.length
      ? { textDecoration: decorations.join(" ") }
      : {}),
    ...(format & 16
      ? {
          fontFamily: "monospace",
          backgroundColor: "rgba(127, 127, 127, 0.16)",
          padding: "0.1em 0.25em",
          borderRadius: "3px",
        }
      : {}),
    ...(format & 32 ? { verticalAlign: "sub", fontSize: "0.75em" } : {}),
    ...(format & 64 ? { verticalAlign: "super", fontSize: "0.75em" } : {}),
  };
};

const renderNode = (node, key, theme, insideParagraph = false) => {
  if (node.type === "text") {
    const color = node.style?.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1];
    const style = {
      ...formatStyles(node.format),
      ...(color ? { color: getReadableTextColor(color, theme) } : {}),
    };

    return (
      <span key={key} style={style}>
        {node.text}
      </span>
    );
  }

  const children = node.children?.map((child, index) =>
    renderNode(
      child,
      index,
      theme,
      insideParagraph || node.type === "paragraph",
    ),
  );
  const alignment = ["left", "center", "right", "justify"].includes(
    node.format,
  )
    ? node.format
    : undefined;
  const style = alignment ? { textAlign: alignment } : undefined;

  if (node.type === "linebreak") return <br key={key} />;
  if (node.type === "list") {
    const ListTag = node.listType === "number" ? "ol" : "ul";
    return <ListTag key={key}>{children}</ListTag>;
  }
  if (node.type === "listitem") return <li key={key}>{children}</li>;
  if (node.type === "quote") return <blockquote key={key}>{children}</blockquote>;
  if (node.type === "heading") {
    const HeadingTag = /^h[1-6]$/.test(node.tag) ? node.tag : "h3";
    return <HeadingTag key={key} style={style}>{children}</HeadingTag>;
  }

  if (node.type === "paragraph" && insideParagraph) {
    return <span key={key} style={style}>{children}</span>;
  }

  return <p key={key} style={style}>{children}</p>;
};

function BlogContent({ content, className, theme }) {
  if (!content?.root?.children) return null;

  const activeTheme =
    theme || document.documentElement.dataset.theme || "light";

  return (
    <div className={className}>
      {content.root.children.map((node, index) =>
        renderNode(node, index, activeTheme),
      )}
    </div>
  );
}

export default BlogContent;
