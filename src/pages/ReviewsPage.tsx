import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import MobileProductHeader from '@/components/mobile/MobileProductHeader';
import { useCategoryContext } from '@/contexts/CategoryContext';
import { useShopContext } from '@/contexts/ShopContext';
import MobileMenuModal from '@/components/mobile/MobileMenuModal';
import MobileProductCard from '@/components/mobile/MobileProductCard';

interface ReviewImage {
  thumbnail: string;
  full: string;
}

interface ReviewItem {
  id_recenzie: string;
  id_produs: string;
  autor: string;
  data: string;
  rating: string;
  continut: string;
  verified: boolean;
  imagini?: ReviewImage[];
}

interface ProductSummary {
  id: number;
  titlu: string;
  slug: string;
  descriere?: string;
  descriere_scurta?: string;
  taguri?: { nume?: string; slug?: string }[];
  imagine_principala: {
    full: string;
    '300x300': string;
    '100x100': string;
  };
}

interface ReviewsResponse {
  recenzii_cu_poza: ReviewItem[];
  recenzii_text: ReviewItem[];
  produse_din_recenzii: ProductSummary[];
}

type ReviewTab = 'photos' | 'text';

const ReviewsPage = () => {
  const navigate = useNavigate();
  const { cart, wishlist } = useShopContext();
  const { setCurrentSlug } = useCategoryContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<ReviewTab>('photos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; author: string } | null>(null);
  const productScrollTimerRef = useRef<number | null>(null);
  const pageSize = 20;

  useEffect(() => {
    let isMounted = true;

    fetch('/cache_app/recenzii.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load reviews');
        }
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        setData(json);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProductId]);

  const reviews = useMemo(() => {
    if (!data) return [];
    if (selectedProductId) {
      const combined = [...data.recenzii_cu_poza, ...data.recenzii_text];
      return combined.filter((review) => review.id_produs === selectedProductId);
    }
    return activeTab === 'photos' ? data.recenzii_cu_poza : data.recenzii_text;
  }, [activeTab, data, selectedProductId]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reviews.slice(start, start + pageSize);
  }, [reviews, currentPage]);

  const summary = useMemo(() => {
    if (!data) return { total: 0, avg: 0 };
    const allReviews = [...data.recenzii_cu_poza, ...data.recenzii_text];
    if (allReviews.length === 0) return { total: 0, avg: 0 };
    const sum = allReviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
    return { total: allReviews.length, avg: sum / allReviews.length };
  }, [data]);

  const bestSellers = useMemo(() => data?.produse_din_recenzii ?? [], [data]);

  const formatDate = (value: string) => {
    const [datePart] = value.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return value;
    return `${day}.${month}.${year}`;
  };

  const renderStars = (value: string) => {
    const rating = Math.round(parseFloat(value || '0'));
    return (
      <div className="flex items-center gap-[2px]">
        {[...Array(5)].map((_, starIndex) => (
          <svg
            key={starIndex}
            viewBox="0 0 24 24"
            className={starIndex < rating ? 'h-3 w-3 text-amber-500' : 'h-3 w-3 text-muted-foreground'}
            fill="currentColor"
          >
            <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <MobileProductHeader
        title="Recenzii clienti"
        onBack={() => navigate(-1)}
        centerTitle
        onMenuClick={() => setIsMenuOpen(true)}
        onLogoClick={() => {
          setCurrentSlug('cadouri-pentru-botez');
          navigate('/');
        }}
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        onCartClick={() => navigate('/cos')}
        onWishlistClick={() => navigate('/wishlist')}
      />

      <div className="px-4 pt-4 space-y-5">
        {!selectedProductId && (
          <div className="sticky top-0 z-30 bg-white/95 pb-2 backdrop-blur">

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2">

                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {summary.avg ? summary.avg.toFixed(2) : '0.00'}
                </span>
              </div>
              {(['photos', 'text'] as ReviewTab[]).map((tab) => {
                const count =
                  tab === 'photos' ? data?.recenzii_cu_poza.length ?? 0 : data?.recenzii_text.length ?? 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    data-track-action={`A schimbat tabul de recenzii la ${tab === 'photos' ? 'Poze' : 'Text'}.`}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'text-white'
                        : 'border border-border bg-white text-muted-foreground'
                    }`}
                    style={
                      activeTab === tab
                        ? { backgroundImage: 'linear-gradient(135deg, #c89b59, #f5d5a8)' }
                        : undefined
                    }
                  >
                    {tab === 'photos' ? 'Poze' : 'Text'} ({count})
                  </button>
                );
              })}

            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Se incarca recenziile...
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={`review-skel-${index}`}
                  className="rounded-2xl border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded-full bg-muted" />
                      <div className="h-2 w-16 rounded-full bg-muted" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((__, starIndex) => (
                        <div key={starIndex} className="h-3 w-3 rounded-full bg-muted" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted" />
                    <div className="h-2 w-5/6 rounded-full bg-muted" />
                  </div>
                  <div className="mt-3 h-32 w-full rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Nu am putut incarca recenziile.
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground">
            Nu exista recenzii disponibile.
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-4">
            {paginatedReviews.map((review) => {
              const hasImages = review.imagini && review.imagini.length > 0;
              const imageUrl = hasImages ? review.imagini![0].full || review.imagini![0].thumbnail : '';

              return (
                <div
                  key={review.id_recenzie}
                  className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.autor}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(review.data)}</p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="mt-3 text-sm text-foreground whitespace-pre-line">{review.continut}</p>
                  {hasImages && (
                    <button
                      type="button"
                      onClick={() => setZoomImage({ url: imageUrl, author: review.autor })}
                      data-track-action="A deschis poza din recenzie."
                      className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20"
                      aria-label="Deschide poza recenzie"
                    >
                      <img
                        src={imageUrl}
                        alt={review.autor}
                        className="h-[70vw] max-h-[360px] w-full object-contain"
                        loading="lazy"
                      />
                    </button>
                  )}
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  data-track-action="A navigat la pagina anterioara de recenzii."
                  className="rounded-full border border-border px-3 py-1"
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  data-track-action="A navigat la pagina urmatoare de recenzii."
                  className="rounded-full border border-border px-3 py-1"
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {bestSellers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white px-0 py-3">
          <div
            className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            onScroll={() => {
              if (productScrollTimerRef.current) {
                window.clearTimeout(productScrollTimerRef.current);
              }
              productScrollTimerRef.current = window.setTimeout(() => {
                if (window.rybbit?.event) {
                  window.rybbit.event('A derulat lista cu produse din recenzii.');
                }
              }, 400);
            }}
          >
            {bestSellers.map((product) => {
              const imageUrl =
                product.imagine_principala['300x300'] ||
                product.imagine_principala.full ||
                product.imagine_principala['100x100'];
              const isSelected = selectedProductId === String(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    const productId = String(product.id);
                    setSelectedProductId((prev) => (prev === productId ? null : productId));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  data-track-action={`A selectat produsul ${product.titlu} din recenzii.`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-border'
                  }`}
                  aria-label={`Recenzii pentru ${product.titlu}`}
                >
                  <img src={imageUrl} alt={product.titlu} className="h-full w-full object-cover" loading="lazy" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        data-track-action="A apasat inapoi din pagina de recenzii."
        className="fixed left-0 top-[75%] z-40 flex h-12 w-10 items-center justify-center rounded-r-md border-r border-border bg-white text-muted-foreground shadow"
        aria-label="Inapoi"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <MobileMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {zoomImage && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setZoomImage(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="relative w-full max-w-[520px]">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                data-track-action="A inchis poza recenzie."
                className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow"
              >
                Inchide
              </button>
              <div className="overflow-hidden rounded-2xl bg-white">
                <img src={zoomImage.url} alt={zoomImage.author} className="h-full w-full object-contain" />
                <div className="px-4 py-3 text-sm font-semibold text-foreground">{zoomImage.author}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewsPage;
