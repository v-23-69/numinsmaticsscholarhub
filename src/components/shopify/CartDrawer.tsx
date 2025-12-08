import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    items, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    createCheckout,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createCheckout();
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 rounded-full hover:bg-muted/50 transition-colors"
      >
        <ShoppingCart className="w-5 h-5 text-foreground" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-[10px] font-bold flex items-center justify-center text-background">
            {totalItems}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-card flex flex-col h-full border-l border-gold/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-background">
                <h2 className="font-serif font-semibold text-lg gold-text">Cart ({totalItems})</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted/50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-3 p-3 rounded-xl bg-card border border-gold/20">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-gold/10">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img
                              src={item.product.node.images.edges[0].node.url}
                              alt={item.product.node.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.node.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedOptions.map(o => o.value).join(' / ')}
                          </p>
                          <p className="font-bold text-gold mt-1">
                            ₹{parseFloat(item.price.amount).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="p-1.5 hover:bg-destructive/10 rounded text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-gold/20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-gold/20"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gold/20 bg-card space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-gold">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleCheckout}
                      className="w-full btn-gold h-12 rounded-xl"
                      disabled={items.length === 0 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Checkout...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Checkout
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
