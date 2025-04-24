import axios from "axios"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import "../CSS/Results.css"

function View(){

    const location = useLocation()

    const { prescId } = location.state

    const[drug1, setDrug1] = useState("")
    const[drug2, setDrug2] = useState("")
    const[dosage, setDosage] = useState("")
    const[question, setQuestion] = useState("")
    const[interaction, setInteraction] = useState()
    const[interactResponse, setInteractResponse] = useState()
    const[questionResponse, setQuestionResponse] = useState("")
    const[qty, setQty] = useState("")
    const[qtyResp, setQtyResp] = useState()
    const[dosageResponse, setDosageResponse] = useState("")
    const[drugResponse, setDrugResponse] = useState("")
    const[score, setScore] = useState()
    const[message, setMessage] = useState("")


    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/getpresc", {params : { id: prescId}})
        .then(response => {
            let presc = response.data

            setDrug1(presc.drug)
            setDrug2(presc.background_med)
            setDosage(presc.dosage)
            setQuestion(presc.question)
            setInteraction(presc.interaction)
            setQty(presc.qty)
        })
    },[])

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/getresult", {params : { id: prescId}})
        .then(response => {
            setDrugResponse(response.data.drug_name)
            setQtyResp(response.data.qty)
            setDosageResponse(response.data.dosageResp)
            setQuestionResponse(response.data.questionResp)
            setInteractResponse(response.data.interactResp)
            setScore(response.data.score)
            setMessage(response.data.aiResp)
        })
    },[])

    return (
        <div className="results-wrapper">
          <div className="results-page">
            <div className="column prescription-box">
              <h2>Prescription</h2>
              <p><strong>Prescribed:</strong> {drug1}</p>
              <p><strong>Interaction Drug:</strong> {drug2}</p>
              <p><strong>Dosage:</strong> {dosage}mg</p>
              <p><strong>Quantity:</strong> {qty}</p>
              <p><strong>Interaction:</strong> {interaction ? "Drugs interact" : "Drugs do not interact"}</p>
              <p><strong>Patient Question:</strong> {question}</p>
            </div>
      
            <div className="column response-box">
              <h2>Your Responses</h2>
              <p><strong>Drug Entered:</strong> {drugResponse} {drug1 == drugResponse ? <>✅</> : <>❌</>}</p><br></br>
              <p><strong>Dosage Given:</strong> {dosageResponse}mg {dosage == dosageResponse ? <>✅</> : <>❌</>}</p>
              <p><strong>Quantity Entered:</strong> {qtyResp} {qty == qtyResp ? <>✅</> : <>❌</>}</p>
              <p><strong>Interaction Response:</strong> {interactResponse ? "Drugs interact" : "Drugs do not interact"} {interaction == interactResponse ? <>✅</> : <>❌</>}</p>
              <p><strong>Question Response:</strong> {questionResponse}</p>
            </div>
          </div>
      
          <div className="summary-box">
            <h2>Feedback Summary</h2>
            <p><strong>Score:</strong> {score} / 10</p>
            <p><strong>AI Feedback:</strong> {message}</p>
          </div>
        </div>
      );
}

export default View