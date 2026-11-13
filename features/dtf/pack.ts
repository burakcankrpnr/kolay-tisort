export type PackPiece = {
  id: string;
  label: string;
  imageUrl: string;
  width: number;
  height: number;
  rotation: number;
};

export function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function autofit(pieces: PackPiece[], sheetW: number, sheetH: number, margin = 1) {
  const sorted = [...pieces].sort((a, b) => b.height * b.width - a.height * a.width);
  let x = margin;
  let y = margin;
  let rowH = 0;
  return sorted.map((piece) => {
    let width = piece.width;
    let height = piece.height;
    let rotation = piece.rotation;
    if (x + width > sheetW - margin) {
      x = margin;
      y += rowH + margin;
      rowH = 0;
    }
    if (y + height > sheetH - margin && x === margin && width > height && height <= sheetW - margin * 2) {
      const swap = width;
      width = height;
      height = swap;
      rotation = rotation + 90;
    }
    const placed = { ...piece, x, y, width, height, rotation };
    x += width + margin;
    rowH = Math.max(rowH, height);
    return placed;
  });
}
