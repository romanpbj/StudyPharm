import { useContext } from "react"
import { AuthContext } from "../AuthContext"
import { useNavigate } from "react-router-dom"

function Logout(){

    const { logoutUser } = useContext(AuthContext)
    const navigate = useNavigate()

    function handleLogout(){
        logoutUser()
        navigate("/login")
    }

    return(
        <button onClick={handleLogout}>Logout</button>
    )
}

export default Logout