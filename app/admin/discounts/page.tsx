import { getAdminDiscountCodes } from "@/lib/admin";
import DiscountCodeList from "@/components/admin/discounts/DiscountCodeList";
import CreateDiscountForm from "@/components/admin/discounts/CreateDiscountForm";

export default async function AdminDiscountsPage() {
  const codes = await getAdminDiscountCodes();
  const active = codes.filter((c) => c.isActive).length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Discount codes</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {codes.length} total · {active} active
          </p>
        </div>
        <CreateDiscountForm />
      </div>

      <DiscountCodeList codes={codes} />
    </div>
  );
}
