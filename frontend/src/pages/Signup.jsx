import axios from "axios"
import { useEffect, useState, useSyncExternalStore } from "react"
import { AuthContext } from "../AuthContext"
import { useNavigate } from "react-router-dom"
import '../CSS/Signup.css'

function Signup(){

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    function handleSignup(e){
        e.preventDefault()
        const userData = { username, password }

        axios.post("http://127.0.0.1:5000/api/signup", userData)
        .then(response => {
            navigate("/login")
        })

    }

    return (
        <div className="signup-container">
          <form className="signup-form" onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Signup</button>
          </form>
        </div>
    );
}

export default Signup