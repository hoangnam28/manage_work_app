import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ReviewPage from './pages/Review';
import Impedance from './pages/Impedance';
import PrivateRoute from './routes/PrivateRoute';
import UserManagement from './pages/UserList';
import MaterialCore from './pages/MaterialCore';
import MaterialProperties from './pages/MaterialProperties';
import DecideBoard from './pages/DecideBoard';
import DecideBoardDetail from './pages/DecideBoardDetail';
import MaterialNew from './pages/MaterialNew';
import UlMaterial from './pages/UlMaterial';
import UlCertification from './pages/UlCertification';

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
        <Route 
          path="/material-new" 
          element={
            <PrivateRoute>
              <MaterialNew />
            </PrivateRoute>
          }
        />
        <Route 
          path="/decide-use" 
          element={
            <PrivateRoute>
              <DecideBoard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/decide-board/:id" 
          element={
            <PrivateRoute>
              <DecideBoardDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ul-material" 
          element={
            <PrivateRoute>
              <UlMaterial />
            </PrivateRoute>
          }
        />
        <Route 
          path="/ul-certification" 
          element={
            <PrivateRoute>
              <UlCertification />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
