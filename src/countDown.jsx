import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import './App.css'

export default function CountDown({ onFinish }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, 100, { duration: 5 });
        controls.then(() => {
            setTimeout(onFinish, 200);
        });
        return () => controls.stop();
    }, [count, onFinish]);

    return (
        <div className="flex items-center justify-center h-dvh bg-linear-to-bl from-blue-300/50 to-cyan-300/50">
            <motion.pre className="text-4xl text-purple-200 font-bold">
                {rounded}
            </motion.pre>
        </div>
    );
}