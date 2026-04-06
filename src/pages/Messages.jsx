const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [messageText, setMessageText] = useState("");

  const queryClient = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => db.entities.Lead.list('-created_date'),
    initialData: [],
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedLead?.id],
    queryFn: () => db.entities.Message.filter({ lead_id: selectedLead.id }, '-created_date'),
    enabled: !!selectedLead,
    initialData: [],
  });

  const sendMutation = useMutation({
    mutationFn: (data) => db.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedLead) return;
    
    sendMutation.mutate({
      lead_id: selectedLead.id,
      sender: "business",
      content: messageText,
      read: true
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
        <p className="text-slate-600">Communicate with your leads and customers</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Leads List */}
        <Card className="lg:col-span-1 border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                leads.map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedLead?.id === lead.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{lead.name}</p>
                        <p className="text-sm text-slate-500 truncate">{lead.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-3 border-0 shadow-lg">
          {selectedLead ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedLead.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{selectedLead.email}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedLead.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'business'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'business' ? 'text-blue-100' : 'text-slate-500'
                          }`}>
                            {format(new Date(message.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full py-16">
              <div className="text-center text-slate-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a lead from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}