import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ReviewPage from './pages/Review';
import PrivateRoute from './routes/PrivateRoute';
import EditHistory from './pages/EditHistory';

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
          path="/edit_history" 
          element={
            <PrivateRoute>
              <EditHistory />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
