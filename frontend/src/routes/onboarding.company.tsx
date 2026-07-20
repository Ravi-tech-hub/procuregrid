import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Package, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { CompanyInfoStep } from "@/components/onboarding/CompanyInfoStep";
import { AddressStep } from "@/components/onboarding/AddressStep";
import { ProductCatalogStep } from "@/components/onboarding/ProductCatalogStep";
import type {
  CompanyFormData,
  AddressFormData,
  ProductFormData,
  ProductItem,
} from "@/lib/onboarding-data";
import { getStateNameByCode } from "@/lib/onboarding-data";
import heroImg from "@/assets/hero-factory.jpg";

export const Route = createFileRoute("/onboarding/company")({
  component: CompanyOnboardingPage,
});

type Step = 1 | 2 | 3;

const STEP_META: Record<Step, { icon: typeof Building2; title: string; description: string }> = {
  1: {
    icon: Building2,
    title: "Company Details",
    description: "Tell us about your business. This helps us personalise your workspace.",
  },
  2: {
    icon: MapPin,
    title: "Business Address",
    description: "Where is your business located? We use this for invoices and logistics.",
  },
  3: {
    icon: Package,
    title: "Product Catalog",
    description: "Add your first product or service so buyers can discover you faster.",
  },
};

const emptyCompany: CompanyFormData = {
  name: "",
  companyType: "buyer",
  businessType: "",
  gstNumber: "",
  panNumber: "",
};

const emptyAddress: AddressFormData = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "IN",
  state: "",
  pincode: "",
};

const emptyProduct: ProductFormData = {
  productName: "",
  description: "",
  imageFile: null,
  imagePreview: null,
  productSlug: "",
  categorySlug: "",
  specifications: "",
  minOrderQty: undefined,
  unit: "Pcs",
  priceRange: "",
  products: [],
};

const SUPPLIER_CATALOG_MEDIA_BUCKET = "supplier-catalog-media";

function withTimeout<T>(p: PromiseLike<T>, ms: number, msg: string) {
  return new Promise<T>((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error(msg)), ms);
    Promise.resolve(p)
      .then((v) => {
        window.clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        window.clearTimeout(id);
        reject(e);
      });
  });
}

function getAllProducts(productData: ProductFormData): ProductItem[] {
  return [
    ...productData.products,
    ...(productData.productName.trim()
      ? [
          {
            productName: productData.productName,
            description: productData.description,
            imageFile: productData.imageFile,
            imagePreview: productData.imagePreview,
            productSlug: productData.productSlug,
            categorySlug: productData.categorySlug,
            specifications: productData.specifications,
            minOrderQty: productData.minOrderQty,
            unit: productData.unit,
            priceRange: productData.priceRange,
          },
        ]
      : []),
  ];
}

function getFileExtension(file: File) {
  const explicitExtension = file.name.split(".").pop()?.trim().toLowerCase();
  if (explicitExtension) {
    return explicitExtension;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

async function getImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Image dimensions could not be determined."));
      image.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function formatOnboardingError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unexpected onboarding error.";
  }

  const message = error.message;

  if (
    message.includes("company_private_legal_gst_number_key") ||
    message.includes("company_private_legal_gst_number_unique") ||
    message.includes("gst_number_unique")
  ) {
    return "This GSTIN is already linked to another company.";
  }

  if (
    message.includes("company_private_legal_pan_number_key") ||
    message.includes("company_private_legal_pan_number_unique") ||
    message.includes("pan_number_unique")
  ) {
    return "This PAN is already linked to another company.";
  }

  if (message.includes("company_addresses")) {
    return "Company was created, but the address could not be saved. Run the new signup storage SQL and try again.";
  }

  if (
    message.includes("catalog_items") ||
    message.includes("catalog_item_media") ||
    message.includes(SUPPLIER_CATALOG_MEDIA_BUCKET) ||
    message.includes("storage")
  ) {
    return "Company was created, but the supplier catalog or image storage is not configured correctly yet.";
  }

  return message;
}

function CompanyOnboardingPage() {
  const navigate = useNavigate();
  const { user, company, loading, refreshMembership, signOut } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [companyData, setCompanyData] = useState<CompanyFormData>(emptyCompany);
  const [addressData, setAddressData] = useState<AddressFormData>(emptyAddress);
  const [productData, setProductData] = useState<ProductFormData>(emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupplierLike =
    companyData.companyType === "supplier" || companyData.companyType === "hybrid";
  const totalSteps = isSupplierLike ? 3 : 2;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (company) {
      navigate({ to: "/app", replace: true });
    }
  }, [company, loading, navigate, user]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    navigate({ to: "/login", replace: true });
  }

  async function submitEverything() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();

      // 1. Create company
      const { error: rpcError } = await withTimeout(
        supabase.rpc("create_company_with_owner", {
          p_name: companyData.name,
          p_company_type: companyData.companyType,
          p_industry_category: companyData.businessType || null,
          p_gst_number: companyData.gstNumber || null,
          p_pan_number: companyData.panNumber || null,
          p_business_type: companyData.businessType || null,
        }),
        15000,
        "Company creation timed out.",
      );

      if (rpcError) {
        if (rpcError.message?.includes("create_company_with_owner")) {
          setError("Company creation RPC not configured. Run the Supabase setup SQL first.");
        } else if (rpcError.message?.includes("company_memberships_role_check")) {
          setError("Role constraint outdated. Run database/fix-membership-role-constraint.sql.");
        } else {
          setError(`Company creation failed: ${rpcError.message}`);
        }
        return;
      }

      // 2. Refresh membership to get company ID, then store the primary address.
      const memberState = await refreshMembership();
      if (memberState.company?.id) {
        const companyId = memberState.company.id;
        const stateName =
          getStateNameByCode(addressData.country, addressData.state) ?? addressData.state;

        const addressPayload = {
          company_id: companyId,
          address_type: "primary_registered",
          address_line1: addressData.addressLine1.trim(),
          address_line2: addressData.addressLine2.trim() || null,
          city: addressData.city.trim(),
          state_code: addressData.state,
          state_name: stateName,
          country_code: addressData.country,
          postal_code: addressData.pincode.trim(),
          is_primary: true,
        };

        const { data: existingPrimaryAddress, error: existingAddressError } = await supabase
          .from("company_addresses")
          .select("id")
          .eq("company_id", companyId)
          .eq("is_primary", true)
          .limit(1)
          .maybeSingle();

        if (existingAddressError) {
          throw existingAddressError;
        }

        const { error: addressError } = existingPrimaryAddress
          ? await supabase
              .from("company_addresses")
              .update(addressPayload)
              .eq("id", existingPrimaryAddress.id)
          : await supabase.from("company_addresses").insert(addressPayload);

        if (addressError) {
          throw addressError;
        }

        // 3. Store all products and their media for supplier/hybrid companies.
        if (isSupplierLike) {
          const allProducts = getAllProducts(productData);

          if (allProducts.length > 0) {
            for (let index = 0; index < allProducts.length; index += 1) {
              const product = allProducts[index];
              const { data: catalogItem, error: catalogError } = await supabase
                .from("catalog_items")
                .insert({
                  company_id: companyId,
                  name: product.productName.trim(),
                  description: product.description?.trim() || null,
                  product_slug: product.productSlug || null,
                  category_slug: product.categorySlug || null,
                  specifications: product.specifications?.trim() || null,
                  min_order_qty: product.minOrderQty ?? null,
                  unit: product.unit || "Pcs",
                  price_range: product.priceRange?.trim() || null,
                  display_order: index,
                })
                .select("id")
                .single();

              if (catalogError || !catalogItem) {
                throw catalogError ?? new Error("Catalog item could not be created.");
              }

              if (!product.imageFile) {
                continue;
              }

              const fileExtension = getFileExtension(product.imageFile);
              const storagePath = `company/${companyId}/catalog/${catalogItem.id}/${crypto.randomUUID()}.${fileExtension}`;

              const { error: uploadError } = await supabase.storage
                .from(SUPPLIER_CATALOG_MEDIA_BUCKET)
                .upload(storagePath, product.imageFile, {
                  cacheControl: "3600",
                  upsert: false,
                  contentType: product.imageFile.type || undefined,
                });

              if (uploadError) {
                await supabase.from("catalog_items").delete().eq("id", catalogItem.id);
                throw uploadError;
              }

              let dimensions: { width: number; height: number } | null = null;
              try {
                dimensions = await getImageDimensions(product.imageFile);
              } catch (_dimensionError) {
                dimensions = null;
              }

              const { error: mediaError } = await supabase.from("catalog_item_media").insert({
                catalog_item_id: catalogItem.id,
                storage_bucket: SUPPLIER_CATALOG_MEDIA_BUCKET,
                storage_path: storagePath,
                mime_type: product.imageFile.type || null,
                file_size_bytes: product.imageFile.size,
                width: dimensions?.width ?? null,
                height: dimensions?.height ?? null,
                alt_text: product.productName.trim(),
                is_primary: true,
                sort_order: 0,
              });

              if (mediaError) {
                await supabase.storage.from(SUPPLIER_CATALOG_MEDIA_BUCKET).remove([storagePath]);
                await supabase.from("catalog_items").delete().eq("id", catalogItem.id);
                throw mediaError;
              }
            }
          }
        }
      }

      navigate({ to: "/app", replace: true });
    } catch (e) {
      setError(formatOnboardingError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || (!!user && company)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-subtle)]">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/80 px-5 py-4 shadow-[var(--shadow-md)] backdrop-blur">
          <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-75"
            />
          </svg>
          <span className="text-sm text-muted-foreground">Checking workspace…</span>
        </div>
      </div>
    );
  }

  const { icon: StepIcon, title, description } = STEP_META[step];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[image:var(--gradient-subtle)]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left hero */}
        <div className="relative hidden overflow-hidden lg:block">
          <img src={heroImg} alt="Factory floor" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_255_/_0.88)] via-[oklch(0.22_0.08_255_/_0.74)] to-[oklch(0.32_0.12_250_/_0.52)]" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Secure · Verified · Built for India
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Set up your procurement workspace
              </h1>
              {/* Step progress on left panel */}
              <div className="mt-8 space-y-3">
                {([1, 2, ...(isSupplierLike ? [3] : [])] as Step[]).map((s) => (
                  <div
                    key={s}
                    className={`flex items-center gap-3 text-sm ${s === step ? "text-white" : s < step ? "text-white/60" : "text-white/35"}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s === step ? "bg-[#f2b84b] text-[#071d35]" : s < step ? "bg-white/40" : "border border-white/30"}`}
                    >
                      {s < step ? "✓" : s}
                    </span>
                    {STEP_META[s].title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <Card className="w-full max-w-2xl border-border/70 bg-white/92 shadow-[var(--shadow-lg)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Step {step} of {totalSteps}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription className="mt-2">{description}</CardDescription>
              </div>
              {/* Mobile progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-muted lg:hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </CardHeader>

            <CardContent>
              {step === 1 && (
                <CompanyInfoStep
                  data={companyData}
                  onChange={setCompanyData}
                  onNext={() => setStep(2)}
                  onSignOut={handleSignOut}
                  signingOut={signingOut}
                />
              )}
              {step === 2 && (
                <AddressStep
                  data={addressData}
                  onChange={setAddressData}
                  actionType={isSupplierLike ? "next" : "submit"}
                  submitting={submitting}
                  error={error}
                  onBack={() => setStep(1)}
                  onNext={() => (isSupplierLike ? setStep(3) : submitEverything())}
                />
              )}
              {step === 3 && (
                <ProductCatalogStep
                  data={productData}
                  onChange={setProductData}
                  submitting={submitting}
                  error={error}
                  onBack={() => setStep(2)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitEverything();
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
