import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPageVariant6 } from './components/LandingPageVariant6';
import { CustomMenuWizard } from './components/CustomMenuWizardVariant1';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageVariant6 />} />
        <Route path="/wizard" element={<CustomMenuWizard />} />
      </Routes>
    </Router>
  );
}