import { useState } from "react";
import { toast } from "react-toastify";
import './App.css'

export default function VerifyComp({ supabase, onLogin }) {
    const [visible, setVisible] = useState(true); // Sign Up view
    const [accExist, setAccExist] = useState(false); // Login view
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");

    const signIn = async (e) => {
        if (e) e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error("Please enter in the details");
            setVisible(true);
        } else {
            onLogin();
        }
    };

    const signUp = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: firstName } }
        });
        if (error) {
            toast.error("Please enter in the details");
        } else {
            signIn();
        }
    };

    const guestMode = () => {
        setVisible(false);
        onLogin();
    };

    const goBack = () => {
        setVisible(true);
        setAccExist(false);
    }

    return (
        <div className="flex justify-center w-full h-dvh bg-linear-to-bl from-blue-300/50 to-cyan-300/50">
            {/* Sign Up Screen */}
            <div className={`${!visible ? 'hidden' : ''} min-w-1/5 max-w-full rounded-2xl z-10 mt-30 absolute flex flex-col justify-center items-center h-1/2 bg-white/10 backdrop-blur-md border border-white/20`}>
                <h1 className="text-lg text-white mb-2">Sign Up</h1>
                <form className="flex flex-col" onSubmit={signUp}>
                    <input className="border rounded-sm m-4 p-1 bg-white text-black" type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
                    <input className="border rounded-sm m-4 p-1 bg-white text-black" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <input className="border rounded-sm m-4 p-1 bg-white text-black" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <div className="flex justify-center gap-2 px-4">
                        <button className="cursor-pointer border-2 p-1 border-black text-white rounded-lg bg-red-500 hover:bg-green-500 transition-colors" type="submit">
                            Sign Up
                        </button>
                        <button onClick={() => { setVisible(false); setAccExist(true); }} className="cursor-pointer border-2 p-1 border-black text-white rounded-lg bg-red-500 hover:bg-green-500 transition-colors" type="button">
                            Sign In
                        </button>
                        <button onClick={guestMode} className="cursor-pointer border-2 p-1 border-black text-white rounded-lg bg-red-500 hover:bg-green-500 transition-colors" type="button">
                            Login as Guest
                        </button>
                    </div>
                </form>
            </div>

            {/* Login Screen */}
            <div className={`${!accExist ? 'hidden' : ''} rounded-2xl z-10 mt-30 absolute flex flex-col justify-center items-center min-w-1/4 max-w-full h-1/2 bg-white/10 backdrop-blur-md border border-white/20`}>
                <h1 className="text-lg text-white mb-2">Login</h1>
                <form className="flex flex-col" onSubmit={signIn}>
                    <input className="border-2 rounded-sm m-4 p-1 bg-white text-black" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <input className="border-2 rounded-sm m-4 p-1 bg-white text-black" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <div className="flex justify-center">
                        <button onClick={goBack} className="cursor-pointer border-2 p-1 border-black text-white w-25 rounded-lg bg-red-500 hover:bg-green-500 mr-2" type="button">
                            Back
                        </button>
                        <button className="cursor-pointer border-2 p-1 border-black text-white w-25 rounded-lg bg-red-500 hover:bg-green-500" type="submit">
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}