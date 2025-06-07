import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Plus, Filter, Clock, MapPin, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { keystoneService } from '@/services/keystoneService';
import { useAuth } from '@/contexts/AuthContext';
import { Keystone } from '@/types/keystone';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export default function ModernKeystones() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: keystones = [], isLoading, refetch } = useQuery({
    queryKey: ['keystones', user?.id],
    queryFn: keystoneService.getKeystones,
    enabled: !!user?.id,
  });

  const filteredKeystones = useMemo(() => {
    let filtered = keystones;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(keystone => 
        keystone.title.toLowerCase().includes(query) ||
        keystone.notes?.toLowerCase().includes(query) ||
        keystone.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(keystone => keystone.category === selectedCategory);
    }

    // Timeframe filter
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      
      filtered = filtered.filter(keystone => {
        const date = new Date(keystone.date);
        
        switch (selectedTimeframe) {
          case 'today':
            return isToday(date);
          case 'tomorrow':
            return isTomorrow(date);
          case 'yesterday':
            return isYesterday(date);
          case 'thisWeek':
            return date >= startOfWeek(now) && date <= endOfWeek(now);
          case 'thisMonth':
            return date >= startOfMonth(now) && date <= endOfMonth(now);
          default:
            return true;
        }
      });
    }

    // Sort by date
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [keystones, searchQuery, selectedCategory, selectedTimeframe]);

  const getDateLabel = (date: string) => {
    const keystoneDate = new Date(date);
    
    if (isToday(keystoneDate)) return 'Today';
    if (isTomorrow(keystoneDate)) return 'Tomorrow';
    if (isYesterday(keystoneDate)) return 'Yesterday';
    
    return format(keystoneDate, 'MMMM d, yyyy');
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'birthday':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'anniversary':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'milestone':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">Keystones</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Important dates and milestones
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                placeholder="Search keystones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Keystones List */}
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredKeystones.length > 0 ? (
              filteredKeystones.map((keystone) => (
                <Card key={keystone.id} className="unified-card">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground dark:text-foreground">
                            {keystone.title}
                          </h3>
                          {keystone.notes && (
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                              {keystone.notes}
                            </p>
                          )}
                        </div>
                        {keystone.category && (
                          <Badge className={getCategoryColor(keystone.category)}>
                            {keystone.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {getDateLabel(keystone.date)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                  No keystones found
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Add your first keystone to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version with dark mode support
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Keystones</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Track important dates and milestones
            </p>
          </div>
          <Button className="unified-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Keystone
          </Button>
        </div>

        {/* Filters */}
        <Card className="unified-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search keystones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="unified-input"
                />
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Keystones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse unified-card">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredKeystones.length > 0 ? (
            filteredKeystones.map((keystone) => (
              <Card key={keystone.id} className="unified-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground dark:text-foreground text-lg">
                        {keystone.title}
                      </h3>
                      {keystone.category && (
                        <Badge className={getCategoryColor(keystone.category)}>
                          {keystone.category}
                        </Badge>
                      )}
                    </div>
                    
                    {keystone.notes && (
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        {keystone.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {getDateLabel(keystone.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground dark:text-foreground mb-2">
                No keystones found
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                {searchQuery ? "Try adjusting your search filters" : "Add your first keystone to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
