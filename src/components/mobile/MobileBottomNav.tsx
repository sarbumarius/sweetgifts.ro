import { Menu, Search, MessageSquare, Phone, X, Flame, SlidersHorizontal } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileMenuModal from './MobileMenuModal';
import MobileCategorySheet from './MobileCategorySheet';
import MobileFilterSheet from './MobileFilterSheet';
import { useCategoryContext } from '@/contexts/CategoryContext';

const navItems = [
  { icon: Menu, label: 'Meniu' },
  { icon: Flame, label: 'Reduceri' },
  { icon: Search, label: 'Cauta' },
  { icon: MessageSquare, label: 'Recenzii' },
  { icon: Phone, label: 'Suna' },
];

export interface MobileBottomNavRef {
  openSearch: () => void;
  openMenu: () => void;
  openCategories: () => void;
}

const MobileBottomNav = forwardRef<MobileBottomNavRef>((props, ref) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { searchQuery, setSearchQuery, setCurrentSort, setCurrentSlug } = useCategoryContext();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openCategories = () => {
    setCurrentSlug('cadouri-pentru-botez');
    setIsCategoryOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openSearch,
    openMenu,
    openCategories,
  }));

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Focus pe input
      inputRef.current.focus();

      // Scroll smooth la productGridDaruri
      setTimeout(() => {
        const productGrid = document.querySelector('.productGridDaruri');
        if (productGrid) {
          const top = productGrid.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isSearchOpen]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
        {isSearchOpen ? (
          // Search Input Mode
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Caută produse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-track-action="A cautat in bottom nav"
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              data-track-action="A apasat pe filtre din cautare."
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Filtre"
            >
              <SlidersHorizontal className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={closeSearch}
              data-track-action="A inchis cautarea din bottom nav."
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        ) : (
          // Navigation Buttons Mode
          <div className="flex items-center justify-around">
            {navItems.map((item, index) => {
              const isDiscountsPage = location.pathname === '/reduceri';
              const isReviewsPage = location.pathname === '/recenzii';
              const label =
                (index === 1 && isDiscountsPage) || (index === 3 && isReviewsPage)
                  ? 'Categorii'
                  : item.label;

              return (
              <button
                key={item.label}
                onClick={() => {
                  if (index === 0) openMenu();
                  if (index === 1) {
                    if (isDiscountsPage) {
                      setCurrentSlug('cadouri-pentru-botez');
                      setIsCategoryOpen(true);
                    } else {
                      navigate('/reduceri');
                      setCurrentSort('reduceri');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  if (index === 2) openSearch();
                  if (index === 3) {
                    if (isReviewsPage) {
                      setCurrentSlug('cadouri-pentru-botez');
                      setIsCategoryOpen(true);
                    } else {
                      navigate('/recenzii');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  if (index === 4) window.open('tel:0748777776', '_self');
                }}
                data-track-action={`A apasat pe ${label} din bottom nav.`}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all hover:scale-110 active:scale-95 ${
                  index === 2 ? 'relative -mt-5' : ''
                }`}
              >
                {index === 2 ? (
                  <div className="gold-gradient flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={`text-[10px] ${index === 2 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            );
            })}
          </div>
        )}
      </nav>

      {/* Menu Modal */}
      <MobileMenuModal
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onOpenCategories={() => {
          setCurrentSlug('cadouri-pentru-botez');
          setIsCategoryOpen(true);
        }}
      />
      <MobileCategorySheet isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
      <MobileFilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;
