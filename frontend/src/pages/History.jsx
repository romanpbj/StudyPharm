import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function History(){

    const[history, setHistory] = useState([])
    const [score, setScore] = useState()
    
    const navigate = useNavigate()

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/history")
        .then(response => {
            setHistory(response.data)
        })
    },[])

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/score")
        .then(response => {
            setScore(response.data.total)
        })
    },[])

    return (
        <div className="profile-page">
            <h1>All History</h1>
            <p>Average Score: <strong>{score}</strong></p>
            <div className="history-grid">
            {history.slice().reverse().map((presc, index) => (
                <button key={index} className="history-card" onClick={() => navigate("/view", { state: { prescId: presc.id } })}>
                    <p><strong>{presc.drug}</strong></p>
                    <p>{presc.date}</p>
                </button>
                ))}
            </div>
        </div>
    )
}

export default History