import {
  type LineSegment,
  lineSegment,
  type LocalPoint,
  pointFrom,
  pointFromVector,
  vectorAntiNormal,
  vectorFromPoint,
  vectorNormal,
  vectorNormalize,
  vectorScale,
} from "@excalidraw/math";

import { type ExcalidrawFreeDrawElement } from "./types";

function generateSegments(
  input:
    | readonly [x: number, y: number, pressure: number][]
    | readonly [x: number, y: number][],
): LineSegment<LocalPoint>[] {
  if (input.length < 2) {
    return [];
  }

  const offset = (
    x: number,
    y: number,
    pressure: number,
    direction: "left" | "right",
  ) => {
    const p = pointFrom<LocalPoint>(x, y);
    const v = vectorNormalize(vectorFromPoint(p));
    const normal = direction === "left" ? vectorAntiNormal(v) : vectorNormal(v);
    const scaled = vectorScale(normal, pressure / 2);

    return pointFromVector(scaled, p);
  };

  let idx = 0;

  const segments = Array(input.length * 2 - 1);
  segments[idx++] = lineSegment(
    offset(input[0][0], input[0][1], input[0][2] ?? 5, "left"),
    offset(input[1][0], input[1][1], input[0][2] ?? 5, "left"),
  );

  for (let i = 2; i < input.length; i++) {
    const point = input[i];
    const prev = segments[idx - 1][1];

    segments[idx++] = lineSegment(
      prev,
      offset(point[0], point[1], point[2] ?? 5, "left"),
    );
  }

  const prev = segments[idx - 1][1];
  segments[idx++] = lineSegment(
    prev,
    offset(
      input[input.length - 1][0],
      input[input.length - 1][1],
      input[input.length - 1][2] ?? 5,
      "right",
    ),
  );

  for (let i = input.length - 2; i >= 0; i--) {
    const point = input[i];
    const prev = segments[idx - 1][1];

    segments[idx++] = lineSegment(
      prev,
      offset(point[0], point[1], point[2] ?? 5, "right"),
    );
  }

  return segments;
}

export function getStroke(
  input:
    | readonly [x: number, y: number, pressure: number][]
    | readonly [x: number, y: number][],
  options: any,
  element: ExcalidrawFreeDrawElement,
): LocalPoint[] {
  const segments = generateSegments(input);

  return [segments[0][0], ...segments.map((s) => s[1])];
}
