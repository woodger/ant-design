import { describe, it, expect } from 'vitest';
import {
  initialImageTransform,
  zoomImage,
  imageWheelRatio,
  fixImagePosition,
  imageTouchZoom
} from './image-preview.engine';
const viewport = { width: 1000, height: 800 };
const image = {
  width: 400,
  height: 300,
  offsetWidth: 400,
  offsetHeight: 300,
  offsetLeft: 300,
  offsetTop: 250
};
describe('Image source transforms', () => {
  it('zooms at the viewport center and clamps against source min and max scales', () => {
    expect(zoomImage(initialImageTransform(), 1.5, image, viewport, 1, 2)).toMatchObject(
      { x: 0, y: 0, scale: 1.5 }
    );
    expect(zoomImage(initialImageTransform(), 10, image, viewport, 1, 2).scale).toBe(2);
    expect(zoomImage(initialImageTransform(), 0.5, image, viewport, 1, 2).scale).toBe(1);
  });
  it(
    'anchors wheel zoom at the pointer and recenters small images when returning to scale one',
    () => {
      expect(zoomImage(initialImageTransform(), 1.5, image, viewport, 1, 50, { x: 600, y: 500 }))
        .toMatchObject(
          { x: -50, y: -50, scale: 1.5 }
        );
      expect(
        zoomImage(
          { ...initialImageTransform(), x: 70, y: 80, scale: 1.5 },
          1 / 1.5,
          image,
          viewport,
          1,
          50
        )
      ).toMatchObject(
        { x: 0, y: 0, scale: 1 }
      );
    }
  );
  it('caps each wheel ratio and supports fractional trackpad motion', () => {
    expect(imageWheelRatio(-200, 0.5)).toBe(1.5);
    expect(imageWheelRatio(100, 0.5)).toBeCloseTo(2 / 3);
    expect(imageWheelRatio(-25, 0.5)).toBe(1.125);
  });
  it('allows temporary touch underscale before release and enforces the maximum scale', () => {
    expect(zoomImage(initialImageTransform(), 0.5, image, viewport, 1, 2, undefined, true)
      .scale)
      .toBe(
        0.5
      );
    expect(zoomImage(initialImageTransform(), 3, image, viewport, 1, 2, undefined, true)
      .scale)
      .toBe(
        2
      );
  });
  it('re bounds small images and corrects only overflowing sides for larger images', () => {
    expect(fixImagePosition(400, 300, -50, 0, viewport)).toEqual({ x: 0, y: 0 });
    expect(fixImagePosition(1400, 1000, 10, -300, viewport)).toEqual({ x: 200, y: -100 });
    expect(fixImagePosition(1400, 1000, -100, -50, viewport)).toEqual({});
  });
  it(
    'weights pinch centers by finger displacement without division by zero for stationary gestures',
    () => {
      expect(
        imageTouchZoom([{ x: 0, y: 0 }, { x: 100, y: 0 }], [{ x: -50, y: 0 }, { x: 150, y: 0 }])
      ).toEqual(
        { ratio: 2, center: { x: 50, y: 0 } }
      );
      expect(
        imageTouchZoom([{ x: 0, y: 0 }, { x: 100, y: 0 }], [{ x: 0, y: 0 }, { x: 100, y: 0 }])
      )
        .toEqual(
          { ratio: 1, center: { x: 0, y: 0 } }
        );
    }
  );
});
