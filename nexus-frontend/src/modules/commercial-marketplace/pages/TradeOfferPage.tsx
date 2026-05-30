import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import Modal from '../../../shared/components/Modal';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import ItemThumb from '../components/ItemThumb';
import { getListingById, getMyListings } from '../apis/listing.api';
import { createOffer } from '../apis/trade-offer.api';
import type { ListingResponse } from '../types/commercial-marketplace.types';

const BASE = '/commercial-marketplace';

const WorldTag: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <span className="inline-flex items-center gap-1.5 rounded text-[10px]/[1.45] font-semibold px-1.5 py-0.5"
    style={{ color, background: color + '22' }}>
    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
    {name}
  </span>
);

const TradeOfferPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flash } = useApp();

  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [available, setAvailable] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getListingById(Number(id)), getMyListings()])
      .then(([l, mine]) => {
        setListing(l);
        setAvailable(mine.filter(i => i.status === 'available'));
      })
      .catch(() => flash('Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const confirmOffer = async () => {
    if (!sel || !listing) return;
    setSubmitting(true);
    try {
      await createOffer({ listingId: listing.id, offeredListingId: sel });
      flash('Trade offer submitted');
      navigate(`${BASE}/my-trades`);
    } catch {
      flash('Failed to submit offer');
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!listing) return <EmptyState icon="market" text="Listing not found." />;

  const selectedItem = available.find(i => i.id === sel) ?? null;

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(`${BASE}/browse/${listing.id}`)} className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Listing
      </button>
      <PageHeader title="Offer a Trade" sub="Select one of your available items to offer in exchange." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <SectionLabel>Item You Want</SectionLabel>
          <div className="flex gap-3">
            <ItemThumb icon={listing.category} imageUrl={listing.images[0]?.imageUrl} />
            <div>
              <div className="text-sm font-semibold text-fg">{listing.title}</div>
              <div className="mt-1">
                <WorldTag name={listing.user.world.name} color={listing.user.world.colorHex} />
              </div>
              <p className="text-[13px]/[1.5] text-fg-secondary mt-2">{listing.description}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <SectionLabel>Select Your Offer</SectionLabel>
          {available.length === 0
            ? <EmptyState icon="box" text="No items to offer. Post an item first." />
            : <div className="grid grid-cols-2 gap-2">
                {available.map(it => (
                  <button key={it.id} onClick={() => setSel(it.id)}
                    className={`text-left p-2.5 rounded border transition-colors ${sel === it.id ? 'border-amber bg-amber/5' : 'border-line hover:border-line-hover'}`}>
                    <ItemThumb icon={it.category} imageUrl={it.images[0]?.imageUrl} size="lg" />
                    <div className="text-[12px]/[1.45] font-semibold text-fg mt-2 line-clamp-1">{it.title}</div>
                    <span className="text-[10px]/[1.45] nx-uppercase text-fg-muted">{it.category}</span>
                  </button>
                ))}
              </div>}
        </Card>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="solid" size="lg" icon="check" disabled={!sel} onClick={() => setConfirming(true)}>
          Submit Offer
        </Button>
      </div>

      {confirming && selectedItem && (
        <Modal
          title="Confirm Trade Offer"
          onClose={() => !submitting && setConfirming(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>Cancel</Button>
              <Button variant="solid" icon="check" onClick={confirmOffer} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm Offer'}
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-secondary mb-4">Are you sure you want to make this trade?</p>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className="text-center">
              <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">You give</div>
              <div className="flex flex-col items-center gap-1.5">
                <ItemThumb icon={selectedItem.category} imageUrl={selectedItem.images[0]?.imageUrl} />
                <span className="text-[12px]/[1.45] font-semibold text-fg line-clamp-2">{selectedItem.title}</span>
              </div>
            </div>
            <Icon name="arrow" size={18} className="text-amber" />
            <div className="text-center">
              <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">You get</div>
              <div className="flex flex-col items-center gap-1.5">
                <ItemThumb icon={listing.category} imageUrl={listing.images[0]?.imageUrl} />
                <span className="text-[12px]/[1.45] font-semibold text-fg line-clamp-2">{listing.title}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TradeOfferPage;
