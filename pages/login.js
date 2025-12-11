import { useState } from "react"
import { supabase } from '../lib/supabase'
export default function Login(){
 const[email,setEmail]=useState(""); const[pw,setPw]=useState("");
 async function handleLogin(e){e.preventDefault(); await supabase.auth.signInWithPassword({email,password:pw});}
 return(<form onSubmit={handleLogin}><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
<input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Wachtwoord" />
<button>Login</button></form>)
}