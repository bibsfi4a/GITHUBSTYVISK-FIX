const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "../components/campaigns/CampaignCard";
import CampaignDialog from "../components/campaigns/CampaignDialog";
import CampaignOptimizer from "../components/campaigns/CampaignOptimizer";

export default function Campaigns() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const queryClient = useQueryClient();

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    db.auth.me().then(setUser);
  }, []);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Campaign.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user,
  });

  const { data: products } = useQuery({
    queryKey: ['products', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDialogOpen(false);
      setEditingCampaign(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDialogOpen(false);
      setEditingCampaign(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Campaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const handleSave = (data) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    return statusFilter === "all" || campaign.status === statusFilter;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ad Campaigns</h1>
          <p className="text-slate-600">Create and manage your marketing campaigns</p>
        </div>
        <Button
          onClick={() => {
            setEditingCampaign(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* AI Campaign Optimizer */}
      {campaigns.length > 0 && (
        <CampaignOptimizer campaigns={campaigns} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="bg-slate-200 h-6 rounded w-3/4 mb-4" />
              <div className="bg-slate-200 h-4 rounded w-full mb-2" />
              <div className="bg-slate-200 h-4 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {statusFilter !== "all" ? `No ${statusFilter} campaigns` : "No campaigns yet"}
          </h3>
          <p className="text-slate-600 mb-6">
            {statusFilter !== "all"
              ? "Try selecting a different filter"
              : "Launch your first marketing campaign to reach more customers"}
          </p>
          <Button
            onClick={() => {
              setEditingCampaign(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-orange-600 to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Campaign Dialog */}
      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        products={products}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}