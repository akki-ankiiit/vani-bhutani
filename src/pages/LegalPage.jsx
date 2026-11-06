import StudioLayout from '../components/layout/StudioLayout';

export default function LegalPage({ type }) {
  const privacy = type === 'privacy';
  return <StudioLayout showCta={false} breadcrumb="Vani Bhutani Designs"><section className="section studio-legal"><div className="container"><p className="l2">Vani Bhutani Designs</p><h1 className="h2">{privacy ? 'Privacy' : 'Terms of use'}</h1>
    {privacy ? <><p>When you contact the studio, the information you choose to share — your name, contact details and project brief — is used to respond to your enquiry.</p><p>Your cookie preference is stored in your browser. This website does not add advertising or analytics trackers. Fonts are delivered by Adobe Fonts.</p><p>If the online enquiry service is not connected, the form says so clearly — you can always reach the studio on +91 98794 14255.</p></> : <><p>The portfolio presents completed residential and commercial interiors by Vani Bhutani Designs. Project names, years, areas and locations are as published by the studio.</p><p>Design scope, fees, timelines and deliverables — including e-services — are agreed separately in a written proposal.</p><p>All photography, drawings and other materials on this website belong to Vani Bhutani Designs or their respective owners and may not be reproduced without permission.</p></>}
    <a className="h5" href="/contact">Contact the studio ↗</a>
  </div></section></StudioLayout>;
}
