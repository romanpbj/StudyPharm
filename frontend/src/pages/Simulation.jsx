import { useState, useEffect, useSyncExternalStore } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import "../CSS/Prescription.css"

function Simulation(){

    const location = useLocation()
    const navigate = useNavigate()
    const { prescId } = location.state || {}

    const[drug1, setDrug1] = useState("")
    const[drug2, setDrug2] = useState("")
    const[dosage, setDosage] = useState("")
    const[freq, setFreq] = useState("")
    const[days, setDays] = useState("")
    const[question, setQuestion] = useState("")
    const[interactResponse, setInteractResponse] = useState()
    const[questionResponse, setQuestionResponse] = useState("")
    const[qty, setQty] = useState("")
    const[dosageResponse, setDosageResponse] = useState("")
    const[drugResponse, setDrugResponse] = useState("")
    const[status, setStatus] = useState()
    const [date, setDate] = useState("")

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/getpresc", {params : { id: prescId}})
        .then(response => {
            let presc = response.data

            setDrug1(presc.drug)
            setDrug2(presc.background_med)
            setDosage(presc.dosage)
            setFreq(presc.freq)
            setDays(presc.days)
            setQuestion(presc.question)
            setStatus(presc.completed)
        })
    },[])

    useEffect(() => {
        const now = new Date();
        setDate(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`)
    },[])

    function handleSubmit(){
        const responseData = {interactResponse, questionResponse, qty, dosageResponse, drugResponse, prescId}

        axios.post("http://127.0.0.1:5000/api/results", responseData)
        .then(response => {
            
            axios.get("http://127.0.0.1:5000/api/calculate", { params : {resultId: response.data.id, dateString: date}})
            .then(response => {
                navigate("/view", {state : {prescId : prescId}})
            })
        })
    }




    return (
        <div className="simulation-page">
          {/* Left column - Prescription */}
          <div className="prescription">
            <div className="rx-logo">℞</div>
    
            <div className="patient-info">
              <div className="line-label">
                <span>Patient:</span>
                <div className="line">Nicole Wilson</div>
              </div>
              <div className="line-label">
                <span>Address:</span>
                <div className="line">123 S. Main St, Roswell, NM</div>
              </div>
            </div>
    
            <div className="prescription-details">
              <p><strong>Medication:</strong> {drug1}</p>
              <p><strong>Dosage:</strong> {dosage} mg</p>
              <p><strong>Frequency:</strong> {freq}</p>
              <p><strong>Duration:</strong> {days} days</p>
            </div>
    
            <div className="signature-area">
              <div>Date ______________________</div>
              <div>Signature ______________________</div>
            </div>
          </div>
    
          {/* Right column (empty for now) */}
          <div className="response-box">
                {/* Wrapper for vertical stacking */}
                <div className="response-content">

                    {/* Pill Label Block */}
                    <div className="pill-label">
                    <div className="label-header">
                        <div className="label-patient-info">
                        <div>
                            <strong>StudyPharm</strong><br /><br />
                            <strong>Patient:</strong> Nicole Wilson<br />
                            <strong>Address:</strong> 123 S. Main St, Roswell, NM
                        </div>
                        <img
                            src="/bottle.jpg"
                            alt="Prescription Bottle"
                            className="bottle-image-inline"
                        />
                        </div>
                    </div>

                    <div className="label-qty">
                        <strong>Qty:</strong>
                        <input type="text" placeholder="20" onChange={(e) => setQty(e.target.value)} />
                    </div>

                    <div className="label-drug-line">
                        <input type="text" placeholder="Drug Name" className="inline-input drug-name" onChange={(e) => setDrugResponse(e.target.value)}/>
                        <input type="text" placeholder="Dosage" className="inline-input dosage" onChange={(e) => setDosageResponse(e.target.value)}/> mg tablets
                    </div>

                    <div className="label-directions">
                        <label><strong>Directions:</strong></label>
                        <textarea placeholder="Enter directions here (e.g., Take 1 tablet by mouth every 8 hours with food)" />
                    </div>
                    </div>

                    {/* Question Box — now separate below label */}
                    <div className="question-box">
                    <p>
                        The patient says that they are taking <strong>{drug2}</strong> at this time.
                        Do these two drugs interact?
                    </p>
                    <button onClick={(e) => setInteractResponse("Yes")}>Yes</button>
                    <button onClick={(e) => setInteractResponse("No")}>No</button>
                    {interactResponse ? <div>
                        <p>The patient asks:</p><p>{question}</p><input type="text" placeholder="Enter response here" onChange={(e) => setQuestionResponse(e.target.value)}/>
                        </div> : <></>}
                    </div>
                    {status ? <p>This simulation has been completed.</p> : <button onClick={handleSubmit}>Submit</button>}
                </div>
            </div>
        </div>
      );
}

export default Simulation