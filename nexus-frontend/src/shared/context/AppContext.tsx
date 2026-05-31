import React, { createContext, useState, useCallback, useEffect } from 'react';
import { setAuthToken } from '../../api';
import type {
  AppContextValue, World, WorldInfo, WorldRequest, WorldHistoryEntry,
  ResourceStock, Trade, NewTrade, Shipment, ManifestItem,
  Listing, NewListing, MarketplaceOffer, AdminCode, Approval, UserRecord,
  OperatorState, TimelineStep,
} from '../types/shared.types';
import { WORLD_DEFAULTS, RESOURCES, RESOURCE_UNITS, STEPS } from '../utils/constants';

// ---- Helpers ---------------------------------------------------------------
let _seq = 1000;
const uid = (p: string) => `${p}-${++_seq}`;
const unitOf = (res: string) => RESOURCE_UNITS[res] ?? 'MT';

const mkTimeline = (reached: number, stamps: (string | undefined)[]): TimelineStep[] =>
  STEPS.map((step, i) => ({
    step,
    ts: stamps[i] ?? null,
    done: i < reached,
    current: i === reached,
  }));

// ---- Static seed data ------------------------------------------------------
const WORLDS: World[] = [
  { id: 'GLV', name: 'GloriaVenus', color: '#C47A1A', dim: '#2B1F08', identity: 'Industrial powerhouse',  added: '2387.04.12' },
  { id: 'NPT', name: 'NanPtune',    color: '#3A8C8C', dim: '#0A1F20', identity: 'Agricultural stronghold', added: '2387.04.12' },
  { id: 'MNU', name: 'MinUranus',   color: '#4A6FA5', dim: '#0E1825', identity: 'Scientific frontier',     added: '2387.04.12' },
  { id: 'WNM', name: 'WunnaMars',   color: '#A04030', dim: '#1F0E0A', identity: 'Energy hub',              added: '2387.06.30' },
];

const s = (resource: string, stock: number, status: ResourceStock['status'], burn: number): ResourceStock =>
  ({ resource, stock, status, burn });

const STOCKS: Record<string, ResourceStock[]> = {
  GLV: [s('Fuel',12400,'Surplus',80), s('Water',3200,'Stable',45), s('Food',800,'Critical',60), s('Medicine',5100,'Stable',20), s('Steel',200,'Critical',15)],
  NPT: [s('Fuel',2100,'Low',55),      s('Water',14000,'Surplus',90), s('Food',9200,'Surplus',70), s('Medicine',3300,'Stable',25), s('Steel',7600,'Surplus',50)],
  MNU: [s('Fuel',5500,'Stable',60),   s('Water',4800,'Stable',50),  s('Food',3100,'Stable',40), s('Medicine',11000,'Surplus',30), s('Steel',4200,'Stable',25)],
  WNM: [s('Fuel',15000,'Surplus',100),s('Water',1800,'Low',40),     s('Food',2200,'Low',50),    s('Medicine',1200,'Low',30),  s('Steel',3800,'Stable',20)],
};

const TRADES: Trade[] = [
  { id:'TRD-1', from:'NPT', to:'WNM', wantRes:'Fuel',  wantQty:3000, offerRes:'Food',  offerQty:2500, urgency:'Urgent',   comment:'Fuel reserves critically low. Agricultural surplus available for immediate exchange.', status:'Pending',  responderComment:'',                                                                       date:'2391.118 / 06:42' },
  { id:'TRD-2', from:'GLV', to:'NPT', wantRes:'Steel', wantQty:500,  offerRes:'Fuel',  offerQty:1500, urgency:'Critical', comment:'Infrastructure repair stalled without steel supply.',                                   status:'Pending',  responderComment:'',                                                                       date:'2391.118 / 09:15' },
  { id:'TRD-3', from:'MNU', to:'NPT', wantRes:'Food',  wantQty:2000, offerRes:'Medicine', offerQty:3000, urgency:'Normal', comment:'Routine resupply for research outpost.',                                               status:'Accepted', responderComment:'Approved. Preparing for dispatch.',                                    date:'2391.116 / 14:20' },
  { id:'TRD-4', from:'WNM', to:'MNU', wantRes:'Medicine', wantQty:5000, offerRes:'Fuel', offerQty:4000, urgency:'Urgent', comment:'Outbreak containment requires medicine stock.',                                         status:'Declined', responderComment:'Cannot spare medicine supplies this cycle. Suggest reducing quantity.', date:'2391.115 / 22:08' },
];

const SHIPMENTS: Shipment[] = [
  { id:'SHP-MNU-00031', origin:'MNU', dest:'NPT', status:'In Transit', departure:'2391.116', eta:'2391.121', flagged:false,
    manifest:[{res:'Medicine',qty:3000,notes:'Sealed cold-chain, handle on arrival'}],
    timeline:mkTimeline(3,['2391.115 / 08:00','2391.115 / 19:30','2391.116 / 04:10','2391.116 / 04:55']),
    flags:[], ref:'TRD-3' },
  { id:'SHP-NPT-00044', origin:'NPT', dest:'MNU', status:'Preparing', departure:'2391.119', eta:'2391.124', flagged:false,
    manifest:[{res:'Food',qty:2000,notes:'Vacuum-sealed grain pallets'}],
    timeline:mkTimeline(1,['2391.117 / 11:00','2391.118 / 09:00']),
    flags:[], ref:'TRD-3' },
  { id:'SHP-WNM-00018', origin:'WNM', dest:'GLV', status:'Delivered', departure:'2391.113', eta:'2391.117', flagged:false,
    manifest:[{res:'Fuel',qty:1200,notes:'Charged cells, verified output'}],
    timeline:mkTimeline(5,['2391.111 / 06:00','2391.111 / 18:00','2391.112 / 02:00','2391.113 / 00:00','2391.117 / 09:30']),
    flags:[], ref:null },
  { id:'SHP-GLV-00055', origin:'GLV', dest:'WNM', status:'Departed', departure:'2391.117', eta:'2391.122', flagged:false,
    manifest:[{res:'Steel',qty:800,notes:'Recycled hull plating, bundled'}],
    timeline:mkTimeline(2,['2391.116 / 10:00','2391.116 / 22:00','2391.117 / 05:30']),
    flags:[], ref:null },
  { id:'SHP-NPT-00045', origin:'NPT', dest:'WNM', status:'Delayed', departure:'2391.116', eta:'2391.123', flagged:true,
    manifest:[{res:'Water',qty:1500,notes:'Potable, pressurized tanks'}],
    timeline:mkTimeline(3,['2391.114 / 07:00','2391.115 / 12:00','2391.116 / 03:00','2391.116 / 03:30']),
    flags:[{desc:'Corridor disruption — rerouting via outer lane', ts:'2391.117 / 16:40', by:'NPT Transit'}], ref:null },
];

const mkListing = (id: string, title: string, cat: string, cond: string, world: string, seller: string, desc: string, icon: string): Listing => ({
  id, title, category: cat, condition: cond, world, seller, desc, icon,
  date: `2391.11${Math.floor(Math.random() * 8) + 1}`,
  mine: false, status: 'Available', photo: null,
});

const LISTINGS: Listing[] = [
  mkListing('MKT-1','Reinforced Work Gloves',            'Tools',    'Used',      'GLV','R. Halden',  'Heavy-duty gloves from factory district. Good condition, reinforced palms.',        'tools'),
  mkListing('MKT-2','Preserved Grain Rations (10kg)',    'Food',     'New',       'NPT','S. Okonkwo', 'Vacuum-sealed grain from last harvest. Long shelf life, undamaged seal.',           'food'),
  mkListing('MKT-3','Portable Diagnostic Scanner',       'Tech',     'Used',      'MNU','V. Reyes',   'Medical scanner, works on basic power cell. Screen has minor scratch.',             'tech'),
  mkListing('MKT-4','Thermal Insulation Panels (set of 4)','Materials','Handmade','WNM','T. Brak',    'Handcrafted from recycled hull plating. Keeps heat in through long nights.',        'materials'),
  mkListing('MKT-5','Antibacterial Wound Dressing (x20)','Medicine', 'New',       'MNU','V. Reyes',   'Standard military-grade dressings, sealed sterile pack.',                          'medicine'),
  mkListing('MKT-6','Hand-carved Bone Chess Set',        'Art',      'Handmade',  'GLV','M. Calder',  'Complete set with board. Carved from reclaimed materials, fully playable.',        'art'),
  mkListing('MKT-7','Water Purification Tablets (x100)', 'Medicine', 'New',       'NPT','S. Okonkwo', 'Purifies 1L per tablet. Essential supply for off-grid survival.',                 'medicine'),
  mkListing('MKT-8','Solar Micro-Charger',               'Tech',     'Used',      'WNM','T. Brak',    'Charges small devices. Foldable panel, minor wear on hinge.',                     'tech'),
];

const MY_ITEMS: Listing[] = [
  { id:'MKT-OWN-1', title:'Spare Atmospheric Filter',   category:'Tools',     condition:'Used', world:'GLV', seller:'You', desc:'Lightly used filter cartridge, compatible with standard rebreathers.', icon:'tools',     date:'2391.116', mine:true, status:'Available',        photo:null },
  { id:'MKT-OWN-2', title:'Bundle of Copper Wiring',    category:'Materials', condition:'Used', world:'GLV', seller:'You', desc:'Salvaged copper, roughly 40 meters coiled. Good conductivity.',        icon:'materials', date:'2391.110', mine:true, status:'In Pending Trade', photo:null },
];

const CODES: AdminCode[] = [
  { code:'NX-RM-GLV-7K2F', world:'GLV', role:'Resource Manager',   status:'Used',      usedBy:'A. Voss',    created:'2391.101' },
  { code:'NX-TO-NPT-3J9D', world:'NPT', role:'Transit Officer',     status:'Used',      usedBy:'L. Okonkwo', created:'2391.101' },
  { code:'NX-CC-MNU-P4X1', world:'MNU', role:'Commercial Citizen',  status:'Available', usedBy:'',           created:'2391.117' },
  { code:'NX-CC-WNM-R8M5', world:'WNM', role:'Commercial Citizen',  status:'Available', usedBy:'',           created:'2391.117' },
  { code:'NX-RM-WNM-9Q2A', world:'WNM', role:'Resource Manager',    status:'Expired',   usedBy:'',           created:'2391.090' },
  { code:'NX-CC-GLV-T6V3', world:'GLV', role:'Commercial Citizen',  status:'Used',      usedBy:'M. Calder',  created:'2391.103' },
];

const APPROVALS: Approval[] = [
  { id:'APR-1', name:'D. Sarraf',    world:'NPT', role:'Commercial Citizen', code:'NX-CC-NPT-8H4K', date:'2391.118 / 07:55' },
  { id:'APR-2', name:'K. Lindqvist', world:'MNU', role:'Transit Officer',    code:'NX-TO-MNU-2W9P', date:'2391.118 / 10:12' },
  { id:'APR-3', name:'O. Mbeki',     world:'WNM', role:'Resource Manager',   code:'NX-RM-WNM-5C1L', date:'2391.118 / 11:48' },
  { id:'APR-4', name:'P. Tanaka',    world:'GLV', role:'Commercial Citizen', code:'NX-CC-GLV-9F7Z', date:'2391.118 / 12:30' },
];

const USERS: UserRecord[] = [
  { id:'USR-1', name:'A. Voss',      world:'GLV', role:'Resource Manager',  status:'Active',  approved:'2391.101' },
  { id:'USR-2', name:'L. Okonkwo',   world:'NPT', role:'Transit Officer',   status:'Active',  approved:'2391.101' },
  { id:'USR-3', name:'M. Calder',    world:'GLV', role:'Commercial Citizen',status:'Active',  approved:'2391.103' },
  { id:'USR-4', name:'V. Reyes',     world:'MNU', role:'Commercial Citizen',status:'Active',  approved:'2391.104' },
  { id:'USR-5', name:'T. Brak',      world:'WNM', role:'Commercial Citizen',status:'Revoked', approved:'2391.099' },
  { id:'USR-6', name:'S. Okonkwo',   world:'NPT', role:'Commercial Citizen',status:'Active',  approved:'2391.105' },
  { id:'USR-7', name:'J. Ferro',     world:'MNU', role:'Resource Manager',  status:'Active',  approved:'2391.102' },
];

const WORLD_REQS: WorldRequest[] = [
  { id:'WRQ-1', type:'Addition', world:'CeresColony', reason:'Mining settlement requests platform access for ore trade integration.', date:'2391.117', status:'Pending', color:'#7A8C3A' },
  { id:'WRQ-2', type:'Removal',  world:'WunnaMars',   reason:'Repeated corridor disruptions; review continued participation.',       date:'2391.116', status:'Pending', color:'#A04030' },
];

const WORLD_HIST: WorldHistoryEntry[] = [
  { id:'WRH-1', type:'Addition', world:'WunnaMars', reason:'Energy hub onboarding after stabilization treaty.',      dates:'2391.060 → 2391.063', status:'Approved' },
  { id:'WRH-2', type:'Addition', world:'TitanReach', reason:'Population too unstable to sustain obligations.',       dates:'2391.040 → 2391.045', status:'Rejected' },
];

const MKT_OFFERS: MarketplaceOffer[] = [
  { id:'OFF-1', dir:'incoming',  theirItem:{title:'Portable Diagnostic Scanner',      icon:'tech',      world:'MNU'}, yourItem:{title:'Spare Atmospheric Filter',    icon:'tools'},     status:'Pending', date:'2391.118 / 08:20' },
  { id:'OFF-2', dir:'outgoing',  yourItem: {title:'Bundle of Copper Wiring',          icon:'materials'},               theirItem:{title:'Thermal Insulation Panels (set of 4)', icon:'materials', world:'WNM'}, status:'Pending', date:'2391.117 / 19:02' },
  { id:'OFF-3', dir:'completed', gave:{title:'Old Ration Crate', icon:'food'},         got:{title:'Hand-carved Bone Chess Set', icon:'art'}, partner:'M. Calder', world:'GLV', status:'Completed', date:'2391.112' },
];

// ---- Context ---------------------------------------------------------------
export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operator, setOperatorState] = useState<OperatorState | null>(null);
  const [worlds]                      = useState<World[]>(WORLDS);
  const [stocks, setStocks]           = useState(STOCKS);
  const [trades, setTrades]           = useState<Trade[]>(TRADES);
  const [shipments, setShipments]     = useState<Shipment[]>(SHIPMENTS);
  const [listings]                    = useState<Listing[]>(LISTINGS);
  const [myItems, setMyItems]         = useState<Listing[]>(MY_ITEMS);
  const [offers, setOffers]           = useState<MarketplaceOffer[]>(MKT_OFFERS);
  const [codes, setCodes]             = useState<AdminCode[]>(CODES);
  const [approvals, setApprovals]     = useState<Approval[]>(APPROVALS);
  const [users, setUsers]             = useState<UserRecord[]>(USERS);
  const [worldReqs, setWorldReqs]     = useState<WorldRequest[]>(WORLD_REQS);
  const [worldHist, setWorldHist]     = useState<WorldHistoryEntry[]>(WORLD_HIST);
  const [toast, setToast]             = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const worldById = useCallback(
    (id: string): WorldInfo => worlds.find(w => w.id === id) ?? WORLD_DEFAULTS[id] ?? { id, name: id, color: '#8A95A5', dim: '#1C2129' },
    [worlds],
  );

  const setOperator = useCallback((op: OperatorState | null) => setOperatorState(op), []);

  // When the operator signs out (operator cleared), drop the API token so no
  // stale credential lingers. The token itself is set on the api module at
  // sign-in / sign-up, where the server hands it to us.
  useEffect(() => {
    if (!operator) setAuthToken(null);
  }, [operator]);

  // ---- Admin actions -------------------------------------------------------
  const resolveApproval = (id: string, action: 'approve' | 'reject') => {
    const app = approvals.find(x => x.id === id);
    setApprovals(a => a.filter(x => x.id !== id));
    if (action === 'approve' && app) {
      setUsers(u => [{ id: uid('USR'), name: app.name, world: app.world, role: app.role, status: 'Active', approved: '2391.118' }, ...u]);
      setCodes(c => c.map(x => x.code === app.code ? { ...x, status: 'Used', usedBy: app.name } : x));
    }
    flash(action === 'approve' ? `Access granted — ${app?.name ?? ''}` : 'Request rejected');
  };

  const generateCodes = (world: string, role: string, qty: number) => {
    const tag = role === 'Resource Manager' ? 'RM' : role === 'Transit Officer' ? 'TO' : 'CC';
    const made: AdminCode[] = Array.from({ length: qty }, () => ({
      code: `NX-${tag}-${world}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      world, role, status: 'Available', usedBy: '', created: '2391.118',
    }));
    setCodes(c => [...made, ...c]);
    flash(`${qty} code${qty > 1 ? 's' : ''} generated`);
  };

  const expireCode = (code: string) => {
    setCodes(c => c.map(x => x.code === code ? { ...x, status: 'Expired' } : x));
    flash('Code expired');
  };

  const toggleUser = (id: string) => {
    setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === 'Active' ? 'Revoked' : 'Active' } : x));
  };

  const resolveWorldReq = (id: string, action: 'approve' | 'reject') => {
    const req = worldReqs.find(r => r.id === id);
    setWorldReqs(r => r.filter(x => x.id !== id));
    if (req) {
      setWorldHist(h => [{
        id: uid('WRH'), type: req.type, world: req.world, reason: req.reason,
        dates: `${req.date} → 2391.118`, status: action === 'approve' ? 'Approved' : 'Rejected',
      }, ...h]);
    }
    flash(action === 'approve' ? 'Request approved' : 'Request rejected');
  };

  const requestWorld = (name: string, color: string, reason: string) => {
    setWorldReqs(r => [{ id: uid('WRQ'), type: 'Addition', world: name, reason, date: '2391.118', status: 'Pending', color }, ...r]);
    flash('World request submitted');
  };

  // ---- Resource actions ----------------------------------------------------
  const saveStocks = (worldId: string, rows: ResourceStock[]) => {
    setStocks(s => ({ ...s, [worldId]: rows }));
    flash('Stock levels updated');
  };

  const sendTrade = (t: NewTrade) => {
    setTrades(arr => [{ id: uid('TRD'), status: 'Pending', responderComment: '', date: '2391.118 / now', ...t }, ...arr]);
    flash('Trade request transmitted');
  };

  const respondTrade = (id: string, action: 'accept' | 'decline', comment?: string) => {
    setTrades(arr => arr.map(t =>
      t.id === id ? { ...t, status: action === 'accept' ? 'Accepted' : 'Declined', responderComment: comment ?? '' } : t
    ));
    if (action === 'accept') {
      const t = trades.find(x => x.id === id);
      if (t) {
        setShipments(s => [{
          id: uid(`SHP-${t.to}`), origin: t.to, dest: t.from, status: 'Preparing',
          departure: 'TBD', eta: 'TBD', flagged: false,
          manifest: [{ res: t.wantRes, qty: t.wantQty, notes: `Auto-generated from accepted trade ${id}` }],
          timeline: mkTimeline(1, ['2391.118 / now']),
          flags: [], ref: id,
        }, ...s]);
      }
    }
    flash(action === 'accept' ? 'Trade accepted — shipment created' : 'Trade declined');
  };

  const cancelTrade  = (id: string) => { setTrades(arr => arr.filter(t => t.id !== id)); flash('Request cancelled'); };
  const fulfillTrade = (id: string) => { setTrades(arr => arr.map(t => t.id === id ? { ...t, status: 'Fulfilled' } : t)); flash('Trade marked fulfilled'); };

  // ---- Cargo actions -------------------------------------------------------
  const createShipment = (dest: string, origin: string, manifest: ManifestItem[], ref: string | null, departure: string) => {
    const n = String(Math.floor(Math.random() * 90000) + 10000);
    setShipments(s => [{
      id: `SHP-${origin}-${n}`, origin, dest, status: 'Preparing',
      departure: departure || 'TBD', eta: 'TBD', flagged: false, manifest,
      timeline: mkTimeline(1, ['2391.118 / now']), flags: [], ref,
    }, ...s]);
    flash('Shipment created');
  };

  const advanceShipment = (id: string) => {
    setShipments(s => s.map(sh => {
      if (sh.id !== id) return sh;
      const cur = sh.timeline.findIndex(t => t.current);
      const next = Math.min(cur + 1, STEPS.length - 1);
      return {
        ...sh, status: STEPS[next],
        timeline: sh.timeline.map((t, i) => ({
          ...t, done: i < next, current: i === next, ts: i === next ? '2391.118 / now' : t.ts,
        })),
      };
    }));
    flash('Status advanced');
  };

  const confirmDelivery = (id: string) => {
    setShipments(s => s.map(sh =>
      sh.id === id
        ? { ...sh, status: 'Delivered', timeline: sh.timeline.map((t, i) => ({ ...t, done: true, current: i === STEPS.length - 1, ts: t.ts ?? '2391.118 / now' })) }
        : sh
    ));
    flash('Delivery confirmed');
  };

  const addFlag = (id: string, desc: string, by: string) => {
    setShipments(s => s.map(sh =>
      sh.id === id ? { ...sh, flagged: true, flags: [...sh.flags, { desc, ts: '2391.118 / now', by }] } : sh
    ));
    flash('Flag recorded');
  };

  // ---- Marketplace actions -------------------------------------------------
  const postItem = (item: NewListing) => {
    setMyItems(arr => [{
      id: uid('MKT-OWN'), seller: 'You', world: operator?.worldId ?? 'GLV',
      mine: true, status: 'Available', date: '2391.118', photo: null, ...item,
    }, ...arr]);
    flash('Item posted to marketplace');
  };

  const editItem     = (id: string, patch: Partial<Listing>) => { setMyItems(arr => arr.map(i => i.id === id ? { ...i, ...patch } : i)); flash('Item updated'); };
  const deleteItem   = (id: string) => { setMyItems(arr => arr.filter(i => i.id !== id)); flash('Item removed'); };

  const submitOffer = (listing: Listing, myItem: Listing) => {
    setOffers(o => [{
      id: uid('OFF'), dir: 'outgoing',
      yourItem:  { title: myItem.title,   icon: myItem.icon },
      theirItem: { title: listing.title,  icon: listing.icon, world: listing.world },
      status: 'Pending', date: '2391.118 / now',
    }, ...o]);
    setMyItems(arr => arr.map(i => i.id === myItem.id ? { ...i, status: 'In Pending Trade' } : i));
    flash('Trade offer submitted');
  };

  const respondOffer = (id: string, action: 'accept' | 'decline') => {
    setOffers(o => o.map(x => x.id === id ? { ...x, status: action === 'accept' ? 'Accepted' : 'Declined' } : x));
    flash(action === 'accept' ? 'Offer accepted' : 'Offer declined');
  };

  const withdrawOffer = (id: string) => { setOffers(o => o.filter(x => x.id !== id)); flash('Offer withdrawn'); };

  // ---- Context value -------------------------------------------------------
  const value: AppContextValue = {
    operator, setOperator, worlds, worldById,
    RESOURCES, RESOURCE_UNITS, unitOf, STEPS,
    stocks, saveStocks,
    trades, sendTrade, respondTrade, cancelTrade, fulfillTrade,
    shipments, createShipment, advanceShipment, confirmDelivery, addFlag,
    listings, myItems, offers, postItem, editItem, deleteItem, submitOffer, respondOffer, withdrawOffer,
    codes, approvals, users, worldReqs, worldHist,
    resolveApproval, generateCodes, expireCode, toggleUser, resolveWorldReq, requestWorld,
    toast, flash,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
