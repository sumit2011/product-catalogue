import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreSettings } from "@/components/store/store-settings";

export default function Settings() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your store settings and preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
