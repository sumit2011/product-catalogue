import { StorePreview } from "@/components/store/store-preview";
import { StoreSettings } from "@/components/store/store-settings";

export default function Storefront() {
  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Storefront</h1>
          <p className="text-gray-600 mt-1">Preview your public online store</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Store Preview */}
        <StorePreview />
        
        {/* Storefront Settings */}
        <StoreSettings />
      </div>
    </div>
  );
}
