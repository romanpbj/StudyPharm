import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../AuthContext"
import { useNavigate } from "react-router-dom"
import '../CSS/Login.css'

function Login(){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { loginUser } = useContext(AuthContext)
    const navigate = useNavigate()

    function handleLogin(e) {
        e.preventDefault();
        const loginUserData = { username, password};
        axios.post("http://127.0.0.1:5000/api/login", loginUserData)
        .then(response => {
            loginUser(response.data)
            navigate("/profile")
        })
        .catch((err) => {
            alert("Error logging in: " + err.message)
        })
    }

    return (
        <div className="login-container">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>
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
            <button type="submit">Login</button>
          </form>
        </div>
      );
}

export default Login