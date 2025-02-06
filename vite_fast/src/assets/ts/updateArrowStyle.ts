// 矢印スタイルを更新する関数
export const updateArrowStyle = (
  arrow: { style: Record<string, any>; headStyle?: Record<string, any> },
  startX: number,
  startY: number,
  endX: number,
  endY: number
) => {
  const cardWidth = 120;
  const cardHeight = 70;

  // ベクトルの差分
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // 矢印の長さと角度を計算
  const angle = Math.atan2(deltaY, deltaX);

  // カード枠までのオフセットを計算
  const halfWidth = cardWidth / 2;
  const halfHeight = cardHeight / 2;

  const startOffsetX =
    Math.cos(angle) *
    (Math.abs(Math.tan(angle)) < halfHeight / halfWidth
      ? halfWidth
      : halfHeight / Math.abs(Math.sin(angle)));
  const startOffsetY =
    Math.sin(angle) *
    (Math.abs(Math.tan(angle)) < halfHeight / halfWidth
      ? halfWidth / Math.abs(Math.cos(angle))
      : halfHeight);

  const endOffsetX =
    Math.cos(angle + Math.PI) *
    (Math.abs(Math.tan(angle + Math.PI)) < halfHeight / halfWidth
      ? halfWidth
      : halfHeight / Math.abs(Math.sin(angle + Math.PI)));
  const endOffsetY =
    Math.sin(angle + Math.PI) *
    (Math.abs(Math.tan(angle + Math.PI)) < halfHeight / halfWidth
      ? halfWidth / Math.abs(Math.cos(angle + Math.PI))
      : halfHeight);

  // 新しい開始点と終了点を計算
  const adjustedStartX = startX + startOffsetX;
  const adjustedStartY = startY + startOffsetY;
  const adjustedEndX = endX + endOffsetX;
  const adjustedEndY = endY + endOffsetY;

  // 矢印の本体スタイルを更新
  arrow.style = {
    ...arrow.style,
    top: `${adjustedStartY}px`,
    left: `${adjustedStartX}px`,
    width: `${Math.sqrt(
      (adjustedEndX - adjustedStartX) ** 2 +
        (adjustedEndY - adjustedStartY) ** 2
    )}px`,
    transform: `rotate(${Math.atan2(
      adjustedEndY - adjustedStartY,
      adjustedEndX - adjustedStartX
    ) * (180 / Math.PI)}deg)`,
    transformOrigin: '0 50%',
  };

  // 矢印の頭 (SVG三角形) のスタイルを更新
  arrow.headStyle = {
    position: 'absolute',
    top: `${adjustedEndY}px`,
    left: `${adjustedEndX}px`,
    width: '20px', // SVGの幅
    height: '17.32px', // SVGの高さ (三角形の高さ)
    transform: `translate(-10px, -8.66px) rotate(${Math.atan2(
      adjustedEndY - adjustedStartY,
      adjustedEndX - adjustedStartX
    ) * (180 / Math.PI) + 90}deg)`, // -10px, -8.66pxで頂点を正確に調整
    transformOrigin: 'center', // 三角形底辺の中心を回転基準に設定
  };
};