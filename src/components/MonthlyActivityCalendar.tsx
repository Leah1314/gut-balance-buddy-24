import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DayActivity {
  date: string;
  hasFoodLogs: boolean;
  hasStoolLogs: boolean;
  foodCount: number;
  stoolCount: number;
  foodLogs: any[];
  stoolLogs: any[];
}

interface MonthlyActivityCalendarProps {
  foodLogs: any[];
  stoolLogs: any[];
  onEntryAdded?: () => void;
}

const MonthlyActivityCalendar = ({ foodLogs, stoolLogs, onEntryAdded }: MonthlyActivityCalendarProps) => {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayActivities, setDayActivities] = useState<Map<string, DayActivity>>(new Map());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTab, setAddTab] = useState<'food' | 'stool' | 'note'>('food');
  const [saving, setSaving] = useState(false);
  // Food fields
  const [foodName, setFoodName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  // Stool fields
  const [bristolType, setBristolType] = useState('4');
  const [stoolColor, setStoolColor] = useState('Brown');
  const [stoolConsistency, setStoolConsistency] = useState('Normal');
  const [stoolNotes, setStoolNotes] = useState('');
  // Note
  const [noteText, setNoteText] = useState('');

  const resetForm = () => {
    setFoodName('');
    setFoodDescription('');
    setBristolType('4');
    setStoolColor('Brown');
    setStoolConsistency('Normal');
    setStoolNotes('');
    setNoteText('');
    setShowAddForm(false);
    setAddTab('food');
  };

  useEffect(() => {
    calculateMonthlyActivities();
  }, [foodLogs, stoolLogs, currentMonth]);

  const calculateMonthlyActivities = () => {
    const activities = new Map<string, DayActivity>();
    
    // Get all days in current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    monthDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Filter logs for this specific day
      const dayFoodLogs = foodLogs.filter(log => {
        const logDate = format(parseISO(log.created_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      });

      const dayStoolLogs = stoolLogs.filter(log => {
        const logDate = format(parseISO(log.created_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      });

      activities.set(dateStr, {
        date: dateStr,
        hasFoodLogs: dayFoodLogs.length > 0,
        hasStoolLogs: dayStoolLogs.length > 0,
        foodCount: dayFoodLogs.length,
        stoolCount: dayStoolLogs.length,
        foodLogs: dayFoodLogs,
        stoolLogs: dayStoolLogs
      });
    });

    setDayActivities(activities);
  };

  const getActivityLevel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const activity = dayActivities.get(dateStr);
    
    if (!activity) return 'none';
    
    if (activity.hasFoodLogs && activity.hasStoolLogs) return 'both';
    if (activity.hasFoodLogs) return 'food';
    if (activity.hasStoolLogs) return 'stool';
    return 'none';
  };

  const handleDateClick = (date: Date) => {
    if (date > new Date()) return;
    setShowAddForm(false);
    setSelectedDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectedActivity = selectedDate ? dayActivities.get(format(selectedDate, 'yyyy-MM-dd')) : null;

  const buildBackdatedTimestamp = (date: Date) => {
    // Use noon local time on the selected date so it lands on the right day in any tz
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  const handleSaveEntry = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }
      const created_at = buildBackdatedTimestamp(selectedDate);

      if (addTab === 'food') {
        if (!foodName.trim()) {
          toast.error('Please enter a food name');
          return;
        }
        const { error } = await supabase.from('food_logs').insert({
          user_id: user.id,
          food_name: foodName.trim(),
          description: foodDescription.trim() || null,
          created_at,
        });
        if (error) throw error;
      } else if (addTab === 'stool') {
        const { error } = await supabase.from('stool_logs').insert({
          user_id: user.id,
          bristol_type: parseInt(bristolType, 10),
          color: stoolColor,
          consistency: stoolConsistency,
          notes: stoolNotes.trim() || null,
          created_at,
        });
        if (error) throw error;
      } else {
        if (!noteText.trim()) {
          toast.error('Please enter a note');
          return;
        }
        const { error } = await supabase.from('food_logs').insert({
          user_id: user.id,
          food_name: '📝 Note',
          description: noteText.trim(),
          created_at,
        });
        if (error) throw error;
      }

      toast.success('Entry added');
      resetForm();
      setSelectedDate(null);
      onEntryAdded?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#4A7C59' }} />
              <span style={{ color: '#2E2E2E' }}>{t('analytics.monthlyActivityCalendar')}</span>
            </CardTitle>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-1.5 sm:p-2 h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[80px] sm:min-w-[100px] text-center" style={{ color: '#2E2E2E' }}>
                {format(currentMonth, 'MMM yyyy', { locale: i18n.language === 'zh' ? zhCN : undefined })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-1.5 sm:p-2 h-8 w-8"
                disabled={currentMonth >= new Date()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 py-3 sm:p-6">
          <Calendar
            locale={i18n.language === 'zh' ? zhCN : undefined}
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full pointer-events-auto mx-auto [&_.rdp-caption]:hidden [&_.rdp-table]:w-full [&_.rdp-cell]:p-0.5 sm:[&_.rdp-cell]:p-1 [&_.rdp-day]:h-8 [&_.rdp-day]:w-8 sm:[&_.rdp-day]:h-10 sm:[&_.rdp-day]:w-10 [&_.rdp-day]:text-xs sm:[&_.rdp-day]:text-sm [&_.rdp-head_cell]:text-xs sm:[&_.rdp-head_cell]:text-sm [&_.rdp-head_cell]:font-medium [&_.rdp-head_cell]:w-8 sm:[&_.rdp-head_cell]:w-10"
            modifiers={{
              hasFood: (date) => getActivityLevel(date) === 'food',
              hasStool: (date) => getActivityLevel(date) === 'stool',
              hasBoth: (date) => getActivityLevel(date) === 'both',
              hasActivity: (date) => getActivityLevel(date) !== 'none'
            }}
            modifiersStyles={{
              hasFood: { 
                backgroundColor: '#E8F5E8',
                color: '#2E7D32',
                fontWeight: 'bold'
              },
              hasStool: { 
                backgroundColor: '#FFF3E0',
                color: '#F57C00',
                fontWeight: 'bold'
              },
              hasBoth: { 
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                fontWeight: 'bold'
              }
            }}
            onDayClick={handleDateClick}
            disabled={(date) => date > new Date()}
          />
          
          {/* Legend */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-x-3 gap-y-1 sm:gap-4 text-[10px] sm:text-xs justify-center">
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: '#E8F5E8' }}></div>
              <span style={{ color: '#2E2E2E' }}>{t('history.foodEntry')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: '#FFF3E0' }}></div>
              <span style={{ color: '#2E2E2E' }}>{t('history.stoolEntry')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: '#E3F2FD' }}></div>
              <span style={{ color: '#2E2E2E' }}>{t('history.bothEntries')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => { if (!open) { setSelectedDate(null); resetForm(); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: i18n.language === 'zh' ? zhCN : undefined })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              {/* Food Logs Section */}
              {selectedActivity.hasFoodLogs && (
                <div>
                  <h4 className="font-medium text-sm mb-2" style={{ color: '#4A7C59' }}>
                    {t('history.foodLog')} ({selectedActivity.foodCount})
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.foodLogs.map((log, index) => (
                      <div key={index} className="p-2 rounded border" style={{ borderColor: '#E8F5E8', backgroundColor: '#F8FDF8' }}>
                        <p className="font-medium text-sm">{log.food_name}</p>
                        {log.description && (
                          <p className="text-xs text-gray-600">{log.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(parseISO(log.created_at), 'h:mm a', { locale: i18n.language === 'zh' ? zhCN : undefined })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stool Logs Section */}
              {selectedActivity.hasStoolLogs && (
                <div>
                  <h4 className="font-medium text-sm mb-2" style={{ color: '#F57C00' }}>
                    {t('history.stoolLog')} ({selectedActivity.stoolCount})
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.stoolLogs.map((log, index) => (
                      <div key={index} className="p-2 rounded border" style={{ borderColor: '#FFF3E0', backgroundColor: '#FFFBF5' }}>
                        <div className="flex justify-between text-sm">
                          <span>{t('history.bristolType')}: {log.bristol_type}</span>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(log.created_at), 'h:mm a', { locale: i18n.language === 'zh' ? zhCN : undefined })}
                          </span>
                        </div>
                        {log.color && (
                          <p className="text-xs">{t('history.color')}: {log.color}</p>
                        )}
                        {log.consistency && (
                          <p className="text-xs">{t('history.consistency')}: {log.consistency}</p>
                        )}
                        {log.notes && (
                          <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!selectedActivity.hasFoodLogs && !selectedActivity.hasStoolLogs && (
                <div className="text-center py-4 text-gray-500">
                  <p>{t('history.noRecordsForDate')}</p>
                </div>
              )}
            </div>
          )}

          {/* Add Entry Section */}
          <div className="mt-4 pt-4 border-t">
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full"
                style={{ backgroundColor: '#4A7C59', color: 'white' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry for This Date
              </Button>
            ) : (
              <div className="space-y-3">
                <Tabs value={addTab} onValueChange={(v) => setAddTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="food">Food</TabsTrigger>
                    <TabsTrigger value="stool">Stool</TabsTrigger>
                    <TabsTrigger value="note">Note</TabsTrigger>
                  </TabsList>

                  <TabsContent value="food" className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="food-name">Food Name</Label>
                      <Input
                        id="food-name"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="e.g. Oatmeal with berries"
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-desc">Description (optional)</Label>
                      <Textarea
                        id="food-desc"
                        value={foodDescription}
                        onChange={(e) => setFoodDescription(e.target.value)}
                        placeholder="Portion size, notes..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="stool" className="space-y-3 mt-3">
                    <div>
                      <Label>Bristol Type (1-7)</Label>
                      <Select value={bristolType} onValueChange={setBristolType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7].map(n => (
                            <SelectItem key={n} value={String(n)}>Type {n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Select value={stoolColor} onValueChange={setStoolColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Brown','Dark Brown','Light Brown','Yellow','Green','Black','Red'].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Consistency</Label>
                      <Select value={stoolConsistency} onValueChange={setStoolConsistency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Hard','Firm','Normal','Soft','Watery'].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stool-notes">Notes (optional)</Label>
                      <Textarea
                        id="stool-notes"
                        value={stoolNotes}
                        onChange={(e) => setStoolNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="note" className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="plain-note">Note</Label>
                      <Textarea
                        id="plain-note"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="How were you feeling? Symptoms? Reminders..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1" disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEntry}
                    disabled={saving}
                    className="flex-1"
                    style={{ backgroundColor: '#4A7C59', color: 'white' }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyActivityCalendar;