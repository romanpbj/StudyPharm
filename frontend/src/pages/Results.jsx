import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Result(){

    const location = useLocation()
    const { resultId } = location.state
    const [score, setScore] = useState("")
    const [message, setMessage] = useState("")
    const [date, setDate] = useState("")

    useEffect(() => {
        const now = new Date();
        setDate(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`)
    },[])

    function handleGet(){
        axios.get("http://127.0.0.1:5000/api/calculate", {params : {resultId : resultId, dateString: date}})
        .then(response => {
            setScore(response.data.score)
            setMessage(response.data.question)
        })
    }

    return (
        <div>
            <button onClick={handleGet}>Get Results</button>
            <p>{score}</p>
            <p>{message}</p>
            <p>{date}</p>
        </div>
    )
}

export default Result