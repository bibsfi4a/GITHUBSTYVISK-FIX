import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductComments({ comments, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-lg">Customer Reviews</h3>
      {comments.map(comment => (
        <Card key={comment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900">{comment.user_name}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(comment.created_date), 'MMM d, yyyy')}
                </p>
              </div>
              {comment.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < comment.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}