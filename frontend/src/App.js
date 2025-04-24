import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Simulation from './pages/Simulation';
import Result from './pages/Results';
import View from './pages/View';
import History from './pages/History';

function App() {
  return (
    <Router>
        <Navbar />
      <div>
        <Routes>
          <Route path='/' element = {<Home />} />
          <Route path='/login' element = {<Login />} />
          <Route path='/signup' element = {<Signup />} />
          <Route path='/simulation' element = {<Simulation />} />
          <Route path='/results' element = {<Result />} />
          <Route path='/profile' element = {<Profile />} />
          <Route path='/view' element = {<View />} />
          <Route path = '/history' element = {<History />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
