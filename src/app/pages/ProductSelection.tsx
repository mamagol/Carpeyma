import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '../components/ui/drawer';
import { ArrowRight, Info } from 'lucide-react';
import { SERVICE_TYPES, ServiceType } from '../types';
import { PRODUCTS, Product } from '../data/products';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function ProductSelection() {
  const navigate = useNavigate();
  const { vehicleId, serviceType } = useParams<{ vehicleId: string; serviceType: ServiceType }>();
  const { vehicles } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const products = serviceType ? PRODUCTS[serviceType] : [];

  const handleProductClick = (product: Product) => {
    navigate(`/vehicles/${vehicleId}/service/${serviceType}/add`, {
      state: { product },
    });
  };

  const handleInfoClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  if (!vehicle || !serviceType) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>اطلاعات یافت نشد</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              بازگشت
            </Button>
          </CardContent>
        </Card>
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
          onClick={() => navigate(`/vehicles/${vehicleId}/service`)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">{SERVICE_TYPES[serviceType]}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-0">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-4 pr-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-base line-clamp-1">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {product.brand}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => handleInfoClick(e, product)}
                    >
                      <Info className="w-4 h-4 text-[#3B82F6]" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                      {product.price.toLocaleString('fa-IR')} تومان
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Info Drawer (Bottom Sheet) */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedProduct?.name}</DrawerTitle>
            {selectedProduct?.brand && (
              <DrawerDescription>{selectedProduct.brand}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Product Image */}
            {selectedProduct && (
              <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">توضیحات</h4>
              <p className="text-sm text-muted-foreground">
                {selectedProduct?.description}
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h4 className="font-medium mb-2">مشخصات فنی</h4>
              <ul className="space-y-2">
                {selectedProduct?.specifications.map((spec, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full mt-2 flex-shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">قیمت:</span>
                <span className="text-xl font-medium">
                  {selectedProduct?.price.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            {/* Select Button */}
            <Button
              className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              onClick={() => {
                if (selectedProduct) {
                  handleProductClick(selectedProduct);
                }
              }}
            >
              انتخاب این محصول
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}