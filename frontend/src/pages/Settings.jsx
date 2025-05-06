import axios from "axios"
import { useState, useEffect, useSyncExternalStore } from "react"

function Settings(){

    const[username, setUsername] = useState("")

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/username")
        .then(response => {
            setUsername(response.data.username)
        })
    },[])

    return(
        <div>
            {username}
        </div>
    )
}

export default Settings