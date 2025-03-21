
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckIcon, PencilIcon, XIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/constants';

interface EditableCostPriceProps {
  initialValue: number;
  onUpdate: (newValue: number) => Promise<void>;
  disabled?: boolean;
}

const EditableCostPrice: React.FC<EditableCostPriceProps> = ({ 
  initialValue, 
  onUpdate, 
  disabled = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(value);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating price:', error);
      setValue(initialValue); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-8 w-24"
          disabled={isUpdating}
          min={0}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isUpdating}
          onClick={handleSave}
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isUpdating}
          onClick={handleCancel}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span>{formatCurrency(initialValue)}</span>
      {!disabled && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-50 hover:opacity-100"
          onClick={handleEdit}
        >
          <PencilIcon className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default EditableCostPrice;
