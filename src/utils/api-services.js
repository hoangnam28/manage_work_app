// Centralized API services export
export { dashboardApi } from './dashboard-api';
export { businessApi } from './business-api';
export { projectApi } from './project-api';
export { taskApi } from './task-api';
export { userApi } from './user-api';

// Re-export existing APIs
export * from './api';
export * from './material-core-api';
export * from './material-pp-api';
export * from './material-new-api';
export * from './material-certification-api';
export * from './ink-management-api';
export * from './time-tracking-api';
export * from './ul-material-api';
export * from './decide-board';

// Default export with all services
const allApiServices = {
  dashboard: () => import('./dashboard-api'),
  business: () => import('./business-api'),
  project: () => import('./project-api'),
  task: () => import('./task-api'),
  user: () => import('./user-api'),
  material: {
    core: () => import('./material-core-api'),
    pp: () => import('./material-pp-api'),
    new: () => import('./material-new-api'),
    certification: () => import('./material-certification-api'),
    ink: () => import('./ink-management-api'),
    ul: () => import('./ul-material-api')
  },
  timeTracking: () => import('./time-tracking-api'),
  decideBoard: () => import('./decide-board')
};

export default allApiServices;
