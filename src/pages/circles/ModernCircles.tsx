
import { useState } from "react";
import { Search, Filter, Plus, Users, Eye, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContacts } from "@/hooks/use-contacts";
import { cn } from "@/lib/utils";

const ModernCircles = () => {
  const { contacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);

  const circleStats = {
    inner: contacts.filter(c => c.circle === 'inner').length,
    middle: contacts.filter(c => c.circle === 'middle').length,
    outer: contacts.filter(c => c.circle === 'outer').length,
  };

  const circleConfig = [
    {
      id: 'inner',
      name: 'Inner Circle',
      description: 'Your closest relationships',
      color: 'bg-red-50 border-red-200 text-red-700',
      iconColor: 'text-red-500',
      icon: Heart,
      count: circleStats.inner
    },
    {
      id: 'middle',
      name: 'Middle Circle',
      description: 'Regular connections',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      iconColor: 'text-amber-500',
      icon: MessageCircle,
      count: circleStats.middle
    },
    {
      id: 'outer',
      name: 'Outer Circle',
      description: 'Professional network',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-500',
      icon: Eye,
      count: circleStats.outer
    }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.personal_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCircle = !selectedCircle || contact.circle === selectedCircle;
    return matchesSearch && matchesCircle;
  });

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Circles</h1>
            <p className="text-gray-600 mt-1">Organize your network by relationship strength</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Circle Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCircle === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCircle(null)}
              className={cn(
                "rounded-full",
                selectedCircle === null ? "bg-gray-900 text-white" : "text-gray-600"
              )}
            >
              All Circles
            </Button>
            {circleConfig.map((circle) => (
              <Button
                key={circle.id}
                variant={selectedCircle === circle.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCircle(circle.id)}
                className={cn(
                  "rounded-full",
                  selectedCircle === circle.id ? "bg-gray-900 text-white" : "text-gray-600"
                )}
              >
                {circle.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {circle.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Circle Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {circleConfig.map((circle) => (
            <Card 
              key={circle.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border",
                circle.color,
                selectedCircle === circle.id ? "ring-2 ring-offset-2 ring-gray-900" : ""
              )}
              onClick={() => setSelectedCircle(selectedCircle === circle.id ? null : circle.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <circle.icon className={cn("h-5 w-5", circle.iconColor)} />
                      <h3 className="font-semibold">{circle.name}</h3>
                    </div>
                    <p className="text-sm opacity-80 mb-3">{circle.description}</p>
                    <div className="text-2xl font-bold">{circle.count}</div>
                  </div>
                  <Users className={cn("h-8 w-8 opacity-20", circle.iconColor)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contacts Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCircle 
                ? `${circleConfig.find(c => c.id === selectedCircle)?.name} (${filteredContacts.length})`
                : `All Contacts (${filteredContacts.length})`
              }
            </h2>
          </div>

          {filteredContacts.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-500 text-center mb-6">
                  {searchQuery 
                    ? "Try adjusting your search terms or filters"
                    : "Start building your network by adding your first contact"
                  }
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => {
                const circleInfo = circleConfig.find(c => c.id === contact.circle);
                return (
                  <Card key={contact.id} className="hover:shadow-md transition-all duration-200 border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                          {contact.personal_email && (
                            <p className="text-sm text-gray-500 truncate">{contact.personal_email}</p>
                          )}
                          {contact.company_name && (
                            <p className="text-sm text-gray-500 truncate">{contact.company_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {circleInfo && (
                              <Badge variant="secondary" className={cn("text-xs", circleInfo.color)}>
                                {circleInfo.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCircles;
