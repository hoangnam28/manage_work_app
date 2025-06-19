import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ReviewPage from './pages/Review';
import Impedance from './pages/Impedance';
import PrivateRoute from './routes/PrivateRoute';
import UserManagement from './pages/UserList';
import MaterialCore from './pages/MaterialCore';
import MaterialProperties from './pages/MaterialProperties';

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
        <Route path="/user-management" element={<UserManagement />} />
        <Route 
          path="/material-core" 
          element={
            <PrivateRoute>
              <MaterialCore />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/material-properties" 
          element={
            <PrivateRoute>
              <MaterialProperties />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
