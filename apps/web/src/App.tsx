import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent
} from "react";

import {
  createOrder,
  createProduct,
  deleteProduct as deleteProductRequest,
  generateProductDescription,
  getCategories,
  getProducts,
  resetProducts,
  updateProduct as updateProductRequest
} from "./api";
import type { Category, CheckoutCustomer, CreateOrderResponse, Product, ProductColorOption } from "./types";

import {
  buildAddressDetails,
  buildAddressSummary,
  type UserAddress
} from "./lib/address";

import { buildInstallment, formatCurrency } from "./lib/currency";

import {
  isAcceptedImageFile,
  readFileAsDataUrl,
  resizeImageToCover,
  resizeImageToFit
} from "./lib/image";

import {
  buildProductGallery,
  cloneProduct,
  formatColorOptions,
  normalizeProduct,
  parseColorOptions,
  parseDimensions
} from "./lib/product";

import { CartPanel } from "./components/cart/CartPanel";

import { UtilityPanel } from "./components/shared/UtilityPanel";

import {
  HeroCarousel,
  type HeroSlide
} from "./components/home/HeroCarousel";

import {
  PromoStrip,
  type PromoCard
} from "./components/home/PromoStrip";

import { ProductFilters } from "./components/home/ProductFilters";

import { ProductList } from "./components/home/ProductList";

import { ResultsHeader } from "./components/home/ResultsHeader";

import { ProductPageContent } from "./components/product/ProductPageContent";

import { StorefrontContent } from "./components/home/StorefrontContent";
import { DabiLogo } from "./components/layout/DabiLogo";
import { StoreFooter } from "./components/layout/StoreFooter";

import { AdminSidebar } from "./components/admin/AdminSidebar";
import { AdminPageHeader } from "./components/admin/AdminPageHeader";
import { AdminPanelHeader } from "./components/admin/AdminPanelHeader";
import { AdminPromoCardsEditor } from "./components/admin/AdminPromoCardsEditor";
import { AdminSlidesEditor } from "./components/admin/AdminSlidesEditor";
import { AdminProductList } from "./components/admin/AdminProductList";

type SortOption = "featured" | "price-asc" | "price-desc" | "name";
type ThemeMode = "light" | "dark";
type HeaderView = "all" | "offers" | "favorites";
type UtilityPanelState = "coupons" | "orders" | "contact" | null;
type AdminSection = "slides" | "promos" | "products";
type ToastState = { message: string; tone: "success" | "error" };

interface CartItem {
  productId: string;
  quantity: number;
}

const signedInUser = {
  name: "Moyses"
};

const mockNotifications = [
  "Seu carrinho tem itens com frete grátis.",
  "Chegaram novas peças em decoração paramétrica."
];

const mockCoupons = [
  { code: "FORMA10", description: "10% off na primeira compra" },
  { code: "SETUP3D", description: "Frete grátis para itens de setup" }
];

const mockOrders = [
  { id: "PED-1032", status: "Em produção", product: "Layered Lamp" },
  { id: "PED-0977", status: "Entregue", product: "Orbit Headset Dock" }
];

const defaultHeroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    eyebrow: "Colecao studio",
    title: "Pecas 3D para setup e decor com acabamento premium",
    description: "Lancamentos autorais com foco em textura, presenca visual e lotes curtos.",
    cta: "Explorar destaques",
    category: "decor",
    accent: "#11b8f5",
    imageUrl: ""
  },
  {
    id: "slide-2",
    eyebrow: "Drop gamer",
    title: "Suportes, docks e acessorios que organizam a mesa sem perder estilo",
    description: "Itens pensados para setup, console e estacao de trabalho com impressao de alta qualidade.",
    cta: "Ver produtos gamer",
    category: "gaming",
    accent: "#6fd3ea",
    imageUrl: ""
  },
  {
    id: "slide-3",
    eyebrow: "Fashion display",
    title: "Bases expositivas e objetos para colecao, loja e fotografia de produto",
    description: "Solucoes visuais para destacar sneakers, miniaturas e pecas especiais.",
    cta: "Conhecer a colecao",
    category: "fashion",
    accent: "#9d7bff",
    imageUrl: ""
  }
];

const defaultPromoCards: PromoCard[] = [
  {
    id: "promo-1",
    tag: "Frete grátis",
    title: "Acima de R$ 299",
    description: "Combine peças para casa e setup sem custo extra de envio."
  },
  {
    id: "promo-2",
    tag: "Lotes curtos",
    title: "Produção autoral",
    description: "Catálogo enxuto, acabamento controlado e reposição por coleção."
  },
  {
    id: "promo-3",
    tag: "Personalização",
    title: "Pronto para variar cor",
    description: "A base do projeto já comporta variantes e estoque por opção."
  }
];

const defaultAddresses: UserAddress[] = [
  {
    id: "home",
    label: "Casa",
    street: "Rua Conselheiro Laurindo, 412",
    district: "Centro",
    city: "Curitiba",
    state: "PR",
    zipCode: "80060-100"
  },
  {
    id: "studio",
    label: "Ateliê",
    street: "Rua Chile, 1850",
    district: "Rebouças",
    city: "Curitiba",
    state: "PR",
    zipCode: "80220-181"
  }
];

function isStorageQuotaError(error: unknown) {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem("store-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editableProducts, setEditableProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [adminSlideDrafts, setAdminSlideDrafts] = useState<HeroSlide[]>(defaultHeroSlides);
  const [promoCards, setPromoCards] = useState<PromoCard[]>(defaultPromoCards);
  const [addresses, setAddresses] = useState<UserAddress[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddresses[0]?.id ?? "");
  const [pendingAddressId, setPendingAddressId] = useState(defaultAddresses[0]?.id ?? "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMaterial, setActiveMaterial] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeView, setActiveView] = useState<HeaderView>("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [completedOrder, setCompletedOrder] = useState<CreateOrderResponse | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>("slides");
  const [activeAdminProductId, setActiveAdminProductId] = useState<string | null>(null);
  const [adminProductDraft, setAdminProductDraft] = useState<Product | null>(null);
  const [isGeneratingAdminDescription, setIsGeneratingAdminDescription] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProductImageIndex, setActiveProductImageIndex] = useState(0);
  const [isProductImageZoomOpen, setIsProductImageZoomOpen] = useState(false);
  const [selectedColorOptionId, setSelectedColorOptionId] = useState<string | null>(null);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<UtilityPanelState>(null);
  const [adminUploadError, setAdminUploadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hasRestoredLocalState, setHasRestoredLocalState] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [draftLocation, setDraftLocation] = useState({
    label: "",
    street: "",
    district: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const locationMenuRef = useRef<HTMLDivElement | null>(null);
  const categoriesMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedSlides = window.localStorage.getItem("store-admin-slides");
    const storedPromoCards = window.localStorage.getItem("store-admin-promos");
    const storedAddresses = window.localStorage.getItem("store-addresses");
    const storedSelectedAddressId = window.localStorage.getItem("store-selected-address");
    const storedUiState = window.localStorage.getItem("store-ui-state");

    if (storedSlides) {
      try {
        const parsedSlides = JSON.parse(storedSlides) as HeroSlide[];

        if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
          setSlides(parsedSlides);
          setAdminSlideDrafts(parsedSlides);
        }
      } catch {
        window.localStorage.removeItem("store-admin-slides");
      }
    }

    if (storedPromoCards) {
      try {
        const parsedPromoCards = JSON.parse(storedPromoCards) as PromoCard[];

        if (Array.isArray(parsedPromoCards) && parsedPromoCards.length > 0) {
          setPromoCards(parsedPromoCards);
        }
      } catch {
        window.localStorage.removeItem("store-admin-promos");
      }
    }

    if (storedAddresses) {
      try {
        const parsedAddresses = JSON.parse(storedAddresses) as UserAddress[];

        if (Array.isArray(parsedAddresses) && parsedAddresses.length > 0) {
          setAddresses(parsedAddresses);
          setSelectedAddressId(storedSelectedAddressId ?? parsedAddresses[0].id);
          setPendingAddressId(storedSelectedAddressId ?? parsedAddresses[0].id);
        }
      } catch {
        window.localStorage.removeItem("store-addresses");
      }
    }

    if (storedUiState) {
      try {
        const parsedUiState = JSON.parse(storedUiState) as {
          isAdminOpen?: boolean;
          adminSection?: AdminSection;
          activeAdminProductId?: string | null;
          selectedProductId?: string | null;
          activeProductImageIndex?: number;
          activeCategory?: string;
          activeMaterial?: string;
          query?: string;
          sortBy?: SortOption;
          activeView?: HeaderView;
        };

        setIsAdminOpen(Boolean(parsedUiState.isAdminOpen));
        setAdminSection(parsedUiState.adminSection ?? "slides");
        setActiveAdminProductId(parsedUiState.activeAdminProductId ?? null);
        setActiveProductImageIndex(parsedUiState.activeProductImageIndex ?? 0);
        setActiveCategory(parsedUiState.activeCategory ?? "all");
        setActiveMaterial(parsedUiState.activeMaterial ?? "all");
        setQuery(parsedUiState.query ?? "");
        setSortBy(parsedUiState.sortBy ?? "featured");
        setActiveView(parsedUiState.activeView ?? "all");

        if (parsedUiState.selectedProductId) {
          setSelectedProduct({
            id: parsedUiState.selectedProductId
          } as Product);
        }
      } catch {
        window.localStorage.removeItem("store-ui-state");
      }
    }

    setHasRestoredLocalState(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("store-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!hasRestoredLocalState) {
      return;
    }

    try {
      window.localStorage.setItem("store-admin-slides", JSON.stringify(slides));
      setAdminUploadError((current) =>
        current === "As imagens do carrossel ultrapassaram o limite de armazenamento local."
          ? null
          : current
      );
    } catch (error) {
      if (isStorageQuotaError(error)) {
        setAdminUploadError("As imagens do carrossel ultrapassaram o limite de armazenamento local.");
        return;
      }

      throw error;
    }
  }, [hasRestoredLocalState, slides]);

  useEffect(() => {
    if (!hasRestoredLocalState) {
      return;
    }

    window.localStorage.setItem("store-admin-promos", JSON.stringify(promoCards));
  }, [hasRestoredLocalState, promoCards]);

  useEffect(() => {
    if (!hasRestoredLocalState) {
      return;
    }

    window.localStorage.setItem("store-addresses", JSON.stringify(addresses));
  }, [addresses, hasRestoredLocalState]);

  useEffect(() => {
    if (!hasRestoredLocalState) {
      return;
    }

    if (selectedAddressId) {
      window.localStorage.setItem("store-selected-address", selectedAddressId);
    }
  }, [hasRestoredLocalState, selectedAddressId]);

  useEffect(() => {
    if (!hasRestoredLocalState) {
      return;
    }

    window.localStorage.setItem(
      "store-ui-state",
      JSON.stringify({
        isAdminOpen,
        adminSection,
        activeAdminProductId,
        selectedProductId: selectedProduct?.id ?? null,
        activeProductImageIndex,
        activeCategory,
        activeMaterial,
        query,
        sortBy,
        activeView
      })
    );
  }, [
    hasRestoredLocalState,
    isAdminOpen,
    adminSection,
    activeAdminProductId,
    selectedProduct,
    activeProductImageIndex,
    activeCategory,
    activeMaterial,
    query,
    sortBy,
    activeView
  ]);

  useEffect(() => {
    if (
      !isLocationMenuOpen &&
      !isCategoriesMenuOpen &&
      !isProfileMenuOpen &&
      !isNotificationsMenuOpen
    ) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!locationMenuRef.current?.contains(target)) {
        setIsLocationMenuOpen(false);
        setIsAddingLocation(false);
        setPendingAddressId(selectedAddressId);
      }

      if (!categoriesMenuRef.current?.contains(target)) {
        setIsCategoriesMenuOpen(false);
      }

      if (!profileMenuRef.current?.contains(target)) {
        setIsProfileMenuOpen(false);
      }

      if (!notificationsMenuRef.current?.contains(target)) {
        setIsNotificationsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [
    isLocationMenuOpen,
    isCategoriesMenuOpen,
    isProfileMenuOpen,
    isNotificationsMenuOpen,
    selectedAddressId
  ]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slides.length]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [categoryItems, productItems] = await Promise.all([
          getCategories(),
          getProducts()
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoryItems);
        const normalizedProducts = productItems.map(normalizeProduct);

        setProducts(normalizedProducts);
        setEditableProducts(normalizedProducts);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar a loja."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const catalogProducts = editableProducts.length > 0 ? editableProducts : products;
  const materials = Array.from(new Set(catalogProducts.map((product) => product.material)));
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];

  function showToast(message: string, tone: ToastState["tone"] = "success") {
    setToast({ message, tone });
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  function scrollToResults() {
    document.getElementById("results-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function resetStorefront() {
    setActiveView("all");
    setActiveCategory("all");
    setActiveMaterial("all");
    setQuery("");
    setSortBy("featured");
    setSelectedProduct(null);
    setSelectedColorOptionId(null);
    setIsProductImageZoomOpen(false);
    setIsAdminOpen(false);
    setActiveAdminProductId(null);
    setAdminProductDraft(null);
    setIsCartOpen(false);
    setIsLocationMenuOpen(false);
    setIsCategoriesMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setActiveUtilityPanel(null);
    scrollToResults();
  }

  function buildSlideDraft(imageUrl: string, index: number): HeroSlide {
    const nextNumber = adminSlideDrafts.length + index + 1;

    return {
      id: `slide-${Date.now()}-${index}`,
      eyebrow: "",
      title: `Banner ${nextNumber}`,
      description: "",
      cta: "",
      category: "all",
      accent: "#11b8f5",
      imageUrl
    };
  }

  function appendSlideDrafts(imageUrls: string[]) {
    if (adminSlideDrafts.length + imageUrls.length > 12) {
      setAdminUploadError("O carrossel aceita no máximo 12 imagens.");
      showToast("O carrossel aceita no máximo 12 imagens.", "error");
      return;
    }

    setAdminSlideDrafts((current) => [
      ...current,
      ...imageUrls.map((imageUrl, index) => buildSlideDraft(imageUrl, index))
    ]);
    showToast(`${imageUrls.length} imagem(ns) adicionada(s) ao rascunho.`);
  }

  function removeSlideDraft(slideId: string) {
    setAdminSlideDrafts((current) =>
      current.length > 1 ? current.filter((slide) => slide.id !== slideId) : current
    );
    showToast("Banner removido do rascunho.");
  }

  function updateSlideDraft(slideId: string, field: keyof HeroSlide, value: string) {
    setAdminSlideDrafts((current) =>
      current.map((slide) => (slide.id === slideId ? { ...slide, [field]: value } : slide))
    );
  }

  function saveSlideDrafts() {
    setSlides(adminSlideDrafts);
    setActiveSlide((current) => (current >= adminSlideDrafts.length ? 0 : current));
    setAdminUploadError(null);
    showToast("Edições do carrossel salvas.");
  }

  function cancelSlideDrafts() {
    setAdminSlideDrafts(slides);
    setAdminUploadError(null);
    showToast("Alterações do carrossel descartadas.");
  }

  function updatePromoCard(promoId: string, field: keyof PromoCard, value: string) {
    setPromoCards((current) =>
      current.map((promo) => (promo.id === promoId ? { ...promo, [field]: value } : promo))
    );
  }

  function updateProduct(productId: string, field: keyof Product, value: string | boolean) {
    setEditableProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        if (field === "featured" && typeof value === "boolean") {
          return { ...product, featured: value };
        }

        if (field === "priceInCents" && typeof value === "string") {
          const normalized = Number(value.replace(/[^\d]/g, ""));
          return { ...product, priceInCents: normalized };
        }

        if (field === "tags" && typeof value === "string") {
          return {
            ...product,
            tags: value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          };
        }

        return { ...product, [field]: value } as Product;
      })
    );
  }

  function updateAdminProductDraft(field: keyof Product, value: string | boolean) {
    setAdminProductDraft((current) => {
      if (!current) {
        return current;
      }

      if (field === "featured" && typeof value === "boolean") {
        return { ...current, featured: value };
      }

      if (field === "priceInCents" && typeof value === "string") {
        const normalized = Number(value.replace(/[^\d]/g, ""));
        return { ...current, priceInCents: normalized };
      }

      if (field === "tags" && typeof value === "string") {
        return {
          ...current,
          tags: value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        };
      }

      if (field === "colorOptions" && typeof value === "string") {
        return {
          ...current,
          colorOptions: parseColorOptions(value)
        };
      }

      return { ...current, [field]: value } as Product;
    });
  }

  function updateProductDimensions(
    productId: string,
    field: "width" | "height",
    value: string
  ) {
    setEditableProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        const parsedDimensions = parseDimensions(product.dimensions);
        const width = field === "width" ? value : parsedDimensions.width;
        const height = field === "height" ? value : parsedDimensions.height;

        return {
          ...product,
          dimensions: `${width.trim()} x ${height.trim()} cm`
        };
      })
    );
  }

  function updateAdminProductDraftDimensions(field: "width" | "height", value: string) {
    setAdminProductDraft((current) => {
      if (!current) {
        return current;
      }

      const parsedDimensions = parseDimensions(current.dimensions);
      const width = field === "width" ? value : parsedDimensions.width;
      const height = field === "height" ? value : parsedDimensions.height;

      return {
        ...current,
        dimensions: `${width.trim()} x ${height.trim()} cm`
      };
    });
  }

  function appendProductGalleryImages(productId: string, dataUrls: string[]) {
    setEditableProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
            ...product,
            galleryImages: [...(product.galleryImages ?? []), ...dataUrls]
          }
          : product
      )
    );
  }

  function appendAdminProductDraftGalleryImages(dataUrls: string[]) {
    setAdminProductDraft((current) =>
      current
        ? {
          ...current,
          galleryImages: [...(current.galleryImages ?? []), ...dataUrls]
        }
        : current
    );
  }

  function removeProductGalleryImage(productId: string, imageIndex: number) {
    setEditableProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
            ...product,
            galleryImages: (product.galleryImages ?? []).filter((_, index) => index !== imageIndex)
          }
          : product
      )
    );
  }

  function removeAdminProductDraftGalleryImage(imageIndex: number) {
    setAdminProductDraft((current) =>
      current
        ? {
          ...current,
          galleryImages: (current.galleryImages ?? []).filter((_, index) => index !== imageIndex)
        }
        : current
    );
  }

  function openAdminProductEditor(product: Product) {
    setActiveAdminProductId(product.id);
    setAdminProductDraft(cloneProduct(product));
    setAdminUploadError(null);
  }

  function cancelAdminProductEditor() {
    setActiveAdminProductId(null);
    setAdminProductDraft(null);
    setAdminUploadError(null);
    showToast("Produto salvo.");
  }

  async function saveAdminProductEditor() {
    if (!adminProductDraft) {
      return;
    }

    try {
      const { items } = await updateProductRequest(cloneProduct(adminProductDraft));
      const normalizedProducts = items.map(normalizeProduct);

      setProducts(normalizedProducts);
      setEditableProducts(normalizedProducts);
      setActiveAdminProductId(null);
      setAdminProductDraft(null);
      setAdminUploadError(null);
      showToast("Produto salvo no catálogo.");
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível salvar o produto."
      );
      showToast("Não foi possível salvar o produto.", "error");
    }
  }

  async function generateAdminDraftDescription() {
    if (!adminProductDraft) {
      return;
    }

    setIsGeneratingAdminDescription(true);
    setAdminUploadError(null);

    try {
      const description = await generateProductDescription({
        name: adminProductDraft.name,
        category: adminProductDraft.category,
        material: adminProductDraft.material,
        dimensions: adminProductDraft.dimensions,
        tags: adminProductDraft.tags,
        colorSummary: (adminProductDraft.colorOptions ?? []).map((option) => option.name).join(", ")
      });

      setAdminProductDraft((current) => (current ? { ...current, description } : current));
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível gerar a descrição com IA."
      );
    } finally {
      setIsGeneratingAdminDescription(false);
    }
  }

  async function addNewProduct() {
    const nextId = `p-${Date.now()}`;
    const nextProduct: Product = {
      id: nextId,
      name: "Novo produto 3D",
      slug: `novo-produto-${nextId}`,
      priceInCents: 19990,
      category: "decor",
      material: "PLA premium",
      dimensions: "20 x 20 cm",
      accentColor: "#ff7a00",
      imageUrl: "",
      galleryImages: [],
      colorOptions: [{ id: "color-1", name: "Branco", swatches: ["#ffffff"] }],
      featured: false,
      description: "Descreva rapidamente o produto aqui.",
      tags: ["novo", "3d"]
    };

    try {
      const { items } = await createProduct(nextProduct);
      const normalizedProducts = items.map(normalizeProduct);

      setProducts(normalizedProducts);
      setEditableProducts(normalizedProducts);
      setAdminSection("products");
      setActiveAdminProductId(nextId);
      setAdminProductDraft(nextProduct);
      setAdminUploadError(null);
      showToast("Novo produto criado.");
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível criar o produto."
      );
      showToast("Não foi possível criar o produto.", "error");
    }
  }

  async function removeProduct(productId: string) {
    try {
      const items = await deleteProductRequest(productId);
      const normalizedProducts = items.map(normalizeProduct);

      setProducts(normalizedProducts);
      setEditableProducts(normalizedProducts);
      setActiveAdminProductId((current) => (current === productId ? null : current));
      setAdminProductDraft((current) => (current?.id === productId ? null : current));
      setAdminUploadError(null);
      showToast("Produto deletado.");
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível deletar o produto."
      );
      showToast("Não foi possível deletar o produto.", "error");
    }
  }

  async function resetAdminContent() {
    setSlides(defaultHeroSlides);
    setAdminSlideDrafts(defaultHeroSlides);
    setPromoCards(defaultPromoCards);
    setActiveAdminProductId(null);
    setAdminProductDraft(null);
    setAdminUploadError(null);
    window.localStorage.removeItem("store-admin-slides");
    window.localStorage.removeItem("store-admin-promos");
    window.localStorage.removeItem("store-admin-products");

    try {
      const items = await resetProducts();
      const normalizedProducts = items.map(normalizeProduct);

      setProducts(normalizedProducts);
      setEditableProducts(normalizedProducts);
      showToast("Conteúdo restaurado.");
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível restaurar produtos."
      );
      showToast("Não foi possível restaurar produtos.", "error");
    }
  }

  async function handleAdminImageFile(
    file: File | undefined,
    onSuccess: (dataUrl: string) => void,
    options?: { targetWidth?: number; targetHeight?: number; resizeMode?: "fit" | "cover" }
  ) {
    if (!file) {
      return;
    }

    if (!isAcceptedImageFile(file)) {
      setAdminUploadError("Use somente arquivos PNG, JPG, JPEG ou WEBP.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const normalizedDataUrl =
        options?.targetWidth && options?.targetHeight
          ? options.resizeMode === "cover"
            ? await resizeImageToCover(dataUrl, options.targetWidth, options.targetHeight)
            : await resizeImageToFit(dataUrl, options.targetWidth, options.targetHeight)
          : dataUrl;
      onSuccess(normalizedDataUrl);
      setAdminUploadError(null);
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível carregar a imagem."
      );
    }
  }

  async function handleAdminImageFiles(
    files: FileList | File[] | undefined | null,
    onSuccess: (dataUrls: string[]) => void,
    options?: {
      targetWidth?: number;
      targetHeight?: number;
      resizeMode?: "fit" | "cover";
      maxFileSizeBytes?: number;
    }
  ) {
    const selectedFiles = files ? Array.from(files) : [];

    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.some((file) => !isAcceptedImageFile(file))) {
      setAdminUploadError("Use somente arquivos PNG, JPG, JPEG ou WEBP.");
      return;
    }

    const maxFileSizeBytes = options?.maxFileSizeBytes;

    if (
      maxFileSizeBytes &&
      selectedFiles.some((file) => file.size > maxFileSizeBytes)
    ) {
      setAdminUploadError("Cada imagem deve ter no máximo 10 MB.");
      return;
    }

    try {
      const dataUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);

          if (options?.targetWidth && options?.targetHeight) {
            return options.resizeMode === "cover"
              ? resizeImageToCover(dataUrl, options.targetWidth, options.targetHeight)
              : resizeImageToFit(dataUrl, options.targetWidth, options.targetHeight);
          }

          return dataUrl;
        })
      );
      onSuccess(dataUrls);
      setAdminUploadError(null);
    } catch (error) {
      setAdminUploadError(
        error instanceof Error ? error.message : "Não foi possível carregar as imagens."
      );
    }
  }

  function handleSlideImagesInput(event: ChangeEvent<HTMLInputElement>) {
    void handleAdminImageFiles(event.target.files, appendSlideDrafts, {
      targetWidth: 1260,
      targetHeight: 420,
      resizeMode: "cover",
      maxFileSizeBytes: 10 * 1024 * 1024
    });
    event.target.value = "";
  }

  function handleSlideImageInput(slideId: string, event: ChangeEvent<HTMLInputElement>) {
    void handleAdminImageFile(event.target.files?.[0], (dataUrl) => {
      updateSlideDraft(slideId, "imageUrl", dataUrl);
      showToast("Imagem do banner atualizada.");
    }, { targetWidth: 1260, targetHeight: 420, resizeMode: "cover" });
    event.target.value = "";
  }

  function handleProductImageInput(productId: string, event: ChangeEvent<HTMLInputElement>) {
    void handleAdminImageFile(event.target.files?.[0], (dataUrl) => {
      updateAdminProductDraft("imageUrl", dataUrl);
    }, { targetWidth: 700, targetHeight: 700 });
    event.target.value = "";
  }

  function handleSlideImagesDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleAdminImageFiles(event.dataTransfer.files, appendSlideDrafts, {
      targetWidth: 1260,
      targetHeight: 420,
      resizeMode: "cover",
      maxFileSizeBytes: 10 * 1024 * 1024
    });
  }

  function handleSlideImageDrop(slideId: string, event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleAdminImageFile(event.dataTransfer.files?.[0], (dataUrl) => {
      updateSlideDraft(slideId, "imageUrl", dataUrl);
      showToast("Imagem do banner atualizada.");
    }, { targetWidth: 1260, targetHeight: 420, resizeMode: "cover" });
  }

  function handleProductImageDrop(productId: string, event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleAdminImageFile(event.dataTransfer.files?.[0], (dataUrl) => {
      updateAdminProductDraft("imageUrl", dataUrl);
    }, { targetWidth: 700, targetHeight: 700 });
  }

  function handleProductGalleryInput(productId: string, event: ChangeEvent<HTMLInputElement>) {
    void handleAdminImageFiles(event.target.files, (dataUrls) => {
      appendAdminProductDraftGalleryImages(dataUrls);
    }, { targetWidth: 700, targetHeight: 700 });
    event.target.value = "";
  }

  function handleProductGalleryDrop(productId: string, event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleAdminImageFiles(event.dataTransfer.files, (dataUrls) => {
      appendAdminProductDraftGalleryImages(dataUrls);
    }, { targetWidth: 700, targetHeight: 700 });
  }

  function openLocationMenu() {
    setPendingAddressId(selectedAddressId);
    setIsAddingLocation(false);
    setIsCategoriesMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setIsLocationMenuOpen((current) => !current);
  }

  function openCategoriesMenu() {
    setIsLocationMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setIsCategoriesMenuOpen((current) => !current);
  }

  function openProfileMenu() {
    setIsLocationMenuOpen(false);
    setIsCategoriesMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setIsProfileMenuOpen((current) => !current);
  }

  function openNotificationsMenu() {
    setIsLocationMenuOpen(false);
    setIsCategoriesMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen((current) => !current);
  }

  function confirmSelectedAddress() {
    setSelectedAddressId(pendingAddressId);
    setIsLocationMenuOpen(false);
    setIsAddingLocation(false);
  }

  function handleNewLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedState = draftLocation.state.trim().toUpperCase();

    if (
      !draftLocation.label.trim() ||
      !draftLocation.street.trim() ||
      !draftLocation.district.trim() ||
      !draftLocation.city.trim() ||
      !normalizedState ||
      !draftLocation.zipCode.trim()
    ) {
      return;
    }

    const nextAddress: UserAddress = {
      id: `custom-${Date.now()}`,
      label: draftLocation.label.trim(),
      street: draftLocation.street.trim(),
      district: draftLocation.district.trim(),
      city: draftLocation.city.trim(),
      state: normalizedState,
      zipCode: draftLocation.zipCode.trim()
    };

    setAddresses((current) => [...current, nextAddress]);
    setSelectedAddressId(nextAddress.id);
    setPendingAddressId(nextAddress.id);
    setDraftLocation({
      label: "",
      street: "",
      district: "",
      city: "",
      state: "",
      zipCode: ""
    });
    setIsAddingLocation(false);
    setIsLocationMenuOpen(false);
  }

  function openUtilityPanel(panel: Exclude<UtilityPanelState, null>) {
    setActiveUtilityPanel(panel);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setIsCategoriesMenuOpen(false);
  }

  function openAdminPanel() {
    setAdminSlideDrafts(slides);
    setIsProfileMenuOpen(false);
    setIsAdminOpen(true);
  }

  function activateSlide(index: number) {
    setActiveSlide(index);
  }

  function goToPreviousSlide() {
    setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  }

  function goToNextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  function handleSlideAction(category: string) {
    setActiveCategory(category);
    setActiveView("all");
    scrollToResults();
  }

  function openProductPage(product: Product) {
    setSelectedProduct(product);
    setActiveProductImageIndex(0);
    setSelectedColorOptionId(product.colorOptions?.[0]?.id ?? null);
    setIsCartOpen(false);
    setActiveUtilityPanel(null);
    setIsCategoriesMenuOpen(false);
    setIsLocationMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFavorite(productId: string) {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  function addToCart(productId: string) {
    setCompletedOrder(null);
    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === productId);

      if (existingItem) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { productId, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateCartQuantity(productId: string, nextQuantity: number) {
    setCompletedOrder(null);

    if (nextQuantity <= 0) {
      setCartItems((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  }

  async function submitOrder({
    customer,
    paymentMethod
  }: {
    customer: CheckoutCustomer;
    paymentMethod: "pix" | "whatsapp";
  }) {
    if (!selectedAddress) {
      showToast("Selecione um endereço de entrega antes de finalizar.", "error");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Adicione pelo menos um produto ao carrinho.", "error");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const response = await createOrder({
        customer,
        paymentMethod,
        address: selectedAddress,
        items: cartItems
      });

      setCompletedOrder(response);
      setCartItems([]);
      showToast("Pedido criado com sucesso.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Não foi possível finalizar o pedido.", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function handleOffersClick() {
    setActiveView("offers");
    setSortBy("featured");
    setSelectedProduct(null);
    scrollToResults();
  }

  function handleFavoritesClick() {
    setActiveView((current) => (current === "favorites" ? "all" : "favorites"));
    setSelectedProduct(null);
    scrollToResults();
  }

  const selectedProductInCatalog = selectedProduct
    ? catalogProducts.find((product) => product.id === selectedProduct.id) ?? null
    : null;
  const selectedProductIndex = selectedProductInCatalog
    ? Math.max(
      0,
      catalogProducts.findIndex((product) => product.id === selectedProductInCatalog.id)
    )
    : 0;
  const selectedProductGallery = selectedProductInCatalog
    ? buildProductGallery(selectedProductInCatalog)
    : [];
  const selectedProductMainImage =
    selectedProductGallery[activeProductImageIndex] ?? selectedProductGallery[0] ?? "";
  const selectedCategoryLabel = selectedProductInCatalog
    ? categories.find((category) => category.id === selectedProductInCatalog.category)?.label ??
    selectedProductInCatalog.category
    : "";
  const selectedColorOption =
    selectedProductInCatalog?.colorOptions?.find((option) => option.id === selectedColorOptionId) ??
    selectedProductInCatalog?.colorOptions?.[0] ??
    null;
  const relatedProducts = selectedProductInCatalog
    ? catalogProducts.filter((product) => product.id !== selectedProductInCatalog.id).slice(0, 5)
    : [];
  const productFeatureBullets = selectedProductInCatalog
    ? [
      `Produzido em ${selectedProductInCatalog.material.toLowerCase()} com acabamento limpo.`,
      `Dimensões aproximadas de ${selectedProductInCatalog.dimensions}.`,
      `Peça pensada para uso em ${selectedCategoryLabel.toLowerCase()} e composição visual.`,
      `Catálogo com identidade própria e lotes curtos de produção.`
    ]
    : [];
  const productReviewSamples = selectedProductInCatalog
    ? [
      {
        author: "Mariana",
        title: "Acabamento muito bom",
        text: `A peça chegou bem embalada e o acabamento ficou acima do esperado para ${selectedProductInCatalog.material}.`,
        rating: "5.0"
      },
      {
        author: "Lucas",
        title: "Ótimo para setup",
        text: `Usei no meu ambiente e combinou bem com a proposta visual. O tamanho de ${selectedProductInCatalog.dimensions} funcionou bem.`,
        rating: "5.0"
      },
      {
        author: "Fernanda",
        title: "Visual forte ao vivo",
        text: "Pessoalmente a textura fica mais interessante do que nas fotos. Valeu a compra.",
        rating: "4.0"
      }
    ]
    : [];

  useEffect(() => {
    if (!selectedProductInCatalog) {
      setSelectedColorOptionId(null);
      return;
    }

    const firstColorOptionId = selectedProductInCatalog.colorOptions?.[0]?.id ?? null;

    setSelectedColorOptionId((current) => {
      if (
        current &&
        selectedProductInCatalog.colorOptions?.some((option) => option.id === current)
      ) {
        return current;
      }

      return firstColorOptionId;
    });
  }, [selectedProductInCatalog]);

  useEffect(() => {
    if (activeProductImageIndex >= selectedProductGallery.length) {
      setActiveProductImageIndex(0);
    }
  }, [activeProductImageIndex, selectedProductGallery.length]);

  useEffect(() => {
    if (!isAdminOpen || !activeAdminProductId) {
      return;
    }

    if (adminProductDraft?.id === activeAdminProductId) {
      return;
    }

    const product = catalogProducts.find((item) => item.id === activeAdminProductId);

    if (product) {
      setAdminProductDraft(cloneProduct(product));
    }
  }, [isAdminOpen, activeAdminProductId, adminProductDraft, catalogProducts]);

  const cartProducts = cartItems
    .map((item) => {
      const product = catalogProducts.find((entry) => entry.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null);

  const cartTotalInCents = cartProducts.reduce(
    (total, item) => total + item.product.priceInCents * item.quantity,
    0
  );

  const visibleProducts = catalogProducts
    .filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesMaterial =
        activeMaterial === "all" || product.material === activeMaterial;
      const matchesQuery = deferredQuery
        ? [
          product.name,
          product.description,
          product.material,
          ...product.tags
        ]
          .join(" ")
          .toLowerCase()
          .includes(deferredQuery.toLowerCase())
        : true;
      const matchesOffers = activeView === "offers" ? product.featured : true;
      const matchesFavorites =
        activeView === "favorites" ? favoriteIds.includes(product.id) : true;

      return (
        matchesCategory &&
        matchesMaterial &&
        matchesQuery &&
        matchesOffers &&
        matchesFavorites
      );
    })
    .sort((left, right) => {
      if (sortBy === "price-asc") {
        return left.priceInCents - right.priceInCents;
      }

      if (sortBy === "price-desc") {
        return right.priceInCents - left.priceInCents;
      }

      if (sortBy === "name") {
        return left.name.localeCompare(right.name);
      }

      if (left.featured === right.featured) {
        return left.name.localeCompare(right.name);
      }

      return left.featured ? -1 : 1;
    });

  if (isAdminOpen) {
    return (
      <div className="marketplace-shell admin-page-shell">
        <main className="admin-page">
          <AdminPageHeader
            onResetAdminContent={resetAdminContent}
            onCloseAdmin={() => setIsAdminOpen(false)}
          />

          <section className="admin-page-layout">
            <AdminSidebar
              adminSection={adminSection}
              onChangeSection={setAdminSection}
              onResetStorefront={resetStorefront}
              onAddNewProduct={addNewProduct}
            />

            <section className="results-panel admin-page-panel">
              <AdminPanelHeader adminSection={adminSection} />

              {adminUploadError ? <p className="admin-upload-error">{adminUploadError}</p> : null}

              {adminSection === "slides" ? (
	                <AdminSlidesEditor
	                  slides={adminSlideDrafts}
	                  adminUploadError={adminUploadError}
                  onUpdateSlide={updateSlideDraft}
                  onSlideImagesInput={handleSlideImagesInput}
                  onSlideImagesDrop={handleSlideImagesDrop}
                  onSlideImageInput={handleSlideImageInput}
                  onSlideImageDrop={handleSlideImageDrop}
                  onRemoveSlide={removeSlideDraft}
                  onSaveSlides={saveSlideDrafts}
                  onCancelSlides={cancelSlideDrafts}
                />
              ) : null}

              {adminSection === "promos" ? (
                <AdminPromoCardsEditor
                  promoCards={promoCards}
                  onUpdatePromoCard={updatePromoCard}
                />
              ) : null}

              {adminSection === "products" ? (
                <AdminProductList
                  products={catalogProducts}
                  categories={categories}
                  activeAdminProductId={activeAdminProductId}
                  adminProductDraft={adminProductDraft}
                  isGeneratingAdminDescription={isGeneratingAdminDescription}
                  onOpenAdminProductEditor={openAdminProductEditor}
                  onCancelAdminProductEditor={cancelAdminProductEditor}
                  onSaveAdminProductEditor={saveAdminProductEditor}
                  onRemoveProduct={removeProduct}
                  onUpdateAdminProductDraft={updateAdminProductDraft}
                  onUpdateAdminProductDraftDimensions={updateAdminProductDraftDimensions}
                  onGenerateAdminDraftDescription={generateAdminDraftDescription}
                  onProductImageInput={handleProductImageInput}
                  onProductImageDrop={handleProductImageDrop}
                  onProductGalleryInput={handleProductGalleryInput}
                  onProductGalleryDrop={handleProductGalleryDrop}
                  onRemoveAdminProductDraftGalleryImage={removeAdminProductDraftGalleryImage}
                />
              ) : null}
            </section>
          </section>
        </main>
        {toast ? (
          <div className={`app-toast app-toast-${toast.tone}`} role="status" aria-live="polite">
            <span className="app-toast-icon" aria-hidden="true">
              {toast.tone === "success" ? "✓" : "×"}
            </span>
            <span>{toast.message}</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="marketplace-shell">
      <header className="top-header">
        <div className="top-header-inner">
          <div className="brand-column">
            <button className="brand reset-button" type="button" onClick={resetStorefront}>
              <DabiLogo className="brand-logo-image" />
            </button>

            <div className="location-menu-shell compact" ref={locationMenuRef}>
              <button
                className="location-trigger compact"
                type="button"
                onClick={openLocationMenu}
              >
                <span className="location-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
                    <circle cx="12" cy="10" r="2.7" />
                  </svg>
                </span>
                <span className="location-copy">
                  <span className="location-eyebrow">Enviar para {signedInUser.name}</span>
                  <strong>
                    {selectedAddress ? buildAddressSummary(selectedAddress) : "Escolha o local de entrega"}
                  </strong>
                </span>
              </button>

              {isLocationMenuOpen ? (
                <div className="location-dropdown">
                  {!isAddingLocation ? (
                    <>
                      <div className="location-dropdown-header">
                        <div>
                          <span className="panel-kicker">Escolha onde receber</span>
                          <h2>{signedInUser.name}, selecione um endereço</h2>
                        </div>
                      </div>

                      <div className="address-options">
                        {addresses.map((address) => (
                          <label key={address.id} className="address-option">
                            <input
                              type="radio"
                              name="delivery-address"
                              checked={pendingAddressId === address.id}
                              onChange={() => setPendingAddressId(address.id)}
                            />
                            <div>
                              <strong>{address.label}</strong>
                              <span>{buildAddressDetails(address)}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="location-actions">
                        <button type="button" onClick={confirmSelectedAddress}>
                          Confirmar
                        </button>
                        <button
                          className="ghost-action"
                          type="button"
                          onClick={() => setIsAddingLocation(true)}
                        >
                          Escolher outra localidade
                        </button>
                      </div>
                    </>
                  ) : (
                    <form className="new-location-form" onSubmit={handleNewLocationSubmit}>
                      <div className="location-dropdown-header">
                        <div>
                          <span className="panel-kicker">Nova localidade</span>
                          <h2>Cadastrar endereço de entrega</h2>
                        </div>
                      </div>

                      <label>
                        <span>Apelido</span>
                        <input
                          value={draftLocation.label}
                          onChange={(event) =>
                            setDraftLocation((current) => ({
                              ...current,
                              label: event.target.value
                            }))
                          }
                          placeholder="Casa, escritório, ateliê..."
                          required
                        />
                      </label>
                      <label>
                        <span>Rua e número</span>
                        <input
                          value={draftLocation.street}
                          onChange={(event) =>
                            setDraftLocation((current) => ({
                              ...current,
                              street: event.target.value
                            }))
                          }
                          placeholder="Rua, avenida, número"
                          required
                        />
                      </label>
                      <label>
                        <span>Bairro</span>
                        <input
                          value={draftLocation.district}
                          onChange={(event) =>
                            setDraftLocation((current) => ({
                              ...current,
                              district: event.target.value
                            }))
                          }
                          placeholder="Bairro"
                          required
                        />
                      </label>
                      <div className="new-location-grid">
                        <label>
                          <span>Cidade</span>
                          <input
                            value={draftLocation.city}
                            onChange={(event) =>
                              setDraftLocation((current) => ({
                                ...current,
                                city: event.target.value
                              }))
                            }
                            placeholder="Cidade"
                            required
                          />
                        </label>
                        <label>
                          <span>UF</span>
                          <input
                            value={draftLocation.state}
                            onChange={(event) =>
                              setDraftLocation((current) => ({
                                ...current,
                                state: event.target.value.slice(0, 2)
                              }))
                            }
                            placeholder="PR"
                            required
                          />
                        </label>
                      </div>
                      <label>
                        <span>CEP</span>
                        <input
                          value={draftLocation.zipCode}
                          onChange={(event) =>
                            setDraftLocation((current) => ({
                              ...current,
                              zipCode: event.target.value
                            }))
                          }
                          placeholder="00000-000"
                          required
                        />
                      </label>

                      <div className="location-actions">
                        <button type="submit">Salvar endereço</button>
                        <button
                          className="ghost-action"
                          type="button"
                          onClick={() => setIsAddingLocation(false)}
                        >
                          Voltar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="header-main">
            <label className="searchbar">
              <input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => {
                    setQuery(nextValue);
                  });
                }}
                placeholder="Buscar produtos 3D, decoração, setup, suportes..."
              />
              <span className="search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>
              </span>
            </label>

            <div className="header-secondary">
              <div className="secondary-links">
                <div className="categories-popup-shell" ref={categoriesMenuRef}>
                  <button
                    className="header-link with-chevron"
                    type="button"
                    onClick={openCategoriesMenu}
                  >
                    Categorias
                  </button>

                  {isCategoriesMenuOpen ? (
                    <div className="categories-popup">
                      {categories
                        .filter((category) => category.id !== "all")
                        .map((category) => (
                          <button
                            key={category.id}
                            className="popup-category-item"
                            type="button"
                            onClick={() => {
                              setActiveCategory(category.id);
                              setIsCategoriesMenuOpen(false);
                              scrollToResults();
                            }}
                          >
                            <strong>{category.label}</strong>
                            <span>
                              {catalogProducts.filter((product) => product.category === category.id).length} itens
                            </span>
                          </button>
                        ))}
                    </div>
                  ) : null}
                </div>

                <button
                  className={activeView === "offers" ? "header-link active-link" : "header-link"}
                  type="button"
                  onClick={handleOffersClick}
                >
                  Ofertas
                </button>
                <button className="header-link" type="button" onClick={() => openUtilityPanel("coupons")}>
                  Cupons
                </button>
                <button className="header-link" type="button" onClick={() => openUtilityPanel("contact")}>
                  Contato
                </button>
              </div>

              <div className="header-actions">
                <div className="profile-menu-shell" ref={profileMenuRef}>
                  <button className="profile-trigger" type="button" onClick={openProfileMenu}>
                    <span className="profile-avatar">{signedInUser.name.slice(0, 1)}</span>
                    <span>{signedInUser.name}</span>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="profile-popup">
                      <button
                        className="profile-popup-item"
                        type="button"
                        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                      >
                        {theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                      </button>
                      <button
                        className="profile-popup-item"
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsLocationMenuOpen(true);
                        }}
                      >
                        Alterar endereço
                      </button>
                      <button
                        className="profile-popup-item"
                        type="button"
                        onClick={openAdminPanel}
                      >
                        Painel admin
                      </button>
                    </div>
                  ) : null}
                </div>

                <button className="header-link" type="button" onClick={() => openUtilityPanel("orders")}>
                  Compras
                </button>
                <button
                  className={activeView === "favorites" ? "header-link active-link" : "header-link"}
                  type="button"
                  onClick={handleFavoritesClick}
                >
                  Favoritos
                </button>

                <div className="icon-menu-shell" ref={notificationsMenuRef}>
                  <button className="icon-link" type="button" onClick={openNotificationsMenu}>
                    <span className="sr-only">Notificações</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2V9Z" />
                      <path d="M10 18a2 2 0 0 0 4 0" />
                    </svg>
                  </button>

                  {isNotificationsMenuOpen ? (
                    <div className="notifications-popup">
                      <span className="panel-kicker">Notificações</span>
                      <div className="notification-list">
                        {mockNotifications.map((notification) => (
                          <p key={notification}>{notification}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <button className="cart-link icon-cart" type="button" onClick={() => setIsCartOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H7" />
                    <circle cx="10" cy="19" r="1.6" />
                    <circle cx="17" cy="19" r="1.6" />
                  </svg>
                  <span>{cartCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {selectedProductInCatalog ? (
        <>
          <ProductPageContent
            product={selectedProductInCatalog}
            productIndex={selectedProductIndex}
            categoryLabel={selectedCategoryLabel}
            gallery={selectedProductGallery}
            activeImageIndex={activeProductImageIndex}
            mainImage={selectedProductMainImage}
            selectedColorOption={selectedColorOption}
            selectedColorOptionId={selectedColorOptionId}
            featureBullets={productFeatureBullets}
            reviewSamples={productReviewSamples}
            relatedProducts={relatedProducts}
            favoriteIds={favoriteIds}
            isImageZoomOpen={isProductImageZoomOpen}
            onBack={() => setSelectedProduct(null)}
            onChangeImage={setActiveProductImageIndex}
            onOpenZoom={() => setIsProductImageZoomOpen(true)}
            onCloseZoom={() => setIsProductImageZoomOpen(false)}
            onSelectColorOption={setSelectedColorOptionId}
            onOpenProduct={openProductPage}
            onAddToCart={addToCart}
            onToggleFavorite={toggleFavorite}
          />
          <StoreFooter />
        </>
      ) : (
        <>
            <HeroCarousel
              slides={slides}
              activeSlide={activeSlide}
              onPreviousSlide={goToPreviousSlide}
              onNextSlide={goToNextSlide}
              onActivateSlide={activateSlide}
              onSlideAction={handleSlideAction}
            />

            <StorefrontContent
              promoCards={promoCards}
              categories={categories}
              catalogProducts={catalogProducts}
              visibleProducts={visibleProducts}
              materials={materials}
              activeCategory={activeCategory}
              activeMaterial={activeMaterial}
              activeView={activeView}
              sortBy={sortBy}
              isLoading={isLoading}
              error={error}
              favoriteIds={favoriteIds}
              onChangeCategory={setActiveCategory}
              onChangeMaterial={setActiveMaterial}
              onChangeSortBy={setSortBy}
              onOpenProduct={openProductPage}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              onResetStorefront={resetStorefront}
            />
            <StoreFooter />
        </>
      )}

      {isCartOpen ? (
        <CartPanel
          cartCount={cartCount}
          cartProducts={cartProducts}
          cartTotalInCents={cartTotalInCents}
          selectedAddress={selectedAddress ?? null}
          isSubmittingOrder={isSubmittingOrder}
          completedOrder={completedOrder}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onSubmitOrder={submitOrder}
        />
      ) : null}

      {activeUtilityPanel ? (
        <UtilityPanel
          activePanel={activeUtilityPanel}
          coupons={mockCoupons}
          orders={mockOrders}
          onClose={() => setActiveUtilityPanel(null)}
        />
      ) : null}

      {toast ? (
        <div className={`app-toast app-toast-${toast.tone}`} role="status" aria-live="polite">
          <span className="app-toast-icon" aria-hidden="true">
            {toast.tone === "success" ? "✓" : "×"}
          </span>
          <span>{toast.message}</span>
        </div>
      ) : null}

    </div>
  );
}
