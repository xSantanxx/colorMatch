import {useState, useEffect, useRef} from "react";
import Gallery from "./gallery.jsx";
import { ToastContainer, toast } from "react-toastify";
import {colorCheck} from "./colorCheck.js";
import ColorThief from "colorthief";
import {default as namer} from "color-namer";
import './App.css'

export default function MainApp({ supabase, session }) {
    const [main, setMain] = useState(true);
    const [cColl, setColl] = useState(false);
    const [showFavorite, setShowFavorite] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const imgR = useRef(null);
    const [orgH, setOrgH] = useState(null);
    const [orgS, setOrgS] = useState(null);
    const [orgL, setOrgL] = useState(null);
    const [comH, setComH] = useState(null);
    const [alpha, setAlpha] = useState(0);
    const [colorValue, setColorValue] = useState(null);
    const [comValue, setComValue] = useState(null);
    const [cMainName, setCMainName] = useState(null);
    const [comName, setComName] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [star, setStar] = useState([]); // Favorites array
    const [loading, setLoading] = useState(true);
    const [id, setId] = useState(null); // For focusing
    const [imageUrl, setImageUrl] = useState(null);
    const [file, setFile] = useState(null);
    const [clothingType, setClothingType] = useState('');

    useEffect(() => {
        getInfo();
        getFav();
    }, []);

    const getInfo = async () => {
        const { data } = await supabase.from("clothes").select();
        setCatalog(data || []);
        setLoading(false);
    };

    const getFav = async () => {
        if (!session) return;
        const { data } = await supabase.from('clothes-fav').select().eq('user_id', session.user.id);
        const info = data?.map(item => item.fav_img) || [];
        setStar(info);
    };

    const toggleFav = async (key) => {
        if (star.includes(key)) {
            setStar(star.filter((ele) => ele !== key));
            toast.success("Deleted from your favorites! :(");
            await supabase.from('clothes-fav').delete().eq('user_id', session.user.id).eq('fav_img', key);
        } else {
            setStar([...star, key]);
            toast.success("Successfully added your favorites! :)");
            await supabase.from('clothes-fav').insert({ user_id: session.user.id, fav_img: key });
        }
    };

    const handleLoadAndUpload = async () => {
        if (!file || !clothingType || clothingType === 'Pick') {
            toast.error("You forgot to choose a clothing type :(");
            return;
        }

        try {
            toast.info("Processing colors and uploading...");

            const colorThief = new ColorThief();
            const img = imgR.current;
            const result = colorThief.getColor(img);
            const palette = colorThief.getPalette(img, 5);

            const comArr = colorCheck(result, palette);

             setCMainName(colorName(`hsl(${comArr[0]}, ${comArr[1]}%, ${comArr[2]}%)`));
             setComName(colorName(`hsl(${comArr[3]}, ${comArr[1]}%, ${comArr[2]}%)`));

             const nameC = colorName(`hsl(${comArr[0]}, ${comArr[1]}%, ${comArr[2]}%)`)
             const nameCC = colorName(`hsl(${comArr[3]}, ${comArr[1]}%, ${comArr[2]}%)`)

             setCMainName(nameC);
             setComName(nameCC);

            const fileName = `${Math.random()}.${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('clothing-c')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('clothing-c')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase.from("clothes").insert({
                image_url: publicUrl,
                category: clothingType,
                hue: comArr[0],
                saturation: comArr[1],
                lightness: comArr[2],
                comHue: comArr[3],
                is_neutral: comArr[1] < 15,
                first_name: session?.user?.user_metadata?.first_name || "Guest",
                colorName: nameC,
                complementaryName: nameCC,
            });

            setOrgH(comArr[0]);
            setOrgS(comArr[1]);
            setOrgL(comArr[2]);
            setComH(comArr[3]);
            setAlpha(1);

            if (dbError) throw dbError;

            toast.success("Successfully loaded image! :D");
            getInfo();

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong during upload");
        }

    };

    const colorName =  (color) => {
        const colorN = namer(color);
        return colorN.ntc[0].name
    }

    const copyClip = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Successfully copied! :)", {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const removal =  () => {
        setImageUrl(null);
        setAlpha(0)
        setCMainName(null);
        setComName(null);
    }

    return (
        <div className={`${loading ? 'animate-pulse' : ''} bg-linear-to-bl from-blue-300/50 to-cyan-300/50 border-2 border-gray-300 h-dvh w-full flex items-center justify-center overflow-x-hidden relative`}>

            <div className="absolute rounded-sm bg-pink-300 hover:bg-green-300 top-0 right-0 border-2 mr-2 mt-2 z-50">
                <button onClick={() => { setMain(!main); setColl(!cColl); }} className="p-1 cursor-pointer">
                    {cColl ? "Enter Mode" : "Gallery"}
                </button>
            </div>

            <div className="absolute top-10 right-0 mr-2 mt-2 z-40">
                {session ? (
                    <div className="border max-w-fit px-2 rounded-full hover:bg-green-300 opacity-25 transition-all duration-300 hover:opacity-95 active:opacity-100">
                        <button className="cursor-pointer" onClick={() => setShowFavorite(!showFavorite)}>
                            {session.user.user_metadata.first_name}
                        </button>
                    </div>
                ) : (
                    <p className="border max-w-fit opacity-25 hover:opacity-95 cursor-pointer rounded-2xl p-0.5">Please Login</p>
                )}
            </div>

            {/* Favorites Section */}
            <div className={`${showFavorite ? 'opacity-95' : 'hidden'} overflow-auto absolute top-18 right-0 mr-2 mt-2 text-center h-3/4 w-1/4 z-50 bg-white/10 backdrop-blur-md rounded-2xl transition-all border border-white/20`}>
                <h1 className="bg-slate-200 text-xl text-black py-2 font-bold">Favorites</h1>
                <div className="flex flex-col gap-4 p-4">
                    {catalog.filter((item) => star.includes(item.id)).map((item) => (
                        <div key={item.id} className="w-full flex flex-col bg-white/20 rounded-xl p-2 shadow-inner">
                            <img
                                src={item.image_url}
                                className="rounded-lg object-contain h-32 w-full bg-black/10"
                                alt="favorite item"
                            />

                            <div className="mt-2 flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wider text-white">
                                    {item.category}
                                </label>

                                <div
                                    className="rounded-full flex items-center justify-center text-white text-[10px] py-1 px-2 shadow-md"
                                    style={{ backgroundColor: `hsl(${item.hue}, ${item.saturation}%, ${item.lightness}%)` }}
                                >
                                    {item.colorName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gallery */}
            <div className={`${!cColl ? 'hidden' : ''} transition duration-300 grid grid-cols-2 gap-2 w-full p-2 h-screen overflow-auto`}>
                {catalog.map((key) => (
                    <Gallery
                        key={key.id}
                        item={key}
                        isFav={star.includes(key.id)}
                        onToggleFav={toggleFav}
                        isFocused={id === key.id}
                        onFocus={setId}
                        onUnfocus={() => setId(null)}
                    />
                ))}
            </div>

            <div className={`${!main ? 'hidden' : ''} relative border border-white/20 bg-white/30 h-125 min-w-97 max-w-full overflow-auto rounded-md p-4`}>

                <div className="flex justify-between items-center">
                    {session ? (
                        <button
                            onClick={() => { setShowHistory(!showHistory); getInfo(); }}
                            className="cursor-pointer p-1 hover:rounded-2xl hover:bg-pink-300/50 text-white"
                        >
                            Profile: {session.user.user_metadata.first_name}
                        </button>
                    ) : <p>Guest</p>}
                </div>

                {/* Collection Section */}
                <div className={`${showHistory ? 'opacity-100' : 'hidden'} rounded-2xl absolute transition duration-300 border max-w-fit max-h-100 overflow-auto text-center bg-slate-200 z-60 text-black`}>
                    <h1 className="font-bold p-2">Your Personal Collection</h1>
                    {catalog.filter((key) => key.first_name === session?.user?.user_metadata?.first_name).map((key) => (
                        <div key={key.id} className="flex flex-col overflow-auto bg-cyan-50/80 border-b border-gray-300 p-2">
                            <img className="max-w-55 m-1 object-contain" src={key.image_url} alt="collection item" />
                            <label className="text-lg">Category: {key.category}</label>
                            <div
                                className="rounded-full flex items-center justify-center text-white mx-2 py-1"
                                style={{ backgroundColor: `hsl(${key.hue}, ${key.saturation}%, ${key.lightness}%)` }}
                            >
                                {key.colorName}
                            </div>
                        </div>
                    ))}
                </div>


                <h1 className="text-2xl text-center mb-4">Add Your Clothing</h1>
                {imageUrl && (
                    <div className={'mt-10 flex items-center justify-center'}>
                        <img
                            ref={imgR}
                            crossOrigin={'anonymous'}
                            className={'top-20 w-65 border-2 rounded-sm max-w-2/4 transition-all duration-300 hover:-translate-y-2'}
                            src={URL.createObjectURL(imageUrl)}
                            alt="Preview"
                        />
                    </div>
                )}

                <div className="flex flex-col items-center gap-4">
                    <input id="files" className="hidden" type="file" onChange={(e) => { setImageUrl(e.target.files[0]); setFile(e.target.files[0]); }} />
                    <div className="flex gap-2">
                        <label className="cursor-pointer bg-white/20 px-3 py-1 rounded-lg" htmlFor="files">Select Image</label>
                        <button className="cursor-pointer bg-green-400/50 px-3 py-1 rounded-lg" onClick={() => handleLoadAndUpload()}>Load</button>
                        <button className="cursor-pointer bg-red-400/50 px-3 py-1 rounded-lg" onClick={removal}>Remove</button>
                    </div>

                    <select value={clothingType} onChange={(e) => setClothingType(e.target.value)} className="bg-black/50 text-white rounded p-1">
                        <option>Pick</option>
                        <option value="Top">Top</option>
                        <option value="Dress">Dress</option>
                        <option value="Pants">Pants</option>
                        <option value="Shoe">Shoe</option>
                    </select>
                </div>
            </div>

            <div className={`${!main ? 'hidden' : ''} border-slate-100 w-1/3 h-1/2 flex flex-col gap-2 ml-4`}>
                <div
                    className="h-1/2 flex items-center justify-center rounded-lg border-2 group cursor-pointer"
                    style={{ backgroundColor: `hsl(${orgH}, ${orgS}%, ${orgL}%, ${alpha})` }}
                    onClick={() => copyClip(cMainName)}
                >
                    <span className="opacity-0 group-hover:opacity-100 transition-all text-white font-bold bg-black/20 p-2 rounded">
                        {cMainName || "Original Color"}
                    </span>
                </div>

                <div
                    className="h-1/2 flex items-center justify-center rounded-lg border-2 group cursor-pointer"
                    style={{ backgroundColor: `hsl(${comH}, ${orgS}%, ${orgL}%, ${alpha})` }}
                    onClick={() => copyClip(comName)}
                >
                    <span className="opacity-0 group-hover:opacity-100 transition-all text-white font-bold bg-black/20 p-2 rounded">
                        {comName || "Complementary"}
                    </span>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}