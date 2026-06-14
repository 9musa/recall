import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login( {error, setError, setSuccess, clearNotifications} ) {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    /* const [error, setError] = useState("")
    const [success, setSuccess] = useState("") */
    const [loading, setLoading] = useState(false)
    const handleContinue = async (e) => {
        e.preventDefault()
        clearNotifications()
        setLoading(true)
        //attempt sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass,
        })
        if (signInError) {
            if (signInError.message.toLowerCase().includes("invalid login credentials")) {
                console.log("Account not found. Attempting to sign up instead")
                const { error: signUpError } = await supabase.auth.signUp({
                    email: email,
                    password: pass,
                })
                if (signUpError) {
                    if (signUpError.message.toLowerCase().includes("user already registered")) {
                        setError("Incorrect password for this account.")
                    } else {
                        setError(signUpError.message)
                    }
                    setLoading(false)
                    return
                }
                console.log("Sign up successful")
                setSuccess("Account created! Start typing on the search box to make notes")
                setLoading(false)
                return
            }
            setError(signInError.message)
            setLoading(false)
            return
        }
        console.log("Sign in successful")
        setSuccess("Welcome back! Fetching your notes...")
        setLoading(false)
    }
    return(
        <form onSubmit={handleContinue}>
            <h1 style={ { fontFamily: "GreatVibes", textAlign: "center" } }>Welcome to Recall</h1>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required/>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password" required/>
            <button className="btn" style={{ width: '100%' }} type="submit" disabled={loading}>{loading ? "Connecting..." : "Continue"}</button>
            {error && <p className='txt' style={ {fontSize:"0.75rem"} }>{error}</p>}
        </form>
    )
}