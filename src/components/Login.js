import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const handleLogIn = async (e) => {
        e.preventDefault()
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: pass.trim(),
        })
        if (error) alert(error.message)
    }
    return(
        <form onSubmit={handleLogIn}>
            <h1>Sign In</h1>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"/>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password"/>
            <button type="submit">Log In</button>
        </form>
    )
}