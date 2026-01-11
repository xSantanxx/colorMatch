import './App.css'
import {use, useEffect, useRef, useState} from "react";
import ColorThief from 'colorthief';
import {colorCheck} from "./colorCheck.js";
import {createClient} from "@supabase/supabase-js";
import {motion, animate, useMotionValue, useTransform} from "framer-motion";
import {ToastContainer, toast} from "react-toastify";
import { default as namer } from "color-namer"

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function App() {
        const [visible, setVisible] = useState(false);
        const [accExist, setAccExist] = useState(false);
        const [session, setSession] = useState(false);
        const [main, setMain] = useState(false);
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [firstName, setFirstName] = useState("");
        const [orgH, setOrgH] = useState(null);
        const [orgS, setOrgS] = useState(null);
        const [orgL, setOrgL] = useState(null);
        const [comH, setComH] = useState(null);
        const [alpha, setAlpha] = useState(1);
        const [color, setColor] = useState(null);
        const [palette, setPalette] = useState(null);
        const imgR = useRef(null);
        const [catalog, setCatalog] = useState([]);
        const [imageUrl, setImageUrl] = useState('');
        const [clothingType, setClothingType] = useState('');
        const [file, setFile] = useState(null);
        const [cColl,setColl] = useState(false);
        const count = useMotionValue(0)
        const rounded = useTransform(() => Math.round(count.get()))
        const [countDown, setCountDown] = useState(false);
        const [focus, setFocus] = useState(false);
        const [id, setId] = useState(null);
        const [showHistory, setShowHistory] = useState(false);
        const [showFavorite, setShowFavorite] = useState(false);
        const [star, setStar] = useState([]);
        const [loading, setLoading] = useState(true);
        const [colorValue, setColorValue] = useState(null);
        const [comValue, setComValue] = useState(null);

        const copiedName = () => {
            toast.success("Successfully copied! :)", {
                position: "top-right",
                autoClose: 5000,
            });
        }


        const successAdd = () => {
            toast.success("Successfully added your favorites! :)", {
                position: "top-right",
                autoClose: 5000,
            });
        }

        const failAdd = () => {
            toast.success("Deleted from your favorites! :(", {
                position: "top-right",
                autoClose: 3000,
            });
        }

        const loadedImg = () => {
            toast.success("Successfully loaded image! :D", {
                position: "top-right",
                autoClose: 3000,
            })
        }

        const errorClothing = () => {
            toast.error("You forgot to choose a clothing type :(", {
                position: "top-right",
                autoClose: 5000,
            })
        }

        useEffect(() => {
            const controls = animate(count, 100, {duration: 5});

            controls.then(() => {
                setVisible(!visible);
                setCountDown(true);
            })

            return () => controls.stop()
        }, [])


    useEffect(() => {
        async function getFav(){
            const user = await supabase.auth.getSession();
            const arr = [await supabase.from('clothes-fav').select().eq('user_id', `${user['data']['session']['user']['id']}`)]
            let info = []
            {arr.map(({data}) => {
                {data.map((item) => {
                   info.push(item['fav_img'])
                })}
            })}
            setStar(info)
        }
        getFav();
    }, []);


    async function uploadFav(star) {

        const user = await supabase.auth.getSession();
        console.log(star);

        const {data, error} = await supabase
            .from('clothes-fav')
            .insert({user_id: user['data']['session']['user']['id'], fav_img: star})

        if(error){
            console.log(error)
        }
    }

    async function deleteFav(key){
        const user = await supabase.auth.getSession();

        const {data, error} = await supabase
            .from('clothes-fav')
            .delete()
            .eq('user_id', `${user['data']['session']['user']['id']}`)
            .eq('fav_img', `${key}`)

        if(error){
            console.log(error)
        }
    }


        async function uploadImg() {

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${file.name}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('clothing-c')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                return null;
            }

            const { data: {publicUrl}} = supabase.storage
                .from('clothing-c')
                .getPublicUrl(filePath);

            return publicUrl;
        }

        async function insert(hue, saturation, lightness, comHue, mainColor, comColor) {

            if(clothingType === ''){
                errorClothing();
                return null;
            } else {

                let neu = false;
                if(saturation < 15){
                    neu = true;
                }

                const imgName = await uploadImg();

                if(imgName){
                    const { data, error } = await supabase.from("clothes").insert({
                        image_url: imgName, category: clothingType, hue: hue, saturation: saturation, lightness: lightness, comHue: comHue,  is_neutral: neu, first_name: session.user.user_metadata.first_name,
                        colorName: mainColor, complementaryName: comColor
                    })

                    if (error) {
                        console.log(error)
                    } else {
                        console.log(data)
                    }
                }
            }
        }

        // get all the images
        async function getInfo() {
            const {data} = await supabase.from("clothes").select();
            setCatalog(data);
            setLoading(false);
        }

        useEffect( () => {
            getInfo();
        }, []);

    const signInFailed = () => {
        toast.error("Please enter in the details", {
            position: "top-right",
            autoClose: 3000,
        })
    }

        const signIn = async (e) => {
            e.preventDefault();
            const {data, error } =await supabase.auth.signInWithPassword({email: email, password: password})

            if (error) {
                signInFailed();
                setVisible(!visible)
            } else {
                setMain(true);
            }
        }

        useEffect(() => {
            supabase.auth.getSession().then(({data: {session}}) => {
                setSession(session);
            })

            const { data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            })
            return () => subscription.unsubscribe()
        }, [])

        const signUpFailed = () => {
            toast.error("Please enter in the details", {
                position: "top-right",
                autoClose: 3000,
            })
        }

        const signUp = async (e) => {
            e.preventDefault();
            const {error} = await supabase.auth.signUp({email, password, options: {
                data: {
                    first_name: firstName,
                }
                }});
            if (error) {
                signUpFailed()
            } else {
                signIn(email, password)
            }
        }

        const imageLoad = () => {
            const colorThief = new ColorThief();
            const img = imgR.current;
            const result = colorThief.getColor(img);
            const result2 = colorThief.getPalette(img, 5);
            setColor(result);
            setPalette(result2);
        }

        const removal = () => {
            setImageUrl(null);
            setAlpha(0)
        }

        const loadImg =  async () => {
            const comArr = colorCheck(color, palette);
            setOrgH(comArr[0]);
            setOrgS(comArr[1]);
            setOrgL(comArr[2]);
            setComH(comArr[3]);
            setAlpha(1);
            loadedImg()
            const cMainName =  colorName(`hsl(${comArr[0]}, ${comArr[1]}%, ${comArr[2]}%)`)
            const comName = colorName(`hsl(${comArr[3]}, ${comArr[1]}%, ${comArr[2]}%)`)
            setColorValue(cMainName)
            setComValue(comName)
            await insert(comArr[0], comArr[1], comArr[2], comArr[3], cMainName, comName);
        }

        const changeState = () => {
            setVisible(false);
            setAccExist(true);
        }

        const mainPageS = () => {
            setVisible(false);
            if(session !== null){
                setMain(true);
            } else {
                setVisible(true);
            }
        }

        const mainPageL = () => {
            setAccExist(false);
        }

        const gallery = () => {
            setMain(!main);
            setColl(!cColl);
        }

        const guestMode = async () => {
            setVisible(false);
            setColl(true);
        }

        const focusDiv = (key) => {
            setId(key);
             setFocus(true);
        }

        const unFocusDiv = (e) => {
            e.stopPropagation()
            setId(null);
            setFocus(false);
        }


        const addEleToFav = async (key) => {
            if(star.includes(key)){
                setStar(star.filter((ele) => ele !== key))
                failAdd()
                await deleteFav(key)
            } else {
                setStar([...star, key])
                successAdd()
                await uploadFav(key)
            }
        }

        const loadColl = () => {
            setShowHistory(!showHistory)
            getInfo();
        }

        const colorName =  (color) => {
            const colorN = namer(color);
            return colorN.ntc[0].name
        }

        const copyClip = (text) => {
            navigator.clipboard.writeText(text);
            copiedName()
        }

        return (
            <>
            <div className={'flex justify-center w-full'}>
                <motion.pre animate={{opacity: countDown ? 0 : 1}} transition={{duration: 0.5}} className={`text-4xl flex justify-center items-center text-purple-200 h-dvh fixed inset-0 z-100 pointer-events-none`}>{rounded}</motion.pre>
                <div className={`${!visible ? 'hidden' : ''} min-w-1/5 max-w-full rounded-2xl z-10 mt-30 ml-auto mr-auto absolute flex flex-col justify-center items-center shadow-2xl backdrop-blur-md h-1/2 bg-white/10`}>
                    {/*Sign Up Sheet*/}
                    <h1 className={'text-lg text-shadow-2xs'}>Sign Up</h1>
                    <form className={'flex flex-col'} onSubmit={signUp}>
                        <input className={'border rounded-sm m-4'} type='text' placeholder={'First Name'} onChange={(e) => setFirstName(e.target.value)}></input>
                        <input className={'border rounded-sm m-4'} type='email' placeholder={'Email'} onChange={(e) => setEmail(e.target.value)}></input>
                        <input className={'border rounded-sm m-4'} type='password' placeholder={'Password'} onChange={(e) => setPassword(e.target.value)}></input>
                        <div>
                            <button onClick={mainPageS} className={'cursor-pointer border-2 p-1 border-black text-white max-w-fit ml-4 mr-2 rounded-lg bg-red-500 hover:bg-green-500'} type='submit'>Sign Up</button>
                            <button onClick={changeState} className={'cursor-pointer border-2 p-1 border-black text-white max-w-fit rounded-lg bg-red-500 hover:bg-green-500'} type='submit'>Sign In</button>
                            <button onClick={guestMode} className={'mx-2 cursor-pointer border-2 p-1 border-black text-white max-w-fit rounded-lg bg-red-500 hover:bg-green-500'} type='submit'>Login as Guest</button>
                        </div>
                    </form>
                </div>
                {/*Login Sheet*/}
                <div className={`${!accExist ? 'hidden' : ''} rounded-2xl z-10 mt-30 ml-auto mr-auto absolute flex flex-col justify-center items-center backdrop-blur-md shadow-2xl min-w-1/4 max-w-full h-1/2 bg-white/10`}>
                    <h1 className={'text-lg'}>Login</h1>
                    <form className={'flex flex-col'} onSubmit={signIn}>
                        <input className={'border-2 rounded-sm m-4'} type='email' placeholder={'Email'} onChange={(e) => setEmail(e.target.value)}></input>
                        <input className={'border-2 rounded-sm m-4'} type='password' placeholder={'Password'} onChange={(e) => setPassword(e.target.value)}></input>
                        <div>
                            <button onClick={mainPageL} className={'cursor-pointer border-2 p-1 border-black text-white w-25 ml-15 mr-2 rounded-lg bg-red-500 hover:bg-green-500'} type='submit'>Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
            {/* main screen */}
            <motion.div className={`${loading ? 'animate-pulse duration-100' : ''} bg-linear-to-bl from-blue-300/50 to-cyan-300/50 border-2 border-gray-300 h-dvh w-full flex items-center justify-center overflow-x-scroll`}>
                <div className={`${!cColl ? 'hidden' : ''} absolute rounded-sm bg-pink-300 hover:bg-green-300 top-0 right-0 border-2 mr-2 mt-2`}>
                    <button onClick={gallery} className={'p-1 cursor-pointer z-50'}>Enter Mode</button>
                </div>
                {/*Favorites*/}
                <div> {session ? <div className={`absolute top-10 right-0 mr-2 mt-2 border max-w-fit px-2 rounded-full hover:bg-green-300 opacity-25 transition-all duration-300 hover:opacity-95 active:opacity-100`}><button className={'opacity-25 hover:opacity-95 cursor-pointer active:opacity-100'} onClick={() => setShowFavorite(!showFavorite)}>{session.user.user_metadata.first_name}</button></div> : <p className={'absolute top-10 right-0 mr-2 mt-2 border max-w-fit opacity-25 hover:opacity-95 cursor-pointer rounded-2xl p-0.5 active:opacity-100'}>Please Login</p> }</div>
                <div className={`${showFavorite ? 'opacity-95' : 'hidden'} overflow-auto opacity-0 absolute top-18 right-0 mr-2 mt-2 text-center h-3/4 w-1/4 z-10 bg-white/10 backdrop-blur-md rounded-2xl transition-all`}><h1 className={'bg-slate-200 text-xl'}>Favorites</h1>
                <div className={''}>
                    {catalog.filter((key) =>  star.includes(key.id)).map((key) => (
                        <div key={key.id} className={'w-30 flex flex-col my-2 ml-2'}>
                            <img src={`${key.image_url}`} className={'rounded-xl object-cover'} />
                            <label className={'text-md'}>Category: {key.category}</label>
                            <div className={'rounded-full flex items-center justify-center text-white'}
                                 style={{backgroundColor: `hsl(${key.hue}, ${key.saturation}%, ${key.lightness}%)`}}>{key.colorName}
                            </div>
                        </div>
                    ))}
                </div></div>
                {/*Gallery*/}
                <div className={`${!cColl ? 'hidden' : ''} transition duration-300 grid grid-cols-2 gap-2 max-w-3/4 p-2 h-screen overflow-auto`}>
                    {catalog.map((key) => (
                        <div onClick={() => focusDiv(key.id)} key={key.id} className={`${key.id === id ? 'z-40 m-auto inset-0 opacity-100 bg-white/50 backdrop-blur-2xl absolute col-span-2 h-124 w-90' : ''} hover:opacity-100 bg-white/50 backdrop-blur-2xl max-h-fit max-w-130 opacity-75 cursor-pointer border-4 border-transparent hover:border-(--hover-color) hover:shadow-[0_0_15px_var(--hover-color)] p-1 rounded-lg flex flex-col transition-all duration-300 hover:-translate-y-2`}
                        style={{'--hover-color': `hsl(${key.hue}, ${key.saturation}%, ${key.lightness}%)`}}>
                            <button onClick={unFocusDiv} className={`${key.id === id ? '' : 'hidden'} hover:outline-solid cursor-pointer absolute top-0 left-0 rounded-full text-center w-3 h-3 mb-1 bg-red-500`}></button>
                            <img loading={'lazy'} decoding={'async'} className={`${key.id === id ? 'h-83' : ''} object-contain max-h-120 max-w-full cursor-pointer`} src={`${key.image_url}`}  />
                            <div className={'flex flex-col z-40'}>
                                <label className={'text-xl'}>Uploaded by: {key.first_name}</label>
                                <label className={'text-xl'}>Category: {key.category}</label>
                                <div className={'flex flex-row gap-4'}>
                                    <button onClick={() => addEleToFav(key.id)} className={`${key.id === id ? '' : 'hidden'} cursor-pointer`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill={star.includes(key.id) ? 'yellow' : 'none'} viewBox="0 0 24 24"
                                             stroke-width="1.5" stroke="currentColor" className={`size-6 transition-all duration-300 ease-in-out`}>
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className={'rounded-full flex items-center justify-center text-white'}
                                     style={{backgroundColor: `hsl(${key.hue}, ${key.saturation}%, ${key.lightness}%)`}}><button className={'z-10 cursor-pointer'} onClick={() => copyClip(key.colorName)}>{key.colorName}</button>
                                </div>
                                <div className={'rounded-full mt-3 flex items-center justify-center text-white'}
                                     style={{backgroundColor: `hsl(${key.comHue}, ${key.saturation}%, ${key.lightness}%)`}}><button className={'cursor-pointer z-10'} onClick={() => copyClip(key.complementaryName)}>{key.complementaryName}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <ToastContainer></ToastContainer>
                </div>
                <motion.div layout transition={{duration: 2, type: "spring", stiffness: 50}}
                            className={`${!main ? 'hidden' : ''} relative border border-white/20 bg-white/30 backdrop-blur-md h-125 min-w-97 max-w-full shadow-lg overflow-auto rounded-md`}>
                    <h1 className={'text-2xl text-center'}>Add Your Clothing</h1>
                    <div>{session ?
                        <button onClick={loadColl} className={'cursor-pointer p-1 hover:rounded-2xl hover:bg-pink-300/50'}>Profile: {session.user.user_metadata.first_name}</button> : <p>Guest</p>}</div>
                    <div className={`${showHistory ? 'opacity-100' : 'hidden'} rounded-2xl opacity-0 absolute transition duration-300 border max-w-fit max-h-100 overflow-auto text-center bg-slate-200 z-60`}>
                        <h1>Collection</h1>
                        {catalog.filter((key) =>  key.first_name === session.user.user_metadata.first_name).map((key) => (
                            <div key={key.id} className={'flex flex-col overflow-auto bg-cyan-50/80 backdrop-blur-2xl'}>
                                <img className={'max-w-55 m-1 object-contain'} src={`${key.image_url}`} />
                                <label className={'text-lg'}>Category: {key.category}</label>
                                <div className={'rounded-full flex items-center justify-center text-white mx-2'} style={{backgroundColor: `hsl(${key.hue}, ${key.saturation}%, ${key.lightness}%)`}}>{key.colorName}</div>
                            </div>
                        ))}
                    </div>
                    <div className={'absolute top-0 right-0 p-1 rounded-md hover:bg-green-300'}><button onClick={gallery} className={'cursor-pointer'}>Gallery</button></div>
                    {/*main image screen*/}
                    {imageUrl && (
                        <div className={'mt-10 flex items-center justify-center'}>
                            <img ref={imgR} crossOrigin={'anonymous'} onLoad={imageLoad}  className={'top-20 w-65 border-2 rounded-sm max-w-2/4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl'} src={URL.createObjectURL(imageUrl)}/>
                        </div>
                    )}
                    <div className={'flex items-center justify-center'}>
                        <input id={'files'} className={'cursor-pointer hidden'} type="file" name="image" onChange={(event) => {
                            setImageUrl(event.target.files[0]);
                            setFile(event.target.files[0]);
                        }} />
                            <div className={'flex flex-row justify-center gap-2'}>
                                <label className={'relative cursor-pointer duration-300 rounded-lg'} htmlFor={'files'}>Select Image</label>
                                <button className={'relative cursor-pointer'} onClick={loadImg}>Load</button>
                                <div className={'relative'}><button className={'cursor-pointer'} onClick={removal}>Remove</button></div>
                            </div>
                        <ToastContainer></ToastContainer>
                        <form>
                            <div className={`w-3/4 h-1/2 mt-2 p-1 ml-2 mb-2 flex flex-row`}>
                                <label className={'text-sm flex flex-row'}>
                                    Clothing:
                                    <select value={clothingType} onChange={(e) => setClothingType(e.target.value)}>
                                        <option>Pick</option>
                                        <option value={'Top'}>Top</option>
                                        <option value={'Dress'}>Dress</option>
                                        <option value={'Pants'}>Pants</option>
                                        <option value={'Shoe'}>Shoe</option>
                                    </select>
                                </label>
                            </div>
                        </form>
                    </div>
                </motion.div>
                <div className={`${!main ? 'hidden' : ''} border-slate-100 w-1/3 h-1/2`}>
                    <div className={`h-1/2 flex items-center justify-center shadow-md rounded-lg border-2`} style={{ backgroundColor: `hsl(${orgH}, ${orgS}%, ${orgL}%, ${alpha})`}}>
                    <button onClick={() => {copyClip(colorValue)}} className={`relative cursor-pointer duration-300 h-full w-full hover:opacity-100 opacity-0 transition-all`}>{colorValue}</button></div>
                    <div className={'h-1/2 flex items-center justify-center rounded-lg border-2'} style={{ backgroundColor: `hsl(${comH}, ${orgS}%, ${orgL}%, ${alpha})`}}><button onClick={() => {copyClip(comValue)}} className={'relative cursor-pointer duration-300 h-full w-full hover:opacity-100 opacity-0 transition-all'}>{comValue}</button></div>
                </div>
                <ToastContainer></ToastContainer>
            </motion.div>
            </>
        )
}

export default App
