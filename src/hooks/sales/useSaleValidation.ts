
import { PizzaSaleItem } from '@/utils/types';
import { useStockItems } from './useStockItems';
import { toast } from '@/hooks/use-toast';

export const useSaleValidation = () => {
  const { 
    stockItems, 
    isPizzaStockAvailable, 
    isBoxStockAvailable, 
    getAvailablePizzaFlavors 
  } = useStockItems();

  const validateSaleItems = (saleItems: PizzaSaleItem[]): boolean => {
    for (const item of saleItems) {
      const pizzaStockResult = isPizzaStockAvailable(item);
      if (!pizzaStockResult) {
        const availableFlavors = getAvailablePizzaFlavors(item.size);
        if (availableFlavors.length > 0) {
          const message = `Stock Pizza ${item.flavor} ${item.size} 0\nStock Pizza ukuran ${item.size.toLowerCase()} yang tersedia adalah:\n${availableFlavors.join(', ')}`;
          toast({
            title: "Stok Tidak Cukup",
            description: message,
            variant: "destructive"
          });
        }
        return false;
      }
      
      if (item.includeBox) {
        const boxStockResult = isBoxStockAvailable(item);
        if (!boxStockResult) {
          toast({
            title: "Stok Tidak Cukup",
            description: "Stok dus tidak mencukupi",
            variant: "destructive"
          });
          return false;
        }
      }
    }
    
    return true;
  };

  return { validateSaleItems };
};
