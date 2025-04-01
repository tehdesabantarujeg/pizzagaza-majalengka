
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileStockActionButtonsProps {
  openPizzaForm: () => void;
  openMultiPizzaForm: () => void;
  openBoxForm: () => void;
}

const MobileStockActionButtons: React.FC<MobileStockActionButtonsProps> = ({
  openPizzaForm,
  openMultiPizzaForm,
  openBoxForm
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      <Button 
        className="rounded-full shadow-lg bg-pizza-orange" 
        size="icon"
        onClick={openBoxForm}
      >
        <PlusIcon className="h-5 w-5" />
        <span className="sr-only">Tambah Stok Dus</span>
      </Button>

      <Button 
        className="rounded-full shadow-lg" 
        size="icon"
        onClick={openPizzaForm}
      >
        <PlusIcon className="h-5 w-5" />
        <span className="sr-only">Tambah Stok Pizza</span>
      </Button>
    </div>
  );
};

export default MobileStockActionButtons;
