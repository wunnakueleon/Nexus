import { useNavigate } from 'react-router-dom';
import Wordmark from '../../../shared/components/Wordmark';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Icon from '../../../shared/components/Icon';

const MODULES = [
  {
    icon: 'market',
    title: 'Commercial Marketplace',
    desc: 'Citizen-to-citizen barter across the four worlds. Post items, browse listings, and trade what you have for what you need.',
  },
  {
    icon: 'cargo',
    title: 'Logistics Management',
    desc: 'Track cargo shipments between worlds end to end — from preparation and departure through to delivery, with flags for delays.',
  },
  {
    icon: 'resource',
    title: 'Resource Management',
    desc: "Monitor each world's stock of fuel, water, food, medicine, and steel, and broker government-level resource trades.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen nx-grid flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-10">
          <Wordmark size="lg" />
          <h1 className="text-2xl sm:text-3xl font-bold text-fg mt-6 max-w-2xl">
            Sustaining four worlds. Preventing extinction.
          </h1>
          <p className="text-sm text-fg-secondary mt-3 max-w-xl leading-relaxed">
            A neutral inter-galactic platform coordinating trade, logistics, and resources across
            GloriaVenus, NanPtune, MinUranus, and WunnaMars.
          </p>
          <div className="flex items-center gap-2 mt-5 text-[11px]/[1.45] font-mono text-fg-muted nx-uppercase">
            <span className="w-1.5 h-1.5 bg-stable rounded-sm animate-pulse-crit" /> Transmission link active
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7 w-full sm:w-auto">
            <Button variant="solid" size="lg" icon="power" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
            <Button variant="outline" size="lg" icon="plus" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODULES.map(m => (
            <Card key={m.title} className="p-5 h-full">
              <div className="w-11 h-11 border border-amber rounded flex items-center justify-center text-amber mb-4">
                <Icon name={m.icon} size={22} />
              </div>
              <h3 className="text-sm font-semibold text-fg mb-2">{m.title}</h3>
              <p className="text-[13px]/[1.6] text-fg-secondary">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
