import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap/gsap-core";
function Button({ isActive, onAdd }) {
    const btnRef = useRef(null);
    useGSAP(() => {
        if (isActive) {
            gsap.to(btnRef.current, {
                flexBasis: "25%",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginLeft: "2%",
                marginRight: "2%",
                duration: 0.15,
                ease: "power2.out",
                pointerEvents: "auto"
            })
        } else {
            gsap.to(btnRef.current, {
                flexBasis: "0%",
                marginLeft: "0%",
                marginRight: "0%",
                paddingLeft: 0,
                paddingRight: 0,
                duration: 0.15,
                ease: "power2.in",
                pointerEvents: "none"
            })
        }
    }, [isActive])

    return <button className="btn" id="addBtn" ref={btnRef} onClick={onAdd}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
}

export default Button;