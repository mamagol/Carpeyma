import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { getProductRecommendations } from '../../lib/serviceRecommendation';
import { RecommendedProduct } from '../types';

export default function ProductSelection() {
  const navigate = useNavigate();
  const { vehicleId, serviceId } = useParams<{ vehicleId: string; serviceId: string }>();
  const { user, vehicles } = useApp();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const serviceName = sessionStorage.getItem('selectedServiceName') || '';

  useEffect(() => {
    if (vehicle && user && serviceName) {
      loadProducts();
    }
  }, [vehicle, user]);

  const loadProducts = async () => {
    if (!vehicle || !user) return;

    setLoading(true);
    try {
      const response = await getProductRecommendations({
        userId: user.id,
        serviceName: serviceName,
        carBrand: vehicle.brandFa,
        carName: vehicle.normalizedNameEn || vehicle.nameFa,
        carModel: vehicle.modelFa,
        year: vehicle.year,
        currentKm: vehicle.currentKilometers,
        city: user.city,
      });

      const mappedProducts: RecommendedProduct[] = response.products.map(p => ({
        productNameFa: p.product_name_fa,
        productBrandFa: p.product_brand_fa,
        productCategoryFa: p.product_category_fa,
        imageUrl: p.image_url,
        productSearchQueryFa: p.product_search_query_fa,
        replacementAfterMonths: p.replacement_after_months,
        usableKm: p.usable_km,
        nextServiceKm: p.next_service_km,
        specs: p.specs,
        reasonFa: p.reason_fa,
        confidence: p.confidence,
        needsReview: p.needs_review,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: RecommendedProduct) => {
    // ذخیره اطلاعات محصول انتخاب شده
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    navigate(`/vehicles/${vehicleId}/service/${serviceId}/add`);
  };

  const showProductDetails = (product: RecommendedProduct) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  if (!vehicle) {
    return (
      <div className="p-4">
        <p>خودرو یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">انتخاب محصول</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {serviceName} - {vehicle.displayNameFa || vehicle.nameFa}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">در حال دریافت پیشنهادات...</p>
        </div>
      )}

      {/* Products List */}
      {!loading && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.productNameFa}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium leading-tight">
                          {product.productNameFa}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.productBrandFa}
                        </p>
                        {product.productCategoryFa && (
                          <Badge variant="secondary" className="mt-2">
                            {product.productCategoryFa}
                          </Badge>
                        )}
                      </div>

                      {/* Info Icon */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          showProductDetails(product);
                        }}
                      >
                        <Info className="w-5 h-5 text-[#3B82F6]" />
                      </Button>
                    </div>

                    {/* Next Service KM */}
                    {product.nextServiceKm && (
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">سرویس بعدی: </span>
                        <span className="font-medium" dir="ltr">
                          {product.nextServiceKm.toLocaleString('fa-IR')} کیلومتر
                        </span>
                      </div>
                    )}

                    {/* Select Button */}
                    <Button
                      className="w-full mt-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                      onClick={() => handleProductSelect(product)}
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      انتخاب این محصول
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Products */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">محصولی پیشنهاد نشد</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            بازگشت
          </Button>
        </div>
      )}

      {/* Product Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedProduct.productNameFa}</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Image */}
                {selectedProduct.imageUrl && (
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.productNameFa}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Brand */}
                <div>
                  <p className="text-sm text-muted-foreground">برند</p>
                  <p className="font-medium mt-1">{selectedProduct.productBrandFa}</p>
                </div>

                {/* Category */}
                {selectedProduct.productCategoryFa && (
                  <div>
                    <p className="text-sm text-muted-foreground">دسته‌بندی</p>
                    <p className="font-medium mt-1">{selectedProduct.productCategoryFa}</p>
                  </div>
                )}

                {/* Specs */}
                {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">مشخصات</p>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usable KM */}
                {selectedProduct.usableKm && (
                  <div>
                    <p className="text-sm text-muted-foreground">کارکرد مفید</p>
                    <p className="font-medium mt-1" dir="ltr">
                      {selectedProduct.usableKm.min.toLocaleString('fa-IR')} تا{' '}
                      {selectedProduct.usableKm.max.toLocaleString('fa-IR')} کیلومتر
                    </p>
                  </div>
                )}

                {/* Replacement After Months */}
                {selectedProduct.replacementAfterMonths && (
                  <div>
                    <p className="text-sm text-muted-foreground">تعویض بعد از</p>
                    <p className="font-medium mt-1">
                      {selectedProduct.replacementAfterMonths} ماه
                    </p>
                  </div>
                )}

                {/* Reason */}
                {selectedProduct.reasonFa && (
                  <div>
                    <p className="text-sm text-muted-foreground">دلیل پیشنهاد</p>
                    <p className="mt-1 text-sm leading-relaxed">{selectedProduct.reasonFa}</p>
                  </div>
                )}

                {/* Confidence */}
                {selectedProduct.confidence !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">میزان اطمینان</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3B82F6]"
                          style={{ width: `${selectedProduct.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(selectedProduct.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Select Button in Sheet */}
              <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t mt-6">
                <Button
                  className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleProductSelect(selectedProduct);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                  انتخاب این محصول
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
