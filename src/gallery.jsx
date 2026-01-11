import { useState, useRef } from "react";
import ColorThief from 'colorthief';
import namer from "color-namer";
import { colorCheck } from "./colorCheck.js"; // Your custom logic
import { toast } from "react-toastify";
import './App.css'

export default function Gallery({ item, onToggleFav, isFav, isFocused, onFocus, onUnfocus }) {
    const [colorData, setColorData] = useState(null);
    const imgR = useRef(null);

    const getColorName = (h, s, l) => {
        const names = namer(`hsl(${h}, ${s}%, ${l}%)`);
        return names.ntc[0].name;
    };

    const handleLoad = () => {
        if (colorData) return;
        try {
            const colorThief = new ColorThief();
            const result = colorThief.getColor(imgR.current);
            const palette = colorThief.getPalette(imgR.current, 5);

            const comArr = colorCheck(result, palette);

            setColorData({
                h: comArr[0], s: comArr[1], l: comArr[2], comH: comArr[3],
                mainName: getColorName(comArr[0], comArr[1], comArr[2]),
                comName: getColorName(comArr[3], comArr[1], comArr[2])
            });
        } catch (err) { console.error(err); }
    };

    const copyClip = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Successfully copied! :)", {
            position: "top-right",
            autoClose: 3000,
        });
    };

    return (
        <div
            onClick={() => onFocus(item.id)}
            className={`${item.id === isFocused ? 'z-40 fixed inset-4 bg-white/80 p-6' : 'relative bg-white/50 opacity-75'} 
            cursor-pointer border-4 border-transparent hover:border-[var(--hover-color)] p-1 rounded-lg flex flex-col transition-all duration-300 hover:-translate-y-2`}
            style={{ '--hover-color': `hsl(${item.hue}, ${item.saturation}%, ${item.lightness}%)` }}
        >
            {isFocused && (
                <button onClick={(e) => { e.stopPropagation(); onUnfocus(); }}
                        className="absolute top-2 left-2 rounded-full w-4 h-4 bg-red-500 z-50" />
            )}

            <img
                ref={imgR}
                loading="lazy"
                crossOrigin="anonymous"
                onLoad={handleLoad}
                className={`${isFocused ? 'h-3/4' : 'h-40'} object-contain w-full rounded-md`}
                src={item.image_url}
            />

            <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-bold text-gray-800">Uploaded by: {item.first_name}</label>
                <label className="text-xs text-gray-600">Category: {item.category}</label>

                <button onClick={(e) => { e.stopPropagation(); onToggleFav(item.id); }} className="w-6 h-6">
                    <svg fill={isFav ? 'yellow' : 'none'} stroke="currentColor" viewBox="0 0 24 24" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                    </svg>
                </button>

                <div className="flex flex-col gap-2 mt-3">
                    <div
                        className="rounded-full flex items-center justify-center text-white py-1 text-xs cursor-pointer shadow-sm"
                        style={{ backgroundColor: `hsl(${item.hue}, ${item.saturation}%, ${item.lightness}%)` }}
                        onClick={(e) => { e.stopPropagation(); copyClip(item.colorName); }}
                    >
                        {item.colorName}
                    </div>

                    <div
                        className="rounded-full flex items-center justify-center text-white py-1 text-xs cursor-pointer shadow-sm"
                        style={{ backgroundColor: `hsl(${item.comHue}, ${item.saturation}%, ${item.lightness}%)` }}
                        onClick={(e) => { e.stopPropagation(); copyClip(item.complementaryName); }}
                    >
                        {item.complementaryName}
                    </div>
                </div>
            </div>
        </div>
    );
}