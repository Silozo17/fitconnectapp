import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import {
  useGymProducts,
  useCreateSale,
  ProductSaleItem,
} from "@/hooks/gym/useGymProducts";
import { useGymMembers } from "@/hooks/gym/useGymMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Banknote,
  User,
  ShoppingCart,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { POSCardPayment } from "@/components/gym/pos/POSCardPayment";

interface CartItem extends ProductSaleItem {
  id: string;
}

export default function GymAdminPOS() {
  const { gym } = useGym();
  const { data: products = [] } = useGymProducts({ activeOnly: true });
  const { data: membersData } = useGymMembers({ limit: 100 });
  const members = membersData?.members || [];
  const createSale = useCreateSale();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("walk-in");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const total = subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // For card payments, show Stripe payment dialog
    if (paymentMethod === "card") {
      setShowCardPayment(true);
      return;
    }

    // For cash payments, process directly
    try {
      await createSale.mutateAsync({
        member_id: selectedMemberId === "walk-in" ? undefined : selectedMemberId,
        items: cart.map(({ id, ...item }) => item),
        payment_method: paymentMethod,
      });

      setCart([]);
      setSelectedMemberId("walk-in");
      setShowCheckout(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCardPaymentSuccess = () => {
    setShowCardPayment(false);
    setCart([]);
    setSelectedMemberId("walk-in");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!gym) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Sell products to members</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border rounded-lg text-left hover:border-primary hover:bg-accent transition-colors"
              >
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-lg font-bold text-primary">
                  £{product.price.toFixed(2)}
                </p>
                {product.track_inventory && (
                  <p className="text-xs text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <Card className="w-96 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Member Selection */}
          <div className="mb-4">
            <Label className="text-xs">Customer (Optional)</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Walk-in customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in customer</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-2 p-2 bg-muted rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      £{item.unit_price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>

            {/* Payment Method */}
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </Button>
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="h-4 w-4 mr-2" />
                Cash
              </Button>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || createSale.isPending}
              onClick={handleCheckout}
            >
              {createSale.isPending ? "Processing..." : `Pay £${total.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Card Payment Dialog */}
      {gym && (
        <POSCardPayment
          isOpen={showCardPayment}
          onClose={() => setShowCardPayment(false)}
          onSuccess={handleCardPaymentSuccess}
          gymId={gym.id}
          items={cart.map((item) => ({
            productId: item.product_id,
            name: item.product_name,
            price: item.unit_price,
            quantity: item.quantity,
          }))}
          memberId={selectedMemberId === "walk-in" ? undefined : selectedMemberId}
          total={total}
        />
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center">
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
            <p className="text-muted-foreground">Transaction successful</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
