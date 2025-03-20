
import React, { useEffect, useState } from 'react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Customer } from '@/utils/types';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/utils/animations';
import { formatDateShort } from '@/utils/constants';

interface CustomerSelectorProps {
  selectedCustomer: string;
  onSelect: (value: string) => void;
}

// Mock customer data
const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', purchases: 3, lastPurchase: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '2', name: 'Jane Smith', purchases: 1, lastPurchase: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '3', name: 'Robert Johnson', purchases: 5, lastPurchase: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', name: 'Emily Williams', purchases: 2, lastPurchase: new Date(Date.now() - 86400000 * 14).toISOString() },
];

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ selectedCustomer, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchValue, setSearchValue] = useState('');

  // This would be replaced with a Supabase fetch in a real implementation
  useEffect(() => {
    // Fetch customers from API or database
    // For now, we're using mock data
  }, []);

  const handleAddNewCustomer = () => {
    // Only add if the name doesn't already exist and is not empty
    if (searchValue && !customers.find(c => c.name.toLowerCase() === searchValue.toLowerCase())) {
      const newCustomer: Customer = {
        id: String(Date.now()),
        name: searchValue,
        purchases: 0,
        lastPurchase: new Date().toISOString()
      };
      
      setCustomers([...customers, newCustomer]);
      onSelect(newCustomer.name);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer || "Pilih pelanggan..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Cari pelanggan..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty className="py-2 px-1">
            <div className="text-sm text-center">
              <p className="text-muted-foreground mb-2">Tidak ada pelanggan ditemukan</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewCustomer}
                disabled={!searchValue}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Tambah "{searchValue}"</span>
              </Button>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.name}
                onSelect={() => {
                  onSelect(customer.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCustomer === customer.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{customer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {customer.purchases} pembelian • Terakhir: {formatDateShort(customer.lastPurchase)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomerSelector;
