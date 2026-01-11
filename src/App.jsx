import './App.css'
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ToastContainer } from "react-toastify";
import CountDown from "./countDown.jsx";
import VerifyComp from "./VerifyComp.jsx";
import MainApp from "./mainApp.jsx";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function App() {
    const [stage, setStage] = useState('timer');
    const [session, setSession] = useState(null);


    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            {stage === 'timer' && (
                <CountDown onFinish={() => setStage('verify')} />
            )}

            {stage === 'verify' && (
                <VerifyComp
                    supabase={supabase}
                    onLogin={() => setStage('main')}
                />
            )}

            {stage === 'main' && (
                <MainApp
                    supabase={supabase}
                    session={session}
                />
            )}

            <ToastContainer />
        </>
    );
}

export default App;