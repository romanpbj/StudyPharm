import { AuthContext } from "../AuthContext"
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../CSS/Profile.css"

function Profile(){

    const [username, setUsername] = useState("")
    const [prescId, setPrescId] = useState("")
    const[history, setHistory] = useState([])
    const[show, setShow] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/username")
        .then(response => {
            setUsername(response.data.username)
        })
    },[])

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/history")
        .then(response => {
            setHistory(response.data)
        })
    },[])

    useEffect(() => {
        if(history.length > 8){
            setShow(true)
        }
    }, [history])

    async function handleSimulation(){
        try{
            const { data } = await axios.post("http://127.0.0.1:5000/api/createprescription", null)
            navigate("/simulation", {state: { prescId: data.id}})
        }catch(err) {
            console.err("Could not create prescription", err)
        }
    }
    

    return (
        <div className="profile-page">
          <h1>Welcome {username}</h1>
      
          <div className="start-section">
            <button onClick={handleSimulation}>Begin Simulation</button>
            <p>{prescId}</p>
          </div>
      
          <div className="history-section">
            <h3>History</h3>
            <div className="history-wrapper">
                <div className="history-grid">
                {history.slice().reverse().slice(0, 8).map((presc, index) => (
                    <button
                    key={index}
                    className="history-card"
                    onClick={() => navigate("/view", { state: { prescId: presc.id } })}
                    >
                    <p><strong>{presc.drug}</strong></p>
                    <p>{presc.date}</p>
                    </button>
                ))}
                </div>

                {show && (
                <div className="show-more-container">
                    <button onClick={() => navigate('/history')} className="show-more-button">Show More</button>
                </div>
                )}
            </div>
        </div>
    </div>
    );
}

export default Profile