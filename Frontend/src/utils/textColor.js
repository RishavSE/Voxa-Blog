const parseColor = (color) => {
  const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);

  if (hex) {
    const value =
      hex[1].length === 3
        ? hex[1].split("").map((part) => part + part).join("")
        : hex[1];
    return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
  }

  const rgb = color.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i,
  );

  return rgb ? rgb.slice(1, 4).map(Number) : null;
};

const toHex = (value) =>
  Math.round(value).toString(16).padStart(2, "0");

export const getReadableTextColor = (color, theme) => {
  if (theme !== "dark") return color;

  const rgb = parseColor(color.trim());
  if (!rgb) return color;

  const luminance = rgb
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

  if (luminance >= 0.3) return color;

  const [red, green, blue] = rgb.map((value) => value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const adjustedLightness = Math.max(lightness, 0.68);
  const chroma =
    (1 - Math.abs(2 * adjustedLightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = adjustedLightness - chroma / 2;
  const channels =
    hue < 60
      ? [chroma, second, 0]
      : hue < 120
        ? [second, chroma, 0]
        : hue < 180
          ? [0, chroma, second]
          : hue < 240
            ? [0, second, chroma]
            : hue < 300
              ? [second, 0, chroma]
              : [chroma, 0, second];

  return `#${channels.map((channel) => toHex((channel + offset) * 255)).join("")}`;
};
