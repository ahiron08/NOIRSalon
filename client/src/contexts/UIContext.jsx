import { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const openMobile = useCallback(() => { setMobileOpen(true); }, []);
  const closeMobile = useCallback(() => { setMobileOpen(false); }, []);
  const openLightbox = useCallback((media) => { setLightbox(media); }, []);
  const closeLightbox = useCallback(() => { setLightbox(null); }, []);

  return (
    <UIContext.Provider value={{ mobileOpen, openMobile, closeMobile, lightbox, openLightbox, closeLightbox }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
