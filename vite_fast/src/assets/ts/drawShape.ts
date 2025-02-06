// SVG描画関数 (任意の長さのポイント配列を入力として受け取る)
function drawShapes(
  points: { x: number; y: number }[], // ポイント配列の型を定義
  place: string // 描画場所のIDを表す文字列
): void {
  if (points.length === 0) return; // 入力が空の場合は何もしない

  // 入力されたポイントのx座標とy座標の最小・最大値を取得して、元の図形の範囲を求める
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const originalWidth = maxX - minX;
  const originalHeight = maxY - minY;

  // スケーリング係数
  const scaleX = 50 / originalWidth;
  const scaleY = 50 / originalHeight;
  const scale = Math.min(scaleX, scaleY); // スケーリング比を維持

  // 色は#731a3d;を使用
  const fillColor = "#731a3d";

  // SVG要素を作成
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  // SVGの大きさ
  const svgWidth = Math.min(50, originalWidth * scale); // 50px以下になるように調整
  const svgHeight = Math.min(50, originalHeight * scale); // 50px以下になるように調整
  svg.setAttribute("width", svgWidth.toString());
  svg.setAttribute("height", svgHeight.toString());
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // <polygon>要素を作成
  const polygon = document.createElementNS(svgNS, "polygon");

  // ポイントデータを文字列に変換して座標をスケーリング
  const scaledPoints = points
    .map(p => {
      const scaledX = (p.x - minX) * scale; // x座標をスケーリング
      const scaledY = (p.y - minY) * scale; // y座標をスケーリング
      return `${scaledX},${scaledY}`;
    })
    .join(" ");

  polygon.setAttribute("points", scaledPoints);
  polygon.setAttribute("fill", fillColor); // 図形を塗りつぶす色をCSSから取得した--maroonで指定

  // SVGにpolygonを追加
  svg.appendChild(polygon);

  // 描画するためのコンテナにSVGを追加
  const container = document.getElementById(place);
  if (container) {
    container.innerHTML = ''; // コンテナをクリア
    container.appendChild(svg);
  }
}

export default drawShapes; // デフォルトエクスポートに変更