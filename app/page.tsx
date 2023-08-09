"use client";
import React from "react";
const SAME_ORIGIN_IMAGE = "/next_assets/image.png";
export default function Home() {
  const [imgSrc, setImgSrc] = React.useState(SAME_ORIGIN_IMAGE);

  const useSameOriginImage = React.useCallback(() => {
    setImgSrc(SAME_ORIGIN_IMAGE);
  }, []);

  const buttonClass =
    "border-2 border-blue-300 rounded-md py-1 px-2 hover:bg-blue-400";

  const imgRef = React.useRef<HTMLImageElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const printImage = React.useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (img === null || canvas === null) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const rect = img.getBoundingClientRect();
    ctx?.drawImage(img, 0, 0, rect.width, rect.height);
  }, []);

  const [imageData, setImageData] = React.useState<ImageData | null>(null);
  const CROP_X = 50;
  const CROP_Y = 50;
  const CROP_WIDTH = 50;
  const CROP_HEIGHT = 50;
  const readDetail = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    const imageData = ctx.getImageData(CROP_X, CROP_Y, CROP_WIDTH, CROP_HEIGHT);
    if (imageData === undefined) {
      return;
    }

    ctx.strokeStyle = "#FF0000";
    ctx.strokeRect(CROP_X, CROP_Y, CROP_WIDTH, CROP_HEIGHT);

    setImageData(imageData);
  }, []);

  const usefulImage = React.useMemo(() => {
    if (imageData === null) {
      return [];
    }

    type Pixel = [
      Uint8ClampedArray[number],
      Uint8ClampedArray[number],
      Uint8ClampedArray[number],
      Uint8ClampedArray[number]
    ];

    type Line = Pixel[];
    type Image = Line[];
    const data: Image = [];
    console.log(imageData.data.length);
    for (let i = 0; i < CROP_HEIGHT; i += 1) {
      const rawLine: Uint8ClampedArray = imageData.data.slice(
        i * CROP_WIDTH * 4,
        (i + 1) * CROP_WIDTH * 4
      );
      // split rawLine by 4pixel
      const line: Line = [];
      for (let j = 0; j < rawLine.length; j += 4) {
        const pixel: Pixel = [
          rawLine[j],
          rawLine[j + 1],
          rawLine[j + 2],
          rawLine[j + 3],
        ];
        line.push(pixel);
      }

      data.push(line);
    }

    return data;
  }, [imageData]);

  return (
    <main className="p-4 max-w-[640px]">
      <div>
        <div>
          Image url:
          <br /> {imgSrc}
        </div>
        <div className="grid gap-2 grid-cols-2 mt-2">
          <button className={buttonClass} onClick={useSameOriginImage}>
            Show Same origin image
          </button>
          <label>
            Cross origin image
            <input
              className="p-2"
              onChange={(e) => setImgSrc(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-10 w-[420px]">
          <img src={imgSrc} alt="your image" ref={imgRef} />
        </div>
      </div>
      <div className="mt-10">
        Canvas{" "}
        <div className="grid gap-2 grid-cols-2">
          <button className={buttonClass} onClick={printImage}>
            print to canvas
          </button>
          <button className={buttonClass + "ml-2"} onClick={readDetail}>
            read image detail
          </button>
        </div>
        <div className="flex mt-2">
          <canvas
            key={imgSrc}
            ref={canvasRef}
            className="border-2 border-red-400"
            width="480px"
            height="480px"
          />
          <div className="ml-4">
            {usefulImage.map((line, index) => (
              <div key={"L" + index} className="flex">
                {line.map((pixel, index) => (
                  <div
                    key={"P" + index}
                    style={{
                      backgroundColor: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`,
                    }}
                    className="w-1 h-1"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
