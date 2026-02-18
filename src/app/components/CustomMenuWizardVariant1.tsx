import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Edit2,
  ClipboardList,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ShoppingCart,
  X,
  Plus,
  Minus,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "./Button";
import {
  menuItems,
  categories,
  MenuItem,
  MenuItemVariant,
} from "./menuItemsData";
import { DietaryIcon } from "./DietaryIcon";
import { ThankYouScreen } from "./ThankYouScreen";
import { WizardHeader } from "./WizardHeader";

interface EventDetails {
  name: string;
  business: string;
  email: string;
  telephone: string;
  street: string;
  plz: string;
  location: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  occasion: string;
  specialRequests: string;
}

export function CustomMenuWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("contact");
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "",
    business: "",
    email: "",
    telephone: "",
    street: "",
    plz: "",
    location: "",
    eventDate: "",
    eventTime: "",
    guestCount: "",
    occasion: "",
    specialRequests: "",
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [itemAddOns, setItemAddOns] = useState<Record<string, string[]>>({});
  const [itemVariants, setItemVariants] = useState<Record<string, string>>({});
  const [itemComments, setItemComments] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Start with first category
  const [visitedCategories, setVisitedCategories] = useState<string[]>([
    categories[0],
  ]); // Mark first as visited
  const [errors, setErrors] = useState<Partial<EventDetails>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [detailsModalItem, setDetailsModalItem] = useState<MenuItem | null>(
    null,
  );
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempGuestCount, setTempGuestCount] = useState<string>("");
  const [tempAddOns, setTempAddOns] = useState<string[]>([]);
  const [tempVariant, setTempVariant] = useState<string>("");
  const [tempComment, setTempComment] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryNumber, setInquiryNumber] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [mainCourseReductionMessage, setMainCourseReductionMessage] =
    useState("");
  const [isCartCollapsed, setIsCartCollapsed] = useState(true); // Collapsed by default for better browsing experience
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false); // Mobile cart drawer state
  const [showCartFab, setShowCartFab] = useState(true); // Show/hide cart FAB based on scroll
  const [summaryViewMode, setSummaryViewMode] = useState<
    "per-person" | "total"
  >("total"); // Step 3 summary view mode - default to "total+extra"

  // Track guest distribution per main course category
  const [mainCourseGuests, setMainCourseGuests] = useState<
    Record<string, number>
  >({
    "Main Courses Meat/Fish": 0,
    "Main Courses Veggie": 0,
    "Main Courses Vegan": 0,
  });
  const [guestCountErrors, setGuestCountErrors] = useState<
    Record<string, string>
  >({}); // Track validation errors for guest count inputs

  // Initialize all categories as collapsed by default
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >(() => {
    const initialCollapsed: Record<string, boolean> = {};
    [
      "Apéro",
      "Starters",
      "Intermediate Course",
      "Main Courses Meat/Fish",
      "Main Courses Veggie",
      "Main Courses Vegan",
      "Desserts",
      "Beverages",
      "Technology",
      "Decoration",
      "Furniture",
      "Miscellaneous",
    ].forEach((cat) => {
      initialCollapsed[cat] = true;
    });
    return initialCollapsed;
  });

  // Refs for category auto-scroll
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const categoryContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  // Auto-scroll category into view when it changes
  useEffect(() => {
    if (selectedCategory && categoryRefs.current[selectedCategory]) {
      const categoryButton = categoryRefs.current[selectedCategory];

      if (categoryButton) {
        // Use scrollIntoView with center alignment for reliable positioning
        categoryButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedCategory]);

  // Scroll direction detection for cart FAB
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only apply on mobile and when cart has items
      if (window.innerWidth < 1024 && selectedItems.length > 0) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          // Scrolling down - hide FAB
          setShowCartFab(false);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up - show FAB
          setShowCartFab(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedItems.length]);

  // Auto-fill main course guest distribution when guest count changes
  useEffect(() => {
    const totalGuests = parseInt(eventDetails.guestCount) || 0;

    if (totalGuests > 0) {
      // Assign all guests to Meat/Fish by default
      setMainCourseGuests({
        "Main Courses Meat/Fish": totalGuests,
        "Main Courses Veggie": 0,
        "Main Courses Vegan": 0,
      });
      // Clear any errors
      setGuestCountErrors({});
    } else {
      // Reset to 0 if guest count is cleared
      setMainCourseGuests({
        "Main Courses Meat/Fish": 0,
        "Main Courses Veggie": 0,
        "Main Courses Vegan": 0,
      });
    }
  }, [eventDetails.guestCount]);

  const steps = [
    {
      number: 1,
      title: "Event Details",
      subtitle:
        "Share your contact details, event date, and number of guests with us.",
      icon: User,
    },
    {
      number: 2,
      title: "Choose Menu",
      subtitle:
        "Select from our curated offerings - from appetizers to desserts.",
      icon: ClipboardList,
    },
    {
      number: 3,
      title: "Review & Submit",
      subtitle:
        "We'll contact you to review your request and confirm availability.",
      icon: Check,
    },
  ];

  const tabs = [
    { id: "contact", label: "Contact", icon: User },
    { id: "address", label: "Address", icon: MapPin },
    { id: "event", label: "Event", icon: Calendar },
    { id: "requests", label: "Requests", icon: ClipboardList },
  ];

  const validateStep1 = () => {
    const newErrors: Partial<EventDetails> = {};

    if (!eventDetails.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!eventDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!eventDetails.telephone.trim()) {
      newErrors.telephone = "Phone number is required";
    }

    if (!eventDetails.eventDate) {
      newErrors.eventDate = "Event date is required";
    }

    if (!eventDetails.guestCount) {
      newErrors.guestCount = "Number of guests is required";
    } else if (parseInt(eventDetails.guestCount) < 1) {
      newErrors.guestCount = "Must have at least 1 guest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep1Valid = () => {
    return (
      eventDetails.name.trim() !== "" &&
      eventDetails.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      eventDetails.telephone.trim() !== "" &&
      eventDetails.eventDate !== "" &&
      eventDetails.guestCount !== "" &&
      parseInt(eventDetails.guestCount) >= 1
    );
  };

  // Helper functions for tab navigation
  const getNextTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1].id;
    }
    return null;
  };

  const isLastTab = () => {
    return activeTab === tabs[tabs.length - 1].id;
  };

  const isContactTabValid = () => {
    return (
      eventDetails.name.trim() !== "" &&
      eventDetails.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      eventDetails.telephone.trim() !== ""
    );
  };

  const isEventTabValid = () => {
    return (
      eventDetails.eventDate !== "" &&
      eventDetails.guestCount !== "" &&
      parseInt(eventDetails.guestCount) >= 1
    );
  };

  const isCurrentTabValid = () => {
    switch (activeTab) {
      case "contact":
        return isContactTabValid();
      case "address":
        return true; // No required fields on address tab
      case "event":
        return isEventTabValid();
      case "requests":
        return isStep1Valid(); // Validate all required fields before proceeding to step 2
      default:
        return true;
    }
  };

  const handleStep1Navigation = () => {
    if (!isLastTab()) {
      // Move to next tab
      const nextTab = getNextTab();
      if (nextTab) {
        setActiveTab(nextTab);
      }
    } else {
      // On last tab, validate all step 1 fields and move to step 2
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const validateStep2 = () => {
    if (selectedItems.length === 0) {
      setStep2Error("Please select at least one menu item to continue");
      return false;
    }

    // Check if main courses are selected
    const hasMainCourses = selectedItems.some((itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      return item && [
        "Main Courses Meat/Fish",
        "Main Courses Veggie",
        "Main Courses Vegan",
      ].includes(item.category);
    });

    // If main courses are selected, validate guest distribution
    if (hasMainCourses) {
      const totalGuests = parseInt(eventDetails.guestCount) || 0;
      const assignedGuests = Object.values(mainCourseGuests).reduce(
        (sum, count) => sum + count,
        0,
      );

      if (assignedGuests < totalGuests) {
        setStep2Error(
          `Please assign all ${totalGuests} guests to main courses (${assignedGuests} of ${totalGuests} assigned)`,
        );
        return false;
      }

      if (assignedGuests > totalGuests) {
        setStep2Error(
          `Assigned guests (${assignedGuests}) cannot exceed total guests (${totalGuests})`,
        );
        return false;
      }
    }

    setStep2Error("");
    return true;
  };

  // Helper functions for category navigation
  const getNextCategory = () => {
    const currentIndex = categories.indexOf(selectedCategory);
    if (currentIndex < categories.length - 1) {
      return categories[currentIndex + 1];
    }
    return null;
  };

  const isLastCategory = () => {
    return selectedCategory === categories[categories.length - 1];
  };

  const allCategoriesVisited = () => {
    return visitedCategories.length === categories.length;
  };

  const isCategoryLocked = (category: string) => {
    // Only allow access to visited categories or the very next unvisited one
    if (visitedCategories.includes(category)) {
      return false; // Already visited, always accessible
    }
    const categoryIndex = categories.indexOf(category);
    const maxVisitedIndex = Math.max(
      ...visitedCategories.map((c) => categories.indexOf(c)),
    );
    // Lock if trying to skip ahead (more than 1 position beyond max visited)
    return categoryIndex > maxVisitedIndex + 1;
  };

  const handleCategoryChange = (category: string) => {
    // Double-check: prevent jumping to locked categories
    if (isCategoryLocked(category)) {
      return; // Exit early if category is locked
    }

    setSelectedCategory(category);
    if (!visitedCategories.includes(category)) {
      setVisitedCategories([...visitedCategories, category]);
    }
  };

  const handleStep2Navigation = () => {
    if (!isLastCategory()) {
      // Move to next category
      const nextCategory = getNextCategory();
      if (nextCategory) {
        handleCategoryChange(nextCategory);
        // Scroll to top of menu section
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (allCategoriesVisited()) {
      // All categories visited, can proceed to step 3
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      handleStep2Navigation();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Event Details:", eventDetails);
    console.log("Selected Menu Items:", selectedItems);

    // Generate a random inquiry number
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const inquiryNum = `INQ-${randomNumber}`;
    setInquiryNumber(inquiryNum);
    setIsSubmitted(true);
  };

  const toggleMenuItem = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        // Remove item
        const newQuantities = { ...itemQuantities };
        delete newQuantities[itemId];
        setItemQuantities(newQuantities);
        return prev.filter((id) => id !== itemId);
      } else {
        // Add item with quantity 1
        setItemQuantities((prev) => ({ ...prev, [itemId]: 1 }));
        return [...prev, itemId];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const currentQty = prev[itemId] || 1;
      const newQty = Math.max(1, currentQty + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const removeFromCart = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    const newQuantities = { ...itemQuantities };
    delete newQuantities[itemId];
    setItemQuantities(newQuantities);
  };

  // Handle guest count change for main course categories
  const handleMainCourseGuestChange = (
    categoryId: string,
    newValue: string
  ) => {
    const totalGuests = parseInt(eventDetails.guestCount) || 0;
    const newCount = parseInt(newValue) || 0;

    // Calculate sum of other categories (excluding current one)
    const otherCategoriesGuests = Object.entries(mainCourseGuests)
      .filter(([cat]) => cat !== categoryId)
      .reduce((sum, [, count]) => sum + count, 0);

    // Maximum allowed for current category
    const maxAllowed = totalGuests - otherCategoriesGuests;

    // Validate
    if (newCount > maxAllowed) {
      // Show error
      setGuestCountErrors((prev) => ({
        ...prev,
        [categoryId]: `Cannot exceed ${maxAllowed} guests (${totalGuests} total - ${otherCategoriesGuests} already assigned)`,
      }));
      // Don't update the state
      return;
    }

    // Clear error and update state
    setGuestCountErrors((prev) => ({
      ...prev,
      [categoryId]: "",
    }));
    setMainCourseGuests((prev) => ({
      ...prev,
      [categoryId]: newCount,
    }));
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      if (!item) return total;

      const quantity = itemQuantities[itemId] || 1;

      // For flat-rate items, don't multiply by guest count
      if (item.pricingType === "flat-rate") {
        return total + item.price * quantity;
      }

      // For per-person items, multiply by guest count
      const guestCount = parseInt(eventDetails.guestCount) || 1;
      return total + item.price * quantity * guestCount;
    }, 0);
  };

  const getSelectedItemsByCategory = (category: string) => {
    return menuItems.filter(
      (item) => item.category === category && selectedItems.includes(item.id),
    );
  };

  const openDetailsModal = (item: MenuItem) => {
    const isAlreadySelected = selectedItems.includes(item.id);
    setDetailsModalItem(item);
    setTempQuantity(isAlreadySelected ? itemQuantities[item.id] || 1 : 1);
    setTempAddOns(isAlreadySelected ? itemAddOns[item.id] || [] : []);
    // Set variant - use existing selection or default to first variant
    setTempVariant(
      isAlreadySelected
        ? itemVariants[item.id] || item.variants?.[0]?.id || ""
        : item.variants?.[0]?.id || "",
    );
    setTempComment(isAlreadySelected ? itemComments[item.id] || "" : "");
    // Set temp guest count for main courses
    if ([
      "Main Courses Meat/Fish",
      "Main Courses Veggie",
      "Main Courses Vegan",
    ].includes(item.category)) {
      setTempGuestCount(String(mainCourseGuests[item.category] || 0));
    } else {
      setTempGuestCount("");
    }
  };

  const closeDetailsModal = () => {
    setDetailsModalItem(null);
    setTempQuantity(1);
    setTempGuestCount("");
    setTempAddOns([]);
    setTempVariant("");
    setTempComment("");
  };

  const toggleTempAddOn = (addOnId: string) => {
    setTempAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId],
    );
  };


  const addToCartFromModal = () => {
    if (!detailsModalItem) return;

    const itemId = detailsModalItem.id;
    const isNewItem = !selectedItems.includes(itemId);

    // Add to selected items if not already there
    if (isNewItem) {
      setSelectedItems((prev) => [...prev, itemId]);
    }

    // Update quantity
    setItemQuantities((prev) => ({ ...prev, [itemId]: tempQuantity }));

    // Update guest count for main courses
    if ([
      "Main Courses Meat/Fish",
      "Main Courses Veggie",
      "Main Courses Vegan",
    ].includes(detailsModalItem.category)) {
      const guestCount = parseInt(tempGuestCount) || 0;
      setMainCourseGuests((prev) => ({
        ...prev,
        [detailsModalItem.category]: guestCount,
      }));
      // Clear any error for this category
      setGuestCountErrors((prev) => ({
        ...prev,
        [detailsModalItem.category]: "",
      }));
    }

    // Update add-ons
    setItemAddOns((prev) => ({ ...prev, [itemId]: tempAddOns }));

    // Update variant
    if (tempVariant) {
      setItemVariants((prev) => ({ ...prev, [itemId]: tempVariant }));
    }

    // Update comment
    if (tempComment.trim()) {
      setItemComments((prev) => ({ ...prev, [itemId]: tempComment }));
    } else {
      // Remove comment if empty
      setItemComments((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }

    closeDetailsModal();
  };

  const getItemTotalPrice = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    const addOns = itemAddOns[item.id] || [];
    const addOnsPrice = addOns.reduce((total, addOnId) => {
      const addOn = item.addOns?.find((ao) => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    // Get price from variant if selected, otherwise use base price
    let basePrice = item.price;
    const variantId = itemVariants[item.id];
    if (variantId && item.variants) {
      const variant = item.variants.find((v) => v.id === variantId);
      if (variant) {
        basePrice = variant.price;
      }
    }

    const itemTotal = (basePrice + addOnsPrice) * quantity;

    // For flat-rate items, return the total without multiplying by guest count
    if (item.pricingType === "flat-rate") {
      return itemTotal;
    }

    // For main course items, use category-specific guest count
    if ([
      "Main Courses Meat/Fish",
      "Main Courses Veggie",
      "Main Courses Vegan",
    ].includes(item.category)) {
      const categoryGuestCount = mainCourseGuests[item.category] || 0;
      return itemTotal * categoryGuestCount;
    }

    // For other per-person items, multiply by total guest count
    const guestCount = parseInt(eventDetails.guestCount) || 1;
    return itemTotal * guestCount;
  };

  const getTotalPriceWithAddOns = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      if (!item) return total;
      return total + getItemTotalPrice(item);
    }, 0);
  };

  // Get per-person price (without multiplying by guest count)
  const getItemPerPersonPrice = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    const addOns = itemAddOns[item.id] || [];
    const addOnsPrice = addOns.reduce((total, addOnId) => {
      const addOn = item.addOns?.find((ao) => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    // Get price from variant if selected, otherwise use base price
    let basePrice = item.price;
    const variantId = itemVariants[item.id];
    if (variantId && item.variants) {
      const variant = item.variants.find((v) => v.id === variantId);
      if (variant) {
        basePrice = variant.price;
      }
    }

    // Return price per person (for per-person items) or total (for flat-rate items)
    if (item.pricingType === "flat-rate") {
      return (basePrice + addOnsPrice) * quantity;
    }
    return (basePrice + addOnsPrice) * quantity;
  };

  // Get the highest main course price (meat) for per-person display
  const getMainCourseDisplayPrice = () => {
    const meatFishItems = selectedItems
      .map((id) => menuItems.find((item) => item.id === id))
      .filter(
        (item) => item && item.category === "Main Courses Meat/Fish",
      ) as MenuItem[];

    if (meatFishItems.length === 0) return 0;

    // Find the highest priced meat/fish item
    const highestPrice = Math.max(
      ...meatFishItems.map((item) => {
        const addOns = itemAddOns[item.id] || [];
        const addOnsPrice = addOns.reduce((total, addOnId) => {
          const addOn = item.addOns?.find((ao) => ao.id === addOnId);
          return total + (addOn?.price || 0);
        }, 0);

        let basePrice = item.price;
        const variantId = itemVariants[item.id];
        if (variantId && item.variants) {
          const variant = item.variants.find((v) => v.id === variantId);
          if (variant) {
            basePrice = variant.price;
          }
        }

        return basePrice + addOnsPrice;
      })
    );

    return highestPrice;
  };

  // Get per-person subtotal for all per-person items (excluding beverages which are pay-by-consumption)
  const getPerPersonSubtotal = () => {
    let subtotal = 0;

    // For main courses, use the display price (highest meat price)
    const hasMainCourses = selectedItems.some((itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      return item && [
        "Main Courses Meat/Fish",
        "Main Courses Veggie",
        "Main Courses Vegan",
      ].includes(item.category);
    });

    if (hasMainCourses) {
      // Use the highest meat/fish price for display
      subtotal += getMainCourseDisplayPrice();
    }

    // For other per-person items (not main courses, not beverages), add their per-person price
    selectedItems.forEach((itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      if (
        !item ||
        item.pricingType !== "per-person" ||
        item.category === "Beverages" ||
        [
          "Main Courses Meat/Fish",
          "Main Courses Veggie",
          "Main Courses Vegan",
        ].includes(item.category)
      ) {
        return;
      }
      subtotal += getItemPerPersonPrice(item);
    });

    return subtotal;
  };

  // Get flat-rate subtotal for all flat-rate items (excluding beverages which are pay-by-consumption)
  const getFlatRateSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      // Exclude beverages from flat-rate subtotal as they are charged by consumption
      if (
        !item ||
        item.pricingType !== "flat-rate" ||
        item.category === "Beverages"
      )
        return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Get consumption-based subtotal for beverages
  const getConsumptionSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      if (
        !item ||
        item.category !== "Beverages" ||
        item.pricingType !== "flat-rate"
      )
        return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Show thank you screen if submitted
  if (isSubmitted) {
    return (
      <ThankYouScreen
        inquiryNumber={inquiryNumber}
        variant="split" // Options: 'centered' | 'split' | 'minimal'
        onCreateNew={() => {
          setIsSubmitted(false);
          setCurrentStep(1);
          setSelectedItems([]);
          setItemQuantities({});
          setItemAddOns({});
          setItemVariants({});
          setItemComments({});
          setTermsAccepted(false);
          setInquiryNumber("");
        }}
        onEditOrder={() => {
          setIsSubmitted(false);
          setCurrentStep(3);
        }}
        onGoHome={() => {
          // Navigation is handled by the WizardHeader back button
          // User can also use browser back or the header logo
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WizardHeader />
      <div className="flex-1 flex flex-col">
        {/* Mobile Step Indicator - Only visible on mobile */}
        <div className="lg:hidden sticky top-20 z-40 bg-primary text-primary-foreground px-4 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Compact Row: Step Counter + Title */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <p
                className="text-primary-foreground opacity-80 flex-shrink-0"
                style={{
                  fontSize: "var(--text-small)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Step {currentStep}/3
              </p>
              <h2
                className="text-primary-foreground text-right"
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                {steps[currentStep - 1].title}
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCompleted || isActive
                          ? "bg-primary-foreground"
                          : "bg-primary-foreground/20"
                      }`}
                      style={{ borderRadius: "var(--radius)" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Sidebar - 25% width with primary background - Hidden on mobile - Fixed on desktop */}
          <aside className="hidden lg:block lg:w-[25%] bg-primary text-primary-foreground p-6 lg:p-8 lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <div className="max-w-md mx-auto lg:mx-0">
              {/* Title */}
              <div className="mb-8">
                <h2
                  className="text-primary-foreground mb-2"
                  style={{
                    fontSize: "var(--text-h2)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Menu configurator for your event
                </h2>
                <p
                  className="text-primary-foreground opacity-90"
                  style={{ fontSize: "var(--text-base)" }}
                >
                  Create your own personalized menu. We look forward to your
                  inquiry and will get back to you promptly.
                </p>
              </div>

              {/* Vertical Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;

                  return (
                    <div key={step.number} className="relative">
                      <div className="flex items-start gap-3">
                        {/* Step Circle with connecting line */}
                        <div className="relative flex flex-col items-center flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                              isCompleted
                                ? "bg-secondary text-secondary-foreground"
                                : isActive
                                  ? "bg-secondary text-secondary-foreground ring-4 ring-secondary/20"
                                  : "bg-transparent text-primary-foreground border-2 border-primary-foreground/30"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          {/* Connecting Line */}
                          {index < steps.length - 1 && (
                            <div
                              className="absolute top-10 w-0.5 bg-secondary/20 transition-all duration-500"
                              style={{
                                backgroundColor: isCompleted
                                  ? "var(--color-secondary)"
                                  : "rgba(255, 255, 255, 0.2)",
                                height: "calc(100% + 1.5rem)",
                              }}
                            />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`mb-1 text-primary-foreground ${isActive || isCompleted ? "opacity-100" : "opacity-60"}`}
                            style={{
                              fontSize: "var(--text-h4)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            {step.title}
                          </p>
                          <p
                            className="text-primary-foreground opacity-80"
                            style={{ fontSize: "var(--text-small)" }}
                          >
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div
                className="mt-6 p-3 bg-primary-foreground/10 rounded-lg"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-primary-foreground opacity-80"
                    style={{ fontSize: "var(--text-small)" }}
                  >
                    Overall Progress
                  </p>
                  <span
                    className="text-primary-foreground opacity-90"
                    style={{
                      fontSize: "var(--text-small)",
                      fontWeight: "var(--font-weight-semibold)",
                    }}
                  >
                    {currentStep}/3 ·{" "}
                    {Math.round(((currentStep - 1) / 2) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Area - 75% width - With left margin on desktop to account for fixed sidebar */}
          <main className="w-full lg:w-[75%] lg:ml-[25%] bg-background p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div
                className="bg-card rounded-lg p-4 lg:p-6 border border-border"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                {/* Step 1: Event Details - VARIANT 1: TABBED LAYOUT */}
                {currentStep === 1 && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <ClipboardList className="w-5 h-5 text-primary" />
                        </div>
                        <h3
                          className="text-foreground"
                          style={{
                            fontSize: "var(--text-h3)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          Tell us about your event
                        </h3>
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "var(--text-base)" }}
                      >
                        Fill out the information across the tabs below
                      </p>
                      <p
                        className="text-muted-foreground mt-2 sm:hidden"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        👉 Swipe left to see more tabs
                      </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-6 -mx-4 sm:mx-0">
                      <div className="flex overflow-x-auto gap-2 pb-4 border-b border-border pl-4 pr-0 sm:px-0 scrollbar-hide">
                        {tabs.map((tab, index) => {
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-all flex-shrink-0 ${
                                isActive
                                  ? "bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                                  : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                              } ${index === tabs.length - 1 ? "mr-8 sm:mr-0" : ""}`}
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              <TabIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="whitespace-nowrap">
                                {tab.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-5">
                      {/* Contact Tab */}
                      {activeTab === "contact" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Name */}
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Name *
                            </label>
                            <input
                              type="text"
                              value={eventDetails.name}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  name: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                                errors.name
                                  ? "border-destructive"
                                  : "border-border focus:border-primary"
                              }`}
                              placeholder="Max Mustermann"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                            {errors.name && (
                              <p
                                className="text-destructive mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {errors.name}
                              </p>
                            )}
                          </div>

                          {/* Business */}
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Business
                            </label>
                            <input
                              type="text"
                              value={eventDetails.business}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  business: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              placeholder="Musterfirma AG"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Email *
                            </label>
                            <input
                              type="email"
                              value={eventDetails.email}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  email: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                                errors.email
                                  ? "border-destructive"
                                  : "border-border focus:border-primary"
                              }`}
                              placeholder="max@firma.ch"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                            {errors.email && (
                              <p
                                className="text-destructive mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {errors.email}
                              </p>
                            )}
                          </div>

                          {/* Telephone */}
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Telephone *
                            </label>
                            <input
                              type="tel"
                              value={eventDetails.telephone}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  telephone: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                                errors.telephone
                                  ? "border-destructive"
                                  : "border-border focus:border-primary"
                              }`}
                              placeholder="+41 31 123 45 67"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                            {errors.telephone && (
                              <p
                                className="text-destructive mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {errors.telephone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Address Tab */}
                      {activeTab === "address" && (
                        <div className="space-y-5">
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Strasse & Nr.
                            </label>
                            <input
                              type="text"
                              value={eventDetails.street}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  street: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              placeholder="Musterstrasse 123"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label
                                className="block text-foreground mb-2"
                                style={{
                                  fontSize: "var(--text-label)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                PLZ
                              </label>
                              <input
                                type="text"
                                value={eventDetails.plz}
                                onChange={(e) =>
                                  setEventDetails({
                                    ...eventDetails,
                                    plz: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                                placeholder="3000"
                                style={{
                                  borderRadius: "var(--radius)",
                                  fontSize: "var(--text-base)",
                                }}
                              />
                            </div>

                            <div>
                              <label
                                className="block text-foreground mb-2"
                                style={{
                                  fontSize: "var(--text-label)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Location
                              </label>
                              <input
                                type="text"
                                value={eventDetails.location}
                                onChange={(e) =>
                                  setEventDetails({
                                    ...eventDetails,
                                    location: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                                placeholder="Bern"
                                style={{
                                  borderRadius: "var(--radius)",
                                  fontSize: "var(--text-base)",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Event Tab */}
                      {activeTab === "event" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Datum *
                            </label>
                            <input
                              type="date"
                              value={eventDetails.eventDate}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  eventDate: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                                errors.eventDate
                                  ? "border-destructive"
                                  : "border-border focus:border-primary"
                              }`}
                              min={new Date().toISOString().split("T")[0]}
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                            {errors.eventDate && (
                              <p
                                className="text-destructive mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {errors.eventDate}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              time
                            </label>
                            <input
                              type="time"
                              value={eventDetails.eventTime}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  eventTime: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                          </div>

                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Number of guests *
                            </label>
                            <input
                              type="number"
                              value={eventDetails.guestCount}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  guestCount: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                                errors.guestCount
                                  ? "border-destructive"
                                  : "border-border focus:border-primary"
                              }`}
                              placeholder="10"
                              min="1"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                            {errors.guestCount && (
                              <p
                                className="text-destructive mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {errors.guestCount}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              className="block text-foreground mb-2"
                              style={{
                                fontSize: "var(--text-label)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Occasion
                            </label>
                            <input
                              type="text"
                              value={eventDetails.occasion}
                              onChange={(e) =>
                                setEventDetails({
                                  ...eventDetails,
                                  occasion: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              placeholder="e.g. company party"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-base)",
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Requests Tab */}
                      {activeTab === "requests" && (
                        <div>
                          <label
                            className="block text-foreground mb-2"
                            style={{
                              fontSize: "var(--text-label)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Allergies, dietary requirements or other comments
                          </label>
                          <textarea
                            value={eventDetails.specialRequests}
                            onChange={(e) =>
                              setEventDetails({
                                ...eventDetails,
                                specialRequests: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary resize-none"
                            placeholder="e.g. 2 people vegetarian, 1 person gluten-free..."
                            rows={6}
                            style={{
                              borderRadius: "var(--radius)",
                              fontSize: "var(--text-base)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2 & 3 remain the same... (truncated for brevity) */}
                {currentStep === 2 && (
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <h3
                          className="text-foreground"
                          style={{
                            fontSize: "var(--text-h3)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          Choose your menu
                        </h3>
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "var(--text-base)" }}
                      >
                        Browse through all {categories.length} categories
                        step-by-step • {visitedCategories.length} of{" "}
                        {categories.length} visited
                      </p>
                    </div>

                    {/* Main Course Reduction Notification Banner */}
                    {mainCourseReductionMessage && (
                      <div
                        className="mb-6 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 border-l-4 border-primary"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-foreground"
                              style={{
                                fontSize: "var(--text-base)",
                                fontWeight: "var(--font-weight-semibold)",
                              }}
                            >
                              Smart Selection Applied
                            </p>
                            <p
                              className="text-muted-foreground mt-0.5"
                              style={{ fontSize: "var(--text-small)" }}
                            >
                              {mainCourseReductionMessage}
                            </p>
                          </div>
                          <button
                            onClick={() => setMainCourseReductionMessage("")}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Per Person Indicator Banner - Only show for per-person categories */}
                    {![
                      "Technology",
                      "Decoration",
                      "Furniture",
                      "Miscellaneous",
                    ].includes(selectedCategory) && (
                      <div
                        className="mb-4 bg-secondary border-l-4 border-primary flex items-center gap-2 px-3 py-2"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span
                          className="text-secondary-foreground"
                          style={{
                            fontSize: "var(--text-small)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          {eventDetails.guestCount || "0"}{" "}
                          {parseInt(eventDetails.guestCount) === 1
                            ? "guest"
                            : "guests"}
                        </span>
                        <span
                          className="text-secondary-foreground/50 mx-1"
                          style={{ fontSize: "var(--text-small)" }}
                        >
                          |
                        </span>
                        <span
                          className="text-secondary-foreground/70"
                          style={{ fontSize: "var(--text-small)" }}
                        >
                          {selectedCategory === "Beverages"
                            ? "Charged by consumption • Per-person pricing available"
                            : "All items apply per person"}
                        </span>
                      </div>
                    )}

                    {/* Category Pills - Horizontal Scroll */}
                    <div className="mb-6">
                      <div
                        ref={categoryContainerRef}
                        className="flex overflow-x-auto gap-2 pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide"
                      >
                        {categories.map((category) => {
                          const isActive = selectedCategory === category;
                          const isVisited =
                            visitedCategories.includes(category);
                          const isLocked = isCategoryLocked(category);
                          const categoryItemCount =
                            getSelectedItemsByCategory(category).length;

                          return (
                            <button
                              key={category}
                              ref={(el) => {
                                categoryRefs.current[category] = el;
                              }}
                              onClick={() => {
                                if (!isLocked) {
                                  handleCategoryChange(category);
                                }
                              }}
                              disabled={isLocked}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all flex-shrink-0 whitespace-nowrap border ${
                                isActive
                                  ? "bg-primary text-primary-foreground border-primary hover:bg-secondary hover:text-secondary-foreground hover:border-secondary"
                                  : isLocked
                                    ? "bg-muted/20 text-muted-foreground/40 border-border/50 cursor-not-allowed opacity-60"
                                    : isVisited
                                      ? "bg-muted/30 text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border"
                                      : "bg-muted/30 text-foreground border-border hover:bg-muted hover:text-foreground hover:border-border"
                              }`}
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              {isLocked && <Lock className="w-3.5 h-3.5" />}
                              {isVisited && !isActive && !isLocked && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                              <span>{category}</span>
                              {categoryItemCount > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    isActive
                                      ? "bg-secondary-foreground/20 text-secondary-foreground"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {categoryItemCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Two Column Layout: Menu Items + Cart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Menu Items - 2 columns on desktop */}
                      <div className="lg:col-span-2">
                        {/* Category Hero Image */}
                        <div
                          className="mb-4 relative h-48 rounded-lg overflow-hidden"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <img
                            src={
                              selectedCategory === "Appetizers"
                                ? "https://images.unsplash.com/photo-1558679582-4d81ce75993a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                : selectedCategory === "Salads"
                                  ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                  : selectedCategory === "Soups"
                                    ? "https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                    : selectedCategory === "Pasta"
                                      ? "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                      : selectedCategory === "Mains"
                                        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                        : selectedCategory === "Seafood"
                                          ? "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                          : selectedCategory === "Cheese"
                                            ? "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                            : "https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                            }
                            alt={selectedCategory}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                            <div className="p-6">
                              <h4
                                className="text-white mb-1"
                                style={{
                                  fontSize: "var(--text-h3)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                {selectedCategory}
                              </h4>
                              <p
                                className="text-white/90"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                {
                                  menuItems.filter(
                                    (item) =>
                                      item.category === selectedCategory,
                                  ).length
                                }{" "}
                                items available
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Linked Logic Info Banner for Veggie/Vegan Main Courses */}
                        {(selectedCategory === "Main Courses Veggie" ||
                          selectedCategory === "Main Courses Vegan") && (
                          <div
                            className="mb-5 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3"
                            style={{ borderRadius: "var(--radius)" }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p
                                  className="text-foreground"
                                  style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--font-weight-semibold)",
                                  }}
                                >
                                  Smart Selection Enabled
                                </p>
                                <p
                                  className="text-muted-foreground mt-1"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Selecting{" "}
                                  {selectedCategory === "Main Courses Veggie"
                                    ? "vegetarian"
                                    : "vegan"}{" "}
                                  mains will automatically reduce your Meat/Fish
                                  selections to maintain the correct guest
                                  count.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Guest Distribution Summary - Only for Main Course categories */}
                        {[
                          "Main Courses Meat/Fish",
                          "Main Courses Veggie",
                          "Main Courses Vegan",
                        ].includes(selectedCategory) && (
                          <div className="mb-5 bg-secondary border-l-4 border-primary rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                                <p
                                  className="text-secondary-foreground"
                                  style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight:
                                      "var(--font-weight-semibold)",
                                  }}
                                >
                                  Main Courses - Guest Distribution
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="text-center">
                                <p
                                  className="text-secondary-foreground/70 mb-1"
                                  style={{
                                    fontSize: "var(--text-small)",
                                  }}
                                >
                                  🥩 Meat/Fish
                                </p>
                                <p
                                  className="text-primary"
                                  style={{
                                    fontSize: "var(--text-h4)",
                                    fontWeight:
                                      "var(--font-weight-semibold)",
                                  }}
                                >
                                  {mainCourseGuests["Main Courses Meat/Fish"] ||
                                    0}
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className="text-secondary-foreground/70 mb-1"
                                  style={{
                                    fontSize: "var(--text-small)",
                                  }}
                                >
                                  🥬 Vegetarian
                                </p>
                                <p
                                  className="text-primary"
                                  style={{
                                    fontSize: "var(--text-h4)",
                                    fontWeight:
                                      "var(--font-weight-semibold)",
                                  }}
                                >
                                  {mainCourseGuests["Main Courses Veggie"] ||
                                    0}
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className="text-secondary-foreground/70 mb-1"
                                  style={{
                                    fontSize: "var(--text-small)",
                                  }}
                                >
                                  🥕 Vegan
                                </p>
                                <p
                                  className="text-primary"
                                  style={{
                                    fontSize: "var(--text-h4)",
                                    fontWeight:
                                      "var(--font-weight-semibold)",
                                  }}
                                >
                                  {mainCourseGuests["Main Courses Vegan"] ||
                                    0}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-secondary-foreground/20 flex items-center justify-between">
                              <span
                                className="text-secondary-foreground/70"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Total Assigned:{" "}
                                <span
                                  className="text-secondary-foreground font-semibold"
                                >
                                  {Object.values(mainCourseGuests).reduce(
                                    (a, b) => a + b,
                                    0,
                                  )}
                                </span>
                              </span>
                              <span
                                className="text-secondary-foreground/70"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Total Guests:{" "}
                                <span
                                  className="text-secondary-foreground font-semibold"
                                >
                                  {eventDetails.guestCount || 0}
                                </span>
                              </span>
                            </div>
                            {Object.values(mainCourseGuests).reduce(
                              (a, b) => a + b,
                              0,
                            ) !==
                              parseInt(eventDetails.guestCount || "0") && (
                              <div className="mt-2 flex items-center gap-1.5 text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Please assign all{" "}
                                  {eventDetails.guestCount || 0} guests
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {menuItems
                            .filter(
                              (item) => item.category === selectedCategory,
                            )
                            .map((item) => {
                              const isSelected = selectedItems.includes(
                                item.id,
                              );
                              const quantity = itemQuantities[item.id] || 1;

                              return (
                                <div
                                  key={item.id}
                                  className={`bg-card border rounded-lg overflow-hidden transition-all flex flex-col ${
                                    isSelected
                                      ? "border-primary shadow-sm"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  style={{ borderRadius: "var(--radius-card)" }}
                                >
                                  {/* Item Image */}
                                  <div className="w-full aspect-[3/2] flex-shrink-0 relative overflow-hidden bg-muted">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Item Content */}
                                  <div className="flex-1 p-4 flex flex-col">
                                    <div className="flex items-start gap-2 mb-2">
                                      {![
                                        "Technology",
                                        "Decoration",
                                        "Furniture",
                                        "Miscellaneous",
                                      ].includes(item.category) && (
                                        <div className="flex-shrink-0 mt-0.5">
                                          <DietaryIcon
                                            type={item.dietaryType}
                                            size="sm"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5
                                            className="text-foreground"
                                            style={{
                                              fontSize: "var(--text-base)",
                                              fontWeight:
                                                "var(--font-weight-semibold)",
                                            }}
                                          >
                                            {item.name}
                                          </h5>
                                          {/* Pay by consumption badge for flat-rate beverages */}
                                          {item.category === "Beverages" &&
                                            item.pricingType ===
                                              "flat-rate" && (
                                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                                Pay by consumption
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                    <p
                                      className="text-muted-foreground mb-3 flex-1"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      {item.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex flex-col gap-0.5">
                                        <p
                                          className="text-primary"
                                          style={{
                                            fontSize: "var(--text-base)",
                                            fontWeight:
                                              "var(--font-weight-semibold)",
                                          }}
                                        >
                                          {item.category === "Beverages" &&
                                          item.pricingType === "flat-rate"
                                            ? `CHF ${item.price.toFixed(2)}/bottle`
                                            : (item.variants &&
                                              item.variants.length > 0
                                                ? "From "
                                                : "") +
                                              `CHF ${item.price.toFixed(2)}`}
                                        </p>
                                        <span
                                          className="text-muted-foreground"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          {item.category === "Beverages" &&
                                          item.pricingType === "flat-rate"
                                            ? "billed by consumption"
                                            : item.pricingType === "per-person"
                                              ? "per person"
                                              : ""}
                                        </span>
                                      </div>
                                    </div>

                                    {!isSelected ? (
                                      <button
                                        onClick={() => openDetailsModal(item)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors w-full"
                                        style={{
                                          borderRadius: "var(--radius)",
                                          fontSize: "var(--text-small)",
                                          fontWeight:
                                            "var(--font-weight-medium)",
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                        Add
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => openDetailsModal(item)}
                                          className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                          style={{
                                            borderRadius: "var(--radius)",
                                            fontSize: "var(--text-small)",
                                            fontWeight:
                                              "var(--font-weight-medium)",
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            removeFromCart(item.id)
                                          }
                                          className="w-10 h-10 flex items-center justify-center bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                                          style={{
                                            borderRadius: "var(--radius)",
                                          }}
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Cart Summary - Desktop Only Sidebar */}
                      <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                          <div
                            className="bg-muted/30 border border-border rounded-lg overflow-hidden"
                            style={{ borderRadius: "var(--radius-card)" }}
                          >
                            {/* Collapsible Header */}
                            <button
                              onClick={() =>
                                setIsCartCollapsed(!isCartCollapsed)
                              }
                              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                                <h4
                                  className="text-foreground"
                                  style={{
                                    fontSize: "var(--text-h4)",
                                    fontWeight: "var(--font-weight-semibold)",
                                  }}
                                >
                                  Your Menu
                                </h4>
                                {selectedItems.length > 0 && (
                                  <span
                                    className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs"
                                    style={{
                                      fontSize: "var(--text-small)",
                                      fontWeight: "var(--font-weight-medium)",
                                    }}
                                  >
                                    {selectedItems.length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isCartCollapsed ? (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                            </button>

                            {/* Collapsed State Summary */}
                            {isCartCollapsed && selectedItems.length > 0 && (
                              <div className="px-5 pb-4 border-t border-border">
                                <div className="pt-4 flex items-center justify-between">
                                  <div>
                                    <p
                                      className="text-foreground"
                                      style={{
                                        fontSize: "var(--text-base)",
                                        fontWeight:
                                          "var(--font-weight-semibold)",
                                      }}
                                    >
                                      {selectedItems.length}{" "}
                                      {selectedItems.length === 1
                                        ? "item"
                                        : "items"}{" "}
                                      selected
                                    </p>
                                    <p
                                      className="text-muted-foreground mt-0.5"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      For {eventDetails.guestCount || "0"}{" "}
                                      {parseInt(eventDetails.guestCount) === 1
                                        ? "guest"
                                        : "guests"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className="text-primary"
                                      style={{
                                        fontSize: "var(--text-h4)",
                                        fontWeight:
                                          "var(--font-weight-semibold)",
                                      }}
                                    >
                                      CHF {getPerPersonSubtotal().toFixed(2)}{" "}
                                      <span className="text-sm font-normal text-muted-foreground">
                                        /person
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Collapsible Content */}
                            {!isCartCollapsed && (
                              <div className="px-5 pb-5">
                                <div className="mb-4 pt-2 border-t border-border">
                                  <p
                                    className="text-muted-foreground"
                                    style={{ fontSize: "var(--text-small)" }}
                                  >
                                    Per-person items calculated for{" "}
                                    {eventDetails.guestCount || "0"}{" "}
                                    {parseInt(eventDetails.guestCount) === 1
                                      ? "guest"
                                      : "guests"}
                                  </p>
                                </div>

                                {selectedItems.length === 0 ? (
                                  <div className="text-center py-8">
                                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                                    <p
                                      className="text-muted-foreground"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      No items selected yet
                                    </p>
                                    <p
                                      className="text-muted-foreground mt-1"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      Browse categories and add dishes
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    {/* Selected Items List */}
                                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                      {selectedItems.map((itemId) => {
                                        const item = menuItems.find(
                                          (i) => i.id === itemId,
                                        );
                                        if (!item) return null;
                                        const quantity =
                                          itemQuantities[itemId] || 1;

                                        return (
                                          <div
                                            key={itemId}
                                            className="bg-card border border-border rounded-lg p-2.5"
                                            style={{
                                              borderRadius: "var(--radius)",
                                            }}
                                          >
                                            {/* Header Row: Title, Price, Actions */}
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <p
                                                    className="text-foreground truncate"
                                                    style={{
                                                      fontSize:
                                                        "var(--text-small)",
                                                      fontWeight:
                                                        "var(--font-weight-semibold)",
                                                    }}
                                                  >
                                                    {item.name}
                                                  </p>
                                                  {/* Pay by consumption badge for beverages */}
                                                  {item.category ===
                                                    "Beverages" && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                                      Pay by consumption
                                                    </span>
                                                  )}
                                                </div>
                                                <p
                                                  className="text-muted-foreground truncate"
                                                  style={{
                                                    fontSize:
                                                      "var(--text-small)",
                                                  }}
                                                >
                                                  {item.category}
                                                  {itemVariants[itemId] &&
                                                    item.variants &&
                                                    (() => {
                                                      const variant =
                                                        item.variants.find(
                                                          (v) =>
                                                            v.id ===
                                                            itemVariants[
                                                              itemId
                                                            ],
                                                        );
                                                      return variant
                                                        ? ` • ${variant.name}`
                                                        : "";
                                                    })()}
                                                  {itemAddOns[itemId] &&
                                                    itemAddOns[itemId].length >
                                                      0 &&
                                                    ` • +${itemAddOns[itemId].length}`}
                                                </p>
                                                {/* Show comments if any */}
                                                {itemComments[itemId] && (
                                                  <p
                                                    className="text-muted-foreground italic mt-0.5 text-xs truncate"
                                                    style={{
                                                      fontSize:
                                                        "var(--text-small)",
                                                    }}
                                                  >
                                                    "{itemComments[itemId]}"
                                                  </p>
                                                )}
                                              </div>
                                              <div className="flex items-start gap-1.5 flex-shrink-0">
                                                <button
                                                  onClick={() =>
                                                    openDetailsModal(item)
                                                  }
                                                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                                  style={{
                                                    borderRadius:
                                                      "var(--radius)",
                                                  }}
                                                  title="Edit item"
                                                >
                                                  <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    removeFromCart(itemId)
                                                  }
                                                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                                  style={{
                                                    borderRadius:
                                                      "var(--radius)",
                                                  }}
                                                  title="Remove item"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Footer Row: Different display for consumption-based beverages */}
                                            {item.category === "Beverages" &&
                                            item.pricingType === "flat-rate" ? (
                                              // Beverage pay-by-consumption display
                                              <div className="pt-1.5 border-t border-border">
                                                <div className="flex flex-col gap-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                                                      Available
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                      for your event
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground text-xs">
                                                      Pricing: CHF{" "}
                                                      {item.price.toFixed(2)}
                                                      /bottle
                                                    </span>
                                                    <span className="text-amber-600 dark:text-amber-400 text-xs">
                                                      (billed by consumption)
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              // Standard display for other items
                                              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                                <div className="flex items-center gap-1.5">
                                                  {item.pricingType ===
                                                    "per-person" && [
                                                      "Main Courses Meat/Fish",
                                                      "Main Courses Veggie",
                                                      "Main Courses Vegan",
                                                    ].includes(item.category) ? (
                                                    <span
                                                      className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                                      style={{
                                                        fontSize:
                                                          "var(--text-small)",
                                                        fontWeight:
                                                          "var(--font-weight-medium)",
                                                      }}
                                                    >
                                                      {mainCourseGuests[item.category] || 0}g
                                                    </span>
                                                  ) : item.pricingType ===
                                                    "per-person" ? (
                                                    <span
                                                      className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                                      style={{
                                                        fontSize:
                                                          "var(--text-small)",
                                                        fontWeight:
                                                          "var(--font-weight-medium)",
                                                      }}
                                                    >
                                                      {quantity}× pp
                                                    </span>
                                                  ) : null}
                                                  {item.pricingType ===
                                                    "flat-rate" &&
                                                    item.category !==
                                                      "Beverages" && (
                                                      <span
                                                        className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                                                        style={{
                                                          fontSize:
                                                            "var(--text-small)",
                                                          fontWeight:
                                                            "var(--font-weight-medium)",
                                                        }}
                                                      >
                                                        {quantity > 1
                                                          ? `${quantity}×`
                                                          : "Flat rate"}
                                                      </span>
                                                    )}
                                                </div>
                                                <p
                                                  className="text-foreground"
                                                  style={{
                                                    fontSize:
                                                      "var(--text-base)",
                                                    fontWeight:
                                                      "var(--font-weight-semibold)",
                                                  }}
                                                >
                                                  CHF{" "}
                                                  {getItemPerPersonPrice(
                                                    item,
                                                  ).toFixed(2)}
                                                  {item.pricingType ===
                                                  "per-person" && ![
                                                    "Main Courses Meat/Fish",
                                                    "Main Courses Veggie",
                                                    "Main Courses Vegan",
                                                  ].includes(item.category) ? (
                                                    <span className="text-muted-foreground text-sm">
                                                      /person
                                                    </span>
                                                  ) : [
                                                    "Main Courses Meat/Fish",
                                                    "Main Courses Veggie",
                                                    "Main Courses Vegan",
                                                  ].includes(item.category) ? (
                                                    <span className="text-muted-foreground text-sm">
                                                      /guest
                                                    </span>
                                                  ) : (
                                                    ""
                                                  )}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Total */}
                                    <div className="border-t border-border pt-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <p
                                          className="text-muted-foreground"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          Per-person items
                                        </p>
                                        <p
                                          className="text-foreground"
                                          style={{
                                            fontSize: "var(--text-base)",
                                            fontWeight:
                                              "var(--font-weight-medium)",
                                          }}
                                        >
                                          CHF{" "}
                                          {getPerPersonSubtotal().toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p
                                          className="text-muted-foreground"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          Additional items
                                        </p>
                                        <p
                                          className="text-foreground"
                                          style={{
                                            fontSize: "var(--text-base)",
                                            fontWeight:
                                              "var(--font-weight-medium)",
                                          }}
                                        >
                                          CHF {getFlatRateSubtotal().toFixed(2)}
                                        </p>
                                      </div>
                                      {/* Billed by consumption subtotal for beverages */}
                                      {getConsumptionSubtotal() > 0 && (
                                        <div
                                          className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                                          style={{
                                            borderRadius: "var(--radius)",
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <p
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              Billed by consumption
                                            </p>
                                            {/* <span className="text-amber-600 dark:text-amber-400 text-xs">🍷️</span> */}
                                          </div>
                                          <p
                                            className="text-amber-700 dark:text-amber-300 font-medium"
                                            style={{
                                              fontSize: "var(--text-base)",
                                            }}
                                          >
                                            CHF{" "}
                                            {getConsumptionSubtotal().toFixed(
                                              2,
                                            )}
                                          </p>
                                        </div>
                                      )}
                                      <div
                                        className="bg-primary/5 border border-primary/20 rounded-lg p-3"
                                        style={{
                                          borderRadius: "var(--radius)",
                                        }}
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-primary" />
                                          </div>
                                          <div>
                                            <p
                                              className="text-foreground"
                                              style={{
                                                fontSize: "var(--text-base)",
                                                fontWeight:
                                                  "var(--font-weight-semibold)",
                                              }}
                                            >
                                              Complete total will be shown in
                                              the review step
                                            </p>
                                            <p
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              Continue to next step to see your
                                              full order breakdown
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Message - Show if on last category but not all visited */}
                    {isLastCategory() && !allCategoriesVisited() && (
                      <div
                        className="mt-5 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3"
                        style={{ borderRadius: "var(--radius-card)" }}
                      >
                        <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p
                            className="text-foreground mb-1"
                            style={{
                              fontSize: "var(--text-base)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            Please browse all categories
                          </p>
                          <p
                            className="text-muted-foreground"
                            style={{ fontSize: "var(--text-small)" }}
                          >
                            You've visited {visitedCategories.length} of{" "}
                            {categories.length} categories. Use the category
                            buttons above to explore all menu sections before
                            continuing to the summary.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Message for Step 2 */}
                    {step2Error && (
                      <div
                        className="mt-5 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
                        style={{ borderRadius: "var(--radius-card)" }}
                      >
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p
                          className="text-destructive"
                          style={{
                            fontSize: "var(--text-base)",
                            fontWeight: "var(--font-weight-medium)",
                          }}
                        >
                          {step2Error}
                        </p>
                      </div>
                    )}

                    {/* Right-Side Floating Cart Button (Mobile Only) */}
                    {selectedItems.length > 0 && showCartFab && (
                      <button
                        onClick={() => setIsMobileDrawerOpen(true)}
                        className="lg:hidden fixed right-0 bottom-24 z-40 bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 p-4 flex items-center gap-2.5 border-2 border-primary-foreground/10 border-r-0"
                        style={{
                          borderRadius:
                            "var(--radius-card) 0 0 var(--radius-card)",
                        }}
                        aria-label="View shopping cart"
                      >
                        <div className="relative">
                          <ShoppingCart className="w-5 h-5" />
                          {/* Badge */}
                          <span
                            className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                            style={{
                              fontSize: "11px",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            {selectedItems.length}
                          </span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span
                            className="opacity-80"
                            style={{
                              fontSize: "11px",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Per person
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-small)",
                              fontWeight: "var(--font-weight-semibold)",
                              lineHeight: "1",
                            }}
                          >
                            CHF {getPerPersonSubtotal().toFixed(2)}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Mobile Cart Drawer Overlay */}
                    {isMobileDrawerOpen && (
                      <div className="lg:hidden fixed inset-0 z-50">
                        {/* Backdrop */}
                        <div
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
                          {/* Drawer Header */}
                          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5 text-primary" />
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Your Menu
                              </h4>
                              {selectedItems.length > 0 && (
                                <span
                                  className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs"
                                  style={{
                                    fontSize: "var(--text-small)",
                                    fontWeight: "var(--font-weight-medium)",
                                  }}
                                >
                                  {selectedItems.length}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setIsMobileDrawerOpen(false)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Drawer Content - Scrollable */}
                          <div className="flex-1 overflow-y-auto px-5 py-4">
                            <div className="mb-4">
                              <p
                                className="text-muted-foreground"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Per-person items calculated for{" "}
                                {eventDetails.guestCount || "0"}{" "}
                                {parseInt(eventDetails.guestCount) === 1
                                  ? "guest"
                                  : "guests"}
                              </p>
                            </div>

                            {selectedItems.length === 0 ? (
                              <div className="text-center py-8">
                                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                                <p
                                  className="text-muted-foreground"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  No items selected yet
                                </p>
                                <p
                                  className="text-muted-foreground mt-1"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Browse categories and add dishes
                                </p>
                              </div>
                            ) : (
                              <>
                                {/* Selected Items List */}
                                <div className="space-y-3 mb-6">
                                  {selectedItems.map((itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    if (!item) return null;
                                    const quantity =
                                      itemQuantities[itemId] || 1;

                                    return (
                                      <div
                                        key={itemId}
                                        className="bg-card border border-border rounded-lg p-2.5"
                                        style={{
                                          borderRadius: "var(--radius)",
                                        }}
                                      >
                                        {/* Header Row: Title, Price, Actions */}
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p
                                                className="text-foreground truncate"
                                                style={{
                                                  fontSize: "var(--text-small)",
                                                  fontWeight:
                                                    "var(--font-weight-semibold)",
                                                }}
                                              >
                                                {item.name}
                                              </p>
                                              {/* Pay by consumption badge for beverages */}
                                              {item.category ===
                                                "Beverages" && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                                  Pay by consumption
                                                </span>
                                              )}
                                            </div>
                                            <p
                                              className="text-muted-foreground truncate"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              {item.category}
                                              {itemVariants[itemId] &&
                                                item.variants &&
                                                (() => {
                                                  const variant =
                                                    item.variants.find(
                                                      (v) =>
                                                        v.id ===
                                                        itemVariants[itemId],
                                                    );
                                                  return variant
                                                    ? ` • ${variant.name}`
                                                    : "";
                                                })()}
                                              {itemAddOns[itemId] &&
                                                itemAddOns[itemId].length > 0 &&
                                                ` • +${itemAddOns[itemId].length}`}
                                            </p>
                                            {/* Show comments if any */}
                                            {itemComments[itemId] && (
                                              <p
                                                className="text-muted-foreground italic mt-0.5 text-xs truncate"
                                                style={{
                                                  fontSize: "var(--text-small)",
                                                }}
                                              >
                                                "{itemComments[itemId]}"
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-start gap-1.5 flex-shrink-0">
                                            <button
                                              onClick={() => {
                                                setIsMobileDrawerOpen(false);
                                                openDetailsModal(item);
                                              }}
                                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                              style={{
                                                borderRadius: "var(--radius)",
                                              }}
                                              title="Edit item"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                removeFromCart(itemId)
                                              }
                                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                              style={{
                                                borderRadius: "var(--radius)",
                                              }}
                                              title="Remove item"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Footer Row: Different display for consumption-based beverages */}
                                        {item.category === "Beverages" &&
                                        item.pricingType === "flat-rate" ? (
                                          // Beverage pay-by-consumption display
                                          <div className="pt-1.5 border-t border-border">
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                                                  Available
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                  for your event
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground text-xs">
                                                  Pricing: CHF{" "}
                                                  {item.price.toFixed(2)}/bottle
                                                </span>
                                                <span className="text-amber-600 dark:text-amber-400 text-xs">
                                                  (billed by consumption)
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          // Standard display for other items
                                          <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                            <div className="flex items-center gap-1.5">
                                              {item.pricingType ===
                                                "per-person" && [
                                                  "Main Courses Meat/Fish",
                                                  "Main Courses Veggie",
                                                  "Main Courses Vegan",
                                                ].includes(item.category) ? (
                                                <span
                                                  className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                                  style={{
                                                    fontSize:
                                                      "var(--text-small)",
                                                    fontWeight:
                                                      "var(--font-weight-medium)",
                                                  }}
                                                >
                                                  {mainCourseGuests[item.category] || 0}g
                                                </span>
                                              ) : item.pricingType ===
                                                "per-person" ? (
                                                <span
                                                  className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                                  style={{
                                                    fontSize:
                                                      "var(--text-small)",
                                                    fontWeight:
                                                      "var(--font-weight-medium)",
                                                  }}
                                                >
                                                  {quantity}× pp
                                                </span>
                                              ) : null}
                                              {item.pricingType ===
                                                "flat-rate" &&
                                                item.category !==
                                                  "Beverages" && (
                                                  <span
                                                    className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                                                    style={{
                                                      fontSize:
                                                        "var(--text-small)",
                                                      fontWeight:
                                                        "var(--font-weight-medium)",
                                                    }}
                                                  >
                                                    {quantity > 1
                                                      ? `${quantity}×`
                                                      : "Flat rate"}
                                                  </span>
                                                )}
                                            </div>
                                            <p
                                              className="text-foreground"
                                              style={{
                                                fontSize: "var(--text-base)",
                                                fontWeight:
                                                  "var(--font-weight-semibold)",
                                              }}
                                            >
                                              CHF{" "}
                                              {getItemPerPersonPrice(
                                                item,
                                              ).toFixed(2)}
                                              {item.pricingType ===
                                              "per-person" && ![
                                                "Main Courses Meat/Fish",
                                                "Main Courses Veggie",
                                                "Main Courses Vegan",
                                              ].includes(item.category) ? (
                                                <span className="text-muted-foreground text-sm">
                                                  /person
                                                </span>
                                              ) : [
                                                "Main Courses Meat/Fish",
                                                "Main Courses Veggie",
                                                "Main Courses Vegan",
                                              ].includes(item.category) ? (
                                                <span className="text-muted-foreground text-sm">
                                                  /guest
                                                </span>
                                              ) : (
                                                ""
                                              )}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Total */}
                                <div className="border-t border-border pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p
                                      className="text-muted-foreground"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      Per-person items
                                    </p>
                                    <p
                                      className="text-foreground"
                                      style={{
                                        fontSize: "var(--text-base)",
                                        fontWeight: "var(--font-weight-medium)",
                                      }}
                                    >
                                      CHF {getPerPersonSubtotal().toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p
                                      className="text-muted-foreground"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      Additional items
                                    </p>
                                    <p
                                      className="text-foreground"
                                      style={{
                                        fontSize: "var(--text-base)",
                                        fontWeight: "var(--font-weight-medium)",
                                      }}
                                    >
                                      CHF {getFlatRateSubtotal().toFixed(2)}
                                    </p>
                                  </div>
                                  {/* Billed by consumption subtotal for beverages */}
                                  {getConsumptionSubtotal() > 0 && (
                                    <div
                                      className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                                      style={{ borderRadius: "var(--radius)" }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <p
                                          className="text-muted-foreground"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          Billed by consumption
                                        </p>
                                        <span className="text-amber-600 dark:text-amber-400 text-xs">
                                          🍷️
                                        </span>
                                      </div>
                                      <p
                                        className="text-amber-700 dark:text-amber-300 font-medium"
                                        style={{ fontSize: "var(--text-base)" }}
                                      >
                                        CHF{" "}
                                        {getConsumptionSubtotal().toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                  <div
                                    className="bg-primary/5 border border-primary/20 rounded-lg p-3"
                                    style={{ borderRadius: "var(--radius)" }}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-primary" />
                                      </div>
                                      <div>
                                        <p
                                          className="text-foreground"
                                          style={{
                                            fontSize: "var(--text-base)",
                                            fontWeight:
                                              "var(--font-weight-semibold)",
                                          }}
                                        >
                                          Complete total will be shown in the
                                          review step
                                        </p>
                                        <p
                                          className="text-muted-foreground"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          Continue to next step to see your full
                                          order breakdown
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <h3
                          className="text-foreground"
                          style={{
                            fontSize: "var(--text-h3)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          Review your request
                        </h3>
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "var(--text-base)" }}
                      >
                        Check all details before submitting
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Contact Info, Address & Event Details - Optimized Grid Layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Information */}
                        <div
                          className="bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Contact Information
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab("contact");
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Name
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.name || "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Business
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.business || "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Email
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.email || "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Telephone
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.telephone || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Address Information */}
                        <div
                          className="bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <MapPin className="w-4 h-4 text-primary" />
                              </div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Address
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab("address");
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Street & Nr.
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.street || "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                PLZ
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.plz || "-"}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Location
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.location || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Event Details - Full Width */}
                        <div
                          className="md:col-span-2 bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Event Details
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab("event");
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Date
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.eventDate
                                  ? new Date(
                                      eventDetails.eventDate,
                                    ).toLocaleDateString("de-CH", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Time
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.eventTime || "-"}
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Number of Guests
                              </p>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <p
                                  className="text-foreground"
                                  style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--font-weight-semibold)",
                                  }}
                                >
                                  {eventDetails.guestCount || "-"}{" "}
                                  {parseInt(eventDetails.guestCount) === 1
                                    ? "guest"
                                    : "guests"}
                                </p>
                              </div>
                              <p
                                className="text-muted-foreground mt-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                All menu items will be prepared per person
                              </p>
                            </div>
                            <div>
                              <p
                                className="text-muted-foreground mb-1"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Occasion
                              </p>
                              <p
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {eventDetails.occasion || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {eventDetails.specialRequests && (
                        <div
                          className="bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <ClipboardList className="w-4 h-4 text-primary" />
                              </div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Special Requests
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab("requests");
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{
                                borderRadius: "var(--radius)",
                                fontSize: "var(--text-small)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </div>
                          <p
                            className="text-foreground"
                            style={{ fontSize: "var(--text-base)" }}
                          >
                            {eventDetails.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Selected Menu Items - Grouped by Category */}
                      <div
                        className="bg-muted/30 border border-border rounded-lg p-5"
                        style={{ borderRadius: "var(--radius-card)" }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <ShoppingCart className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Selected Menu ({selectedItems.length}{" "}
                                {selectedItems.length === 1 ? "item" : "items"})
                              </h4>
                              <p
                                className="text-muted-foreground mt-0.5"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                Per person quantities
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                            style={{
                              borderRadius: "var(--radius)",
                              fontSize: "var(--text-small)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </div>

                        {selectedItems.length === 0 ? (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                            <p
                              className="text-muted-foreground"
                              style={{ fontSize: "var(--text-small)" }}
                            >
                              No items selected
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(() => {
                              // Group items by category
                              const categories = [
                                "Apéro",
                                "Starters",
                                "Intermediate Course",
                                "Main Courses Meat/Fish",
                                "Main Courses Veggie",
                                "Main Courses Vegan",
                                "Desserts",
                                "Beverages",
                                "Technology",
                                "Decoration",
                                "Furniture",
                                "Miscellaneous",
                              ];

                              return categories.map((category) => {
                                const categoryItems = selectedItems
                                  .map((itemId) =>
                                    menuItems.find((i) => i.id === itemId),
                                  )
                                  .filter(
                                    (item): item is MenuItem =>
                                      item !== undefined &&
                                      item.category === category,
                                  );

                                if (categoryItems.length === 0) return null;

                                const isCollapsed =
                                  collapsedCategories[category];

                                return (
                                  <div
                                    key={category}
                                    className="bg-card border border-border rounded-lg overflow-hidden"
                                    style={{ borderRadius: "var(--radius)" }}
                                  >
                                    {/* Collapsible Category Header */}
                                    <button
                                      onClick={() =>
                                        setCollapsedCategories((prev) => ({
                                          ...prev,
                                          [category]: !prev[category],
                                        }))
                                      }
                                      className="w-full flex items-center justify-between gap-2 p-4 pb-2 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCollapsed ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <h5
                                          className="text-foreground font-semibold"
                                          style={{
                                            fontSize: "var(--text-base)",
                                          }}
                                        >
                                          {category}
                                        </h5>
                                        <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                                          {categoryItems.length}
                                        </span>
                                      </div>
                                      <span className="text-muted-foreground text-xs">
                                        {isCollapsed ? "Show" : "Hide"}
                                      </span>
                                    </button>

                                    {/* Items in this category - collapsible */}
                                    {!isCollapsed && (
                                      <div className="p-4 pt-2 space-y-2">
                                        {categoryItems.map((item) => {
                                          const itemId = item.id;
                                          const quantity =
                                            itemQuantities[itemId] || 1;

                                          return (
                                            <div
                                              key={itemId}
                                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
                                            >
                                              {/* Thumbnail */}
                                              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                                                <img
                                                  src={item.image}
                                                  alt={item.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>

                                              {/* Item Details */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 flex-wrap">
                                                  {![
                                                    "Technology",
                                                    "Decoration",
                                                    "Furniture",
                                                    "Miscellaneous",
                                                  ].includes(item.category) && (
                                                    <DietaryIcon
                                                      type={item.dietaryType}
                                                      size="sm"
                                                    />
                                                  )}
                                                  <h6 className="text-foreground font-medium text-sm">
                                                    {item.name}
                                                  </h6>
                                                  {/* Pay by consumption badge for beverages */}
                                                  {item.category ===
                                                    "Beverages" &&
                                                    item.pricingType ===
                                                      "flat-rate" && (
                                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                                        Pay by consumption
                                                      </span>
                                                    )}
                                                </div>

                                                {/* Variants, Add-ons, Comments */}
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                  {itemVariants[itemId] &&
                                                    item.variants &&
                                                    (() => {
                                                      const variant =
                                                        item.variants.find(
                                                          (v) =>
                                                            v.id ===
                                                            itemVariants[
                                                              itemId
                                                            ],
                                                        );
                                                      return variant ? (
                                                        <span>
                                                          Variant:{" "}
                                                          {variant.name}
                                                        </span>
                                                      ) : null;
                                                    })()}
                                                  {itemAddOns[itemId] &&
                                                    itemAddOns[itemId].length >
                                                      0 && (
                                                      <span>
                                                        Add-ons:{" "}
                                                        {itemAddOns[itemId]
                                                          .map((addOnId) => {
                                                            const addOn =
                                                              item.addOns?.find(
                                                                (ao) =>
                                                                  ao.id ===
                                                                  addOnId,
                                                              );
                                                            return addOn
                                                              ? addOn.name
                                                              : null;
                                                          })
                                                          .filter(Boolean)
                                                          .join(", ")}
                                                      </span>
                                                    )}
                                                  {itemComments[itemId] && (
                                                    <span className="italic">
                                                      Note:{" "}
                                                      {itemComments[itemId]}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Price */}
                                              <div className="flex-shrink-0 text-right">
                                                <p className="text-primary font-semibold text-sm">
                                                  {item.category ===
                                                    "Beverages" &&
                                                  item.pricingType ===
                                                    "flat-rate"
                                                    ? `CHF ${item.price.toFixed(2)}/unit`
                                                    : `CHF ${getItemPerPersonPrice(item).toFixed(2)}${item.pricingType === "per-person" ? "" : ""}`}
                                                  {item.pricingType ===
                                                    "per-person" &&
                                                    item.category !==
                                                      "Beverages" && (
                                                      <span className="text-muted-foreground text-xs ml-1">
                                                        /person
                                                      </span>
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                  {item.category ===
                                                    "Beverages" &&
                                                  item.pricingType ===
                                                    "flat-rate"
                                                    ? "billed by consumption"
                                                    : item.pricingType ===
                                                        "per-person"
                                                      ? [
                                                          "Main Courses Meat/Fish",
                                                          "Main Courses Veggie",
                                                          "Main Courses Vegan",
                                                        ].includes(item.category)
                                                        ? `${mainCourseGuests[item.category] || 0}×`
                                                        : `${parseInt(eventDetails.guestCount) || 0}×`
                                                      : quantity > 1
                                                        ? `${quantity}×`
                                                        : "flat"}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}

                            {/* Total Summary */}
                            <div className="border-t border-border pt-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p
                                    className="text-foreground mb-1"
                                    style={{
                                      fontSize: "var(--text-base)",
                                      fontWeight: "var(--font-weight-semibold)",
                                    }}
                                  >
                                    Per Person Total
                                  </p>
                                  <p
                                    className="text-muted-foreground"
                                    style={{ fontSize: "var(--text-small)" }}
                                  >
                                    {selectedItems.length}{" "}
                                    {selectedItems.length === 1
                                      ? "item"
                                      : "items"}{" "}
                                    selected for{" "}
                                    {eventDetails.guestCount || "0"}{" "}
                                    {parseInt(eventDetails.guestCount) === 1
                                      ? "guest"
                                      : "guests"}
                                  </p>
                                </div>
                                <p
                                  className="text-primary"
                                  style={{
                                    fontSize: "var(--text-h3)",
                                    fontWeight: "var(--font-weight-semibold)",
                                  }}
                                >
                                  CHF {getPerPersonSubtotal().toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dietary Breakdown & Complete Order Calculation - Side by Side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Dietary Breakdown Card */}
                        <div
                          className="bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <h4
                              className="text-foreground"
                              style={{
                                fontSize: "var(--text-h4)",
                                fontWeight: "var(--font-weight-semibold)",
                              }}
                            >
                              Dietary Breakdown
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Meat/Fish Summary */}
                            <div
                              className="bg-card border border-border rounded-lg p-4"
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <p
                                className="text-muted-foreground mb-2"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                🍖 Meat/Fish Selections
                              </p>
                              <p
                                className="text-primary mb-1"
                                style={{
                                  fontSize: "var(--text-h2)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                {
                                  selectedItems.filter((itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return (
                                      item?.dietaryType === "non-vegetarian"
                                    );
                                  }).length
                                }{" "}
                                items
                              </p>
                              {eventDetails.guestCount && (
                                <p
                                  className="text-muted-foreground"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Total:{" "}
                                  {selectedItems
                                    .filter((itemId) => {
                                      const item = menuItems.find(
                                        (i) => i.id === itemId,
                                      );
                                      return (
                                        item?.dietaryType ===
                                          "non-vegetarian" &&
                                        item?.pricingType === "per-person"
                                      );
                                    })
                                    .reduce(
                                      (total, itemId) =>
                                        total + (itemQuantities[itemId] || 1),
                                      0,
                                    ) * parseInt(eventDetails.guestCount)}{" "}
                                  portions
                                </p>
                              )}
                            </div>

                            {/* Veggie/Vegan Summary */}
                            <div
                              className="bg-card border border-border rounded-lg p-4"
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <p
                                className="text-muted-foreground mb-2"
                                style={{ fontSize: "var(--text-small)" }}
                              >
                                🥗 Veggie/Vegan Selections
                              </p>
                              <p
                                className="text-primary mb-1"
                                style={{
                                  fontSize: "var(--text-h2)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                {
                                  selectedItems.filter((itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return (
                                      item?.dietaryType === "vegetarian" ||
                                      item?.dietaryType === "vegan"
                                    );
                                  }).length
                                }{" "}
                                items
                              </p>
                              {eventDetails.guestCount && (
                                <p
                                  className="text-muted-foreground"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Total:{" "}
                                  {selectedItems
                                    .filter((itemId) => {
                                      const item = menuItems.find(
                                        (i) => i.id === itemId,
                                      );
                                      return (
                                        (item?.dietaryType === "vegetarian" ||
                                          item?.dietaryType === "vegan") &&
                                        item?.pricingType === "per-person"
                                      );
                                    })
                                    .reduce(
                                      (total, itemId) =>
                                        total + (itemQuantities[itemId] || 1),
                                      0,
                                    ) * parseInt(eventDetails.guestCount)}{" "}
                                  portions
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Summary Card with Toggle View */}
                        <div
                          className="bg-muted/30 border border-border rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <ShoppingCart className="w-4 h-4 text-primary" />
                              </div>
                              <h4
                                className="text-foreground"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Order Summary
                              </h4>
                            </div>
                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
                              <button
                                onClick={() => setSummaryViewMode("per-person")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                  summaryViewMode === "per-person"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Per Person
                              </button>
                              <button
                                onClick={() => setSummaryViewMode("total")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                  summaryViewMode === "total"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Total + Extras
                              </button>
                            </div>
                          </div>

                          {summaryViewMode === "per-person" ? (
                            // Per-Person View
                            <div className="space-y-4">
                              <div
                                className="bg-card border border-border rounded-lg p-4"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <p
                                  className="text-foreground font-semibold mb-3"
                                  style={{ fontSize: "var(--text-base)" }}
                                >
                                  Per-Person Breakdown
                                </p>

                                {/* Menu Items by Category - Per Person */}
                                {(() => {
                                  const foodCategories = [
                                    "Apéro",
                                    "Starters",
                                    "Intermediate Course",
                                    "Main Courses Meat/Fish",
                                    "Main Courses Veggie",
                                    "Main Courses Vegan",
                                    "Desserts",
                                  ];
                                  const breakdown = foodCategories
                                    .map((cat) => {
                                      const items = selectedItems.filter(
                                        (itemId) => {
                                          const item = menuItems.find(
                                            (i) => i.id === itemId,
                                          );
                                          return (
                                            item?.category === cat &&
                                            item?.pricingType === "per-person"
                                          );
                                        },
                                      );
                                      const subtotal = items.reduce(
                                        (sum, itemId) => {
                                          const item = menuItems.find(
                                            (i) => i.id === itemId,
                                          );
                                          return (
                                            sum +
                                            (item
                                              ? getItemPerPersonPrice(item)
                                              : 0)
                                          );
                                        },
                                        0,
                                      );
                                      return {
                                        name: cat,
                                        count: items.length,
                                        subtotal,
                                      };
                                    })
                                    .filter((cat) => cat.count > 0);

                                  return (
                                    <div
                                      key="food-categories"
                                      className="space-y-2"
                                    >
                                      {breakdown.map((cat) => (
                                        <div
                                          key={cat.name}
                                          className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                                        >
                                          <div>
                                            <span
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              {cat.name}
                                            </span>
                                            <span
                                              className="text-muted-foreground ml-2"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              ({cat.count})
                                            </span>
                                          </div>
                                          <span className="text-foreground font-medium">
                                            CHF {cat.subtotal.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Per-Person Total */}
                              <div
                                className="bg-primary/5 border border-primary/30 rounded-lg p-4"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p
                                      className="text-foreground font-semibold"
                                      style={{ fontSize: "var(--text-base)" }}
                                    >
                                      Per Person Total
                                    </p>
                                    <p className="text-muted-foreground text-sm mt-1">
                                      For {eventDetails.guestCount || "0"}{" "}
                                      guests
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className="text-primary"
                                      style={{
                                        fontSize: "var(--text-h3)",
                                        fontWeight: "var(--font-weight-bold)",
                                      }}
                                    >
                                      CHF {getPerPersonSubtotal().toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Total + Extras View
                            <div className="space-y-4">
                              {/* Food Menu Items Section */}
                              <div
                                className="bg-card border border-border rounded-lg overflow-hidden"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                  <p
                                    className="text-foreground font-semibold"
                                    style={{ fontSize: "var(--text-base)" }}
                                  >
                                    🍽️ Food Menu
                                  </p>
                                </div>
                                <div className="p-4 space-y-2">
                                  {(() => {
                                    const foodCategories = [
                                      "Apéro",
                                      "Starters",
                                      "Intermediate Course",
                                      "Main Courses Meat/Fish",
                                      "Main Courses Veggie",
                                      "Main Courses Vegan",
                                      "Desserts",
                                    ];
                                    const breakdown = foodCategories
                                      .map((cat) => {
                                        const items = selectedItems.filter(
                                          (itemId) => {
                                            const item = menuItems.find(
                                              (i) => i.id === itemId,
                                            );
                                            return item?.category === cat;
                                          },
                                        );
                                        const subtotal = items.reduce(
                                          (sum, itemId) => {
                                            const item = menuItems.find(
                                              (i) => i.id === itemId,
                                            );
                                            return (
                                              sum +
                                              (item
                                                ? getItemTotalPrice(item)
                                                : 0)
                                            );
                                          },
                                          0,
                                        );
                                        return {
                                          name: cat,
                                          count: items.length,
                                          subtotal,
                                        };
                                      })
                                      .filter((cat) => cat.count > 0);

                                    return (
                                      <div
                                        key="food-categories"
                                        className="space-y-1"
                                      >
                                        {breakdown.map((cat) => (
                                          <div
                                            key={cat.name}
                                            className="flex justify-between items-center py-1.5"
                                          >
                                            <span
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              {cat.name} ({cat.count})
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {cat.subtotal.toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="pt-2 mt-2 border-t-2 border-primary flex justify-between">
                                          <span className="text-foreground font-semibold">
                                            Subtotal Food:
                                          </span>
                                          <span className="text-foreground font-semibold">
                                            CHF{" "}
                                            {(() => {
                                              const foodCategories = [
                                                "Apéro",
                                                "Starters",
                                                "Intermediate Course",
                                                "Main Courses Meat/Fish",
                                                "Main Courses Veggie",
                                                "Main Courses Vegan",
                                                "Desserts",
                                              ];
                                              return selectedItems
                                                .filter((itemId) => {
                                                  const item = menuItems.find(
                                                    (i) => i.id === itemId,
                                                  );
                                                  return (
                                                    item &&
                                                    foodCategories.includes(
                                                      item.category,
                                                    )
                                                  );
                                                })
                                                .reduce((sum, itemId) => {
                                                  const item = menuItems.find(
                                                    (i) => i.id === itemId,
                                                  );
                                                  return (
                                                    sum +
                                                    (item
                                                      ? getItemTotalPrice(item)
                                                      : 0)
                                                  );
                                                }, 0)
                                                .toFixed(2);
                                            })()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Beverages Section */}
                              {(() => {
                                const beverageItems = selectedItems.filter(
                                  (itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return item?.category === "Beverages";
                                  },
                                );

                                if (beverageItems.length === 0) return null;

                                const beverageSubtotal = beverageItems.reduce(
                                  (sum, itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return (
                                      sum + (item ? getItemTotalPrice(item) : 0)
                                    );
                                  },
                                  0,
                                );

                                return (
                                  <div
                                    className="bg-card border border-border rounded-lg overflow-hidden"
                                    style={{ borderRadius: "var(--radius)" }}
                                  >
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p
                                        className="text-foreground font-semibold"
                                        style={{ fontSize: "var(--text-base)" }}
                                      >
                                        🍷️ Beverages
                                      </p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Pay by consumption • not included in
                                        per-person pricing
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {beverageItems.map((itemId) => {
                                        const item = menuItems.find(
                                          (i) => i.id === itemId,
                                        );
                                        if (!item) return null;
                                        const itemTotal =
                                          getItemTotalPrice(item);
                                        return (
                                          <div
                                            key={itemId}
                                            className="flex justify-between items-center py-1"
                                          >
                                            <span
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              {item.name} (
                                              {item.pricingType === "flat-rate"
                                                ? `CHF ${item.price.toFixed(2)}/bottle`
                                                : "per person"}
                                              )
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {itemTotal.toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t border-border flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Beverages:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {beverageSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Additional Services Section */}
                              {(() => {
                                const serviceCategories = [
                                  "Technology",
                                  "Decoration",
                                  "Furniture",
                                  "Miscellaneous",
                                ];
                                const serviceItems = selectedItems.filter(
                                  (itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return (
                                      item &&
                                      serviceCategories.includes(item.category)
                                    );
                                  },
                                );

                                if (serviceItems.length === 0) return null;

                                const serviceSubtotal = serviceItems.reduce(
                                  (sum, itemId) => {
                                    const item = menuItems.find(
                                      (i) => i.id === itemId,
                                    );
                                    return (
                                      sum + (item ? getItemTotalPrice(item) : 0)
                                    );
                                  },
                                  0,
                                );

                                return (
                                  <div
                                    className="bg-card border border-border rounded-lg overflow-hidden"
                                    style={{ borderRadius: "var(--radius)" }}
                                  >
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p
                                        className="text-foreground font-semibold"
                                        style={{ fontSize: "var(--text-base)" }}
                                      >
                                        ✨ Additional Services
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {serviceItems.map((itemId) => {
                                        const item = menuItems.find(
                                          (i) => i.id === itemId,
                                        );
                                        if (!item) return null;
                                        const itemTotal =
                                          getItemTotalPrice(item);
                                        return (
                                          <div
                                            key={itemId}
                                            className="flex justify-between items-center py-1"
                                          >
                                            <span
                                              className="text-muted-foreground"
                                              style={{
                                                fontSize: "var(--text-small)",
                                              }}
                                            >
                                              {item.name}
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {itemTotal.toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t border-border flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Services:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {serviceSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* GRAND TOTAL */}
                              <div
                                className="bg-secondary/10 border-2 border-secondary rounded-lg p-4"
                                style={{ borderRadius: "var(--radius)" }}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p
                                      className="text-foreground font-semibold"
                                      style={{ fontSize: "var(--text-h4)" }}
                                    >
                                      TOTAL ESTIMATE
                                    </p>
                                    {eventDetails.guestCount &&
                                      parseInt(eventDetails.guestCount) > 0 && (
                                        <p
                                          className="text-muted-foreground mt-1"
                                          style={{
                                            fontSize: "var(--text-small)",
                                          }}
                                        >
                                          For {eventDetails.guestCount} guests
                                        </p>
                                      )}
                                  </div>
                                  <p
                                    className="text-primary"
                                    style={{
                                      fontSize: "var(--text-h2)",
                                      fontWeight: "var(--font-weight-bold)",
                                    }}
                                  >
                                    CHF {getTotalPriceWithAddOns().toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Deposit Requirement Alert - Only show if total is CHF 5,000 or more */}
                      {getTotalPriceWithAddOns() >= 5000 && (
                        <div
                          className="bg-secondary border border-secondary rounded-lg p-5"
                          style={{ borderRadius: "var(--radius-card)" }}
                        >
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4
                                className="text-white mb-2"
                                style={{
                                  fontSize: "var(--text-h4)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                Deposit Requirement
                              </h4>
                              <p
                                className="text-white/80 mb-3"
                                style={{ fontSize: "var(--text-base)" }}
                              >
                                A deposit is required for orders above{" "}
                                <span className="text-primary font-semibold">
                                  CHF 5,000.00
                                </span>
                                . This deposit will be deducted from the final
                                invoice.
                              </p>
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <p
                                  className="text-white/70"
                                  style={{ fontSize: "var(--text-small)" }}
                                >
                                  Our team will connect you once order is locked
                                  and confirmed.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Terms and Conditions */}
                      <div
                        className="bg-card border border-border rounded-lg p-5"
                        style={{ borderRadius: "var(--radius-card)" }}
                      >
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                            style={{ accentColor: "var(--color-primary)" }}
                          />
                          <span
                            className="text-foreground"
                            style={{ fontSize: "var(--text-base)" }}
                          >
                            I agree to the{" "}
                            <span
                              className="text-primary"
                              style={{
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Terms and Conditions
                            </span>{" "}
                            and confirm that all information is correct.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div
                  className="sticky bottom-0 bg-card flex items-center justify-between mt-3 pt-3 border-t border-border gap-2 -mx-5 px-5 -mb-5 pb-3 lg:-mx-8 lg:px-8 lg:-mb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30"
                  style={{
                    borderRadius: "0 0 var(--radius-card) var(--radius-card)",
                  }}
                >
                  {/* Back button - Show when: 1) on Step 2 or 3, OR 2) on Step 1 but not on first tab */}
                  {(currentStep > 1 ||
                    (currentStep === 1 && activeTab !== "contact")) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentStep === 1) {
                          // Navigate to previous tab
                          const currentIndex = tabs.findIndex(
                            (tab) => tab.id === activeTab,
                          );
                          if (currentIndex > 0) {
                            setActiveTab(tabs[currentIndex - 1].id);
                          }
                        } else if (currentStep === 2) {
                          // On Step 2, check if on first category
                          const currentCategoryIndex =
                            categories.indexOf(selectedCategory);
                          if (currentCategoryIndex > 0) {
                            // Go to previous category
                            setSelectedCategory(
                              categories[currentCategoryIndex - 1],
                            );
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          } else {
                            // On first category, go back to Step 1
                            handleBack();
                          }
                        } else {
                          // Navigate to previous step
                          handleBack();
                        }
                      }}
                      icon={ChevronLeft}
                      iconPosition="left"
                      size="sm"
                    >
                      Back
                    </Button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {currentStep === 1 && (
                      <Button
                        variant="primary"
                        onClick={handleStep1Navigation}
                        icon={ChevronRight}
                        iconPosition="right"
                        disabled={!isCurrentTabValid()}
                        size="sm"
                      >
                        {isLastTab() ? "Start Menu" : "Next"}
                      </Button>
                    )}

                    {currentStep === 2 && (
                      <Button
                        variant="primary"
                        onClick={handleNext}
                        icon={ChevronRight}
                        iconPosition="right"
                        disabled={isLastCategory() && !allCategoriesVisited()}
                        size="sm"
                      >
                        {isLastCategory() && allCategoriesVisited()
                          ? "Continue to Summary"
                          : "Next Category"}
                      </Button>
                    )}

                    {currentStep === 3 && (
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        icon={Send}
                        iconPosition="right"
                        disabled={!termsAccepted}
                        size="sm"
                      >
                        Submit Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Details Modal */}
        {detailsModalItem && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeDetailsModal}
          >
            <div
              className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ borderRadius: "var(--radius-card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <DietaryIcon type={detailsModalItem.dietaryType} size="md" />
                  <div>
                    <h3
                      className="text-foreground"
                      style={{
                        fontSize: "var(--text-h4)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {detailsModalItem.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className="text-primary"
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        CHF {detailsModalItem.price.toFixed(2)}
                      </p>
                      {detailsModalItem.pricingType === "per-person" && (
                        <span
                          className="text-muted-foreground"
                          style={{ fontSize: "var(--text-small)" }}
                        >
                          per person
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Item Image */}
                <div
                  className="mb-6 rounded-lg overflow-hidden"
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <img
                    src={detailsModalItem.image}
                    alt={detailsModalItem.name}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "var(--text-base)" }}
                  >
                    {detailsModalItem.description}
                  </p>
                </div>

                {/* Pricing Information - For consumption-based beverages */}
                {detailsModalItem.category === "Beverages" &&
                  detailsModalItem.pricingType === "flat-rate" && (
                    <div
                      className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-700 dark:text-amber-300 text-sm font-bold">
                            i
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-foreground font-semibold mb-1"
                            style={{ fontSize: "var(--text-base)" }}
                          >
                            Billed by Consumption
                          </p>
                          <p
                            className="text-muted-foreground"
                            style={{ fontSize: "var(--text-small)" }}
                          >
                            Pricing starts at CHF{" "}
                            {detailsModalItem.price.toFixed(2)} per unit. Final
                            amount will be calculated based on actual
                            consumption at your event.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Size/Variant Selection */}
                {detailsModalItem.variants &&
                  detailsModalItem.variants.length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="text-foreground mb-3"
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        Choose Size
                      </h4>
                      <div className="space-y-3">
                        {detailsModalItem.variants.map((variant) => {
                          const isSelected = tempVariant === variant.id;
                          return (
                            <label
                              key={variant.id}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-border/80"
                              }`}
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name="variant"
                                    checked={isSelected}
                                    onChange={() => setTempVariant(variant.id)}
                                    className="w-5 h-5 appearance-none border-2 border-border rounded-full checked:border-primary checked:border-[6px] transition-all cursor-pointer"
                                  />
                                </div>
                                <div className="flex-1">
                                  <span
                                    className="text-foreground"
                                    style={{
                                      fontSize: "var(--text-base)",
                                      fontWeight: "var(--font-weight-medium)",
                                    }}
                                  >
                                    {variant.name}
                                  </span>
                                  {variant.description && (
                                    <span
                                      className="text-muted-foreground ml-2"
                                      style={{ fontSize: "var(--text-small)" }}
                                    >
                                      ({variant.description})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                className="text-foreground ml-3"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                CHF {variant.price.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Allergen Information */}
                {detailsModalItem.allergens &&
                  detailsModalItem.allergens.length > 0 && (
                    <div
                      className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex gap-3"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p
                          className="text-foreground mb-1"
                          style={{
                            fontSize: "var(--text-small)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          Allergen Information
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: "var(--text-small)" }}
                        >
                          Contains: {detailsModalItem.allergens.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Optional Add-ons */}
                {detailsModalItem.addOns &&
                  detailsModalItem.addOns.length > 0 && (
                    <div className="mb-6">
                      <h4
                        className="text-foreground mb-3"
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        Optional Add-ons
                      </h4>
                      <div className="space-y-3">
                        {detailsModalItem.addOns.map((addOn) => {
                          const isChecked = tempAddOns.includes(addOn.id);
                          return (
                            <label
                              key={addOn.id}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isChecked
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-border/80"
                              }`}
                              style={{ borderRadius: "var(--radius)" }}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleTempAddOn(addOn.id)}
                                    className="w-5 h-5 appearance-none border-2 border-border rounded checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                  />
                                  {isChecked && (
                                    <Check
                                      className="w-3 h-3 text-white absolute pointer-events-none"
                                      style={{ strokeWidth: 3 }}
                                    />
                                  )}
                                </div>
                                <span
                                  className="text-foreground"
                                  style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--font-weight-medium)",
                                  }}
                                >
                                  {addOn.name}
                                </span>
                              </div>
                              <span
                                className="text-foreground ml-3"
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                +CHF {addOn.price.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Additional Comments */}
                <div className="mb-6">
                  <h4
                    className="text-foreground mb-3"
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-semibold)",
                    }}
                  >
                    Additional Comments
                    <span
                      className="text-muted-foreground ml-1"
                      style={{
                        fontSize: "var(--text-small)",
                        fontWeight: "var(--font-weight-normal)",
                      }}
                    >
                      (Optional)
                    </span>
                  </h4>
                  <textarea
                    value={tempComment}
                    onChange={(e) => setTempComment(e.target.value)}
                    placeholder="Any special instructions or dietary requirements..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    style={{
                      borderRadius: "var(--radius)",
                      fontSize: "var(--text-base)",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Left: Quantity & Guest Count Selectors */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Quantity Selector - Hide for flat-rate items and beverages */}
                    {detailsModalItem.pricingType !== 'flat-rate' && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm whitespace-nowrap">Qty:</span>
                        <button
                          onClick={() =>
                            setTempQuantity(Math.max(1, tempQuantity - 1))
                          }
                          className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground flex-shrink-0"
                          style={{ borderRadius: "var(--radius)" }}
                          disabled={tempQuantity <= 1}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span
                          className="text-foreground min-w-[3rem] text-center"
                          style={{
                            fontSize: "var(--text-h4)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          {tempQuantity}
                        </span>
                        <button
                          onClick={() => setTempQuantity(tempQuantity + 1)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors flex-shrink-0"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Guest Count Selector - Only for Main Courses */}
                    {[
                      "Main Courses Meat/Fish",
                      "Main Courses Veggie",
                      "Main Courses Vegan",
                    ].includes(detailsModalItem.category) && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm whitespace-nowrap">Guests:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempGuestCount}
                            min="0"
                            max={parseInt(eventDetails.guestCount || "0")}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setTempGuestCount(newValue);
                              // Validate immediately
                              const newCount = parseInt(newValue) || 0;
                              const totalGuests = parseInt(eventDetails.guestCount) || 0;
                              const otherCategoriesGuests = Object.entries(mainCourseGuests)
                                .filter(([cat]) => cat !== detailsModalItem.category)
                                .reduce((sum, [, count]) => sum + count, 0);
                              const maxAllowed = totalGuests - otherCategoriesGuests;

                              if (newCount > maxAllowed) {
                                setGuestCountErrors((prev) => ({
                                  ...prev,
                                  [detailsModalItem.category]: `Cannot exceed ${maxAllowed} guests`,
                                }));
                              } else {
                                setGuestCountErrors((prev) => ({
                                  ...prev,
                                  [detailsModalItem.category]: "",
                                }));
                                // Commit change immediately so navigation/validation sees updated counts
                                setMainCourseGuests((prev) => ({
                                  ...prev,
                                  [detailsModalItem.category]: newCount,
                                }));
                              }
                            }}
                            className={`w-16 px-2 py-2 bg-input-background border rounded-lg transition-colors text-center ${
                              guestCountErrors[detailsModalItem.category]
                                ? "border-destructive"
                                : "border-border focus:border-primary"
                            }`}
                            placeholder="0"
                            style={{
                              borderRadius: "var(--radius)",
                              fontSize: "var(--text-base)",
                            }}
                          />
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            / {parseInt(eventDetails.guestCount || "0")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Add to Cart Button with Total */}
                  <button
                    onClick={addToCartFromModal}
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors ml-auto"
                    style={{
                      borderRadius: "var(--radius)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-semibold)",
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                    <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                      CHF{" "}
                      {(() => {
                        let basePrice = detailsModalItem.price;
                        if (tempVariant && detailsModalItem.variants) {
                          const variant = detailsModalItem.variants.find(
                            (v) => v.id === tempVariant,
                          );
                          if (variant) basePrice = variant.price;
                        }
                        const addOnsTotal = tempAddOns.reduce(
                          (total, addOnId) => {
                            const addOn = detailsModalItem.addOns?.find(
                              (ao) => ao.id === addOnId,
                            );
                            return total + (addOn?.price || 0);
                          },
                          0,
                        );
                        // For flat-rate items, don't multiply by quantity
                        const multiplier = detailsModalItem.pricingType === 'flat-rate' ? 1 : tempQuantity;
                        return (
                          (basePrice + addOnsTotal) *
                          multiplier
                        ).toFixed(2);
                      })()}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
