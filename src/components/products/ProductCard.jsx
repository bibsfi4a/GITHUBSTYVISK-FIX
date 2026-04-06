import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
export default function ProductCard({ product, onEdit, onDelete }) {
  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
        {/* Banner Image */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {product.banner_image ? (
            <img
              src={product.banner_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-white/30" />
            </div>
          )}
          {product.status === 'active' && (
            <Badge className="absolute top-3 right-3 bg-white text-blue-600 border-0">
              New
            </Badge>
          )}
        </div>

        <CardContent className="p-5">
          {/* Title */}
          <div className="mb-3">
            <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-3 mb-3">
              {product.description}
            </p>
          </div>

          {/* Category and AI Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {product.category?.replace(/_/g, ' ')}
            </Badge>
            {product.features && product.features.length > 0 && (
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                AI-Powered
              </Badge>
            )}
          </div>

          {/* Free Badge */}
          {product.price === 0 && (
            <Badge className="bg-green-100 text-green-700 border-green-300 border mb-4">
              Free
            </Badge>
          )}

          {/* View Details Button */}
          <Button
            onClick={() => onEdit(product)}
            className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
            size="sm"
          >
            View Details →
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex-1 border-slate-300"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-300 text-blue-600 hover:bg-blue-50">
                  QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                  <DialogTitle className="text-center">{product.name} QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <QRCodeSVG 
                      value={`${window.location.origin}/marketplace?product=${product.id}`} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-slate-500">Scan this code to view the product listing.</p>
                  <Button onClick={() => {
                    // Quick way to download an SVG is to draw it on canvas or download string, simplifying for MVP
                    alert("Right-click or long-press the QR code to save it!");
                  }}>
                    Download Instructions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}