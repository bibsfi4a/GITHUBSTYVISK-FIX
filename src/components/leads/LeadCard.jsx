import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusColors = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualified: "bg-purple-100 text-purple-700 border-purple-200",
  converted: "bg-green-100 text-green-700 border-green-200",
  lost: "bg-red-100 text-red-700 border-red-200"
};

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700"
};

export default function LeadCard({ lead, products, onEdit, onDelete }) {
  const product = products.find(p => p.id === lead.product_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{lead.name}</h3>
              {product && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Package className="w-3 h-3" />
                  <span>Interested in: {product.name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${statusColors[lead.status]} border`}>
                {lead.status}
              </Badge>
              <Badge className={priorityColors[lead.priority]}>
                {lead.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            {lead.email && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition-colors">
                  {lead.email}
                </a>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-green-600" />
                <a href={`tel:${lead.phone}`} className="hover:text-green-600 transition-colors">
                  {lead.phone}
                </a>
              </div>
            )}

            {lead.location && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>{lead.location}</span>
              </div>
            )}
          </div>

          {lead.message && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 line-clamp-3">{lead.message}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Source: {lead.source}</span>
              <span>{format(new Date(lead.created_date), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(lead)}
              className="flex-1 border-slate-300"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(lead.id)}
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