import { lazy } from 'react';
import { projects } from './projects';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const ProjectPage = lazy(() => import('../pages/ProjectPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const LegalPage = lazy(() => import('../pages/LegalPage'));

export const routes = [
  { path: '/', title: 'Vani Bhutani Designs | Thoughtful Interior Architecture & Design', Component: HomePage },
  { path: '/projects', title: 'Projects — Vani Bhutani Designs', Component: ProjectsPage },
  { path: '/contact', title: 'Start a Conversation — Vani Bhutani Designs', Component: ContactPage },
  ...projects.map(project => ({ path: `/projects/${project.slug}`, title: `${project.name} (${project.year}) — Vani Bhutani Designs`, Component: () => <ProjectPage project={project} /> })),
  { path: '/privacy', title: 'Privacy — Vani Bhutani Designs', Component: () => <LegalPage type="privacy" /> },
  { path: '/terms', title: 'Terms of Use — Vani Bhutani Designs', Component: () => <LegalPage type="terms" /> },
];
