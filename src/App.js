import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ReviewPage from './pages/Review';
import Impedance from './pages/Impedance';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/review_tasks" 
          element={
            <PrivateRoute>
              <ReviewPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/impedance" 
          element={
            <PrivateRoute>
              <Impedance />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
