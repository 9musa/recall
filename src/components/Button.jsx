import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap/gsap-core";
function Button() {
    const btnRef = useRef(null);
ProcessingInstruction()
    useGSAP(() => {
        gsap.from(btnRef.current, {
            width: 0,
            duration: 0.15,
            ease: "Power2.out"
        })
    }, [])

    return <button className="btn" id="addBtn" ref={btnRef}>Add</button>
}

export default Button;