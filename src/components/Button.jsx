import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap/gsap-core";
function Button({onAdd}) {
    const btnRef = useRef(null);
    useGSAP(() => {
        gsap.from(btnRef.current, {
            width: 0,
            duration: 0.15,
            ease: "Power2.out"
        })
    }, [])

    return <button className="btn" id="addBtn" ref={btnRef} onClick={onAdd}>Add</button>
}

export default Button;