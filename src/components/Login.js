import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const handleContinue = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        //attempt sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass,
        })
        if (signInError) {
            if (signInError.message.toLowerCase().includes("invalid login credentials")) {
                console.log("Account not found. Attempting to sign up instead")
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: email,
                    password: pass,
                })
                if (signUpError) {
                    if (signUpError.message.toLowerCase().includes("user already registered")) {
                        setError("Incorrect password for this account.")
                        alert("Sign in error: Incorrect password for this account.")
                    } else {
                        setError(signUpError.message)
                        alert(`Sign up error: ${signUpError.message}`)
                    }
                    setLoading(false)
                    return
                }
                console.log("Sign up successful")
                alert("Account created successfully")
                setLoading(false)
                return
            }
            setError(signInError.message)
            alert(`Sign in error: ${signInError.message}`)
            setLoading(false)
            return
        }
        console.log("Sign in successful")
        alert("Signed in")
        setLoading(false)
    }
    return(
        <form onSubmit={handleContinue}>
            <h1 style={ { textAlign: "center" } }>Welcome to Recall</h1>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required/>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password" required/>
            <button className="btn" style={{ width: '100%' }} type="submit" disabled={loading}>{loading ? "Connecting..." : "Continue"}</button>
        </form>
    )
}