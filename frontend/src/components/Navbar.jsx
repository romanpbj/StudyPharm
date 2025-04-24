import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import { useContext } from "react"
import Logout from "./Logout"
import '../CSS/NavBar.css'

function Navbar(){

    const navigate = useNavigate()

    const { user } = useContext(AuthContext)

    return (
        <div className="navbar">
          <div className="navbar-left">
            <img src="/StudyPharm.PNG" alt="StudyPharm" className="logo" />
          </div>
          <div className="navbar-right">
            {user ? <button onClick={() => navigate("/profile")}>Profile</button> : null}
            {user ? <Logout /> : <button onClick={() => navigate("/login")}>Login</button>}
            <button onClick={() => navigate("/signup")}>Signup</button>
          </div>
        </div>
      );
}

export default Navbar