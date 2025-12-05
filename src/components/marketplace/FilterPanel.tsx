import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: "mughal", label: "Mughal India", count: 2450 },
  { id: "british", label: "British India", count: 3120 },
  { id: "sultanate", label: "Sultanates", count: 1850 },
  { id: "ancient", label: "Ancient India", count: 980 },
  { id: "eic", label: "East India Company", count: 1540 },
  { id: "modern", label: "Modern Republic", count: 4200 },
];

const metals = [
  { id: "gold", label: "Gold" },
  { id: "silver", label: "Silver" },
  { id: "copper", label: "Copper" },
  { id: "nickel", label: "Nickel" },
  { id: "mixed", label: "Mixed/Other" },
];

const conditions = [
  { id: "unc", label: "Uncirculated (UNC)" },
  { id: "au", label: "About Uncirculated (AU)" },
  { id: "ef", label: "Extremely Fine (EF)" },
  { id: "vf", label: "Very Fine (VF)" },
  { id: "f", label: "Fine (F)" },
];

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [expandedSections, setExpandedSections] = useState<string[]>(["category", "price"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  const activeFiltersCount =
    selectedCategories.length + selectedMetals.length + selectedConditions.length;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed lg:relative top-0 left-0 h-full lg:h-auto w-80 lg:w-64 xl:w-72 bg-background lg:bg-transparent border-r lg:border-r-0 border-border z-50 lg:z-0",
          "lg:translate-x-0 overflow-y-auto scrollbar-elegant"
        )}
      >
        <div className="p-5 lg:p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-semibold text-lg">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="badge-gold text-xs">{activeFiltersCount}</span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Section */}
          <div className="border-b border-border/60 pb-5 mb-5">
            <button
              onClick={() => toggleSection("category")}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-medium text-sm">Category</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.includes("category") && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes("category") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setSelectedCategories((prev) =>
                            checked
                              ? [...prev, cat.id]
                              : prev.filter((id) => id !== cat.id)
                          );
                        }}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                        {cat.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cat.count.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Section */}
          <div className="border-b border-border/60 pb-5 mb-5">
            <button
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-medium text-sm">Price Range</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.includes("price") && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes("price") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-1">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={500000}
                      step={1000}
                      onValueChange={setPriceRange}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(priceRange[0])}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metal Section */}
          <div className="border-b border-border/60 pb-5 mb-5">
            <button
              onClick={() => toggleSection("metal")}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-medium text-sm">Metal</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.includes("metal") && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes("metal") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {metals.map((metal) => (
                    <label
                      key={metal.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={selectedMetals.includes(metal.id)}
                        onCheckedChange={(checked) => {
                          setSelectedMetals((prev) =>
                            checked
                              ? [...prev, metal.id]
                              : prev.filter((id) => id !== metal.id)
                          );
                        }}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {metal.label}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Condition Section */}
          <div className="pb-5">
            <button
              onClick={() => toggleSection("condition")}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-medium text-sm">Condition</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.includes("condition") && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes("condition") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {conditions.map((cond) => (
                    <label
                      key={cond.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={selectedConditions.includes(cond.id)}
                        onCheckedChange={(checked) => {
                          setSelectedConditions((prev) =>
                            checked
                              ? [...prev, cond.id]
                              : prev.filter((id) => id !== cond.id)
                          );
                        }}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {cond.label}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedMetals([]);
                setSelectedConditions([]);
                setPriceRange([0, 500000]);
              }}
            >
              Clear All
            </Button>
            <Button className="flex-1 btn-primary">Apply</Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
