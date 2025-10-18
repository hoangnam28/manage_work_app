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
import MaterialCertification from './pages/Material.Certification';
import CertificationForm from './pages/CertificationForm';
import Home from './pages/Home';
import InkPage from './pages/InkPage';
import DashBoard from './pages/DashBoard';
import BussinessList from './pages/BussinessList';
import ProjectList from './pages/ProjectList';
import TaskList from './pages/TaskList';
import MyTasks from './pages/MyTasks';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
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
          path="/material-certification" 
          element={
            <PrivateRoute>
              <MaterialCertification />
            </PrivateRoute>
          }
        />
        <Route 
          path="/certification-form/:id" 
          element={
            <PrivateRoute>
              <CertificationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route 
          path="/material-ink"
          element={
            <PrivateRoute>
              <InkPage />
            </PrivateRoute>
          }
        />
        <Route 
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashBoard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/business"
          element={
            <PrivateRoute>
              <BussinessList />
            </PrivateRoute>
          }
        />
        <Route 
          path="/business/:businessId/projects"
          element={
            <PrivateRoute>
              <ProjectList />
            </PrivateRoute>
          }
        />
        <Route 
          path="/business/:businessId/project/:projectId/tasks"
          element={
            <PrivateRoute>
              <TaskList />
            </PrivateRoute>
          }
        />
        <Route 
          path="/my-tasks"
          element={
            <PrivateRoute>
              <MyTasks />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
