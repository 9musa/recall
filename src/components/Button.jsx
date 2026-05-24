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

    return <button className="btn" id="addBtn" ref={btnRef} onClick={onAdd}><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg></button>
}

export default Button;