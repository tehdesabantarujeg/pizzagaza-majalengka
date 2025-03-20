
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FadeInStagger } from '@/components/animations/FadeIn';
import TransactionCard from '@/components/TransactionCard';
import { Transaction, PizzaStock } from '@/utils/types';
import { 
  PIZZA_FLAVORS, 
  PIZZA_SIZES, 
  PIZZA_STATES, 
  PRICES, 
  formatCurrency 
} from '@/utils/constants';
import { Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Mock data for stock and transactions
const mockStockData: PizzaStock[] = [
  {
    id: '1',
    size: 'Small',
    flavor: 'Cheese',
    quantity: 15,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA + PRICES.COST_SMALL_BOX,
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    size: 'Medium',
    flavor: 'Pepperoni',
    quantity: 8,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_MEDIUM_PIZZA + PRICES.COST_MEDIUM_BOX,
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    size: 'Small',
    flavor: 'Beef',
    quantity: 12,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA + PRICES.COST_SMALL_BOX,
    updatedAt: new Date().toISOString()
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    pizzaId: '1',
    size: 'Small',
    flavor: 'Cheese',
    quantity: 2,
    state: 'Cooked',
    sellingPrice: PRICES.SELLING_SMALL_COOKED,
    totalPrice: PRICES.SELLING_SMALL_COOKED * 2,
    customerName: 'John Doe'
  },
  {
    id: '2',
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    pizzaId: '2',
    size: 'Medium',
    flavor: 'Pepperoni',
    quantity: 1,
    state: 'Raw',
    sellingPrice: PRICES.SELLING_MEDIUM_RAW,
    totalPrice: PRICES.SELLING_MEDIUM_RAW,
    customerName: 'Jane Smith'
  },
];

const Sales = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [stockItems, setStockItems] = useState<PizzaStock[]>(mockStockData);
  const [open, setOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: PIZZA_FLAVORS[0],
    quantity: 1,
    state: 'Raw' as 'Raw' | 'Cooked',
    customerName: '',
    notes: ''
  });
  const [sellingPrice, setSellingPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [totalPrice, setTotalPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [error, setError] = useState('');

  // Calculate selling price based on size and state
  const calculateSellingPrice = (size: 'Small' | 'Medium', state: 'Raw' | 'Cooked') => {
    if (size === 'Small') {
      return state === 'Raw' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      return state === 'Raw' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
  };

  // Update prices when size, state, or quantity changes
  const updatePrices = () => {
    const price = calculateSellingPrice(newSale.size, newSale.state);
    setSellingPrice(price);
    setTotalPrice(price * newSale.quantity);
  };

  React.useEffect(() => {
    updatePrices();
  }, [newSale.size, newSale.state, newSale.quantity]);

  // Handle size change
  const handleSizeChange = (value: string) => {
    setNewSale({ ...newSale, size: value as 'Small' | 'Medium' });
  };

  // Handle flavor change
  const handleFlavorChange = (value: string) => {
    setNewSale({ ...newSale, flavor: value });
  };

  // Handle state change
  const handleStateChange = (value: string) => {
    setNewSale({ ...newSale, state: value as 'Raw' | 'Cooked' });
  };

  // Check if stock is available
  const isStockAvailable = () => {
    const stockItem = stockItems.find(
      item => item.size === newSale.size && item.flavor === newSale.flavor
    );
    
    if (!stockItem) {
      setError(`No stock found for ${newSale.flavor} ${newSale.size} pizza`);
      return false;
    }
    
    if (stockItem.quantity < newSale.quantity) {
      setError(`Only ${stockItem.quantity} ${newSale.flavor} ${newSale.size} pizzas in stock`);
      return false;
    }
    
    setError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stock
    if (!isStockAvailable()) {
      return;
    }
    
    // Find stock item and update quantity
    const updatedStock = stockItems.map(item => {
      if (item.size === newSale.size && item.flavor === newSale.flavor) {
        return {
          ...item,
          quantity: item.quantity - newSale.quantity,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      pizzaId: stockItems.find(
        item => item.size === newSale.size && item.flavor === newSale.flavor
      )?.id || '',
      size: newSale.size,
      flavor: newSale.flavor,
      quantity: newSale.quantity,
      state: newSale.state,
      sellingPrice,
      totalPrice,
      customerName: newSale.customerName || undefined,
      notes: newSale.notes || undefined
    };
    
    // Update state
    setStockItems(updatedStock);
    setTransactions([newTransaction, ...transactions]);
    setOpen(false);
    
    // Show success toast
    toast({
      title: "Sale recorded successfully",
      description: `${newSale.quantity} ${newSale.flavor} ${newSale.size} pizza(s) sold for ${formatCurrency(totalPrice)}`,
    });
    
    // Reset form
    setNewSale({
      size: 'Small',
      flavor: PIZZA_FLAVORS[0],
      quantity: 1,
      state: 'Raw',
      customerName: '',
      notes: ''
    });
  };

  return (
    <Layout>
      <Header 
        title="Sales Processing" 
        description="Record and manage pizza sales"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>
                  Enter details for the pizza being sold
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right">
                    Size
                  </Label>
                  <Select value={newSale.size} onValueChange={handleSizeChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="flavor" className="text-right">
                    Flavor
                  </Label>
                  <Select value={newSale.flavor} onValueChange={handleFlavorChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_FLAVORS.map((flavor) => (
                        <SelectItem key={flavor} value={flavor}>
                          {flavor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="state" className="text-right">
                    State
                  </Label>
                  <Select value={newSale.state} onValueChange={handleStateChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state === 'Raw' ? 'Raw (Mentah)' : 'Cooked (Matang)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({ 
                      ...newSale, 
                      quantity: parseInt(e.target.value) || 1 
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right">
                    Customer
                  </Label>
                  <Input
                    id="customerName"
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                    placeholder="Optional"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newSale.notes}
                    onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                    placeholder="Optional"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Price
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span>{formatCurrency(sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Price:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={() => isStockAvailable()}>
                  Record Sale
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Header>

      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FadeInStagger staggerDelay={50}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No sales recorded yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Record your first sale to get started
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Button>
              </div>
            )}
          </FadeInStagger>
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
